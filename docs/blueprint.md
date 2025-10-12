# **App Name**: SmartResume AI

## Core Features:

- AI Resume Generation: Generate resumes from scratch based on user input such as job titles, skills, and experience level using the Gemini API tool.
- Resume Enhancement: Analyze existing resumes (PDF, DOCX) to suggest improvements using AI. Incorporate better wording, structure, and formatting, powered by the Gemini API tool.
- Resume Editor: Provide a rich text or form-based editor with a live resume preview, allowing users to customize templates, sections (summary, experience, skills, education), and layout.
- User Authentication: Enable user sign-up/login using Google or email-password via Firebase Auth.
- Data Storage: Store user profiles, resumes, AI-generated drafts, uploaded resumes, and exported PDF versions using Firestore and Firebase Storage.
- PDF Export: Allow users to download generated resumes as professional PDF files.
- AI Assistant Sidebar: Integrate a chatbot-like AI assistant to suggest improvements, fix grammar, and tailor content for specific job roles. The AI assistant is powered by Gemini.
- Dashboard: A place for users to manage, organize, and access resumes.
- Image upload: Allow the user to upload a profile image.

## Style Guidelines:

- Primary color: HSL chosen to suggest trustworthiness, royal blue (#244DB7). Use only as accents in the site's buttons.
- Background color: Pale desaturated sky blue for a calm, uncluttered impression (#E8F0FE).
- Accent color: Red-violet, to suggest dynamism (#A020F0).
- Body and headline font: 'Inter' sans-serif for a modern and neutral look.
- Note: currently only Google Fonts are supported.
- Use professional and clean icons from a consistent set. Icons should be related to document management, AI, and user profiles.
- Design a clean, minimal, and professional layout, inspired by Notion and Canva. Implement glassmorphism cards and soft shadows for a premium look.
- Use subtle animations with Framer Motion for UI transitions and interactions.