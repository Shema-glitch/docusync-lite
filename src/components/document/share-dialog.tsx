
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocuments } from '@/hooks/use-documents.tsx';
import type { Document, DocumentMember } from '@/lib/types';
import { useAuth, type User } from '@/hooks/use-auth';
import { Loader2, Copy, Users, Check, Trash2, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  document: Document;
}

export function ShareDialog({ isOpen, onOpenChange, document }: ShareDialogProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { updateDocumentMembers, findUserByEmail } = useDocuments();
  
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${document.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Share link has been copied to your clipboard." });
  }
  
  const handleInvite = async () => {
    if (!email) return;

    setIsSearching(true);
    const userToInvite = await findUserByEmail(email);
    setIsSearching(false);
    
    if (!userToInvite) {
        toast({ variant: 'destructive', title: 'User not found', description: `No user with the email ${email} exists.` });
        return;
    }

    if (document.members[userToInvite.id]) {
        toast({ variant: 'destructive', title: 'Already a member', description: `${email} already has access to this document.` });
        return;
    }

    const newMembers = {
        ...document.members,
        [userToInvite.id]: {
            role: 'viewer' as const,
            name: userToInvite.name,
            avatar: userToInvite.avatar,
        }
    };

    setIsUpdating(true);
    await updateDocumentMembers(document.id, newMembers);
    setIsUpdating(false);

    toast({ title: 'User Invited', description: `${email} has been invited as a viewer.` });
    setEmail('');
  };
  
  const handleRoleChange = async (userId: string, newRole: 'editor' | 'viewer') => {
    if (!document.members[userId] || document.members[userId].role === 'owner') return;

    const newMembers = {
        ...document.members,
        [userId]: { ...document.members[userId], role: newRole }
    };
    setIsUpdating(true);
    await updateDocumentMembers(document.id, newMembers);
    setIsUpdating(false);
     toast({ title: 'Permissions Updated', description: `Permissions for ${document.members[userId].name} have been updated.` });
  }

  const handleRemoveMember = async (userId: string) => {
     if (!document.members[userId] || document.members[userId].role === 'owner') return;

     const newMembers = { ...document.members };
     delete newMembers[userId];
     setIsUpdating(true);
     await updateDocumentMembers(document.id, newMembers);
     setIsUpdating(false);
     toast({ title: 'Member Removed', description: `Access for the user has been revoked.` });
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share "{document.title}"</DialogTitle>
          <DialogDescription>
            Anyone with the link can view. Invite others to collaborate.
          </DialogDescription>
        </DialogHeader>
        
        <div className='space-y-4'>
            <div className="flex space-x-2">
                <Input value={`${window.location.origin}/share/${document.id}`} readOnly className="flex-1 bg-muted border-none" />
                <Button onClick={copyShareLink}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Invite people</Label>
                <div className="flex space-x-2">
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="user@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSearching || isUpdating}
                    />
                    <Button onClick={handleInvite} disabled={isSearching || isUpdating || !email}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className='flex items-center gap-2'>
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">Members</h3>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                   {Object.entries(document.members).map(([id, member]) => (
                       <div key={id} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                               <Avatar>
                                   <AvatarImage src={member.avatar} />
                                   <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div>
                                   <p className="font-medium leading-none">{member.name} {id === currentUser?.id && '(You)'}</p>
                                   <p className="text-sm text-muted-foreground">{member.role === 'owner' ? <span className='flex items-center gap-1'><Crown className="h-3 w-3 text-yellow-500"/>Owner</span> : member.role}</p>
                               </div>
                           </div>
                           {member.role !== 'owner' && (
                               <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                       <Button variant="outline" size="sm">
                                           {member.role === 'editor' ? 'Editor' : 'Viewer'}
                                       </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end">
                                       <DropdownMenuItem onClick={() => handleRoleChange(id, 'editor')}>
                                            <div className='flex items-center justify-between w-full'>
                                                Editor {member.role === 'editor' && <Check className="h-4 w-4" />}
                                            </div>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem onClick={() => handleRoleChange(id, 'viewer')}>
                                            <div className='flex items-center justify-between w-full'>
                                                Viewer {member.role === 'viewer' && <Check className="h-4 w-4" />}
                                            </div>
                                       </DropdownMenuItem>
                                       <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveMember(id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                       </DropdownMenuItem>
                                   </DropdownMenuContent>
                               </DropdownMenu>
                           )}
                       </div>
                   ))}
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
