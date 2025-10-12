
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-resume-improvements.ts';
import '@/ai/flows/generate-resume-from-scratch.ts';
import '@/ai/flows/enhance-existing-resume.ts';
import '@/ai/flows/parse-resume-from-pdf.ts';
