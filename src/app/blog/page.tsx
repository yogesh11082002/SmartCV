import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
  const blogPosts = [
    {
      title: "5 Common Resume Mistakes and How to Fix Them",
      date: "May 28, 2024",
      category: "Resume Tips",
      excerpt: "Your resume is your first impression. Learn how to avoid common pitfalls that could be costing you interviews.",
      image: PlaceHolderImages.find(p => p.id === 'resume-thumb-1'),
      href: "/blog/post-1"
    },
    {
      title: "How to Tailor Your Resume for Any Job Using AI",
      date: "May 22, 2024",
      category: "AI Tools",
      excerpt: "Discover the power of AI in personalizing your resume for each job application, dramatically increasing your chances of success.",
      image: PlaceHolderImages.find(p => p.id === 'ai-generation'),
      href: "/blog/post-2"
    },
    {
      title: "The Ultimate Guide to Action Verbs for Your Resume",
      date: "May 15, 2024",
      category: "Writing Guide",
      excerpt: "Upgrade your resume's impact by using powerful action verbs that showcase your accomplishments and skills.",
      image: PlaceHolderImages.find(p => p.id === 'editor'),
      href: "/blog/post-3"
    },
     {
      title: "Choosing the Right Resume Template for Your Industry",
      date: "May 10, 2024",
      category: "Design",
      excerpt: "From creative fields to corporate roles, the right template can make all the difference. We break down the best choices.",
      image: PlaceHolderImages.find(p => p.id === 'templates'),
      href: "/blog/post-4"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">SmartCV Blog</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Your source for career advice, resume tips, and AI-powered job-hunting strategies.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => post.image && (
              <Card key={post.title} className="flex flex-col overflow-hidden group">
                <Link href={post.href} className="block">
                  <div className="overflow-hidden">
                    <Image src={post.image.imageUrl} alt={post.title} width={600} height={400} data-ai-hint={post.image.imageHint} className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{post.category}</Badge>
                  <CardTitle className="text-xl">
                     <Link href={post.href}>{post.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                   <p className="text-sm text-muted-foreground">{post.date}</p>
                   <Link href={post.href} className="flex items-center text-primary font-semibold text-sm">
                    Read More <ArrowRight className="ml-2 w-4 h-4" />
                   </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
