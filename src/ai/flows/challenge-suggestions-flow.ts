
'use server';
/**
 * @fileOverview An AI agent for generating challenge suggestions.
 * 
 * - getAISuggestions - A function that returns 3 creative challenge suggestions.
 * - Suggestion - The type for a single suggestion.
 * - SuggestionsOutput - The return type for the getAISuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestionSchema = z.object({
  title: z.string().describe('A creative and engaging title for a personal challenge. Max 50 characters.'),
  durationDays: z.number().int().min(1).describe('A realistic duration in days for the challenge (e.g., 7, 14, 30, 90).'),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;

const SuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).length(3).describe('An array of exactly 3 unique challenge suggestions.'),
});

export type SuggestionsOutput = z.infer<typeof SuggestionsOutputSchema>;


export async function getAISuggestions(): Promise<SuggestionsOutput> {
  return challengeSuggestionFlow();
}

const prompt = ai.definePrompt({
  name: 'challengeSuggestionPrompt',
  output: { schema: SuggestionsOutputSchema },
  prompt: `You are an expert in personal development and motivation. 
  
  Generate 3 unique, creative, and engaging ideas for personal challenges that a person could undertake for self-improvement. 
  
  The challenges should cover different areas like health, learning, creativity, or productivity.
  Keep the titles concise and inspiring.
  
  Provide a realistic duration for each challenge.
  
  Return the output as a structured JSON object containing a list of exactly 3 suggestions.`,
});


const challengeSuggestionFlow = ai.defineFlow(
  {
    name: 'challengeSuggestionFlow',
    outputSchema: SuggestionsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    if (!output) {
      throw new Error('AI did not return any suggestions.');
    }
    return output;
  }
);

    