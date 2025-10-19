
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
  return { tags: ['report', 'finance', 'Q4', 'marketing', 'budget'], error: null };
}

export async function getAiSummary(data: SummarizeDocInput) {
  return { 
    summary: `- The report analyzes the Q4 financial performance, highlighting a 15% increase in revenue.\n- Marketing expenditure saw a 10% rise, with a notable ROI from digital campaigns.\n- Key challenges included supply chain disruptions, which impacted profit margins by 5%.\n- The forecast for the next quarter predicts steady growth, contingent on market stability.`,
    error: null 
  };
}

export async function getAiExplanation(data: ExplainDocInput) {
  return { 
    explanation: `### **Purpose**\nThis document is a standard **Quarterly Financial Report**. Its main goal is to provide stakeholders with a summary of the company's financial performance over the last three months (Q4).\n\n### **Key Concepts**\n*   **ROI (Return on Investment):** A metric used to evaluate the efficiency of an investment. In this case, it measures how much profit was generated from the money spent on marketing.\n*   **Profit Margins:** This represents the percentage of revenue that has turned into profit. A 5% impact means that for every $100 in sales, the profit was $5 less than expected due to supply chain issues.\n\n### **Main Takeaways**\n1.  **Financially Successful Quarter:** The company's revenue grew significantly (15%), which is a strong positive signal.\n2.  **Marketing is Working:** Increased spending on digital marketing is paying off, leading to more sales.\n3.  **External Factors are a Risk:** Problems with the supply chain are a key challenge that is making products more expensive to produce, thus reducing profits.`,
    error: null 
  };
}

export async function uploadFile(formData: FormData): Promise<{ downloadURL: string; storagePath: string; error: string | null; }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { downloadURL: '', storagePath: '', error: 'No file provided.' };
        }

        // --- SIMULATED UPLOAD FOR DEMO ---
        // In a real application, you'd use the commented out code below.
        // For this demo, we'll return a URL to a sample document.
        const getSampleUrl = (type: string) => {
            if (type.includes('word')) return 'https://calibre-ebook.com/downloads/demos/demo.docx';
            if (type.includes('spreadsheet')) return 'https://file-examples.com/storage/fe52cb0c6162138b79b9472/2017/02/file_example_XLSX_10.xlsx';
            if (type.includes('presentation')) return 'https://file-examples.com/storage/fe52cb0c6162138b79b9472/2017/08/file_example_PPT_250KB.ppt';
            if (type.includes('pdf')) return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            if (type.includes('text')) return 'data:text/plain;base64,SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgdGV4dCBmaWxlIHRoYXQgY2FuIGJlIHNlYXJjaGVkLg==';
            return '';
        }
        
        const downloadURL = getSampleUrl(file.type);
        const storagePath = `documents/sample-${file.name}`;
        
        if (!downloadURL) {
          return { downloadURL: '', storagePath: '', error: 'This file type is not supported in the demo.' };
        }

        return { downloadURL, storagePath, error: null };
        
        /*
        // --- REAL UPLOAD LOGIC (Commented out for demo) ---
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
        */

    } catch (e: any) {
        console.error('Upload failed:', e);
        return { downloadURL: '', storagePath: '', error: 'File upload failed. Please try again.' };
    }
}

export async function permanentlyDeleteFile(document: { id: string; storagePath?: string }): Promise<{ error: string | null }> {
    const { id, storagePath } = document;

    if (storagePath && !storagePath.startsWith('documents/sample-')) {
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 40px; width: 40px; color: hsl(25, 95%, 53%); margin: 0 auto;">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 40px; width: 40px; color: hsl(25, 95%, 53%); margin: 0 auto;">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
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

export async function requestDemo(email: string): Promise<{ error: string | null }> {
    if (!email) {
        return { error: 'Email address is required to request a demo.' };
    }
     if (!process.env.GMAIL_USER) {
        return { error: 'The recipient email for demo requests is not configured.' };
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

        const userEmailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="height: 40px; width: 40px; color: hsl(25, 95%, 53%); margin: 0 auto;">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <h1 style="color: #333; margin-top: 10px;">DocuSync Lite</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="font-size: 24px; color: #333;">We've Received Your Demo Request!</h2>
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for your interest in DocuSync Lite. A member of our team will reach out to you shortly to schedule your demo.</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                    <p>&copy; 2025 DocuSync Lite. All rights reserved.</p>
                </div>
            </div>
        `;
        
        await transporter.sendMail({
            from: `"DocuSync Lite Team" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Your DocuSync Lite Demo Request',
            html: userEmailHtml
        });
        
        const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                <h2 style="font-size: 20px;">New Demo Request</h2>
                <p>A new demo has been requested by: <strong>${email}</strong>.</p>
                <p>Please follow up with them to schedule a session.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"DocuSync Lite System" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Sending to yourself
            subject: 'New Demo Request for DocuSync Lite',
            html: adminEmailHtml
        });
        
        return { error: null };
    } catch (e: any) {
        console.error("[DEMO REQUEST DEBUG] CRITICAL ERROR in requestDemo:", e);
        return { error: e.message || 'Could not process your demo request. Please try again.' };
    }
}

    