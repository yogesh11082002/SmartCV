
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
    {
      slug: "post-1",
      title: "5 Common Resume Mistakes and How to Fix Them",
      date: "May 28, 2024",
      category: "Resume Tips",
      excerpt: "Your resume is your first impression. Learn how to avoid common pitfalls that could be costing you interviews.",
      image: PlaceHolderImages.find(p => p.id === 'resume-thumb-1'),
      content: `
        <p>Your resume is often the first interaction a potential employer has with you. It's a critical document that can either open doors or close them. Unfortunately, many job seekers make common mistakes that hinder their chances. Here are five of the most frequent errors and how you can fix them to make your resume shine.</p>
        
        <h2>1. Typos and Grammatical Errors</h2>
        <p>This might seem obvious, but it's the most common mistake. Typos and grammatical errors scream a lack of attention to detail. In a competitive job market, even a single mistake can be enough for a recruiter to toss your resume.</p>
        <p><strong>Fix:</strong> Proofread, proofread, proofread. Read your resume aloud, use a grammar checker like Grammarly, and have a friend or family member review it for you. A fresh pair of eyes can catch mistakes you've overlooked.</p>

        <h2>2. A Vague or Missing Summary</h2>
        <p>Recruiters spend only a few seconds scanning each resume. A professional summary at the top should immediately tell them who you are and what you bring to the table. A generic or missing summary forces them to hunt for information.</p>
        <p><strong>Fix:</strong> Write a concise, 3-4 sentence summary tailored to the job you're applying for. Highlight your key skills, years of experience, and biggest career achievements. Use our AI summary generator to get a powerful, professional summary in seconds.</p>

        <h2>3. Not Tailoring Your Resume</h2>
        <p>Sending the same generic resume to every job application is a recipe for rejection. Employers want to see that you've read the job description and that your skills and experience are a direct match for their needs.</p>
        <p><strong>Fix:</strong> For each application, carefully analyze the job description. Identify the key skills and qualifications the employer is looking for and edit your resume to highlight them. Use keywords from the job description to get past automated applicant tracking systems (ATS).</p>

        <h2>4. Focusing on Responsibilities, Not Achievements</h2>
        <p>Many resumes list job duties instead of accomplishments. "Responsible for managing social media accounts" is far less impactful than "Increased social media engagement by 40% in six months by implementing a new content strategy."</p>
        <p><strong>Fix:</strong> For each role, list 3-5 bullet points that showcase your achievements. Use the STAR method (Situation, Task, Action, Result) and quantify your results with numbers, percentages, or dollar amounts whenever possible. This provides concrete evidence of your value.</p>

        <h2>5. Poor Formatting and Design</h2>
        <p>A cluttered, hard-to-read resume will quickly be discarded. Inconsistent fonts, tiny margins, and a wall of text make it difficult for recruiters to find the information they need.</p>
        <p><strong>Fix:</strong> Choose a clean, professional template. Use a clear font (like Calibri, Arial, or Georgia) in a readable size (10-12 points). Ensure there's plenty of white space and use consistent formatting for headings, dates, and bullet points. SmartCV offers a range of professionally designed templates to make this easy.</p>
        
        <p>Avoiding these common mistakes will significantly improve your resume's effectiveness and increase your chances of landing an interview. Good luck!</p>
      `
    },
    {
      slug: "post-2",
      title: "How to Tailor Your Resume for Any Job Using AI",
      date: "May 22, 2024",
      category: "AI Tools",
      image: PlaceHolderImages.find(p => p.id === 'ai-generation'),
      content: "<p>Content for this blog post is coming soon. Check back later!</p>"
    },
    {
      slug: "post-3",
      title: "The Ultimate Guide to Action Verbs for Your Resume",
      date: "May 15, 2024",
      category: "Writing Guide",
      image: PlaceHolderImages.find(p => p.id === 'editor'),
      content: "<p>Content for this blog post is coming soon. Check back later!</p>"
    },
    {
      slug: "post-4",
      title: "Choosing the Right Resume Template for Your Industry",
      date: "May 10, 2024",
      category: "Design",
      image: PlaceHolderImages.find(p => p.id === 'templates'),
      content: "<p>Content for this blog post is coming soon. Check back later!</p>"
    }
  ];

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <article className="prose dark:prose-invert max-w-4xl mx-auto">
          {post.image && (
            <div className="aspect-video rounded-lg overflow-hidden border mb-8">
              <Image 
                src={post.image.imageUrl} 
                alt={post.title} 
                width={1200}
                height={675}
                className="object-cover w-full h-full"
                data-ai-hint={post.image.imageHint}
              />
            </div>
          )}
          <Badge variant="secondary" className="mb-2">{post.category}</Badge>
          <h1>{post.title}</h1>
          <p className="text-sm text-muted-foreground">Published on {post.date}</p>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
