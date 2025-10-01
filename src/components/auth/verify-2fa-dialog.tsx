
'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { send2faCode } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface Verify2faDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userId: string | null;
  userEmail: string | null;
}

export function Verify2faDialog({ isOpen, onOpenChange, userId, userEmail }: Verify2faDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verify2faAndLogin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();


  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCode('');
      setIsLoading(false);
    }
    onOpenChange(open);
  }

  const handleResendCode = async () => {
    if (!userId || !userEmail) return;
    setIsResending(true);
    try {
      const { error } = await send2faCode(userId, userEmail);
      if (error) throw new Error(error);
      toast({
        variant: 'info',
        title: 'Code Sent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to resend code.',
      });
    } finally {
        setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || !userId || !userEmail) return;

    setIsLoading(true);
    try {
      await verify2faAndLogin(userId, userEmail, code);
      // The useAuth hook will handle successful login state change
      handleOpenChange(false);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'The code is incorrect or has expired.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            A verification code has been sent to your email. Enter it to complete your login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="login-2fa-code">Verification Code</Label>
                <Input
                    id="login-2fa-code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                />
            </div>
             <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleResendCode} disabled={isResending}>
                 {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend Code
            </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleVerifyCode} disabled={isLoading || code.length < 6}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
