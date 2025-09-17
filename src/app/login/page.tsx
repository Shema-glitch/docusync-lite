
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
    <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const MicrosoftIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M0 0H23V23H0z" />
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M1 12h10v10H1z" />
        <path fill="#7FBA00" d="M12 1h10v10H12z" />
        <path fill="#FFB900" d="M12 12h10v10H12z" />
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
  const isFormFilled = email.trim() !== '' && password.trim() !== '';

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
            <Alert variant="destructive" className='alert-destructive'>
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
            
            <Button type="submit" className="w-full text-base font-bold" disabled={anyLoading || !isFormFilled}>
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
