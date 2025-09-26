
'use client';

import type { User } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AtSign, CalendarDays, Edit, FilePlus, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';


interface UserProfileProps {
  user: User;
}

interface ActivityLog {
  id: string;
  type: 'CREATE_DOCUMENT' | 'SHARE_DOCUMENT';
  timestamp: Timestamp;
  details: {
    documentId: string;
    documentTitle: string;
    sharedWith?: string; // name of user shared with
  };
}

const activityIcons = {
  CREATE_DOCUMENT: FilePlus,
  SHARE_DOCUMENT: Share2,
};

const activityDescriptions = {
  CREATE_DOCUMENT: (details: ActivityLog['details']) => `You created the document "${details.documentTitle}".`,
  SHARE_DOCUMENT: (details: ActivityLog['details']) => `You shared the document "${details.documentTitle}" with ${details.sharedWith}.`,
};


export function UserProfile({ user }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = currentUser?.id === user.id;

  useEffect(() => {
    const activityRef = collection(db, 'users', user.id, 'activity');
    const q = query(activityRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
      setActivity(activities);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{user.name}</CardTitle>
            {user.organizationName && (
                <CardDescription className="text-base">{user.organizationName}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
                <AtSign className="h-5 w-5" />
                <span>{user.email}</span>
            </div>
            {isCurrentUser && (
              <Button className="w-full" variant="outline" onClick={() => router.push('/settings')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>A log of recent actions performed by this user.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                </div>
            ) : activity.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No activity to display yet.</div>
            ) : (
                <div className="space-y-6">
                    {activity.map(log => {
                        const Icon = activityIcons[log.type];
                        const description = activityDescriptions[log.type] ? activityDescriptions[log.type](log.details) : 'Unknown action';
                        return (
                            <div key={log.id} className="flex items-start gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
