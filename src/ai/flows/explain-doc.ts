// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered document explanation.
 *
 * This file exports:
 * - `explainDoc`:  Function to generate an explanation for a document.
 * - `ExplainDocInput`: The input type for the explainDoc function.
 * - `ExplainDocOutput`: The return type for the explainDoc function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainDocInputSchema = z.object({
  documentText: z.string().describe('The text content of the document.'),
  documentTitle: z.string().optional().describe('The title of the document.'),
});
export type ExplainDocInput = z.infer<typeof ExplainDocInputSchema>;

const ExplainDocOutputSchema = z.object({
    explanation: z.string().describe('A clear, simple explanation of the document, including its purpose, key concepts, and main takeaways. Format using markdown.'),
});
export type ExplainDocOutput = z.infer<typeof ExplainDocOutputSchema>;

export async function explainDoc(input: ExplainDocInput): Promise<ExplainDocOutput> {
  return explainDocFlow(input);
}

const explainDocPrompt = ai.definePrompt({
  name: 'explainDocPrompt',
  input: {schema: ExplainDocInputSchema},
  output: {schema: ExplainDocOutputSchema},
  prompt: `You are an expert document analyst. Your task is to explain the provided document in simple terms.

Assume the user has no prior knowledge of the subject matter.

Your explanation should cover:
1.  **Purpose**: What is the main goal or objective of this document?
2.  **Key Concepts**: Define any important terms or jargon.
3.  **Main Takeaways**: What are the most important points the reader should understand?

Structure your response using clear headings and paragraphs in markdown format.

Document Title: {{documentTitle}}
Document Content:
---
{{documentText}}
---
`,
});

const explainDocFlow = ai.defineFlow(
  {
    name: 'explainDocFlow',
    inputSchema: ExplainDocInputSchema,
    outputSchema: ExplainDocOutputSchema,
  },
  async input => {
    const {output} = await explainDocPrompt(input);
    return output!;
  }
);
