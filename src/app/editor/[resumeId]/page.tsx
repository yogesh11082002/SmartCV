
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, addDoc, updateDoc, collection, serverTimestamp, DocumentData } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Bot, CalendarIcon, Eye, Loader2, PlusCircle, Save, Sparkles, Trash2, GripVertical, FileText, Palette, Check, Brush, Minus, DraftingCompass, LayoutTemplate, Paintbrush, Briefcase, GraduationCap, Lightbulb, User, Newspaper, Gem, Mail, Phone, MapPin, Link as LinkIcon, Edit, Image as ImageIcon, Download, Book, SquarePen, BookOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { generateResumeFromScratch, GenerateResumeFromScratchOutput } from "@/ai/flows/generate-resume-from-scratch"
import { suggestResumeImprovements } from "@/ai/flows/suggest-resume-improvements"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { parseResumeFromPdf, ParseResumeFromPdfOutput } from '@/ai/flows/parse-resume-from-pdf';

const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date().optional(),
  description: z.string().min(1, "Description is required"),
});

const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  graduationDate: z.date({ required_error: "A graduation date is required." }),
});

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
});

const resumeSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  template: z.string().optional(),
  theme: z.string().optional(),
  personalDetails: z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    linkedin: z.string().optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
  }),
  summary: z.string().optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.string().optional(),
});

type ResumeFormValues = z.infer<typeof resumeSchema>

type Template = "modern" | "executive" | "vibrant" | "minimalist" | "technical" | "creative" | "infographic" | "classic" | "columnist" | "academic";
type Theme = "default" | "sky" | "forest" | "rose" | "indigo" | "slate" | "gold" | "crimson" | "emerald" | "amber" | "violet";

const templates: { id: Template, name: string, icon: React.FC<any> }[] = [
    { id: 'modern', name: 'Modern', icon: FileText },
    { id: 'executive', name: 'Executive', icon: Briefcase },
    { id: 'creative', name: 'Creative', icon: Brush },
    { id: 'classic', name: 'Classic', icon: SquarePen },
    { id: 'academic', name: 'Academic', icon: BookOpen },
    { id: 'vibrant', name: 'Vibrant', icon: Paintbrush },
    { id: 'minimalist', name: 'Minimalist', icon: Minus },
    { id: 'technical', name: 'Technical', icon: DraftingCompass },
    { id: 'infographic', name: 'Infographic', icon: Newspaper },
    { id: 'columnist', name: 'Columnist', icon: Gem },
];
const themes: { id: Theme, name: string, color: string }[] = [
    { id: 'default', name: 'Default', color: 'hsl(222.2 47.4% 11.2%)'},
    { id: 'sky', name: 'Sky', color: 'hsl(200 80% 50%)' },
    { id: 'forest', name: 'Forest', color: 'hsl(140 60% 35%)' },
    { id: 'rose', name: 'Rose', color: 'hsl(340 70% 55%)' },
    { id: 'indigo', name: 'Indigo', color: 'hsl(240 60% 55%)' },
    { id: 'slate', name: 'Slate', color: 'hsl(215 25% 27%)' },
    { id: 'gold', name: 'Gold', color: 'hsl(45 80% 50%)' },
    { id: 'crimson', name: 'Crimson', color: 'hsl(350 80% 50%)' },
    { id: 'emerald', name: 'Emerald', color: 'hsl(160 70% 40%)' },
    { id: 'amber', name: 'Amber', color: 'hsl(35 90% 55%)' },
    { id: 'violet', name: 'Violet', color: 'hsl(270 70% 60%)' },
];


