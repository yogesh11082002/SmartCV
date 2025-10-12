

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Eye, FilePlus2 } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    { name: "Modern", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-1'), id: "modern" },
    { name: "Executive", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-2'), id: "executive" },
    { name: "Creative", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-3'), id: "creative" },
    { name: "Minimalist", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-1'), id: "minimalist" },
    { name: "Classic", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-2'), id: "classic" },
    { name: "Academic", image: PlaceHolderImages.find(p => p.id === 'resume-thumb-3'), id: "academic" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Resume Templates</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of professionally designed templates. Find the perfect one to match your style and industry.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map(template => template.image && (
              <Card key={template.id} className="group overflow-hidden">
                 <Link href={`/editor/new?template=${template.id}`} className="block">
                    <CardHeader className="p-0 relative">
                       <div className="aspect-[400/565] overflow-hidden">
                          <Image
                              src={template.image.imageUrl}
                              alt={template.name}
                              width={400}
                              height={565}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              data-ai-hint={template.image.imageHint}
                          />
                      </div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button asChild size="sm">
                              <div className="flex items-center">
                                <FilePlus2 className="mr-2"/>
                                Use Template
                              </div>
                          </Button>
                      </div>
                    </CardHeader>
                    <CardFooter className="p-4">
                      <h3 className="font-semibold w-full text-center">{template.name}</h3>
                    </CardFooter>
                  </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

    

    

    