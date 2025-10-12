
"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { UserNav } from '@/components/shared/user-nav';
import { Logo } from '@/components/shared/logo';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
       <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // A simple way to hide sidebar for the new resume page
  const showSidebar = pathname !== '/dashboard/new' && pathname !== '/editor/new';

  return (
    <SidebarProvider>
      {showSidebar && (
        <Sidebar>
          <AppSidebar />
        </Sidebar>
      )}
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
          <div className="container flex h-14 items-center">
            {showSidebar ? (
               <div className="md:hidden">
                <SidebarTrigger />
              </div>
            ) : null}
            <div className={cn("hidden md:block", !showSidebar && "mr-auto")}>
              <Logo href="/" />
            </div>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
