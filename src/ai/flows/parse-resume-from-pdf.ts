
'use server';

/**
 * @fileOverview A Genkit flow to parse resume details from a PDF file.
 *
 * - parseResumeFromPdf - A function that extracts structured data from a PDF resume.
 * - ParseResumeFromPdfInput - The input type for the parseResumeFromPdf function.
 * - ParseResumeFromPdfOutput - The return type for the parseResumeFrom-pdf function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Define Zod schemas for structured resume data
const PersonalDetailsSchema = z.object({
  fullName: z.string().optional().describe('The full name of the candidate.'),
  email: z.string().optional().describe('The email address of the candidate.'),
  phoneNumber: z.string().optional().describe('The phone number of the candidate.'),
  address: z.string().optional().describe('The physical address of the candidate.'),
  linkedin: z.string().optional().describe('The URL of the LinkedIn profile.'),
});

const ExperienceSchema = z.object({
  jobTitle: z.string().optional().describe('The job title.'),
  company: z.string().optional().describe('The company name.'),
  startDate: z.string().optional().describe("The start date in 'YYYY-MM-DD' format."),
  endDate: z.string().optional().describe("The end date in 'YYYY-MM-DD' format, or 'Present'."),
  description: z.string().optional().describe('A description of the role and responsibilities.'),
});

const EducationSchema = z.object({
  institution: z.string().optional().describe('The name of the educational institution.'),
  degree: z.string().optional().describe('The degree or certificate obtained.'),
  graduationDate: z.string().optional().describe("The graduation date in 'YYYY-MM' format."),
});

const ProjectSchema = z.object({
    name: z.string().optional().describe("The name of the project."),
    description: z.string().optional().describe("A brief description of the project."),
    url: z.string().url("A valid URL for the project.").optional(),
});

// Input and Output Schemas for the flow
const ParseResumeFromPdfInputSchema = z.object({
  pdfDataUri: z.string().describe("A PDF file encoded as a data URI."),
});
export type ParseResumeFromPdfInput = z.infer<typeof ParseResumeFromPdfInputSchema>;

const ParseResumeFromPdfOutputSchema = z.object({
  personalDetails: PersonalDetailsSchema.optional(),
  summary: z.string().optional().describe('The professional summary or objective.'),
  experience: z.array(ExperienceSchema).optional().describe('A list of work experiences.'),
  education: z.array(EducationSchema).optional().describe('A list of educational qualifications.'),
  projects: z.array(ProjectSchema).optional().describe('A list of projects.'),
  skills: z.string().optional().describe('A comma-separated list of skills.'),
});
export type ParseResumeFromPdfOutput = z.infer<typeof ParseResumeFromPdfOutputSchema>;


// Define the prompt for the AI model
const parseResumePrompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: { schema: ParseResumeFromPdfInputSchema },
  output: { schema: ParseResumeFromPdsfOutputSchema },
  model: 'googleai/gemini-2.5-pro',
  prompt: `You are an expert resume parser. Analyze the following resume document and extract the information into a structured JSON format. Be as accurate as possible. Extract all sections including personal details (name, email, phone, address, linkedin), summary, work experience, education, projects, and skills. For dates, standardize them to 'YYYY-MM-DD' or 'YYYY-MM' format where appropriate.

Resume Document:
{{media url=pdfDataUri}}
`,
});


// Define the main flow
const parseResumeFromPdfFlow = ai.defineFlow(
  {
    name: 'parseResumeFromPdfFlow',
    inputSchema: ParseResumeFromPdfInputSchema,
    outputSchema: ParseResumeFromPdfOutputSchema,
  },
  async (input) => {
    // Use the AI to parse the PDF directly
    const { output } = await parseResumePrompt(input);
    
    if (!output) {
      throw new Error('Failed to get a structured output from the AI model.');
    }

    return output;
  }
);


// Export a wrapper function to be called from the server-side
export async function parseResumeFromPdf(input: ParseResumeFromPdfInput): Promise<ParseResumeFromPdfOutput> {
  return parseResumeFromPdfFlow(input);
}
