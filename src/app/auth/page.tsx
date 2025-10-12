"use client"
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/shared/logo";
import { useUser } from "@/firebase";
import { useEffect } from "react";

export default function AuthPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="absolute top-4 left-4">
              <Logo href="/" />
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    
                    <h1 className="text-2xl font-bold mt-4 font-headline">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to continue to SmartCV</p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
}
