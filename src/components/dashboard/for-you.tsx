
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pin, User, ArrowRight } from "lucide-react";
import { useDocuments } from "@/hooks/use-documents.tsx";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ForYou() {
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
            description: "Click the star on any document to pin it to your dashboard for quick access.",
            cta: "Browse Documents",
            action: () => router.push('/documents')
        });
    }

    if (!hasOrganizationName) {
        suggestions.push({
            icon: User,
            title: "Personalize Your Workspace",
            description: "Add your organization's name to give your dashboard a personal touch.",
            cta: "Go to Settings",
            action: () => router.push('/settings')
        });
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    For You
                </CardTitle>
                 <CardDescription>
                    Here are some suggestions to help you get the most out of your workspace.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    <suggestion.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{suggestion.title}</p>
                                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={suggestion.action}>
                                {suggestion.cta}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
