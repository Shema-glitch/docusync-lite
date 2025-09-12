
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading) {
      if (user) {
        const redirect = searchParams.get('redirect');
        if (redirect) {
          router.push(decodeURIComponent(redirect));
        } else {
          router.push('/dashboard');
        }
      } else {
        const redirect = searchParams.get('redirect');
        let loginPath = '/login';
        if (redirect) {
          loginPath += `?redirect=${redirect}`;
        }
        router.push(loginPath);
      }
    }
  }, [user, loading, router, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