export default function EditorPage() {
  const params = useParams()
  const resumeId = params.resumeId as string;
  const isNew = resumeId === "new"
  const router = useRouter()
  const searchParams = useSearchParams();

  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isAiLoading, setIsAiLoading] = useState<string | boolean>(false) // Can be section name or boolean
  const [activeTemplate, setActiveTemplate] = useState<Template>((searchParams.get("template") as Template) || "modern");
  const [activeTheme, setActiveTheme] = useState<Theme>((searchParams.get("theme") as Theme) || "default");
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  const resumePreviewRef = useRef<HTMLDivElement>(null);


  const resumeDocRef = useMemoFirebase(
    () => (firestore && user && !isNew ? doc(firestore, `users/${user.uid}/resumes`, resumeId) : null),
    [firestore, user, isNew, resumeId]
  )
  const { data: resumeData, isLoading: isResumeLoading } = useDoc<DocumentData>(resumeDocRef)

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: "Untitled Resume",
      template: activeTemplate,
      theme: activeTheme,
      personalDetails: {
        fullName: user?.displayName || "",
        email: user?.email || "",
        phoneNumber: "",
        address: "",
        linkedin: "",
        photoUrl: user?.photoURL || "",
      },
      summary: "",
      experience: [],
      education: [],
      projects: [],
      skills: "",
    },
  })

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  });

   const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  useEffect(() => {
    // Handle data from PDF import
    const isImport = searchParams.get('import') === 'true';
    if (isNew && isImport) {
        const storedData = sessionStorage.getItem('new-resume-data');
        if (storedData) {
            try {
                const parsedData: ParseResumeFromPdfOutput = JSON.parse(storedData);
                const dataToReset: Partial<ResumeFormValues> = {
                  title: `${parsedData.personalDetails?.fullName || 'Untitled'}'s Resume`,
                  personalDetails: {
                    fullName: parsedData.personalDetails?.fullName || user?.displayName || "",
                    email: parsedData.personalDetails?.email || user?.email || "",
                    phoneNumber: parsedData.personalDetails?.phoneNumber || "",
                    address: parsedData.personalDetails?.address || "",
                    linkedin: parsedData.personalDetails?.linkedin || "",
                    photoUrl: user?.photoURL || "",
                  },
                  summary: parsedData.summary,
                  experience: parsedData.experience?.map(exp => ({
                    ...exp,
                    startDate: exp.startDate ? parseISO(exp.startDate) : new Date(),
                    endDate: exp.endDate ? (exp.endDate.toLowerCase() === 'present' ? undefined : parseISO(exp.endDate)) : undefined,
                  })),
                  education: parsedData.education?.map(edu => ({
                    ...edu,
                    graduationDate: edu.graduationDate ? parseISO(edu.graduationDate) : new Date(),
                  })),
                  skills: parsedData.skills,
                  projects: parsedData.projects?.map(proj => ({
                      ...proj,
                      name: proj.name || '',
                      description: proj.description || '',
                      url: proj.url || '',
                  })) || [],
                };
                form.reset(dataToReset as ResumeFormValues);
                sessionStorage.removeItem('new-resume-data');
                // Clean the URL
                router.replace('/editor/new', { scroll: false });
            } catch (e) {
                console.error("Failed to parse imported resume data", e);
                sessionStorage.removeItem('new-resume-data');
            }
        }
    }
  }, [searchParams, isNew, form, user, router]);

  useEffect(() => {
    if (resumeData) {
      // Convert Firestore timestamps to JS Date objects
      const experienceWithDates = resumeData.experience?.map((exp: any) => ({
        ...exp,
        startDate: exp.startDate?.toDate(),
        endDate: exp.endDate?.toDate(),
      })) || [];
      const educationWithDates = resumeData.education?.map((edu: any) => ({
        ...edu,
        graduationDate: edu.graduationDate?.toDate(),
      })) || [];

      const dataToReset: Partial<ResumeFormValues> = {
        title: resumeData.title,
        template: resumeData.template || 'modern',
        theme: resumeData.theme || 'default',
        personalDetails: {
          ...resumeData.personalDetails,
          photoUrl: resumeData.personalDetails?.photoUrl || user?.photoURL || "",
        },
        summary: resumeData.summary,
        experience: experienceWithDates,
        education: educationWithDates,
        projects: resumeData.projects || [],
        skills: resumeData.skills,
      };
      form.reset(dataToReset)
      setActiveTemplate(resumeData.template || 'modern');
      setActiveTheme(resumeData.theme || 'default');
    }
  }, [resumeData, form, user])

  const watchedForm = useWatch({ control: form.control })

  async function onSubmit(data: ResumeFormValues) {
    if (!firestore || !user) return
    setIsSaving(true)

    try {
      if (isNew) {
        const newResumeRef = await addDoc(collection(firestore, `users/${user.uid}/resumes`), {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
          lastModified: serverTimestamp(),
        })
        toast({ title: "Resume created!", description: "Your new resume has been saved." })
        router.replace(`/editor/${newResumeRef.id}`)
      } else {
        await updateDoc(resumeDocRef!, {
          ...data,
          lastModified: serverTimestamp(),
        })
        toast({ title: "Resume updated!", description: "Your changes have been saved." })
      }
    } catch (error) {
      console.error("Error saving resume: ", error)
      toast({ variant: "destructive", title: "Error", description: "Could not save resume." })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDownloadPdf() {
    const element = resumePreviewRef.current;
    if (!element) {
        toast({ variant: "destructive", title: "Error", description: "Could not find resume to download." });
        return;
    }

    setIsDownloading(true);
    toast({ title: "Preparing Download...", description: "Please wait while we generate your PDF." });

    try {
        const canvas = await html2canvas(element, {
            scale: 3, // Higher scale for better quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: null, // Use element's background
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt', // Use points for standard sizing
            format: 'a4',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;
        const pdfAspectRatio = pdfWidth / pdfHeight;

        let finalWidth, finalHeight;

        // Scale to fit page width
        finalWidth = pdfWidth;
        finalHeight = finalWidth / canvasAspectRatio;

        // If it's too tall, scale to fit page height
        if (finalHeight > pdfHeight) {
            finalHeight = pdfHeight;
            finalWidth = finalHeight * canvasAspectRatio;
        }

        const xPos = (pdfWidth - finalWidth) / 2;
        const yPos = (pdfHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
        pdf.save(`${form.getValues('title') || 'resume'}.pdf`);
        toast({ title: "Download started!", description: "Your resume PDF is being downloaded." });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: "destructive", title: "PDF Generation Failed", description: "There was an issue creating your PDF." });
    } finally {
        setIsDownloading(false);
    }
  }

  async function handleAiGenerate(section: 'summary' | `experience.${number}`) {
    const loadingKey = section === 'summary' ? 'summary-gen' : `${section}-gen`;
    setIsAiLoading(loadingKey);
    toast({ title: "AI is generating content..." });

    try {
        const jobTitle = form.getValues('title') || 'Software Engineer';
        const result: GenerateResumeFromScratchOutput = await generateResumeFromScratch({
            jobTitle: jobTitle,
            skills: form.getValues('skills')?.split(',') || [],
            experienceLevel: 'Mid-level', // This could be a form field in the future
        });

        if (section === 'summary') {
            form.setValue('summary', result.summary);
            toast({ title: "Summary Generated!", description: 'A new professional summary has been created.' });
        } else {
            // For experience, we'll take the first generated experience and populate the fields
            const expIndex = parseInt(section.split('.')[1], 10);
            const generatedExp = result.experience[0];
            if (generatedExp) {
                form.setValue(`experience.${expIndex}.jobTitle`, generatedExp.jobTitle);
                form.setValue(`experience.${expIndex}.company`, generatedExp.company);
                form.setValue(`experience.${expIndex}.description`, generatedExp.description);
                // Note: Dates are not set as they are less predictable
            }
            toast({ title: "Experience Generated!", description: 'A new work experience entry has been created.' });
        }

    } catch (error) {
        console.error("AI generation failed:", error);
        toast({ variant: "destructive", title: "AI Error", description: "Failed to generate content." });
    } finally {
        setIsAiLoading(false);
    }
}
  
  async function handleAiImprove<T extends 'summary' | `experience.${number}.description` | `projects.${number}.description`>(field: T, section: string) {
    setIsAiLoading(section);
    const currentValue = form.getValues(field);
    if (!currentValue) {
        toast({ variant: 'destructive', title: 'Empty Field', description: 'Cannot improve an empty field.' });
        setIsAiLoading(false);
        return;
    }
    toast({ title: "AI is improving the text..." });
    try {
        const { improvedText } = await suggestResumeImprovements({ textToImprove: currentValue });
        form.setValue(field, improvedText as any);
        toast({ title: "Content Improved!", description: 'The selected text has been enhanced.' });
    } catch (error) {
        console.error("AI improvement failed:", error);
        toast({ variant: "destructive", title: "AI Error", description: "Failed to improve text." });
    } finally {
        setIsAiLoading(false);
    }
}

  const setTemplate = (template: Template) => {
    setActiveTemplate(template);
    form.setValue('template', template);
  }

  const setTheme = (theme: Theme) => {
    setActiveTheme(theme);
    form.setValue('theme', theme);
  }

  const themeColors: Record<Theme, string> = {
    default: 'hsl(222.2 47.4% 11.2%)',
    sky: 'hsl(200 80% 50%)',
    forest: 'hsl(140 60% 35%)',
    rose: 'hsl(340 70% 55%)',
    indigo: 'hsl(240 60% 55%)',
    slate: 'hsl(215 25% 27%)',
    gold: 'hsl(45 80% 50%)',
    crimson: 'hsl(350 80% 50%)',
    emerald: 'hsl(160 70% 40%)',
    amber: 'hsl(35 90% 55%)',
    violet: 'hsl(270 70% 60%)',
  };
  

  if (isResumeLoading && !isNew) {
    return <EditorLoadingSkeleton />
  }

  const editorContent = (
    <div className={cn("overflow-y-auto h-full", mobileView !== 'editor' && 'hidden md:block')}>
      <Form {...form}>
        <form className="p-4 space-y-6 md:pb-24">
          <Card>
              <CardHeader>
                  <CardTitle>Resume Title</CardTitle>
                  <CardDescription>Give your resume a name to easily identify it later.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                      <FormItem>
                          <FormControl>
                              <Input placeholder="e.g. 'Software Engineer Resume'" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
                />
              </CardContent>
          </Card>
            
          <Accordion type="multiple" defaultValue={['personal-details', 'summary', 'experience', 'education', 'skills', 'projects']} className="w-full">
              <AccordionItem value="personal-details">
                  <AccordionTrigger className="font-semibold">Personal Details</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-4">
                          <FormField control={form.control} name="personalDetails.fullName" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl><Input placeholder="John Doe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <FormField control={form.control} name="personalDetails.email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl><Input placeholder="john.doe@example.com" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <FormField control={form.control} name="personalDetails.phoneNumber" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <FormField control={form.control} name="personalDetails.address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <FormField control={form.control} name="personalDetails.linkedin" render={({ field }) => ( <FormItem> <FormLabel>LinkedIn Profile</FormLabel> <FormControl><Input placeholder="linkedin.com/in/johndoe" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                          <FormField control={form.control} name="personalDetails.photoUrl" render={({ field }) => ( <FormItem> <FormLabel>Photo URL</FormLabel> <FormControl><Input placeholder="https://..." {...field} /></FormControl> <FormDescription>A direct link to a profile picture. Optional.</FormDescription> <FormMessage /> </FormItem> )} />
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="summary">
                  <AccordionTrigger className="font-semibold">Professional Summary</AccordionTrigger>
                  <AccordionContent>
                      <div className="p-4 relative">
                          <FormField control={form.control} name="summary" render={({ field }) => ( <FormItem> <FormLabel>Summary</FormLabel> <FormControl><Textarea placeholder="A brief summary of your professional background..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem> )} />
                          <div className="absolute top-2 right-2 flex gap-1">
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button type="button" variant="ghost" size="icon" onClick={() => handleAiGenerate('summary')} disabled={isAiLoading === 'summary-gen'}>
                                          {isAiLoading === 'summary-gen' ? <Loader2 className="animate-spin"/> : <PlusCircle />}
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Generate with AI</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button type="button" variant="ghost" size="icon" onClick={() => handleAiImprove('summary', 'summary')} disabled={isAiLoading === 'summary'}>
                                          {isAiLoading === 'summary' ? <Loader2 className="animate-spin"/> : <Sparkles />}
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Improve with AI</TooltipContent>
                              </Tooltip>
                          </div>
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="experience">
                  <AccordionTrigger className="font-semibold">Work Experience</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-4">
                          {experienceFields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                                  <FormField control={form.control} name={`experience.${index}.jobTitle`} render={({ field }) => ( <FormItem> <FormLabel>Job Title</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                  <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => ( <FormItem> <FormLabel>Company</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "MMM yyyy")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                      <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "MMM yyyy")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormDescription>Leave blank for present job.</FormDescription><FormMessage /></FormItem>)} />
                                  </div>
                                  <div className="relative">
                                      <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} rows={4} /></FormControl> <FormMessage /> </FormItem> )} />
                                      <div className="absolute top-0 right-0 flex gap-1">
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button type="button" variant="ghost" size="icon" onClick={() => handleAiGenerate(`experience.${index}`)} disabled={isAiLoading === `exp-${index}-gen`}>
                                                      {isAiLoading === `exp-${index}-gen` ? <Loader2 className="animate-spin"/> : <PlusCircle />}
                                                  </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Generate with AI</TooltipContent>
                                          </Tooltip>
                                          <Tooltip>
                                              <TooltipTrigger asChild>
                                                  <Button type="button" variant="ghost" size="icon" onClick={() => handleAiImprove(`experience.${index}.description`, `exp-${index}`)} disabled={isAiLoading === `exp-${index}`}>
                                                      {isAiLoading === `exp-${index}` ? <Loader2 className="animate-spin"/> : <Sparkles />}
                                                  </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Improve with AI</TooltipContent>
                                          </Tooltip>
                                      </div>
                                  </div>
                                  <Button variant="ghost" size="icon" className="absolute top-2 right-[68px]" onClick={() => removeExperience(index)}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                              </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => appendExperience({ jobTitle: "", company: "", startDate: new Date(), description: "" })}>
                              <PlusCircle className="mr-2" /> Add Experience
                          </Button>
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="education">
                  <AccordionTrigger className="font-semibold">Education</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-4">
                          {educationFields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                                  <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => ( <FormItem> <FormLabel>Institution</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                  <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => ( <FormItem> <FormLabel>Degree/Certificate</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                  <FormField control={form.control} name={`education.${index}.graduationDate`} render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Graduation Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? (format(field.value, "MMM yyyy")) : (<span>Pick a date</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                              </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => appendEducation({ institution: "", degree: "", graduationDate: new Date() })}>
                              <PlusCircle className="mr-2" /> Add Education
                          </Button>
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="projects">
                  <AccordionTrigger className="font-semibold">Projects</AccordionTrigger>
                  <AccordionContent>
                      <div className="space-y-4 p-4">
                          {projectFields.map((field, index) => (
                              <div key={field.id} className="p-4 border rounded-md relative space-y-4">
                                  <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => ( <FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                  <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => ( <FormItem> <FormLabel>Project URL</FormLabel> <FormControl><Input {...field} placeholder="https://my-cool-project.com" /></FormControl> <FormMessage /> </FormItem> )} />
                                  <div className="relative">
                                    <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} rows={3} /></FormControl> <FormMessage /> </FormItem> )} />
                                     <Tooltip>
                                          <TooltipTrigger asChild>
                                              <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0" onClick={() => handleAiImprove(`projects.${index}.description`, `proj-${index}`)} disabled={isAiLoading === `proj-${index}`}>
                                                  {isAiLoading === `proj-${index}` ? <Loader2 className="animate-spin"/> : <Sparkles />}
                                              </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Improve with AI</TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Button variant="ghost" size="icon" className="absolute top-2 right-12" onClick={() => removeProject(index)}>
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                              </div>
                          ))}
                          <Button type="button" variant="outline" onClick={() => appendProject({ name: "", description: "", url: "" })}>
                              <PlusCircle className="mr-2" /> Add Project
                          </Button>
                      </div>
                  </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skills">
                  <AccordionTrigger className="font-semibold">Skills</AccordionTrigger>
                  <AccordionContent>
                      <div className="p-4">
                          <FormField control={form.control} name="skills" render={({ field }) => ( <FormItem> <FormLabel>Skills</FormLabel> <FormControl><Textarea placeholder="JavaScript, React, Node.js..." {...field} /></FormControl> <FormMessage /> <p className="text-sm text-muted-foreground">Separate skills with commas.</p> </FormItem> )} />
                      </div>
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </div>
  );

  const previewContent = (
    <div className={cn("bg-slate-200 dark:bg-slate-900/50 p-4 sm:p-8 overflow-y-auto", mobileView !== 'preview' && 'hidden md:block')}>
          <Card 
              ref={resumePreviewRef}
              className="w-full max-w-2xl mx-auto shadow-2xl" 
              id="resume-preview"
              style={{ '--preview-primary': themeColors[activeTheme] } as React.CSSProperties}
          >
              {activeTemplate === 'modern' && <ModernTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'executive' && <ExecutiveTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'vibrant' && <VibrantTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'minimalist' && <MinimalistTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'technical' && <TechnicalTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'creative' && <CreativeTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'infographic' && <InfographicTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'classic' && <ClassicTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'columnist' && <ColumnistTemplatePreview watchedForm={watchedForm} />}
              {activeTemplate === 'academic' && <AcademicTemplatePreview watchedForm={watchedForm} />}
          </Card>
    </div>
  );

  const handleBackNavigation = () => {
    if (mobileView === 'preview') {
      setMobileView('editor');
    } else if (isNew) {
      router.push('/dashboard/new');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-auto md:overflow-hidden">
        <TooltipProvider>
      <div className="flex-none p-2 md:p-4 border-b">
        <div className="hidden md:flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={handleBackNavigation}>
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <div className="flex-1 sm:flex-none flex justify-center items-center gap-2">
            <TemplateSwitcher activeTemplate={activeTemplate} setTemplate={setTemplate} />
            <ThemeSwitcher activeTheme={activeTheme} setTheme={setTheme} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                Download
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
              Save
            </Button>
          </div>
        </div>
        <div className="md:hidden flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
                <ArrowLeft />
            </Button>
            <div className="flex items-center gap-2">
                 <TemplateSwitcher activeTemplate={activeTemplate} setTemplate={setTemplate} />
                 <ThemeSwitcher activeTheme={activeTheme} setTheme={setTheme} />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')}>
                {mobileView === 'editor' ? <Eye /> : <Book />}
                <span className="sr-only">Toggle View</span>
             </Button>
        </div>
      </div>
      <div className="flex-grow grid md:grid-cols-2 gap-0 md:gap-4 overflow-hidden">
          {editorContent}
          {previewContent}
      </div>
      {/* Mobile Action Bar */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t p-2 flex justify-end items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="animate-spin h-4 w-4"/> : <Download className="h-4 w-4" />}
                <span className="ml-2">Download</span>
            </Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                <span className="ml-2">Save</span>
            </Button>
        </div>
      </TooltipProvider>
    </div>
  )
}

function EditorLoadingSkeleton() {
    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-9 w-36" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div>
                    <Skeleton className="h-[80vh] w-full" />
                </div>
            </div>
        </div>
    )
}

