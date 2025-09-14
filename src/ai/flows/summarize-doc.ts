// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered document summarization.
 *
 * This file exports:
 * - `summarizeDoc`:  Function to generate a summary for a document.
 * - `SummarizeDocInput`: The input type for the summarizeDoc function.
 * - `SummarizeDocOutput`: The return type for the summarizeDoc function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocInputSchema = z.object({
  documentText: z.string().describe('The text content of the document.'),
  documentTitle: z.string().optional().describe('The title of the document.'),
});
export type SummarizeDocInput = z.infer<typeof SummarizeDocInputSchema>;

const SummarizeDocOutputSchema = z.object({
    summary: z.string().describe('A concise summary of the document, written in 3-5 bullet points.'),
});
export type SummarizeDocOutput = z.infer<typeof SummarizeDocOutputSchema>;

export async function summarizeDoc(input: SummarizeDocInput): Promise<SummarizeDocOutput> {
  return summarizeDocFlow(input);
}

const summarizeDocPrompt = ai.definePrompt({
  name: 'summarizeDocPrompt',
  input: {schema: SummarizeDocInputSchema},
  output: {schema: SummarizeDocOutputSchema},
  prompt: `You are a document analysis assistant. Your task is to provide a clear and concise summary of the provided document text.

Present the summary as 3 to 5 key bullet points.

Focus on the main arguments, conclusions, and important data points.

Document Title: {{documentTitle}}
Document Content:
---
{{documentText}}
---
`,
});

const summarizeDocFlow = ai.defineFlow(
  {
    name: 'summarizeDocFlow',
    inputSchema: SummarizeDocInputSchema,
    outputSchema: SummarizeDocOutputSchema,
  },
  async input => {
    const {output} = await summarizeDocPrompt(input);
    return output!;
  }
);
