
'use server';

import { suggestTags, type SuggestTagsInput } from '@/ai/flows/suggest-tags';
import { summarizeDoc, type SummarizeDocInput } from '@/ai/flows/summarize-doc';
import { explainDoc, type ExplainDocInput } from '@/ai/flows/explain-doc';
import { adminStorage } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        await resend.emails.send({
            from: 'DocuSync Lite <onboarding@resend.dev>',
            to,
            subject: 'Welcome to DocuSync Lite!',
            html: `
                <h1>Welcome aboard, ${name}!</h1>
                <p>We're thrilled to have you join DocuSync Lite.</p>
                <p>You can now start uploading and managing your documents with ease. Here are a few things you can do to get started:</p>
                <ul>
                    <li>Upload your first document</li>
                    <li>Organize files into categories</li>
                    <li>Use AI to summarize and tag your files</li>
                </ul>
                <p>If you have any questions, just reply to this email.</p>
                <p>Best,<br/>The DocuSync Team</p>
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
