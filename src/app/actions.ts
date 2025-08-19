'use server';

import { suggestTags, type SuggestTagsInput } from '@/ai/flows/suggest-tags';

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
