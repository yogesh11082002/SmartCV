'use server';

/**
 * @fileOverview A resume improvement suggestion AI agent.
 *
 * - suggestResumeImprovements - A function that handles the resume improvement suggestion process.
 * - SuggestResumeImprovementsInput - The input type for the suggestResumeImprovements function.
 * - SuggestResumeImprovementsOutput - The return type for the suggestResumeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResumeImprovementsInputSchema = z.object({
  textToImprove: z.string().describe('The text to be improved.'),
  context: z
    .string()
    .optional()
    .describe('Additional context, like a job title or company, to tailor the improvement.'),
});
export type SuggestResumeImprovementsInput = z.infer<typeof SuggestResumeImprovementsInputSchema>;

const SuggestResumeImprovementsOutputSchema = z.object({
  improvedText: z.string().describe('The improved text.'),
});
export type SuggestResumeImprovementsOutput = z.infer<typeof SuggestResumeImprovementsOutputSchema>;

export async function suggestResumeImprovements(
  input: SuggestResumeImprovementsInput
): Promise<SuggestResumeImprovementsOutput> {
  return suggestResumeImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResumeImprovementsPrompt',
  input: {schema: SuggestResumeImprovementsInputSchema},
  output: {schema: SuggestResumeImprovementsOutputSchema},
  prompt: `You are an AI resume assistant. You will be given a piece of text from a resume and must improve it. Make it more professional, concise, and impactful.
{{#if context}}
The improvement should be tailored to the following context: {{{context}}}
{{/if}}

Original Text:
{{{textToImprove}}}
`,
});

const suggestResumeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestResumeImprovementsFlow',
    inputSchema: SuggestResumeImprovementsInputSchema,
    outputSchema: SuggestResumeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
