
'use server';

import { suggestTags, type SuggestTagsInput } from '@/ai/flows/suggest-tags';
import { summarizeDoc, type SummarizeDocInput } from '@/ai/flows/summarize-doc';
import { explainDoc, type ExplainDocInput } from '@/ai/flows/explain-doc';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid'
import nodemailer from 'nodemailer';

const nanoid = customAlphabet('1234567890', 6);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function getAiSuggestions(data: SuggestTagsInput) {
  try {
    const result = await suggestTags(data);
    return { tags: result.tags, error: null };
  } catch (e) {
    console.error(e);
    // In a real app, you'd want to log this error to a monitoring service
    return { tags: [], error: 'Failed to get AI suggestions. Please try again.' };
  }
}

export async function getAiSummary(data: SummarizeDocInput) {
  try {
    const result = await summarizeDoc(data);
    return { summary: result.summary, error: null };
  } catch (e) {
    console.error(e);
    return { summary: '', error: 'Failed to generate summary. The document may be too long or in an unsupported format.' };
  }
}

export async function getAiExplanation(data: ExplainDocInput) {
  try {
    const result = await explainDoc(data);
    return { explanation: result.explanation, error: null };
  } catch (e) {
    console.error(e);
    return { explanation: '', error: 'Failed to generate explanation. The document may be too long or in an unsupported format.' };
  }
}

export async function uploadFile(formData: FormData): Promise<{ downloadURL: string; storagePath: string; error: string | null; }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { downloadURL: '', storagePath: '', error: 'No file provided.' };
        }

        const storagePath = `documents/${uuidv4()}-${file.name}`;
        const bucket = adminStorage.bucket();
        const buffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(storagePath);
        
        await fileUpload.save(buffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        const [downloadURL] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // A long time in the future
        });

        return { downloadURL, storagePath, error: null };
    } catch (e: any) {
        console.error('Upload failed:', e);
        return { downloadURL: '', storagePath: '', error: 'File upload failed. Please try again.' };
    }
}

export async function permanentlyDeleteFile(document: { id: string; storagePath?: string }): Promise<{ error: string | null }> {
    const { id, storagePath } = document;

    if (storagePath) {
        try {
            const bucket = adminStorage.bucket();
            await bucket.file(storagePath).delete();
        } catch (error: any) {
             if (error.code !== 404) { // Ignore "object not found" errors
                console.error("Error deleting file from storage: ", error);
                return { error: 'Failed to delete file from storage.' };
             }
        }
    }

    try {
        const docRef = doc(db, 'documents', id);
        await deleteDoc(docRef);
        return { error: null };
    } catch (error: any) {
        console.error("Error deleting document from firestore: ", error);
        return { error: 'Failed to delete document record.' };
    }
}

export async function send2faCode(userId: string): Promise<{ error: string | null }> {
    console.log(`[2FA DEBUG] Starting send2faCode for user: ${userId}`);
    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.error(`[2FA DEBUG] User not found: ${userId}`);
            return { error: 'User not found.' };
        }
        
        const userData = userDoc.data();
        if (!userData) {
            console.error(`[2FA DEBUG] User data is empty for user: ${userId}`);
            return { error: 'User data not found.' };
        }
        const email = userData.email;

        // Verify SMTP connection
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) {
                    console.error("[SMTP DEBUG] Connection verification failed:", error);
                    reject(new Error("SMTP connection failed. Check credentials in .env file."));
                } else {
                    console.log("[SMTP DEBUG] Server is ready to take our messages");
                    resolve(success);
                }
            });
        });

        const code = nanoid();
        console.log(`[2FA DEBUG] Generated code: ${code}`);
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        console.log(`[2FA DEBUG] Attempting to save code to Firestore...`);
        await userDocRef.update({
            '2fa': { code, expires }
        });
        console.log(`[2FA DEBUG] Successfully saved code to Firestore.`);

        console.log(`[2FA DEBUG] Attempting to send email to ${email}...`);
        await transporter.sendMail({
            from: `"DocuSync Lite Security" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Your DocuSync Lite Verification Code',
            html: `Your 2FA code is: <strong>${code}</strong>. It expires in 10 minutes.`
        });
        console.log(`[2FA DEBUG] Successfully sent email.`);
        
        return { error: null };
    } catch (e: any) {
        console.error("[2FA DEBUG] CRITICAL ERROR in send2faCode:", e);
        return { error: e.message || 'Could not send verification code. Please try again.' };
    }
}

export async function verifyAndEnable2FA(userId: string, code: string): Promise<{ success: boolean; error: string | null }> {
    console.log(`[2FA DEBUG] Starting enable2FA with code: ${code} for user ${userId}`);
    if (!userId) {
        console.error('[2FA DEBUG] No user ID provided.');
        return { success: false, error: "Not authenticated" };
    }

    try {
        const userDocRef = adminDb.collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        
        if (!userDoc.exists) {
            console.error('[2FA DEBUG] User document not found in Firestore.');
            return { success: false, error: "User not found" };
        }

        const twoFaData = userDoc.data()?.['2fa'];
        console.log('[2FA DEBUG] Fetched 2FA data from Firestore:', twoFaData);

        if (!twoFaData || !twoFaData.code) {
            console.error('[2FA DEBUG] No 2FA code found in the database to compare against.');
            return { success: false, error: "Verification code not found. Please try sending a new one." };
        }
        
        if (new Date() > twoFaData.expires.toDate()) {
            console.error('[2FA DEBUG] Expired code.');
            return { success: false, error: "Verification code has expired. Please request a new one." };
        }

        if (twoFaData.code !== code) {
            console.error(`[2FA DEBUG] Code mismatch. User entered: ${code}, DB code: ${twoFaData.code}`);
            return { success: false, error: "Invalid verification code." };
        }
        
        console.log('[2FA DEBUG] Code verified successfully. Updating Firestore document...');
        await userDocRef.update({
            is2faEnabled: true,
            '2fa': null, // Clear the 2fa object
        });
        console.log('[2FA DEBUG] Firestore document updated. 2FA is now enabled.');
        
        return { success: true, error: null };

    } catch(e: any) {
        console.error('[2FA DEBUG] CRITICAL ERROR in verifyAndEnable2FA:', e);
        return { success: false, error: e.message || "An unexpected error occurred." };
    }
}

