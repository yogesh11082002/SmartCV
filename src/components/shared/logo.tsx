import Link from 'next/link';
import { CheckCircle, FileText } from 'lucide-react';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 group">
      <div className="relative h-8 w-8">
        <FileText className="h-8 w-8 text-primary/80 transition-transform duration-300 ease-in-out group-hover:rotate-[-5deg]" />
        <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 bg-background text-primary transition-transform duration-300 ease-in-out group-hover:scale-110" />
      </div>
      <span className="font-bold text-xl font-headline">SmartCV</span>
    </Link>
  );
}
