
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Lightbulb, Pin, User, ArrowRight } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents.tsx";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

export function HeaderSuggestions() {
    const { documents } = useDocuments();
    const { user } = useAuth();
    const router = useRouter();

    const hasPinnedDocuments = documents.some(doc => doc.isFavorite);
    const hasOrganizationName = !!user?.organizationName;

    const suggestions = [];

    if (!hasPinnedDocuments) {
        suggestions.push({
            icon: Pin,
            title: "Pin Your First Document",
            description: "Click the star on any document to pin it for quick access.",
            action: () => router.push('/documents')
        });
    }

    if (!hasOrganizationName) {
        suggestions.push({
            icon: User,
            title: "Personalize Your Workspace",
            description: "Add your organization's name to give your dashboard a personal touch.",
            action: () => router.push('/settings')
        });
    }
    
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{suggestions.length}</Badge>
                    <span className="sr-only">Show suggestions</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">For You</h4>
                        <p className="text-sm text-muted-foreground">
                           Suggestions to improve your workflow.
                        </p>
                    </div>
                     <div className="grid gap-2">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0 last:border-b-0 border-b">
                                 <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                 <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">
                                        {suggestion.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {suggestion.description}
                                    </p>
                                 </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

