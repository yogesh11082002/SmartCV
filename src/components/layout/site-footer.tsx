import Link from "next/link";
import { Logo } from "../shared/logo";

export function SiteFooter() {
    const legalLinks = [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
    ];

    const companyLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Blog', href: '/blog' },
    ];

    const productLinks = [
        { name: 'Features', href: '/#features' },
        { name: 'Templates', href: '/templates' },
        { name: 'Pricing', href: '/pricing' },
    ];


    return (
        <footer className="border-t bg-secondary/50">
            <div className="container py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
                        <Logo />
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Create your perfect resume with the power of AI.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold mb-2">Product</h4>
                        {productLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold mb-2">Company</h4>
                        {companyLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <h4 className="font-semibold mb-2">Legal</h4>
                        {legalLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                </div>
                <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                     <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} SmartCV. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
