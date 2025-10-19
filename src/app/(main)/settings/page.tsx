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
import { Loader2, ShieldCheck, ShieldOff, LifeBuoy, User, Palette, Bell, Accessibility, KeyRound, Cloud, FlaskConical, Github, Bot, Link as LinkIcon, LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TwoFactorAuthDialog } from '@/components/auth/two-factor-auth-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const accentColors = [
    { name: 'Orange', class: 'bg-orange-500', value: 'hsl(25 95% 53%)' },
    { name: 'Blue', class: 'bg-blue-500', value: 'hsl(217 91% 60%)' },
    { name: 'Green', class: 'bg-green-500', value: 'hsl(142 71% 45%)' },
    { name: 'Purple', class: 'bg-purple-500', value: 'hsl(258 90% 47%)' },
    { name: 'Rose', class: 'bg-rose-500', value: 'hsl(347 90% 55%)' },
];

export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { startOnboarding } = useOnboarding();

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Notifications State
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppReminders, setInAppReminders] = useState(true);
    const [activityDigest, setActivityDigest] = useState(false);
    const [digestFrequency, setDigestFrequency] = useState('weekly');

    // Accessibility State
    const [fontSize, setFontSize] = useState(16);
    const [isHighContrast, setIsHighContrast] = useState(false);

    // Appearance State
    const [layoutDensity, setLayoutDensity] = useState('comfortable');
    const [previewMode, setPreviewMode] = useState('grid');
    const [activeAccent, setActiveAccent] = useState('hsl(25 95% 53%)');

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

     useEffect(() => {
        document.documentElement.style.setProperty('--primary', activeAccent);
    }, [activeAccent]);
    

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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="profile"><User className='h-4 w-4 mr-2'/>Profile</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className='h-4 w-4 mr-2'/>Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className='h-4 w-4 mr-2'/>Notifications</TabsTrigger>
          <TabsTrigger value="accessibility"><Accessibility className='h-4 w-4 mr-2'/>Accessibility</TabsTrigger>
          <TabsTrigger value="security"><KeyRound className='h-4 w-4 mr-2'/>Security</TabsTrigger>
          <TabsTrigger value="integrations"><Cloud className='h-4 w-4 mr-2'/>Integrations</TabsTrigger>
          <TabsTrigger value="labs"><FlaskConical className='h-4 w-4 mr-2'/>Labs</TabsTrigger>
          <TabsTrigger value="help"><LifeBuoy className='h-4 w-4 mr-2'/>Help</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <Button variant="outline" disabled>
                        Upload + Crop (Coming Soon)
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email ?? ''} readOnly disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value="Member" readOnly disabled />
                </div>
                <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save changes'}
               </Button>
            </CardContent>
            <Separator />
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className='flex items-center gap-3'><Github /> <span>GitHub</span></div>
                    <Button variant="outline" disabled>Connect</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className='flex items-center gap-3'><Bot /> <span>Google</span></div>
                    <Button variant="secondary">Connected</Button>
                </div>
             </CardContent>
             <Separator />
             <CardHeader>
                <CardTitle>Activity Log</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Monitor /> <div>Last Login: 3 hours ago from Chrome on macOS</div>
                </div>
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
                <div>
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">Select the overall color scheme.</p>
                    <div className="flex space-x-2 mt-2">
                        <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                        <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                        <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>System</Button>
                    </div>
                </div>
                 <div>
                    <Label>Accent Color</Label>
                    <p className="text-sm text-muted-foreground">Choose your primary accent color.</p>
                    <div className="flex space-x-2 mt-2">
                        {accentColors.map(color => (
                            <Button 
                                key={color.name}
                                variant={activeAccent === color.value ? 'default' : 'outline'}
                                onClick={() => setActiveAccent(color.value)}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <span className={cn("h-5 w-5 rounded-full", color.class)} />
                            </Button>
                        ))}
                    </div>
                </div>
                <div>
                    <Label>Layout Density</Label>
                     <p className="text-sm text-muted-foreground">Adjust spacing and element sizes.</p>
                    <Select value={layoutDensity} onValueChange={setLayoutDensity}>
                        <SelectTrigger className="w-[280px] mt-2">
                            <SelectValue placeholder="Select density" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Preview Mode</Label>
                     <p className="text-sm text-muted-foreground">How to display document lists.</p>
                    <Select value={previewMode} onValueChange={setPreviewMode}>
                        <SelectTrigger className="w-[280px] mt-2">
                            <SelectValue placeholder="Select preview mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
                    </div>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="inapp-notifications">In-App Reminders</Label>
                        <p className="text-sm text-muted-foreground">Show browser notifications for upcoming due dates.</p>
                    </div>
                    <Switch id="inapp-notifications" checked={inAppReminders} onCheckedChange={setInAppReminders} />
                </div>
                <Separator />
                 <h4 className="text-md font-semibold">Granular Controls</h4>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">Notify me when someone @mentions me.</p>
                    </div>
                    <Switch />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Document Shares</Label>
                        <p className="text-sm text-muted-foreground">Notify me when a document is shared with me.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Comments</Label>
                        <p className="text-sm text-muted-foreground">Notify me about comments on my documents.</p>
                    </div>
                    <Switch defaultChecked/>
                </div>
                <Separator />
                <div>
                    <Label>Digest Frequency</Label>
                     <p className="text-sm text-muted-foreground">How often to receive summary emails.</p>
                    <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                        <SelectTrigger className="w-[280px] mt-2">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instant">Instant</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
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
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="sr-hints">Screen Reader Hints</Label>
                        <p className="text-sm text-muted-foreground">Provide additional ARIA hints for screen readers.</p>
                    </div>
                    <Switch id="sr-hints" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Keyboard Shortcuts</Label>
                        <p className="text-sm text-muted-foreground">Customize keyboard shortcuts.</p>
                    </div>
                    <Button variant="outline" disabled>Customize (Soon)</Button>
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
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Password</Label>
                        <p className="text-sm text-muted-foreground">Last changed on 1 Jan, 2024</p>
                    </div>
                    <Button variant="outline" disabled>Reset Password</Button>
                </div>

                <Separator />
                 <h4 className="text-md font-semibold">Active Sessions</h4>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className='flex items-center gap-3'><Monitor /> <div><p className='font-medium'>macOS, Chrome</p><p className='text-xs text-green-500'>Current Session</p></div></div>
                    <Button variant="ghost" size="sm" disabled>Revoke</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className='flex items-center gap-3'><Smartphone /> <div><p className='font-medium'>iPhone 15 Pro</p><p className='text-xs text-muted-foreground'>3 days ago</p></div></div>
                    <Button variant="ghost" size="sm">Revoke</Button>
                </div>

                 <Separator />
                 <h4 className="text-md font-semibold">Developer Keys</h4>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>API Tokens</Label>
                        <p className="text-sm text-muted-foreground">Manage API tokens for third-party integrations.</p>
                    </div>
                    <Button variant="outline" disabled>Manage Keys</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
            <Card>
                 <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>Connect DocuSync with your favorite tools.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className='flex items-center gap-3'><img src="https://www.google.com/drive/static/images/drive/logo-drive.png" className="h-6 w-6"/><span>Google Drive</span></div>
                        <Button variant="outline">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className='flex items-center gap-3'><img src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Slack_Mark.svg" className="h-6 w-6"/><span>Slack</span></div>
                        <Button variant="outline">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className='flex items-center gap-3'><img src="https://static-00.iconduck.com/assets.00/zapier-icon-2048x1235-pua8crgq.png" className="h-6"/><span>Zapier</span></div>
                        <Button variant="outline">Connect</Button>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className='flex items-center gap-3'><LinkIcon className="h-6 w-6"/><span>Custom Webhooks</span></div>
                        <Button variant="outline">Manage</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="labs">
            <Card>
                 <CardHeader>
                    <CardTitle>Labs</CardTitle>
                    <CardDescription>Toggle experimental features. These may change or be removed at any time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>AI-Powered Document Structuring</Label>
                            <p className="text-sm text-muted-foreground">Automatically organize your documents into a knowledge graph.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>Offline Desktop App</Label>
                            <p className="text-sm text-muted-foreground">Sign up for early access to our native desktop experience.</p>
                        </div>
                        <Button variant="outline">Sign Up</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Need assistance? Find resources here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Onboarding Guide</Label>
                        <p className="text-sm text-muted-foreground">Restart the initial tutorial to get a tour of the app's features.</p>
                    </div>
                    <Button variant="outline" onClick={startOnboarding}>
                        Restart Tutorial
                    </Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Documentation</Label>
                        <p className="text-sm text-muted-foreground">Browse our comprehensive guides and tutorials.</p>
                    </div>
                    <Button variant="outline" disabled>View Docs</Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label>Status Page</Label>
                        <p className="text-sm text-muted-foreground">Check our system uptime and maintenance schedule.</p>
                    </div>
                    <Button variant="outline" disabled>View Status</Button>
                </div>
                <Separator />
                <h4 className="text-md font-semibold">Contact Support</h4>
                <form className='space-y-4'>
                    <Textarea placeholder="Describe your issue..." />
                     <Button disabled>Submit Feedback</Button>
                </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    <TwoFactorAuthDialog isOpen={is2faDialogOpen} onOpenChange={setIs2faDialogOpen} />
    </>
  );
}
