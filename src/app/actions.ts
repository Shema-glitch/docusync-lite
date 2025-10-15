
'use server';
import '@/lib/server-init';

// import { suggestTags, type SuggestTagsInput } from '@/ai/flows/suggest-tags';
// import { summarizeDoc, type SummarizeDocInput } from '@/ai/flows/summarize-doc';
// import { explainDoc, type ExplainDocInput } from '@/ai/flows/explain-doc';
import { adminStorage, adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid'
import nodemailer from 'nodemailer';

type SuggestTagsInput = any;
type SummarizeDocInput = any;
type ExplainDocInput = any;

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

// In-memory store for OTPs
const otpStore: Map<string, { code: string; expires: Date }> = new Map();


export async function getAiSuggestions(data: SuggestTagsInput) {
  console.log("AI features are currently disabled.");
  return { tags: [], error: 'AI features are currently disabled.' };
}

export async function getAiSummary(data: SummarizeDocInput) {
    console.log("AI features are currently disabled.");
  return { summary: '', error: 'AI features are currently disabled.' };
}

export async function getAiExplanation(data: ExplainDocInput) {
    console.log("AI features are currently disabled.");
  return { explanation: '', error: 'AI features are currently disabled.' };
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

export async function send2faCode(userId: string, email: string): Promise<{ error: string | null }> {
    console.log(`[2FA DEBUG] Starting send2faCode for user: ${userId}`);
    if (!email) {
        return { error: 'Email address is required.' };
    }
    
    try {
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

        console.log(`[2FA DEBUG] Attempting to save code to in-memory store...`);
        otpStore.set(userId, { code, expires });
        console.log(`[2FA DEBUG] Successfully saved code to in-memory store.`);

        console.log(`[2FA DEBUG] Attempting to send email to ${email}...`);
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 40px; width: 40px; color: #ff9800; margin: 0 auto;">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63z" />
                    </svg>
                    <h1 style="color: #333; margin-top: 10px;">DocuSync Lite</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="font-size: 24px; color: #333;">Your Verification Code</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Please use the following code to complete your verification process. This code is valid for 10 minutes.</p>
                    <div style="font-size: 36px; font-weight: bold; text-align: center; letter-spacing: 10px; background-color: #f1f1f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        ${code}
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">If you did not request this code, please ignore this email or contact support if you have any concerns.</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>&copy; 2025 DocuSync Lite. All rights reserved.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"DocuSync Lite Security" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Your DocuSync Lite Verification Code',
            html: emailHtml
        });
        console.log(`[2FA DEBUG] Successfully sent email.`);
        
        return { error: null };
    } catch (e: any) {
        console.error("[2FA DEBUG] CRITICAL ERROR in send2faCode:", e);
        return { error: e.message || 'Could not send verification code. Please try again.' };
    }
}

export async function verify2faCode(userId: string, code: string): Promise<{ success: boolean; error: string | null }> {
    console.log(`[2FA DEBUG] Starting verify2faCode with code: ${code} for user ${userId}`);
    if (!userId) {
        console.error('[2FA DEBUG] No user ID provided.');
        return { success: false, error: "Not authenticated" };
    }

    const otpData = otpStore.get(userId);
    console.log('[2FA DEBUG] Fetched 2FA data from in-memory store:', otpData);

    if (!otpData || !otpData.code) {
        console.error('[2FA DEBUG] No 2FA code found in the store to compare against.');
        return { success: false, error: "Verification code not found. Please try sending a new one." };
    }
    
    if (new Date() > otpData.expires) {
        console.error('[2FA DEBUG] Expired code.');
        otpStore.delete(userId); // Clean up expired code
        return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    if (otpData.code !== code) {
        console.error(`[2FA DEBUG] Code mismatch. User entered: ${code}, DB code: ${otpData.code}`);
        return { success: false, error: "Invalid verification code." };
    }
    
    console.log('[2FA DEBUG] Code verified successfully. Clearing OTP from store.');
    otpStore.delete(userId); // Clean up used code
    
    return { success: true, error: null };
}

export async function joinWaitlist(email: string): Promise<{ error: string | null }> {
    if (!email) {
        return { error: 'Email address is required.' };
    }
    
    try {
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

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 40px; width: 40px; color: #ff9800; margin: 0 auto;">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63z" />
                    </svg>
                    <h1 style="color: #333; margin-top: 10px;">DocuSync Lite</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="font-size: 24px; color: #333;">You're on the Waitlist!</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for joining the waitlist for DocuSync Lite. You're one step closer to revolutionizing your team's collaboration.</p>
                    <p style="font-size: 16px; line-height: 1.5;">We'll notify you as soon as we're ready to welcome you. Stay tuned for exclusive updates and sneak peeks!</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>&copy; 2025 DocuSync Lite. All rights reserved.</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"DocuSync Lite Team" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'You\'re on the DocuSync Lite Waitlist! 🎉',
            html: emailHtml
        });
        
        return { error: null };
    } catch (e: any) {
        console.error("[WAITLIST DEBUG] CRITICAL ERROR in joinWaitlist:", e);
        return { error: e.message || 'Could not add you to the waitlist. Please try again.' };
    }
}
