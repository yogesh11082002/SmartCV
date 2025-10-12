
'use client';

import Link from "next/link"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { Logo } from "../shared/logo"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useUser } from "@/firebase";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  const navLinks = [
    { name: "Templates", href: "/templates" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          {user && (
            <nav className="flex items-center space-x-1">
              {navLinks.map(link => (
                <Button key={link.name} asChild variant="ghost" className={cn("transition-colors hover:text-primary", pathname === link.href && "text-primary")}>
                  <Link href={link.href}>{link.name}</Link>
                </Button>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {isUserLoading ? (
              <Skeleton className="h-9 w-24 rounded-md" />
            ) : user ? (
              <Button asChild className="group overflow-hidden relative border border-primary/20 shadow-lg shadow-primary/10 rounded-md">
                 <Link href="/dashboard">
                  <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-primary/20 rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                  <span className="relative">Dashboard</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/auth">Login</Link>
                </Button>
                <Button asChild className="group overflow-hidden relative bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-md">
                   <Link href="/auth">
                    <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
                    <span className="relative">Get Started</span>
                  </Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
        <div className="flex md:hidden flex-1 justify-end items-center gap-2">
           {isUserLoading ? (
             <Skeleton className="h-8 w-8 rounded-full" />
           ) : user ? (
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon"><Menu/></Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">Main site navigation for mobile.</SheetDescription>
                  <div className="flex flex-col h-full">
                      <div className="flex-grow">
                        <nav className="flex flex-col items-start space-y-2 mt-8">
                            {navLinks.map(link => (
                                <Button key={link.name} asChild variant="ghost" className="w-full justify-start text-lg">
                                  <SheetClose asChild>
                                    <Link href={link.href}>{link.name}</Link>
                                  </SheetClose>
                                </Button>
                            ))}
                        </nav>
                      </div>
                      <div className="flex flex-col gap-2">
                          <Button asChild className="w-full">
                            <SheetClose asChild>
                              <Link href="/dashboard">Dashboard</Link>
                            </SheetClose>
                          </Button>
                      </div>
                    <div className="mt-4 flex justify-center">
                        <ThemeToggle />
                    </div>
                  </div>
                </SheetContent>
            </Sheet>
           ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth">Get Started</Link>
              </Button>
            </>
           )}
        </div>
      </div>
    </header>
  )
}
