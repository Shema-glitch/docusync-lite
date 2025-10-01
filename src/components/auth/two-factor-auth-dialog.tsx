
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

interface TwoFactorAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function TwoFactorAuthDialog({ isOpen, onOpenChange }: TwoFactorAuthDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { user, enable2FA } = useAuth();
  const { toast } = useToast();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCode('');
      setIsLoading(false);
    }
    onOpenChange(open);
  }

  const handleSendCode = async () => {
    if (!user || !user.email) return;
    setIsResending(true);
    try {
      const { error } = await send2faCode(user.id, user.email);
      if (error) throw new Error(error);
      toast({
        variant: 'info',
        title: 'Code Sent',
        description: 'A verification code has been sent to your email.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send code.',
      });
    } finally {
        setIsResending(false);
    }
  };


  useEffect(() => {
    // Automatically send the code when the dialog opens for the first time.
    if (isOpen && user) {
        handleSendCode();
    }
    // The empty dependency array and the check for `user` ensures this only runs once
    // when the dialog opens with a valid user session. We disable the exhaustive-deps
    // lint rule because we intentionally do not want this to re-run on every property change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleVerifyCode = async () => {
    if (!code) {
        toast({
            variant: 'destructive',
            title: 'Code Required',
            description: 'Please enter the verification code.',
        });
      return;
    }

    setIsLoading(true);
    try {
      await enable2FA(code);
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Two-Factor Authentication has been enabled.',
      });
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
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            We've sent a verification code to your email. Enter it below to enable 2FA.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="2fa-code">Verification Code</Label>
                <Input
                    id="2fa-code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleSendCode} disabled={isResending}>
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
            Enable 2FA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
