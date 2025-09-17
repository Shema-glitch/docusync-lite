
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ForgotPasswordDialog } from '@/components/auth/forgot-password-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.58L19.35,4.36C17.27,2.46 15,1.5 12.19,1.5C6.92,1.5 3,6.08 3,12C3,17.92 6.92,22.5 12.19,22.5C17.6,22.5 21.7,18.43 21.7,12.33C21.7,11.77 21.5,11.45 21.35,11.1Z"
        />
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path 
            fill="currentColor"
            d="M11.5,3.5H3.5v8h8Zm9,0h-8v8h8Zm-9,9H3.5v8h8Zm9,0h-8v8h8Z" 
        />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isForgotPassOpen, setForgotPassOpen] = useState(false);
  
  const anyLoading = isLoading || isGoogleLoading || isMicrosoftLoading;

  useEffect(() => {
    const resetSuccess = searchParams.get('reset_success');
    if (resetSuccess) {
      setSuccess('Your password has been reset successfully. Please log in with your new password.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await login(email, password);
      const redirect = searchParams.get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    setSuccess(null);
    try {
        await loginWithGoogle();
        const redirect = searchParams.get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsGoogleLoading(false);
    }
  }

  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    setError(null);
    setSuccess(null);
    try {
        await loginWithMicrosoft();
        const redirect = searchParams.get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsMicrosoftLoading(false);
    }
  }
  
  const redirectParam = searchParams.get('redirect');
  const signupHref = redirectParam ? `/signup?redirect=${redirectParam}` : '/signup';

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log in to your account</h1>
        </div>

        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
        {success && (
             <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-400">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                <AlertDescription>
                    {success}
                </AlertDescription>
            </Alert>
        )}


        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="email" className='text-xs uppercase text-muted-foreground'>Email</Label>
            <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={anyLoading}
                className='bg-background text-base'
            />
            </div>
            <div className="space-y-2">
            <Label htmlFor="password" className='text-xs uppercase text-muted-foreground'>Password</Label>
            <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={anyLoading}
                className='bg-background text-base'
            />
            </div>
            
            <Button type="submit" className="w-full text-base font-bold" disabled={anyLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
            </Button>
        </form>
        <div className="text-center">
            <Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline" onClick={() => setForgotPassOpen(true)}>
                Forgot password?
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
            <Button variant="secondary" className="w-full justify-center gap-2" onClick={handleGoogleLogin} disabled={anyLoading}>
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                Continue with Google
            </Button>
            <Button variant="secondary" className="w-full justify-center gap-2" onClick={handleMicrosoftLogin} disabled={anyLoading}>
                {isMicrosoftLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <MicrosoftIcon />
                )}
                Continue with Microsoft
            </Button>
        </div>

        <div className="mt-4 text-center text-sm">
            New to DocuSync?{' '}
            <Link href={signupHref} className="font-bold text-primary hover:underline">
            Sign up
            </Link>
        </div>
      </div>
    </div>
    <ForgotPasswordDialog isOpen={isForgotPassOpen} onOpenChange={setForgotPassOpen} />
    </>
  );
}
