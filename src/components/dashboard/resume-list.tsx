
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  collection,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { MoreHorizontal, Pencil, Trash2, FilePlus2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';

interface Resume {
  id: string;
  title: string;
  lastModified: Timestamp | null;
  imageUrl?: string; 
  imageHint?: string;
}

export function ResumeList() {
  const firestore = useFirestore();
  const { user } = useUser();

  const resumesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'resumes');
  }, [firestore, user]);

  const { data: resumes, isLoading } = useCollection<Resume>(resumesQuery);

  const handleDelete = async (resumeId: string) => {
    if (!firestore || !user) return;
    const resumeRef = doc(firestore, 'users', user.uid, 'resumes', resumeId);
    await deleteDoc(resumeRef);
  };
  
  const resumePlaceholders = [
    PlaceHolderImages.find(p => p.id === 'resume-thumb-1'),
    PlaceHolderImages.find(p => p.id === 'resume-thumb-2'),
    PlaceHolderImages.find(p => p.id === 'resume-thumb-3'),
  ];

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <Skeleton className="aspect-[400/565] w-full" />
                    <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-8 w-8" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="text-center py-12 md:py-16 border-2 border-dashed rounded-lg bg-secondary/30">
        <div className="w-16 h-16 bg-background mx-auto rounded-full flex items-center justify-center mb-4">
            <FilePlus2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">No Resumes Found</h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">It looks like you haven't created any resumes yet. Get started by creating your first one!</p>
        <Button asChild>
          <Link href="/dashboard/new">
            Create Your First Resume
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {resumes.map((resume, index) => {
        const placeholder = resumePlaceholders[index % resumePlaceholders.length];
        const lastModifiedDate = resume.lastModified instanceof Timestamp 
            ? resume.lastModified.toDate() 
            : new Date();
        const formattedLastModified = resume.lastModified 
            ? `${formatDistanceToNow(lastModifiedDate)} ago`
            : 'recently';
        return (
          <Card
            key={resume.id}
            className="group overflow-hidden bg-card/70 backdrop-blur-lg border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <CardHeader className="p-0">
                <Link href={`/editor/${resume.id}`} className="block">
                    <div className="aspect-[400/565] overflow-hidden">
                    <Image
                        src={placeholder?.imageUrl || "https://picsum.photos/seed/resume-fallback/400/565"}
                        alt={resume.title}
                        width={400}
                        height={565}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={placeholder?.imageHint || 'document'}
                    />
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <h3 className="font-semibold truncate">{resume.title || `Untitled Resume`}</h3>
              <p className="text-sm text-muted-foreground">
                Last modified {formattedLastModified}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/editor/${resume.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()} // Prevent closing dropdown
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            resume and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(resume.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
