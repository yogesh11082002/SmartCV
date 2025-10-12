'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing an existing resume.
 *
 * - enhanceExistingResume - A function that takes a resume as input and returns an improved version.
 * - EnhanceExistingResumeInput - The input type for the enhanceExistingResume function.
 * - EnhanceExistingResumeOutput - The return type for the enhanceExistingResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceExistingResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the existing resume.'),
});
export type EnhanceExistingResumeInput = z.infer<typeof EnhanceExistingResumeInputSchema>;

const EnhanceExistingResumeOutputSchema = z.object({
  enhancedResume: z.string().describe('The enhanced resume content with improved wording, structure, and formatting.'),
});
export type EnhanceExistingResumeOutput = z.infer<typeof EnhanceExistingResumeOutputSchema>;

export async function enhanceExistingResume(input: EnhanceExistingResumeInput): Promise<EnhanceExistingResumeOutput> {
  return enhanceExistingResumeFlow(input);
}

const enhanceExistingResumePrompt = ai.definePrompt({
  name: 'enhanceExistingResumePrompt',
  input: {schema: EnhanceExistingResumeInputSchema},
  output: {schema: EnhanceExistingResumeOutputSchema},
  prompt: `You are an AI resume expert. Please review the following resume text and provide an enhanced version with improved wording, structure, and formatting.

Original Resume:
{{{resumeText}}}

Enhanced Resume:`, 
});

const enhanceExistingResumeFlow = ai.defineFlow(
  {
    name: 'enhanceExistingResumeFlow',
    inputSchema: EnhanceExistingResumeInputSchema,
    outputSchema: EnhanceExistingResumeOutputSchema,
  },
  async input => {
    const {output} = await enhanceExistingResumePrompt(input);
    return output!;
  }
);
