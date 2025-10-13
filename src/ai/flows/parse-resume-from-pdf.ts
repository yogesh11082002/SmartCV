
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
  fullName: z.string().describe('The full name of the candidate.'),
  email: z.string().describe('The email address of the candidate.'),
  phoneNumber: z.string().describe('The phone number of the candidate.'),
  address: z.string().describe('The physical address of the candidate.'),
  linkedin: z.string().describe('The URL of the LinkedIn profile.'),
});

const ExperienceSchema = z.object({
  jobTitle: z.string().describe('The job title.'),
  company: z.string().describe('The company name.'),
  startDate: z.string().describe("The start date in 'YYYY-MM-DD' format."),
  endDate: z.string().describe("The end date in 'YYYY-MM-DD' format, or 'Present'."),
  description: z.string().describe('A description of the role and responsibilities.'),
});

const EducationSchema = z.object({
  institution: z.string().describe('The name of the educational institution.'),
  degree: z.string().describe('The degree or certificate obtained.'),
  graduationDate: z.string().describe("The graduation date in 'YYYY-MM' format."),
});

const ProjectSchema = z.object({
    name: z.string().describe("The name of the project."),
    description: z.string().describe("A brief description of the project."),
    url: z.string().describe("A valid URL for the project.").optional(),
});

// Input and Output Schemas for the flow
const ParseResumeFromPdfInputSchema = z.object({
  pdfDataUri: z.string().describe("A PDF file encoded as a data URI."),
});
export type ParseResumeFromPdfInput = z.infer<typeof ParseResumeFromPdfInputSchema>;

const ParseResumeFromPdfOutputSchema = z.object({
  personalDetails: PersonalDetailsSchema.nullable().describe('The personal details of the candidate. Null if not found.'),
  summary: z.string().describe('The professional summary or objective. Empty string if not found.'),
  experience: z.array(ExperienceSchema).describe('A list of work experiences. Empty array if none found.'),
  education: z.array(EducationSchema).describe('A list of educational qualifications. Empty array if none found.'),
  projects: z.array(ProjectSchema).describe('A list of projects. Empty array if none found.'),
  skills: z.string().describe('A comma-separated list of skills. Empty string if not found.'),
});
export type ParseResumeFromPdfOutput = z.infer<typeof ParseResumeFromPdfOutputSchema>;


// Define the prompt for the AI model
const parseResumePrompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: { schema: ParseResumeFromPdfInputSchema },
  output: { schema: ParseResumeFromPdfOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert resume parser. Analyze the following resume document and extract the information into the structured JSON format defined by the output schema. Be as accurate as possible.

You MUST extract all sections including:
- Personal Details (name, email, phone, address, linkedin)
- A professional Summary or objective
- A list of all Work Experience entries
- A list of all Education entries
- A list of all Projects
- A comma-separated list of Skills

For dates, standardize them to 'YYYY-MM-DD' or 'YYYY-MM' format where appropriate.
If a section or field is not present in the document, return an empty string, an empty array, or null for the corresponding field in the JSON structure, but do not omit the field itself.

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

    // Ensure all optional top-level fields have default values if missing
    return {
        personalDetails: output.personalDetails || null,
        summary: output.summary || "",
        experience: output.experience || [],
        education: output.education || [],
        projects: output.projects || [],
        skills: output.skills || "",
    };
  }
);


// Export a wrapper function to be called from the server-side
export async function parseResumeFromPdf(input: ParseResumeFromPdfInput): Promise<ParseResumeFromPdfOutput> {
  return parseResumeFromPdfFlow(input);
}
