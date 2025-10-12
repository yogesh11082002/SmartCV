'use server';

/**
 * @fileOverview Generates a resume from scratch based on user-provided job title, skills, and experience level.
 *
 * - generateResumeFromScratch - A function that generates a resume.
 * - GenerateResumeFromScratchInput - The input type for the generateResumeFromScratch function.
 * - GenerateResumeFromScratchOutput - The return type for the generateResumeFromScratch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResumeFromScratchInputSchema = z.object({
  jobTitle: z.string().describe('The job title for the desired resume.'),
  skills: z.array(z.string()).describe('An array of skills relevant to the job.'),
  experienceLevel: z
    .string()
    .describe('The experience level (e.g., Entry-level, Mid-level, Senior-level).'),
  name: z.string().optional().describe('The full name of the person for whom to create the resume.'),
  email: z.string().email().optional().describe('The email address of the person.'),
  phoneNumber: z.string().optional().describe('The phone number of the person.'),
  address: z.string().optional().describe('The address of the person.'),
  linkedinUrl: z.string().url().optional().nullable().describe('The LinkedIn profile URL (optional).'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  templateStyle: z
    .string()
    .optional()
    .describe("Resume template style. Examples: 'Modern', 'Professional', 'Creative'."),
});

export type GenerateResumeFromScratchInput = z.infer<typeof GenerateResumeFromScratchInputSchema>;

const GenerateResumeFromScratchOutputSchema = z.object({
  summary: z.string().describe('A professional summary for the resume.'),
  experience: z
    .array(
      z.object({
        jobTitle: z.string(),
        company: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
      })
    )
    .describe('A list of relevant work experiences.'),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        graduationDate: z.string(),
      })
    )
    .describe('A list of educational qualifications.'),
  skills: z.string().describe('A comma-separated list of relevant skills.'),
});

export type GenerateResumeFromScratchOutput = z.infer<typeof GenerateResumeFromScratchOutputSchema>;

export async function generateResumeFromScratch(
  input: GenerateResumeFromScratchInput
): Promise<GenerateResumeFromScratchOutput> {
  return generateResumeFromScratchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeFromScratchPrompt',
  input: {schema: GenerateResumeFromScratchInputSchema},
  output: {schema: GenerateResumeFromScratchOutputSchema},
  prompt: `You are an expert resume writer. Create compelling, structured resume content for a candidate based on the following information. Generate a professional summary, a few realistic work experience entries, a couple of education entries, and a list of skills.

  {{#if name}}Name: {{{name}}}{{/if}}
  {{#if email}}Email: {{{email}}}{{/if}}
  {{#if phoneNumber}}Phone Number: {{{phoneNumber}}}{{/if}}
  {{#if address}}Address: {{{address}}}{{/if}}
  {{#if linkedinUrl}}
  LinkedIn: {{{linkedinUrl}}}
  {{/if}}
  {{#if photoDataUri}}
  Photo: {{media url=photoDataUri}}
  {{/if}}
  Job Title: {{{jobTitle}}}
  Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Experience Level: {{{experienceLevel}}}
  {{#if templateStyle}}
  Template Style: {{{templateStyle}}}
  {{/if}}

  Craft resume content that highlights the candidate's strengths and tailors the content to the specified job title and experience level. Use industry best practices, including clear section headings, concise bullet points, and action-oriented language.  The resume should be well-organized, easy to read, and professional. Omit any personal information not provided.

  Provide the complete resume content in the structured JSON format as defined by the output schema.
`,
});

const generateResumeFromScratchFlow = ai.defineFlow(
  {
    name: 'generateResumeFromScratchFlow',
    inputSchema: GenerateResumeFromScratchInputSchema,
    outputSchema: GenerateResumeFromScratchOutputSchema,
  },
  async input => {
    // Ensure linkedinUrl is null if it's an empty string to pass validation
    if (input.linkedinUrl === '') {
      input.linkedinUrl = null;
    }
    const {output} = await prompt(input);
    return output!;
  }
);
