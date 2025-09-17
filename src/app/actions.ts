
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
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.RESEND_API_KEY,
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


export async function sendWelcomeEmail(to: string, name: string): Promise<{ error: string | null }> {
    try {
        await transporter.sendMail({
            from: 'DocuSync Lite <onboarding@resend.dev>',
            to,
            subject: 'Welcome to DocuSync Lite!',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f4f4f7; color: #1a1a1a; }
                        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                        .header { background-color: #FA6002; color: #ffffff; padding: 40px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { padding: 40px; }
                        .content h2 { font-size: 22px; color: #333333; margin-top: 0; }
                        .content p { line-height: 1.6; color: #555555; }
                        .list { list-style-type: none; padding: 0; margin: 20px 0; }
                        .list li { padding: 12px 0; border-bottom: 1px solid #eeeeee; display: flex; align-items: center; }
                        .list li:last-child { border-bottom: none; }
                        .list li::before { content: '✓'; color: #FA6002; font-weight: bold; margin-right: 15px; font-size: 18px; }
                        .button-container { text-align: center; margin-top: 30px; }
                        .button { background-color: #FA6002; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; }
                        .footer { background-color: #262626; color: #aaaaaa; padding: 20px; text-align: center; font-size: 12px; }
                        .footer a { color: #FA6002; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome, ${name}!</h1>
                        </div>
                        <div class="content">
                            <h2>Your journey to effortless document management begins now.</h2>
                            <p>We're thrilled to have you join DocuSync Lite. You're all set to start uploading, organizing, and collaborating on your documents with our powerful AI-driven features.</p>
                            <p>Here are a few things you can do to get started:</p>
                            <ul class="list">
                                <li><strong>Upload Your First Document:</strong> Securely add files to your new digital vault.</li>
                                <li><strong>Organize with AI:</strong> Let our AI summarize and suggest tags for your documents.</li>
                                <li><strong>Collaborate with Ease:</strong> Share files and manage permissions with your team.</li>
                            </ul>
                            <div class="button-container">
                                <a href="https://docusync.site" class="button">Go to Your Dashboard</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>You received this email because you signed up for DocuSync Lite.</p>
                            <p>&copy; 2024 DocuSync Lite. All Rights Reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });
        return { error: null };
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        // We don't want to block the user's signup flow if the email fails.
        // In a real app, this would be logged to a monitoring service.
        return { error: 'Failed to send welcome email.' };
    }
}


export async function send2faCode(userId: string): Promise<{ error: string | null }> {
    try {
        const userDocRef = doc(adminDb, 'users', userId);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists()) {
            return { error: 'User not found.' };
        }
        
        const userData = userDoc.data();
        const email = userData.email;
        const name = userData.name;

        const code = nanoid();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await userDocRef.update({
            '2fa.code': code,
            '2fa.expires': expires,
        });

        await transporter.sendMail({
            from: 'DocuSync Lite Security <security@resend.dev>',
            to: email,
            subject: 'Your DocuSync Lite Verification Code',
            html: `Your 2FA code is: <strong>${code}</strong>. It expires in 10 minutes.`
        });
        
        return { error: null };
    } catch (e: any) {
        console.error("Failed to send 2FA code:", e);
        return { error: 'Could not send verification code. Please try again.' };
    }
}
