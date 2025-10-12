

"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FilePlus2, Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseResumeFromPdf } from '@/ai/flows/parse-resume-from-pdf';

export default function NewResumePage() {
    const [isParsing, setIsParsing] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a PDF file.',
            });
            return;
        }

        setIsParsing(true);
        toast({
            title: 'Parsing Resume...',
            description: 'The AI is analyzing your resume. This may take a moment.',
        });

        try {
            const reader = new FileReader();
            const pdfDataUri = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
            
            const parsedData = await parseResumeFromPdf({ pdfDataUri });

            // Store data in session storage to pass to the editor
            sessionStorage.setItem('new-resume-data', JSON.stringify(parsedData));

            toast({
                title: 'Resume Parsed!',
                description: 'Redirecting to the editor to finalize your resume.',
            });
            
            router.push('/editor/new?import=true');

        } catch (error) {
            console.error("Error parsing PDF:", error);
            toast({
                variant: 'destructive',
                title: 'Parsing Failed',
                description: 'There was an error parsing your resume. Please try again or check the server logs.',
            });
        } finally {
            setIsParsing(false);
        }
    };


    return (
        <div className="container max-w-4xl mx-auto py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline">Create a New Resume</h1>
                <p className="text-lg text-muted-foreground mt-2">How would you like to start?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="flex flex-col items-center justify-center text-center p-8 hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FilePlus2 className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Start from Scratch</CardTitle>
                        <CardDescription>
                            Build your resume step-by-step with our guided editor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg">
                            <Link href="/editor/new">
                                Go to Editor <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="flex flex-col items-center justify-center text-center p-8 hover:shadow-lg transition-shadow">
                     <CardHeader>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                           {isParsing ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <UploadCloud className="w-8 h-8 text-primary" />}
                        </div>
                        <CardTitle className="text-2xl">Import from PDF</CardTitle>
                        <CardDescription>
                            Let our AI parse your existing resume and fill in the details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button asChild size="lg" variant="secondary" disabled={isParsing}>
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                {isParsing ? 'Parsing...' : 'Upload PDF'}
                            </label>
                        </Button>
                        <input
                            type="file"
                            id="pdf-upload"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            disabled={isParsing}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
