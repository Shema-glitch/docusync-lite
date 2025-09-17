
'use client';

import { useOnboarding } from "@/hooks/use-onboarding";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Check, Upload, Search, Star, Zap } from "lucide-react";
import { Progress } from "./ui/progress";

const steps = [
    {
        title: "Welcome to DocuSync Lite!",
        description: "This quick tour will show you the key features to get you started. You'll learn how to upload, find, and organize your documents.",
        icon: Zap,
    },
    {
        title: "Upload Your First Document",
        description: "Click the 'Upload Document' button in the sidebar. You can drag and drop files or browse your computer. It's the first step to building your digital vault.",
        icon: Upload,
    },
    {
        title: "Search Across Everything",
        description: "Use the search bar at the top to instantly find documents by title, content, or tags. Never lose a file again.",
        icon: Search,
    },
    {
        title: "Star Your Favorites",
        description: "Hover over any document and click the star icon to pin it for quick access. Your favorite documents will appear on the dashboard and in the 'Favorites' section.",
        icon: Star,
    },
    {
        title: "You're All Set!",
        description: "You've learned the basics. You can always find more features in the document menus and settings. Enjoy a more organized digital life!",
        icon: Check,
    }
];

export function OnboardingGuide() {
    const { isFirstTime, setIsFirstTime, currentStep, nextStep, prevStep, completeOnboarding } = useOnboarding();

    if (!isFirstTime) {
        return null;
    }

    const CurrentIcon = steps[currentStep].icon;
    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <Dialog open={isFirstTime} onOpenChange={setIsFirstTime}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center items-center mb-4 bg-primary/10 rounded-full h-16 w-16 mx-auto">
                        <CurrentIcon className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl">{steps[currentStep].title}</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {steps[currentStep].description}
                    </DialogDescription>
                </DialogHeader>

                <Progress value={progress} className="w-full my-4" />

                <DialogFooter className="flex justify-between w-full">
                    {currentStep > 0 ? (
                        <Button variant="outline" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                    ) : (
                         <div />
                    )}

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={nextStep}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={completeOnboarding}>
                            Finish <Check className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
