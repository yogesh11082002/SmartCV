
import Link from "next/link";
import { ResumeList } from "@/components/dashboard/resume-list";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">My Resumes</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Manage your resumes and create new ones.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/new">
                        <FilePlus2 className="mr-2" />
                        Create New Resume
                    </Link>
                </Button>
            </div>
            <ResumeList />
        </div>
    );
}
