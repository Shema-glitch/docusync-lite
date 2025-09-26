
'use client';

import { UserProfile } from '@/components/user-profile';
import { useDocuments } from '@/hooks/use-documents.tsx';
import { useEffect, useState } from 'react';
import type { User } from '@/hooks/use-auth';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params: { id } }: { params: { id: string } }) {
  const { findUserById } = useDocuments();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await findUserById(id);
        if (!user) {
          setError('User not found.');
        }
        setProfileUser(user);
      } catch (e) {
        console.error("Failed to fetch user", e);
        setError('An error occurred while fetching the user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, findUserById]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="text-2xl font-bold tracking-tight">Profile Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            {error || 'The profile you are looking for does not exist.'}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return <UserProfile user={profileUser} />;
}
