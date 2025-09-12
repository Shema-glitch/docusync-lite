
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { DocumentMember } from "@/lib/types";

interface MembersProps {
    members: Record<string, DocumentMember>;
}

export function Members({ members }: MembersProps) {
    const memberList = Object.entries(members);
    const displayedMembers = memberList.slice(0, 3);
    const remainingCount = memberList.length - displayedMembers.length;

    return (
        <TooltipProvider>
            <div className="flex items-center -space-x-2">
                {displayedMembers.map(([id, member]) => (
                     <Tooltip key={id}>
                        <TooltipTrigger asChild>
                            <Avatar className="border-2 border-background">
                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="profile avatar" />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-muted-foreground">{member.role}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {remainingCount > 0 && (
                    <Avatar className="border-2 border-background">
                        <AvatarFallback>+{remainingCount}</AvatarFallback>
                    </Avatar>
                )}
            </div>
        </TooltipProvider>
    )
}
