import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Users, Target, Eye } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    { name: "Alex Johnson", role: "CEO & Founder", image: PlaceHolderImages.find(p => p.id === 'testimonial-1') },
    { name: "Samantha Lee", role: "Head of AI Development", image: PlaceHolderImages.find(p => p.id === 'testimonial-3') },
    { name: "Michael Brown", role: "Lead Product Designer", image: PlaceHolderImages.find(p => p.id === 'testimonial-2') },
  ];
  const missionImage = PlaceHolderImages.find(p => p.id === 'ai-generation');
  const visionImage = PlaceHolderImages.find(p => p.id === 'templates');

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8 md:py-16">
        <div className="space-y-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">About SmartCV</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              We are dedicated to revolutionizing the job application process by empowering individuals to create their best professional selves.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block bg-primary/10 p-3 rounded-lg">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-headline">Our Mission</h2>
              <p className="text-muted-foreground text-lg">
                To democratize career opportunities by providing cutting-edge AI tools that make professional resume building accessible to everyone. We believe that a great resume is the first step towards a dream job, and we're here to ensure you put your best foot forward.
              </p>
            </div>
            {missionImage && (
              <div className="overflow-hidden rounded-lg shadow-lg">
                <Image src={missionImage.imageUrl} alt="Our Mission" width={1080} height={810} data-ai-hint={missionImage.imageHint} className="object-cover w-full h-full" />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
             {visionImage && (
              <div className="overflow-hidden rounded-lg shadow-lg md:order-last">
                <Image src={visionImage.imageUrl} alt="Our Vision" width={1080} height={810} data-ai-hint={visionImage.imageHint} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="space-y-4">
              <div className="inline-block bg-primary/10 p-3 rounded-lg">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-headline">Our Vision</h2>
              <p className="text-muted-foreground text-lg">
                We envision a world where talent is recognized irrespective of background or connections. By leveraging artificial intelligence, we aim to level the playing field, helping millions of professionals showcase their skills and experiences in the most effective way possible.
              </p>
            </div>
          </div>
          
          <div>
            <div className="text-center mb-12">
               <div className="inline-block bg-primary/10 p-3 rounded-lg mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Meet the Team</h2>
              <p className="mt-4 text-lg text-muted-foreground">The innovators behind SmartCV</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map(member => member.image && (
                <Card key={member.name} className="text-center">
                  <CardContent className="pt-6">
                    <Image src={member.image.imageUrl} alt={member.name} width={120} height={120} data-ai-hint={member.image.imageHint} className="rounded-full mx-auto mb-4 border-4 border-primary/20" />
                    <h3 className="text-xl font-bold">{member.name}</h3>
                    <p className="text-primary">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
