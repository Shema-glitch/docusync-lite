

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AuthHeader } from '@/components/layout/auth-header';
import { useToast } from '@/hooks/use-toast';

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
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M1 12h10v10H1z" />
        <path fill="#7FBA00" d="M12 1h10v10H12z" />
        <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
);

const FacebookIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.1 0-1.5.52-1.5 1.45V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
    </svg>
);


export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithMicrosoft, loginWithFacebook } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const { toast } = useToast();

  const anyLoading = isLoading || isGoogleLoading || isMicrosoftLoading || isFacebookLoading;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(name, email, password);
      toast({
        title: 'Success!',
        description: "Account created successfully! Redirecting...",
      });
      setTimeout(() => {
        const redirect = searchParams.get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/');
      }, 2000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
      setIsLoading(false);
    }
  };
  
  const handleProviderLogin = async (provider: 'google' | 'microsoft' | 'facebook') => {
    const setLoading = {
        google: setIsGoogleLoading,
        microsoft: setIsMicrosoftLoading,
        facebook: setIsFacebookLoading,
    }[provider];
    const loginFn = {
        google: loginWithGoogle,
        microsoft: loginWithMicrosoft,
        facebook: loginWithFacebook,
    }[provider];

    setLoading(true);
    try {
        await loginFn();
        const redirect = searchParams.get('redirect');
        router.push(redirect ? decodeURIComponent(redirect) : '/');
    } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
            toast({
              variant: "destructive",
              title: "Error",
              description: err.message,
            });
        }
        setLoading(false);
    }
  }
  
  const redirectParam = searchParams.get('redirect');
  const loginHref = redirectParam ? `/login?redirect=${redirectParam}` : '/login';

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Create an account</h1>
            </div>

            <div className="grid grid-cols-1 gap-2">
                <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => handleProviderLogin('google')} disabled={anyLoading}>
                    {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GoogleIcon />
                    )}
                    Continue with Google
                </Button>
                <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => handleProviderLogin('microsoft')} disabled={anyLoading}>
                    {isMicrosoftLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MicrosoftIcon />
                    )}
                    Continue with Microsoft
                </Button>
                <Button variant="secondary" className="w-full justify-center gap-2" onClick={() => handleProviderLogin('facebook')} disabled={anyLoading}>
                    {isFacebookLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FacebookIcon />
                    )}
                    Continue with Facebook
                </Button>
            </div>

            <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-2 text-xs uppercase text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>
            
            {showEmailForm ? (
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="name" className='text-xs uppercase text-muted-foreground'>Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={anyLoading}
                        className='bg-background text-base'
                    />
                    </div>
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
                    
                    <Button type="submit" className="w-full text-base font-bold" disabled={anyLoading || !name || !email || !password}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                    </Button>
                </form>
            ) : (
                <Button variant="secondary" className="w-full" onClick={() => setShowEmailForm(true)} disabled={anyLoading}>
                    <Mail className="mr-2 h-4 w-4"/>
                    Continue with Email & Password
                </Button>
            )}

            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href={loginHref} className="font-bold text-primary hover:underline">
                Log in
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
}
