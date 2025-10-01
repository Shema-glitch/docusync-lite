

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle, AlertCircle, LogIn, Info } from 'lucide-react';
import Link from 'next/link';
import { ForgotPasswordDialog } from '@/components/auth/forgot-password-dialog';
import { AuthHeader } from '@/components/layout/auth-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isRecentLoginLoading, setIsRecentLoginLoading] = useState(false);
  const { login, loginWithGoogle, loginWithMicrosoft, loginWithFacebook } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isForgotPassOpen, setForgotPassOpen] = useState(false);
  const { toast } = useToast();
  
  const [lastLoginProvider, setLastLoginProvider] = useState<string | null>(null);
  const [lastUserName, setLastUserName] = useState<string | null>(null);
  const [lastUserEmail, setLastUserEmail] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  const anyLoading = isLoading || isGoogleLoading || isMicrosoftLoading || isFacebookLoading || isRecentLoginLoading;
  const isFormFilled = email.trim() !== '' && password.trim() !== '';

  useEffect(() => {
    const resetSuccess = searchParams.get('reset_success');
    if (resetSuccess) {
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully. Please log in with your new password.',
      });
    }

    const lastProvider = localStorage.getItem('lastLoginProvider');
    const lastName = localStorage.getItem('lastUserName');
    const lastEmail = localStorage.getItem('lastUserEmail');

    if(lastProvider && lastName) {
        setLastLoginProvider(lastProvider);
        setLastUserName(lastName);
        if(lastEmail) {
            setLastUserEmail(lastEmail);
        }
        setShowManualForm(false);
    } else {
        setShowManualForm(true);
    }

  }, [searchParams, toast]);

  const handleSuccessfulLogin = () => {
    const redirect = searchParams.get('redirect');
    router.push(redirect ? decodeURIComponent(redirect) : '/');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormFilled) {
        toast({
            variant: "destructive",
            title: "Notice",
            description: "Please fill in all fields.",
        });
        return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      handleSuccessfulLogin();
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
        handleSuccessfulLogin();
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

  const handleRecentLogin = async () => {
    if (!lastLoginProvider) return;
    
    setIsRecentLoginLoading(true);
    if (lastLoginProvider === 'password') {
        toast({
            variant: "destructive",
            title: "Notice",
            description: "Please enter your password to continue.",
        });
        if (lastUserName) {
          const lastEmail = localStorage.getItem('lastUserEmail');
          if (lastEmail) setEmail(lastEmail);
        }
        setShowManualForm(true);
    } else if (lastLoginProvider === 'google.com') {
        await handleProviderLogin('google');
    } else if (lastLoginProvider === 'facebook.com') {
        await handleProviderLogin('facebook');
    } else if (lastLoginProvider.includes('microsoft.com')) {
        await handleProviderLogin('microsoft');
    }
    setIsRecentLoginLoading(false);
  }
  
  const redirectParam = searchParams.get('redirect');
  const signupHref = redirectParam ? `/signup?redirect=${redirectParam}` : '/signup';

  const getProviderIcon = (provider: string | null) => {
    switch (provider) {
      case 'google.com':
        return <GoogleIcon />;
      case 'facebook.com':
        return <FacebookIcon />;
      case 'microsoft.com':
        return <MicrosoftIcon />;
      default:
        return <LogIn className="h-5 w-5 text-muted-foreground" />;
    }
  }

  const showGoogleContext = lastUserEmail && lastLoginProvider === 'google.com' && !showManualForm;

  return (
    <>
    <div className="flex flex-col min-h-screen bg-background">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
            <div className="text-center">
            <h1 className="text-3xl font-bold">Log in to your account</h1>
            </div>

            {lastLoginProvider && lastUserName && !showManualForm && (
                <>
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardDescription>Welcome back!</CardDescription>
                        <CardTitle className="flex items-center gap-3">
                            {getProviderIcon(lastLoginProvider)}
                            {lastUserName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={handleRecentLogin} disabled={anyLoading}>
                           {isRecentLoginLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline w-full" onClick={() => setShowManualForm(true)}>
                            Not you? Log in with a different account
                        </Button>
                    </CardFooter>
                </Card>
                <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-xs uppercase text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>
                </>
            )}

            {showManualForm && (
              <>
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
              
                <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-background px-2 text-xs uppercase text-muted-foreground">
                            Or
                        </span>
                    </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 gap-2">
                <Button 
                    variant="secondary"
                    className={cn(
                        "w-full justify-center gap-2",
                        showGoogleContext && "h-auto py-2 flex-col items-start"
                    )}
                    onClick={() => handleProviderLogin('google')}
                    disabled={anyLoading}
                >
                    <div className={cn("flex items-center gap-2", showGoogleContext ? "" : "w-full justify-center")}>
                        {isGoogleLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        <span className="font-semibold">Continue with Google</span>
                    </div>
                    {showGoogleContext && (
                        <span className="text-xs text-muted-foreground pl-7">{lastUserEmail}</span>
                    )}
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

            <div className="mt-4 text-center text-sm">
                New to DocuSync?{' '}
                <Link href={signupHref} className="font-bold text-primary hover:underline">
                Sign up
                </Link>
            </div>
        </div>
      </main>
    </div>
    <ForgotPasswordDialog isOpen={isForgotPassOpen} onOpenChange={setForgotPassOpen} />
    </>
  );
}
