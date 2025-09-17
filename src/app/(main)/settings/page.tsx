
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TwoFactorAuthDialog } from '@/components/auth/two-factor-auth-dialog';


type Accent = 'default' | 'violet' | 'orange';

export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppReminders, setInAppReminders] = useState(true);
    const [activityDigest, setActivityDigest] = useState(false);

    const [fontSize, setFontSize] = useState(16);
    const [isHighContrast, setIsHighContrast] = useState(false);

    const [is2faDialogOpen, setIs2faDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name ?? '');
            setAvatar(user.avatar ?? '');
            setOrganizationName(user.organizationName ?? '');
        }
    }, [user]);


    useEffect(() => {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);

    useEffect(() => {
      if (isHighContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      return () => document.body.classList.remove('high-contrast');
    }, [isHighContrast]);
    

    const hasChanges = name !== (user?.name ?? '') || avatar !== (user?.avatar ?? '') || organizationName !== (user?.organizationName ?? '');

    const handleSaveChanges = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Authenticated',
                description: 'You must be logged in to save changes.',
            });
            return;
        }
        if (!name.trim()) {
            toast({
                variant: 'destructive',
                title: 'Invalid Name',
                description: 'Name cannot be empty.',
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateUserProfile({ name, avatar, organizationName });
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'Could not update your profile.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleToggle2FA = () => {
        if (!user?.is2faEnabled) {
            setIs2faDialogOpen(true);
        } else {
            // Here you would typically have another dialog to confirm disabling 2FA
            // For simplicity, we'll just disable it directly
             toast({
                variant: 'destructive',
                title: '2FA Not Yet Disableable',
                description: 'Disabling 2FA is not supported in this version.',
            });
        }
    }


  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, preferences, and more.</p>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile & Branding</CardTitle>
              <CardDescription>
                Customize your personal and workspace appearance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Your Company, Inc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/logo.png"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email ?? ''} readOnly disabled />
              </div>
               <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save changes'}
               </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Select the overall color scheme for the app.</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                    <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>System</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications and reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive emails for document shares, comments, and reminders.</p>
                    </div>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="inapp-notifications">In-App Reminders</Label>
                        <p className="text-sm text-muted-foreground">Show browser notifications for upcoming document reminders.</p>
                    </div>
                    <Switch id="inapp-notifications" checked={inAppReminders} onCheckedChange={setInAppReminders} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="activity-digest">Weekly Activity Digest</Label>
                        <p className="text-sm text-muted-foreground">Get a weekly summary of your document activity.</p>
                    </div>
                    <Switch id="activity-digest" checked={activityDigest} onCheckedChange={setActivityDigest} />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Make the app more comfortable for your needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <p className="text-sm text-muted-foreground">Adjust the font size for better readability.</p>
                    </div>
                    <div className="w-1/3 flex items-center gap-4">
                      <Slider defaultValue={[fontSize]} max={24} min={12} step={1} onValueChange={([value]) => setFontSize(value)} />
                       <span className="text-sm text-muted-foreground w-8">{fontSize}px</span>
                    </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="high-contrast">High Contrast Mode</Label>
                        <p className="text-sm text-muted-foreground">Increase contrast throughout the app.</p>
                    </div>
                    <Switch id="high-contrast" checked={isHighContrast} onCheckedChange={setIsHighContrast} />
                </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account's security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="2fa" className='flex items-center gap-2'>
                           {user?.is2faEnabled ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldOff className="h-5 w-5 text-destructive" />}
                           Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                    </div>
                    <Button variant="outline" onClick={handleToggle2FA}>
                        {user?.is2faEnabled ? 'Disable' : 'Enable'}
                    </Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    <TwoFactorAuthDialog isOpen={is2faDialogOpen} onOpenChange={setIs2faDialogOpen} />
    </>
  );
}