function TemplateSwitcher({ activeTemplate, setTemplate }: { activeTemplate: Template, setTemplate: (template: Template) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <LayoutTemplate className="mr-2" />
                    <span className="hidden sm:inline">{templates.find(t => t.id === activeTemplate)?.name || 'Template'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Choose a Template</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {templates.map(template => (
                    <DropdownMenuItem key={template.id} onClick={() => setTemplate(template.id)}>
                        <template.icon className="mr-2" />
                        <span>{template.name}</span>
                        {activeTemplate === template.id && <Check className="ml-auto w-4 h-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ThemeSwitcher({ activeTheme, setTheme }: { activeTheme: Theme, setTheme: (theme: Theme) => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Paintbrush className="mr-2" />
                     <span className="hidden sm:inline">{themes.find(t => t.id === activeTheme)?.name || 'Theme'}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themes.map(theme => (
                     <DropdownMenuItem key={theme.id} onClick={() => setTheme(theme.id)}>
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: theme.color }} />
                        <span>{theme.name}</span>
                        {activeTheme === theme.id && <Check className="ml-auto w-4 h-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/* --- TEMPLATE PREVIEWS --- */

function ModernTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <div className="text-center border-b-2 border-slate-200 dark:border-slate-700 pb-4 mb-6">
            <h2 className="text-4xl font-bold text-[var(--preview-primary)] break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">
                {watchedForm.personalDetails?.email}
                {watchedForm.personalDetails?.phoneNumber && ` | ${watchedForm.personalDetails.phoneNumber}`}
                {watchedForm.personalDetails?.address && ` | ${watchedForm.personalDetails.address}`}
                {watchedForm.personalDetails?.linkedin && ` | ${watchedForm.personalDetails.linkedin}`}
            </p>
        </div>
        
        {watchedForm.summary && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] uppercase tracking-wider mb-2">Professional Summary</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </div>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] uppercase tracking-wider mb-2">Work Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline flex-wrap">
                            <h4 className="text-md font-semibold">{exp.jobTitle}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}
                            </p>
                        </div>
                        <p className="text-md italic text-slate-600 dark:text-slate-400">{exp.company}</p>
                        <ul className="list-disc list-inside mt-1 text-sm text-slate-600 dark:text-slate-300 space-y-1 whitespace-pre-wrap break-words">
                            {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </div>
        )}
        
        {watchedForm.projects && watchedForm.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--preview-primary)] uppercase tracking-wider mb-2">Projects</h3>
            <div className="space-y-4">
              {watchedForm.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline flex-wrap">
                    <h4 className="text-md font-semibold">{proj.name}</h4>
                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View Project</a>}
                  </div>
                  <ul className="list-disc list-inside mt-1 text-sm text-slate-600 dark:text-slate-300 space-y-1 whitespace-pre-wrap break-words">
                    {proj.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchedForm.education && watchedForm.education.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] uppercase tracking-wider mb-2">Education</h3>
                <div className="space-y-2">
                {watchedForm.education.map((edu, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline flex-wrap">
                            <h4 className="text-md font-semibold">{edu.institution}</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400">
                                {edu.graduationDate && format(edu.graduationDate, 'MMM yyyy')}
                            </p>
                        </div>
                        <p className="text-md italic text-slate-600 dark:text-slate-400">{edu.degree}</p>
                    </div>
                ))}
                </div>
            </div>
        )}

        {watchedForm.skills && (
            <div>
                <h3 className="text-lg font-bold text-[var(--preview-primary)] uppercase tracking-wider mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {watchedForm.skills.split(',').map((skill, i) => (
                        skill.trim() && <span key={i} className="bg-[var(--preview-primary)]/10 text-[var(--preview-primary)] text-xs font-semibold px-3 py-1 rounded-full">{skill.trim()}</span>
                    ))}
                </div>
            </div>
        )}
    </div>
  )
}

function ExecutiveTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-serif">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-bold tracking-tight uppercase break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
            <Separator className="my-2 bg-[var(--preview-primary)] h-0.5 w-24 mx-auto"/>
            <p className="text-sm text-slate-500 dark:text-slate-400 break-words">
                {watchedForm.personalDetails?.email}
                {watchedForm.personalDetails?.phoneNumber && ` · ${watchedForm.personalDetails.phoneNumber}`}
                {watchedForm.personalDetails?.address && ` · ${watchedForm.personalDetails.address}`}
                {watchedForm.personalDetails?.linkedin && ` · ${watchedForm.personalDetails.linkedin}`}
            </p>
        </div>
        
        {watchedForm.summary && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold tracking-wider uppercase border-b-2 border-slate-300 dark:border-slate-700 pb-2 mb-3">Summary</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </div>
        )}

        {watchedForm.skills && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold tracking-wider uppercase border-b-2 border-slate-300 dark:border-slate-700 pb-2 mb-3">Core Competencies</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.skills}</p>
            </div>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold tracking-wider uppercase border-b-2 border-slate-300 dark:border-slate-700 pb-2 mb-3">Professional Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center flex-wrap">
                            <h4 className="text-md font-bold">{exp.jobTitle}, <span className="font-normal italic text-[var(--preview-primary)]">{exp.company}</span></h4>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                {exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}
                            </p>
                        </div>
                        <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                           {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </div>
        )}

        {watchedForm.education && watchedForm.education.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold tracking-wider uppercase border-b-2 border-slate-300 dark:border-slate-700 pb-2 mb-3">Education</h3>
                {watchedForm.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start flex-wrap">
                        <div>
                            <h4 className="font-bold">{edu.institution}</h4>
                            <p className="italic">{edu.degree}</p>
                        </div>
                        <p className="text-sm font-medium">{edu.graduationDate && format(edu.graduationDate, 'yyyy')}</p>
                    </div>
                ))}
            </div>
        )}

        {watchedForm.projects && watchedForm.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold tracking-wider uppercase border-b-2 border-slate-300 dark:border-slate-700 pb-2 mb-3">Projects</h3>
            <div className="space-y-4">
              {watchedForm.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center flex-wrap">
                    <h4 className="text-md font-bold">{proj.name}</h4>
                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View Project</a>}
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

function VibrantTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="bg-[var(--preview-primary)] text-white p-8 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
        <p className="text-lg font-light mt-1">{watchedForm.title || "Resume Title"}</p>
      </header>
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--preview-primary)] mb-2">Contact</h3>
              <div className="text-sm space-y-2">
                {watchedForm.personalDetails?.email && <div className="flex items-start gap-2 break-words"><Mail className="w-4 h-4 mt-1 shrink-0"/><div className="break-all">{watchedForm.personalDetails.email}</div></div>}
                {watchedForm.personalDetails?.phoneNumber && <div className="flex items-start gap-2 break-words"><Phone className="w-4 h-4 mt-1 shrink-0"/><div>{watchedForm.personalDetails.phoneNumber}</div></div>}
                {watchedForm.personalDetails?.address && <div className="flex items-start gap-2 break-words"><MapPin className="w-4 h-4 mt-1 shrink-0"/><div>{watchedForm.personalDetails.address}</div></div>}
                {watchedForm.personalDetails?.linkedin && <div className="flex items-start gap-2 break-words"><LinkIcon className="w-4 h-4 mt-1 shrink-0"/><div className="break-all">{watchedForm.personalDetails.linkedin}</div></div>}
              </div>
            </div>
            {watchedForm.education && watchedForm.education.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--preview-primary)] mb-2">Education</h3>
                {watchedForm.education.map((edu, i) => (
                  <div key={i} className="mb-3 text-sm">
                    <p className="font-semibold">{edu.institution}</p>
                    <p>{edu.degree}</p>
                    <p className="text-xs text-slate-500">{edu.graduationDate && format(edu.graduationDate, 'yyyy')}</p>
                  </div>
                ))}
              </div>
            )}
            {watchedForm.skills && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--preview-primary)] mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {watchedForm.skills.split(',').map((skill, i) => (
                    skill.trim() && <span key={i} className="bg-slate-200 dark:bg-slate-700 text-xs font-medium px-2 py-1 rounded">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-6">
            {watchedForm.summary && (
              <div>
                <h3 className="text-lg font-bold border-b-2 border-[var(--preview-primary)] pb-1 mb-2">About Me</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{watchedForm.summary}</p>
              </div>
            )}
            {watchedForm.experience && watchedForm.experience.length > 0 && (
              <div>
                <h3 className="text-lg font-bold border-b-2 border-[var(--preview-primary)] pb-1 mb-2">Work Experience</h3>
                <div className="space-y-4">
                  {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                      <h4 className="text-md font-bold">{exp.jobTitle}</h4>
                      <div className="flex justify-between items-baseline mb-1 flex-wrap">
                        <p className="text-sm font-semibold">{exp.company}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}
                        </p>
                      </div>
                      <ul className="list-disc list-outside pl-4 text-sm space-y-1 whitespace-pre-wrap break-words">
                        {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {watchedForm.projects && watchedForm.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-bold border-b-2 border-[var(--preview-primary)] pb-1 mb-2">Projects</h3>
                <div className="space-y-4">
                  {watchedForm.projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline flex-wrap">
                        <h4 className="text-md font-bold">{proj.name}</h4>
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View</a>}
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MinimalistTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-sans">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-light tracking-widest uppercase break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
            <p className="text-xs tracking-wider text-slate-500 dark:text-slate-400 mt-2 break-words">
                {watchedForm.personalDetails?.email}
                {watchedForm.personalDetails?.phoneNumber && ` | ${watchedForm.personalDetails.phoneNumber}`}
                {watchedForm.personalDetails?.address && ` | ${watchedForm.personalDetails.address}`}
                {watchedForm.personalDetails?.linkedin && ` | ${watchedForm.personalDetails.linkedin}`}
            </p>
        </div>
        
        {watchedForm.summary && (
            <div className="mb-8">
                <p className="text-center italic text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </div>
        )}
        
        <hr className="my-8 border-slate-200 dark:border-slate-700" />

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline flex-wrap">
                            <h4 className="text-md font-semibold">{exp.jobTitle} at {exp.company}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {exp.startDate && format(exp.startDate, 'yyyy')} - {exp.endDate ? format(exp.endDate, 'yyyy') : 'Present'}
                            </p>
                        </div>
                        <p className="text-sm mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">{exp.description}</p>
                    </div>
                ))}
                </div>
            </div>
        )}
        
        {watchedForm.projects && watchedForm.projects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Projects</h3>
            <div className="space-y-4">
              {watchedForm.projects.map((proj, i) => (
                <div key={i}>
                    <div className="flex justify-between items-baseline flex-wrap">
                        <h4 className="text-md font-semibold">{proj.name}</h4>
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View</a>}
                    </div>
                  <p className="text-sm mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchedForm.education && watchedForm.education.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Education</h3>
                <div className="space-y-2">
                {watchedForm.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline flex-wrap">
                        <div>
                            <h4 className="text-md font-semibold">{edu.institution}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{edu.degree}</p>
                        </div>
                         <p className="text-xs text-slate-500 dark:text-slate-400">
                            {edu.graduationDate && format(edu.graduationDate, 'yyyy')}
                        </p>
                    </div>
                ))}
                </div>
            </div>
        )}

        {watchedForm.skills && (
            <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-4">Skills</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{watchedForm.skills}</p>
            </div>
        )}
    </div>
  )
}

function TechnicalTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono">
        <div className="flex justify-between items-center pb-4 border-b-4 border-[var(--preview-primary)] flex-wrap">
            <div>
                <h2 className="text-3xl font-bold break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
            </div>
            <div className="text-right text-xs break-words">
                <p>{watchedForm.personalDetails?.email}</p>
                <p>{watchedForm.personalDetails?.phoneNumber}</p>
                <p>{watchedForm.personalDetails?.address}</p>
                {watchedForm.personalDetails?.linkedin && <p>linkedin.com/in/{watchedForm.personalDetails.linkedin}</p>}
            </div>
        </div>
        
        {watchedForm.summary && (
            <div className="my-5">
                <h3 className="text-sm font-bold text-[var(--preview-primary)] mb-1">[ PROFESSIONAL_SUMMARY ]</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </div>
        )}

        {watchedForm.skills && (
            <div className="my-5">
                <h3 className="text-sm font-bold text-[var(--preview-primary)] mb-2">[ TECHNICAL_SKILLS ]</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {watchedForm.skills.split(',').map((skill, i) => (
                        skill.trim() && <span key={i}>{skill.trim()}</span>
                    ))}
                </div>
            </div>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="my-5">
                <h3 className="text-sm font-bold text-[var(--preview-primary)] mb-2">[ EXPERIENCE ]</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline text-md flex-wrap">
                            <h4 className="font-bold">{exp.jobTitle} // <span className="font-light">{exp.company}</span></h4>
                            <p className="font-light">
                                {exp.startDate && format(exp.startDate, 'MM/yyyy')} - {exp.endDate ? format(exp.endDate, 'MM/yyyy') : 'Current'}
                            </p>
                        </div>
                        <ul className="mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                            {exp.description?.split('\n').map((item, key) => item && <li key={key}><span className="text-[var(--preview-primary)] mr-2">&gt;</span>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </div>
        )}
        
        {watchedForm.projects && watchedForm.projects.length > 0 && (
          <div className="my-5">
            <h3 className="text-sm font-bold text-[var(--preview-primary)] mb-2">[ PROJECTS ]</h3>
            <div className="space-y-4">
              {watchedForm.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline text-md flex-wrap">
                    <h4 className="font-bold">{proj.name}</h4>
                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">[link]</a>}
                  </div>
                   <ul className="mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                    {proj.description?.split('\n').map((item, key) => item && <li key={key}><span className="text-[var(--preview-primary)] mr-2">&gt;</span>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchedForm.education && watchedForm.education.length > 0 && (
            <div className="my-5">
                <h3 className="text-sm font-bold text-[var(--preview-primary)] mb-2">[ EDUCATION ]</h3>
                <div className="space-y-2">
                {watchedForm.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-baseline flex-wrap">
                        <div>
                            <h4 className="text-md font-bold">{edu.degree}</h4>
                            <p className="text-sm font-light">{edu.institution}</p>
                        </div>
                        <p className="text-md font-light">
                           {edu.graduationDate && format(edu.graduationDate, 'MM/yyyy')}
                        </p>
                    </div>
                ))}
                </div>
            </div>
        )}

    </div>
  )
}

function CreativeTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  const avatarPlaceholder = PlaceHolderImages.find(p => p.id === 'user-avatar');
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 grid md:grid-cols-12 gap-8 font-sans">
      {/* Left Column */}
      <div className="md:col-span-4 flex flex-col items-center text-center bg-slate-100 dark:bg-slate-800/50 p-6 rounded-lg">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--preview-primary)] mb-4">
          <Image 
            src={watchedForm.personalDetails?.photoUrl || avatarPlaceholder?.imageUrl || "https://picsum.photos/seed/avatar/200/200"}
            alt={watchedForm.personalDetails?.fullName || "User"}
            width={128}
            height={128}
            className="object-cover w-full h-full"
            data-ai-hint={avatarPlaceholder?.imageHint || 'person cartoon'}
          />
        </div>
        <h2 className="text-2xl font-bold text-[var(--preview-primary)] break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
        <p className="font-medium mt-1">{watchedForm.title || "Resume Title"}</p>
        
        <Separator className="my-6 w-full" />

        <div className="space-y-4 text-xs w-full text-left break-words">
            <h3 className="text-md font-bold text-[var(--preview-primary)] mb-2 uppercase tracking-wider">Contact</h3>
            {watchedForm.personalDetails?.email && <div className="flex items-start gap-2"> <Mail className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span className="break-all">{watchedForm.personalDetails?.email}</span> </div>}
            {watchedForm.personalDetails?.phoneNumber && <div className="flex items-start gap-2"> <Phone className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span>{watchedForm.personalDetails?.phoneNumber}</span> </div>}
            {watchedForm.personalDetails?.address && <div className="flex items-start gap-2"> <MapPin className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span>{watchedForm.personalDetails?.address}</span> </div>}
            {watchedForm.personalDetails?.linkedin && <div className="flex items-start gap-2"> <LinkIcon className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span className="break-all">{watchedForm.personalDetails?.linkedin}</span> </div>}
        </div>
        
        {watchedForm.skills && (
          <div className="w-full text-left mt-6">
            <h3 className="text-md font-bold text-[var(--preview-primary)] mb-2 uppercase tracking-wider">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {watchedForm.skills.split(',').map((skill, i) => skill.trim() && <span key={i} className="bg-[var(--preview-primary)]/10 text-[var(--preview-primary)] text-xs font-semibold px-2 py-1 rounded">{skill.trim()}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="md:col-span-8">
        {watchedForm.summary && (
            <section className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1">Profile</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </section>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <section className="mb-6">
                <h3 className="text-xl font-bold mb-3 text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1">Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <h4 className="text-md font-semibold">{exp.jobTitle}</h4>
                        <div className="flex justify-between items-baseline text-sm flex-wrap">
                           <p className="italic text-slate-600 dark:text-slate-400">{exp.company}</p>
                           <p className="text-xs text-slate-500">{exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}</p>
                        </div>
                        <ul className="list-disc list-outside pl-4 mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                            {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </section>
        )}

        {watchedForm.projects && watchedForm.projects.length > 0 && (
            <section className="mb-6">
                <h3 className="text-xl font-bold mb-3 text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1">Projects</h3>
                 <div className="space-y-4">
                {watchedForm.projects.map((proj, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline flex-wrap">
                            <h4 className="text-md font-semibold">{proj.name}</h4>
                            {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View Project</a>}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
                    </div>
                ))}
                </div>
            </section>
        )}

        {watchedForm.education && watchedForm.education.length > 0 && (
          <section>
            <h3 className="text-xl font-bold mb-3 text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1">Education</h3>
            {watchedForm.education.map((edu, i) => (
                <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between items-baseline flex-wrap">
                        <p className="font-semibold">{edu.institution}</p>
                        <p className="text-xs text-slate-500">{edu.graduationDate && format(edu.graduationDate, 'yyyy')}</p>
                    </div>
                    <p className="italic text-slate-600 dark:text-slate-400">{edu.degree}</p>
                </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}


function InfographicTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col md:flex-row gap-8 font-sans">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 bg-slate-100 dark:bg-slate-800/50 p-6 flex flex-col items-center text-center rounded-lg">
        <h2 className="text-2xl font-bold text-[var(--preview-primary)] mt-4 break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
        <p className="text-sm font-medium mt-1">{watchedForm.title || "Resume Title"}</p>
        
        <Separator className="my-6" />

        <div className="space-y-4 text-xs w-full text-left break-words">
            {watchedForm.personalDetails?.email && <div className="flex items-start gap-2"> <Mail className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span className="break-all">{watchedForm.personalDetails.email}</span> </div>}
            {watchedForm.personalDetails?.phoneNumber && <div className="flex items-start gap-2"> <Phone className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span>{watchedForm.personalDetails.phoneNumber}</span> </div>}
            {watchedForm.personalDetails?.address && <div className="flex items-start gap-2"> <MapPin className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span>{watchedForm.personalDetails.address}</span> </div>}
            {watchedForm.personalDetails?.linkedin && <div className="flex items-start gap-2"> <LinkIcon className="w-4 h-4 text-[var(--preview-primary)] shrink-0 mt-1"/> <span className="break-all">{watchedForm.personalDetails.linkedin}</span> </div>}
        </div>
        
        <Separator className="my-6" />

        {watchedForm.skills && (
          <div className="w-full text-left">
            <h3 className="text-md font-bold text-[var(--preview-primary)] mb-3">Skills</h3>
            <ul className="text-sm space-y-1">
              {watchedForm.skills.split(',').map((skill, i) => skill.trim() && <li key={i} className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" />{skill.trim()}</li>)}
            </ul>
          </div>
        )}

        <Separator className="my-6" />

        {watchedForm.education && watchedForm.education.length > 0 && (
          <div className="w-full text-left">
            <h3 className="text-md font-bold text-[var(--preview-primary)] mb-3">Education</h3>
            {watchedForm.education.map((edu, i) => (
                <div key={i} className="mb-2 text-sm">
                    <p className="font-semibold">{edu.institution}</p>
                    <p className="text-xs">{edu.degree}</p>
                    <p className="text-xs text-slate-500">{edu.graduationDate && format(edu.graduationDate, 'yyyy')}</p>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full md:w-2/3">
        {watchedForm.summary && (
            <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-2"><User className="w-5 h-5 text-[var(--preview-primary)]" /> Profile</h3>
                <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </div>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold mb-2"><Briefcase className="w-5 h-5 text-[var(--preview-primary)]" /> Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i} className="pl-6 relative before:absolute before:left-2 before:top-1 before:w-2 before:h-2 before:bg-[var(--preview-primary)] before:rounded-full before:content-[''] after:absolute after:left-[11px] after:top-4 after:h-[calc(100%-1rem)] after:w-px after:bg-slate-200 dark:after:bg-slate-700 after:content-['']">
                        <h4 className="text-md font-semibold">{exp.jobTitle} at {exp.company}</h4>
                        <p className="text-xs text-slate-500 mb-1">{exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}</p>
                        <p className="text-sm whitespace-pre-wrap break-words">{exp.description}</p>
                    </div>
                ))}
                </div>
            </div>
        )}

        {watchedForm.projects && watchedForm.projects.length > 0 && (
            <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-2"><Gem className="w-5 h-5 text-[var(--preview-primary)]" /> Projects</h3>
                 <div className="space-y-4">
                {watchedForm.projects.map((proj, i) => (
                    <div key={i} className="pl-6 relative before:absolute before:left-2 before:top-1 before:w-2 before:h-2 before:bg-[var(--preview-primary)] before:rounded-full before:content-[''] after:absolute after:left-[11px] after:top-4 after:h-[calc(100%-1rem)] after:w-px after:bg-slate-200 dark:after:bg-slate-700 after:content-['']">
                        <h4 className="text-md font-semibold">{proj.name}</h4>
                        {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View Project</a>}
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
                    </div>
                ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function ClassicTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-black dark:text-white font-[Times,'Times New Roman',serif]">
      <div className="text-center">
        <h2 className="text-3xl font-bold uppercase break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
        <p className="text-sm mt-1 break-words">
          {watchedForm.personalDetails?.address} | {watchedForm.personalDetails?.phoneNumber} | {watchedForm.personalDetails?.email}
          {watchedForm.personalDetails?.linkedin && ` | ${watchedForm.personalDetails.linkedin}`}
        </p>
      </div>

      <Separator className="my-4 bg-black dark:bg-white" />

      {watchedForm.summary && (
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-1">Summary</h3>
          <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.summary}</p>
        </div>
      )}

      {watchedForm.skills && (
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-1">Skills</h3>
          <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.skills}</p>
        </div>
      )}

      {watchedForm.experience && watchedForm.experience.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Experience</h3>
          <div className="space-y-3">
            {watchedForm.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between flex-wrap">
                  <h4 className="text-sm font-bold">{exp.jobTitle}</h4>
                  <p className="text-sm">{exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}</p>
                </div>
                <p className="text-sm italic">{exp.company}</p>
                <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                  {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {watchedForm.projects && watchedForm.projects.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Projects</h3>
          <div className="space-y-3">
            {watchedForm.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between flex-wrap">
                  <h4 className="text-sm font-bold">{proj.name}</h4>
                  {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View</a>}
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {watchedForm.education && watchedForm.education.length > 0 && (
        <div>
          <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Education</h3>
          {watchedForm.education.map((edu, i) => (
            <div key={i} className="flex justify-between flex-wrap">
              <div>
                <h4 className="text-sm font-bold">{edu.degree}</h4>
                <p className="text-sm">{edu.institution}</p>
              </div>
              <p className="text-sm">{edu.graduationDate && format(edu.graduationDate, 'MMM yyyy')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ColumnistTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 grid md:grid-cols-3 gap-8">
      {/* Main Content Column */}
      <div className="md:col-span-2 pr-8 border-r border-slate-200 dark:border-slate-700">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-[var(--preview-primary)] break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
          <p className="text-lg font-medium">{watchedForm.title || "Resume Title"}</p>
        </div>
        {watchedForm.summary && (
            <section className="mb-6">
                <h3 className="text-lg font-bold tracking-wider uppercase mb-2">Summary</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{watchedForm.summary}</p>
            </section>
        )}
        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <section className="mb-6">
                <h3 className="text-lg font-bold tracking-wider uppercase mb-2">Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <h4 className="font-bold">{exp.jobTitle}</h4>
                        <div className="flex justify-between text-sm flex-wrap">
                            <p className="italic">{exp.company}</p>
                            <p className="text-slate-500 dark:text-slate-400">{exp.startDate && format(exp.startDate, 'yyyy')} - {exp.endDate ? format(exp.endDate, 'yyyy') : 'Present'}</p>
                        </div>
                        <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                           {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </section>
        )}
        {watchedForm.projects && watchedForm.projects.length > 0 && (
            <section>
                <h3 className="text-lg font-bold tracking-wider uppercase mb-2">Projects</h3>
                <div className="space-y-4">
                {watchedForm.projects.map((proj, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center flex-wrap">
                            <h4 className="font-bold">{proj.name}</h4>
                            {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline">View Project</a>}
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{proj.description}</p>
                    </div>
                ))}
                </div>
            </section>
        )}
      </div>

      {/* Sidebar Column */}
      <div className="md:col-span-1 space-y-6">
        <section>
          <h3 className="text-md font-bold tracking-wider uppercase mb-2">Contact</h3>
          <div className="text-sm space-y-1 break-words">
              {watchedForm.personalDetails?.email && <p className="break-all">{watchedForm.personalDetails.email}</p>}
              {watchedForm.personalDetails?.phoneNumber && <p>{watchedForm.personalDetails.phoneNumber}</p>}
              {watchedForm.personalDetails?.address && <p>{watchedForm.personalDetails.address}</p>}
              {watchedForm.personalDetails?.linkedin && <p className="break-all">{watchedForm.personalDetails.linkedin}</p>}
          </div>
        </section>
        {watchedForm.skills && (
          <section>
            <h3 className="text-md font-bold tracking-wider uppercase mb-2">Skills</h3>
            <div className="flex flex-wrap gap-1">
                {watchedForm.skills.split(',').map((skill, i) => (
                    skill.trim() && <span key={i} className="bg-[var(--preview-primary)]/10 text-[var(--preview-primary)] text-xs font-semibold px-2 py-1 rounded">{skill.trim()}</span>
                ))}
            </div>
          </section>
        )}
        {watchedForm.education && watchedForm.education.length > 0 && (
          <section>
            <h3 className="text-md font-bold tracking-wider uppercase mb-2">Education</h3>
            <div className="space-y-3">
              {watchedForm.education.map((edu, i) => (
                  <div key={i} className="text-sm">
                      <p className="font-bold">{edu.institution}</p>
                      <p>{edu.degree}</p>
                      <p className="text-xs text-slate-500">{edu.graduationDate && format(edu.graduationDate, 'yyyy')}</p>
                  </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


function AcademicTemplatePreview({ watchedForm }: { watchedForm: ResumeFormValues }) {
  return (
    <div className="p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-serif">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold break-words">{watchedForm.personalDetails?.fullName || "Your Name"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">
                {watchedForm.personalDetails?.email}
                {watchedForm.personalDetails?.phoneNumber && ` | ${watchedForm.personalDetails.phoneNumber}`}
                {watchedForm.personalDetails?.address && ` | ${watchedForm.personalDetails.address}`}
                {watchedForm.personalDetails?.linkedin && ` | ${watchedForm.personalDetails.linkedin}`}
            </p>
        </div>

        {watchedForm.education && watchedForm.education.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1 mb-3">Education</h3>
                {watchedForm.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start mb-2 flex-wrap">
                        <div>
                            <h4 className="font-semibold">{edu.institution}</h4>
                            <p className="italic">{edu.degree}</p>
                        </div>
                        <p className="text-sm">{edu.graduationDate && format(edu.graduationDate, 'MMM yyyy')}</p>
                    </div>
                ))}
            </div>
        )}

        {watchedForm.experience && watchedForm.experience.length > 0 && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1 mb-3">Research & Teaching Experience</h3>
                <div className="space-y-4">
                {watchedForm.experience.map((exp, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-baseline flex-wrap">
                            <h4 className="text-md font-semibold">{exp.jobTitle}, <span className="italic">{exp.company}</span></h4>
                            <p className="text-xs text-slate-500">
                                {exp.startDate && format(exp.startDate, 'MMM yyyy')} - {exp.endDate ? format(exp.endDate, 'MMM yyyy') : 'Present'}
                            </p>
                        </div>
                        <ul className="list-disc list-outside pl-5 mt-1 text-sm space-y-1 whitespace-pre-wrap break-words">
                           {exp.description?.split('\n').map((item, key) => item && <li key={key}>{item}</li>)}
                        </ul>
                    </div>
                ))}
                </div>
            </div>
        )}

        {watchedForm.projects && watchedForm.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1 mb-3">Publications</h3>
            <div className="space-y-2">
              {watchedForm.projects.map((proj, i) => (
                <div key={i}>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    <span className="font-semibold">{proj.name}:</span> {proj.description} 
                    {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--preview-primary)] hover:underline ml-2">[Link]</a>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {watchedForm.skills && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--preview-primary)] border-b-2 border-[var(--preview-primary)] pb-1 mb-3">Technical Skills</h3>
                 <p className="text-sm whitespace-pre-wrap break-words">{watchedForm.skills}</p>
            </div>
        )}
    </div>
  )
}
    

    

    
