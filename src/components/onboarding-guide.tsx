
'use client';

import { useOnboarding } from "@/hooks/use-onboarding";
import { Popover, PopoverContent, PopoverAnchor } from "./ui/popover";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Check, Upload, Search, Star, Zap, ShieldCheck } from "lucide-react";
import { Progress } from "./ui/progress";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const steps = [
    {
        title: "Welcome to DocuSync Lite!",
        description: "This quick tour will show you the key features to get you started. You'll learn how to upload, find, and organize your documents.",
        icon: Zap,
        targetId: null,
        position: 'center' as const,
        route: null,
    },
    {
        title: "Upload Your First Document",
        description: "Click here to upload files. You can drag and drop or browse your computer. It's the first step to building your digital vault.",
        icon: Upload,
        targetId: 'step-1-upload',
        position: 'bottom' as const,
        route: null,
    },
    {
        title: "Search Across Everything",
        description: "Use the search bar to instantly find documents by title, content, or tags. Never lose a file again.",
        icon: Search,
        targetId: 'step-2-search',
        position: 'bottom' as const,
        route: null,
    },
    {
        title: "Star Your Favorites",
        description: "Hover over any document and click the star icon to pin it for quick access from your dashboard.",
        icon: Star,
        targetId: 'step-3-favorite',
        position: 'bottom' as const,
        route: '/documents',
    },
    {
        title: "Secure Your Account",
        description: "Head to Settings > Security to enable Two-Factor Authentication (2FA). It adds an extra layer of protection.",
        icon: ShieldCheck,
        targetId: 'step-4-security',
        position: 'bottom-end' as const,
        route: '/settings',
    },
];

const totalSteps = steps.length;

export function OnboardingGuide() {
    const { isGuideVisible, setIsGuideVisible, currentStep, nextStep, prevStep, completeOnboarding } = useOnboarding();
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
    const previousRouteRef = useRef<string | null>(null);

    const step = steps[currentStep];
    const progress = ((currentStep + 1) / totalSteps) * 100;
    const titleId = `onboarding-title-${currentStep}`;
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isGuideVisible && isMounted) {
            const currentStepInfo = steps[currentStep];

            if (currentStepInfo.route && window.location.pathname !== currentStepInfo.route) {
                previousRouteRef.current = window.location.pathname;
                router.push(currentStepInfo.route);
            }
            
            // Hide popover while we find the element
            setIsVisible(false);

            if (currentStepInfo.targetId) {
                const findElement = () => {
                    const found = document.querySelector<HTMLElement>(`[data-onboarding-id="${currentStepInfo.targetId}"]`);
                    if (found) {
                        setTargetElement(found);
                        setIsVisible(true); // Show popover now that element is found
                        clearInterval(intervalId);
                    }
                }
                const intervalId = setInterval(findElement, 100);
                return () => clearInterval(intervalId);
            } else {
                setTargetElement(null);
                setIsVisible(true); // Show for non-targeted steps (like the intro)
            }
        } else {
            setIsVisible(false);
        }
    }, [isGuideVisible, isMounted, currentStep, router]);
    

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            nextStep();
        } else {
            completeOnboarding();
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsGuideVisible(false);
        }
    }

    if (!isGuideVisible || !isMounted) {
        return null;
    }

    const isCentered = step.position === 'center';
    const CurrentIcon = step.icon;

    const side = isCentered ? undefined : (step.position.includes('-') ? step.position.split('-')[0] as any : step.position);
    const align = isCentered ? undefined : (step.position.includes('-') ? step.position.split('-')[1] as any : 'center');

    return (
        <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]" />

        {/* Highlighter */}
        {isVisible && targetElement && (
            <div 
                className="fixed rounded-md z-[101] border-2 border-primary border-dashed animate-pulse"
                style={{
                    top: targetElement.getBoundingClientRect().top - 4,
                    left: targetElement.getBoundingClientRect().left - 4,
                    width: targetElement.getBoundingClientRect().width + 8,
                    height: targetElement.getBoundingClientRect().height + 8,
                }}
            />
        )}
        
        <Popover open={isVisible} onOpenChange={handleOpenChange}>
            <PopoverAnchor>
                {/* This is a virtual anchor, we position the popover based on screen or element */}
                <div 
                    className={cn(!isCentered && "fixed")}
                    style={!isCentered && targetElement ? {
                       top: targetElement.getBoundingClientRect().top,
                       left: targetElement.getBoundingClientRect().left,
                       width: targetElement.getBoundingClientRect().width,
                       height: targetElement.getBoundingClientRect().height,
                    } : {}}
                />
            </PopoverAnchor>
            <PopoverContent 
                side={side}
                align={align}
                className="z-[102] w-80"
                style={isCentered ? {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                } : {}}
                onEscapeKeyDown={() => setIsGuideVisible(false)}
                aria-labelledby={titleId}
            >
                <div className="grid gap-4">
                    <div className="space-y-2 text-center">
                        <div className="flex justify-center items-center mb-4 bg-primary/10 rounded-full h-12 w-12 mx-auto">
                            <CurrentIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h4 id={titleId} className="font-medium leading-none">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                            {step.description}
                        </p>
                    </div>

                    <Progress value={progress} className="w-full my-2" />

                    <div className="flex justify-between w-full">
                        {currentStep > 0 ? (
                            <Button variant="ghost" size="sm" onClick={prevStep}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                            </Button>
                        ) : <div />}

                        <Button size="sm" onClick={handleNext}>
                            {currentStep < totalSteps - 1 ? 'Next' : 'Finish'}
                            <ArrowRight className={cn("ml-2 h-4 w-4", currentStep === totalSteps - 1 && "hidden")} />
                            <Check className={cn("ml-2 h-4 w-4", currentStep < totalSteps - 1 && "hidden")} />
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        </>
    );
}
