
"use client"
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, Brush, FileText, Star } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { SiteFooter } from '@/components/layout/site-footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

export default function Home() {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: 'AI-Powered Generation',
      description: 'Generate a professional resume from scratch by providing your job title, skills, and experience level. Our AI handles the rest.',
      image: PlaceHolderImages.find(p => p.id === 'ai-generation'),
    },
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'Professional Templates',
      description: 'Choose from a variety of modern, professional, and creative templates. Customize the layout to fit your personal brand.',
      image: PlaceHolderImages.find(p => p.id === 'templates'),
    },
    {
      icon: <Brush className="w-8 h-8 text-primary" />,
      title: 'Intuitive Live Editor',
      description: 'Easily edit your resume with our rich-text editor and see your changes in real-time. Fine-tune every detail to perfection.',
      image: PlaceHolderImages.find(p => p.id === 'editor'),
    },
  ];

  const testimonials = [
    {
      name: 'Sarah L.',
      role: 'Software Engineer',
      avatar: PlaceHolderImages.find(p => p.id === 'testimonial-1'),
      review: "SmartCV helped me land my dream job! The AI suggestions were spot-on and the templates are beautiful. I got multiple interview calls within a week.",
    },
    {
      name: 'Michael B.',
      role: 'Product Manager',
      avatar: PlaceHolderImages.find(p => p.id === 'testimonial-2'),
      review: "As a product manager, I know the importance of presentation. This tool made it incredibly easy to create a polished, professional resume that truly stands out.",
    },
    {
      name: 'Jessica T.',
      role: 'UX Designer',
      avatar: PlaceHolderImages.find(p => p.id === 'testimonial-3'),
      review: "I'm a designer, so aesthetics matter to me. I was impressed by the clean UI and the modern resume templates. It's the best resume builder I've ever used.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative container text-center py-20 sm:py-32 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[120%] h-[680px] -z-10"
            style={{
              background: 'radial-gradient(ellipse 50% 50% at 50% 50%, hsl(var(--primary) / 0.1), transparent 80%)'
            }}
          />
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline"
          >
            Craft Your Perfect Resume with AI
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            SmartCV helps you create a standout resume in minutes.
            Leverage our AI to generate, enhance, and tailor your resume for your
            dream job.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform">
              <Link href="/dashboard">
                Create Your Resume <ArrowRight className="ml-2" />
              </Link>
            </Button>
             <Button asChild size="lg" variant="ghost">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </motion.div>
        </section>

        <section id="features" className="container py-20 sm:py-32">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
              Why Choose SmartCV?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to build a resume that gets you hired.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="bg-card/70 backdrop-blur-lg border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <CardHeader className="items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-4 bg-primary/10 rounded-full mb-4"
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {feature.image && (
                      <div className="aspect-video overflow-hidden rounded-lg border">
                        <Image
                          src={feature.image.imageUrl}
                          alt={feature.description}
                          width={1080}
                          height={810}
                          className="object-cover"
                          data-ai-hint={feature.image.imageHint}
                        />
                      </div>
                    )}
                    <p className="mt-4 text-center text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="bg-secondary/30 py-20 sm:py-32">
            <div className="container">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl font-headline">
                        Loved by Professionals Worldwide
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                        Don't just take our word for it. Here's what our users have to say.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                      <motion.div
                        key={testimonial.name}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Card key={testimonial.name} className="flex flex-col h-full bg-card hover:-translate-y-1 transition-transform duration-300">
                            <CardContent className="pt-6 flex-grow">
                                <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="text-yellow-400 fill-yellow-400 w-5 h-5"/>)}
                                </div>
                                <p className="mt-4 text-muted-foreground italic">"{testimonial.review}"</p>
                            </CardContent>
                            <CardFooter className="mt-4 flex items-center gap-4">
                                {testimonial.avatar && (
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.avatar.imageHint} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </div>
            </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
