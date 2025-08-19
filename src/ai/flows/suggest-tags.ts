// This file uses server-side code.
'use server';

/**
 * @fileOverview AI-powered tag suggestion for uploaded documents.
 *
 * This file exports:
 * - `suggestTags`:  Function to generate tag suggestions for a document.
 * - `SuggestTagsInput`: The input type for the suggestTags function.
 * - `SuggestTagsOutput`: The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  documentText: z.string().describe('The text content of the document.'),
  documentTitle: z.string().optional().describe('The title of the document.'),
  documentDescription: z.string().optional().describe('The description of the document.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the document.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const suggestTagsPrompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are a document tagging assistant. Given the content, title, and description of a document, you will suggest relevant tags to help users organize their files.

Consider the following:
- Suggest 5-10 tags.
- Tags should be concise and descriptive.
- Focus on the main topics and themes of the document.
- Only return the tags, nothing else.

Document Title: {{documentTitle}}
Document Description: {{documentDescription}}
Document Content: {{documentText}}`,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await suggestTagsPrompt(input);
    return output!;
  }
);
