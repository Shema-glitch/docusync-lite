
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, ShieldOff, LifeBuoy, User, Palette, Bell, Accessibility, KeyRound, Cloud, FlaskConical, Github, Bot, Link as LinkIcon, LogOut, Monitor, Smartphone, Tablet, Zap, Slack, Database } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TwoFactorAuthDialog } from '@/components/auth/two-factor-auth-dialog';
import { useOnboarding } from '@/hooks/use-onboarding';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { useAppearance, accentColors } from '@/hooks/use-appearance';


export default function SettingsPage() {
    const { user, updateUserProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const { startOnboarding } = useOnboarding();

    const { 
      fontSize, 
      setFontSize, 
      accentColor,
      setAccentColor,
    } = useAppearance();

    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Notifications State
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [inAppReminders, setInAppReminders] = useState(true);
    const [digestFrequency, setDigestFrequency] = useState('weekly');

    // Appearance State
    const [layoutDensity, setLayoutDensity] = useState('comfortable');
    const [previewMode, setPreviewMode] = useState('grid');
   
    const [is2faDialogOpen, setIs2faDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name ?? '');
            setAvatar(user.avatar ?? '');
            setOrganizationName(user.organizationName ?? '');
        }
    }, [user]);

    const handleHighContrastChange = (isHigh: boolean) => {
      if (isHigh) {
        setTheme('high-contrast');
      } else {
        // Revert to the previous theme, defaulting to 'system'
        const previousTheme = localStorage.getItem('previous-theme') || 'system';
        setTheme(previousTheme);
      }
    };
    
    const handleThemeChange = (newTheme: string) => {
      // Store the current non-high-contrast theme before switching
      if (theme !== 'high-contrast') {
        localStorage.setItem('previous-theme', theme || 'system');
      }
      setTheme(newTheme);
    };

    const hasChanges = name !== (user?.name ?? '') || organizationName !== (user?.organizationName ?? '');

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

    const contentVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };


  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, preferences, and more.</p>
      </div>
       <Tabs defaultValue="profile" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto bg-transparent p-0 rounded-none border-b md:w-full sm:w-max">
                <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <User className='h-4 w-4'/>Profile
                </TabsTrigger>
                <TabsTrigger value="appearance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <Palette className='h-4 w-4'/>Appearance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <Bell className='h-4 w-4'/>Notifications
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <Accessibility className='h-4 w-4'/>Accessibility
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <KeyRound className='h-4 w-4'/>Security
                </TabsTrigger>
                <TabsTrigger value="integrations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <Cloud className='h-4 w-4'/>Integrations
                </TabsTrigger>
                <TabsTrigger value="labs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <FlaskConical className='h-4 w-4'/>Labs
                </TabsTrigger>
                <TabsTrigger value="help" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent font-semibold text-muted-foreground data-[state=active]:text-primary gap-2 !shadow-none py-3 data-[state=active]:[&>svg]:inline-block [&>svg]:hidden">
                    <LifeBuoy className='h-4 w-4'/>Help
                </TabsTrigger>
            </TabsList>
        </div>


        <TabsContent value="profile" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                      <Avatar className="h-20 w-20">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" disabled>
                          Upload + Crop (Coming Soon)
                      </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="name">Display Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="organizationName">Organization Name</Label>
                          <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Your Company, Inc."/>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={user?.email ?? ''} readOnly disabled />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input id="role" value="Member" readOnly disabled />
                      </div>
                  </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                  <Button onClick={handleSaveChanges} disabled={isSaving || !hasChanges}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save changes'}
                  </Button>
              </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>Manage your third-party account connections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 gap-4">
                        <div className='flex items-center gap-3'><Github className="h-6 w-6"/> <span>GitHub</span></div>
                        <Button variant="outline" disabled className="w-full md:w-auto">Connect</Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-lg border p-4 gap-4">
                        <div className='flex items-center gap-3'><Bot className="h-6 w-6"/> <span>Google</span></div>
                        <Button variant="secondary" disabled className="w-full md:w-auto">Connected</Button>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">Select the overall color scheme.</p>
                    </div>
                    <div className="flex space-x-2 shrink-0">
                        <Button variant={(theme === 'light') ? 'default' : 'outline'} onClick={() => handleThemeChange('light')}>Light</Button>
                        <Button variant={(theme === 'dark') ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')}>Dark</Button>
                        <Button variant={(theme === 'system') ? 'default' : 'outline'} onClick={() => handleThemeChange('system')}>System</Button>
                    </div>
                </div>
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                        <Label>Accent Color</Label>
                        <p className="text-sm text-muted-foreground">Choose your primary accent color.</p>
                    </div>
                    <div className="flex space-x-2">
                        {accentColors.map(color => (
                            <Button 
                                key={color.name}
                                variant={accentColor === color.value ? 'default' : 'outline'}
                                onClick={() => setAccentColor(color.value)}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <span className={cn("h-5 w-5 rounded-full", color.class)} />
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                        <Label>Layout Density</Label>
                        <p className="text-sm text-muted-foreground">Adjust spacing and element sizes.</p>
                    </div>
                    <Select value={layoutDensity} onValueChange={setLayoutDensity}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Select density" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                        <Label>Preview Mode</Label>
                        <p className="text-sm text-muted-foreground">How to display document lists.</p>
                    </div>
                    <Select value={previewMode} onValueChange={setPreviewMode}>
                        <SelectTrigger className="w-full md:w-[180px]">
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
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Manage how you receive notifications from us.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
                    </div>
                    <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                        <Label htmlFor="inapp-notifications">In-App Reminders</Label>
                        <p className="text-sm text-muted-foreground">Show browser notifications for upcoming due dates.</p>
                    </div>
                    <Switch id="inapp-notifications" checked={inAppReminders} onCheckedChange={setInAppReminders} />
                </div>
                 <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="space-y-0.5">
                        <Label>Digest Frequency</Label>
                        <p className="text-sm text-muted-foreground">How often to receive summary emails.</p>
                    </div>
                    <Select value={digestFrequency} onValueChange={setDigestFrequency}>
                        <SelectTrigger className="w-full md:w-[180px]">
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
            <Card>
              <CardHeader>
                <CardTitle>Granular Controls</CardTitle>
                <CardDescription>
                  Control exactly which notifications you want to receive.
                </CardDescription>
              </CardHeader>
               <CardContent className="divide-y divide-border">
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                          <Label>Mentions</Label>
                          <p className="text-sm text-muted-foreground">When someone @mentions you.</p>
                      </div>
                      <Switch />
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                          <Label>Document Shares</Label>
                          <p className="text-sm text-muted-foreground">When a document is shared with you.</p>
                      </div>
                      <Switch defaultChecked />
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                          <Label>Comments</Label>
                          <p className="text-sm text-muted-foreground">On your documents and replies.</p>
                      </div>
                      <Switch defaultChecked/>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="accessibility" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Make the app more comfortable for your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label htmlFor="font-size">Font Size</Label>
                          <p className="text-sm text-muted-foreground">Adjust the font size for better readability.</p>
                      </div>
                      <div className="w-full md:w-1/3 flex items-center gap-4">
                        <Slider value={[fontSize]} max={24} min={12} step={1} onValueChange={([value]) => setFontSize(value)} />
                        <span className="text-sm text-muted-foreground w-8">{fontSize}px</span>
                      </div>
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label htmlFor="high-contrast">High Contrast Mode</Label>
                          <p className="text-sm text-muted-foreground">Increase contrast throughout the app.</p>
                      </div>
                      <Switch id="high-contrast" checked={theme === 'high-contrast'} onCheckedChange={handleHighContrastChange} />
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label htmlFor="sr-hints">Screen Reader Hints</Label>
                          <p className="text-sm text-muted-foreground">Provide additional ARIA hints for screen readers.</p>
                      </div>
                      <Switch id="sr-hints" />
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label>Keyboard Shortcuts</Label>
                          <p className="text-sm text-muted-foreground">Customize keyboard shortcuts.</p>
                      </div>
                      <Button variant="outline" disabled>Customize (Soon)</Button>
                  </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your account's security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label htmlFor="2fa" className='flex items-center gap-2'>
                            {user?.is2faEnabled ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldOff className="h-5 w-5 text-destructive" />}
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                      </div>
                      <Button variant="outline" onClick={handleToggle2FA} className="w-full md:w-auto">
                          {user?.is2faEnabled ? 'Disable' : 'Enable'}
                      </Button>
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label>Password</Label>
                          <p className="text-sm text-muted-foreground">Last changed on 1 Jan, 2024</p>
                      </div>
                      <Button variant="outline" disabled className="w-full md:w-auto">Reset Password</Button>
                  </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>This is a list of devices that have logged into your account. Revoke any sessions you do not recognize.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-border">
                    <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className='flex items-center gap-3'><Monitor /> <div><p className='font-medium'>macOS, Chrome</p><p className='text-xs text-green-500'>Current Session</p></div></div>
                        <Button variant="ghost" size="sm" disabled className="w-full md:w-auto">Revoke</Button>
                    </div>
                    <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className='flex items-center gap-3'><Smartphone /> <div><p className='font-medium'>iPhone 15 Pro</p><p className='text-xs text-muted-foreground'>3 days ago</p></div></div>
                        <Button variant="outline" size="sm" className="w-full md:w-auto">Revoke</Button>
                    </div>
                </CardContent>
            </Card>

              <Card>
                  <CardHeader>
                      <CardTitle>Developer Keys</CardTitle>
                      <CardDescription>Manage API tokens for third-party integrations.</CardDescription>
                  </CardHeader>
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                          <Label>API Tokens</Label>
                          <p className="text-sm text-muted-foreground">For building custom integrations.</p>
                      </div>
                      <Button variant="outline" disabled className="w-full md:w-auto">Manage Keys</Button>
                  </CardContent>
              </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>Connect DocuSync with your favorite tools.</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className='flex items-center gap-3'><Database className="h-6 w-6"/><span>Google Drive</span></div>
                          <Button variant="outline" className="w-full md:w-auto">Connect</Button>
                      </div>
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className='flex items-center gap-3'><Slack className="h-6 w-6"/><span>Slack</span></div>
                          <Button variant="outline" className="w-full md:w-auto">Connect</Button>
                      </div>
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className='flex items-center gap-3'><Zap className="h-6 w-6"/><span>Zapier</span></div>
                          <Button variant="outline" className="w-full md:w-auto">Connect</Button>
                      </div>
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div className='flex items-center gap-3'><LinkIcon className="h-6 w-6"/><span>Custom Webhooks</span></div>
                          <Button variant="outline" className="w-full md:w-auto">Manage</Button>
                      </div>
                  </CardContent>
              </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="labs" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
              <Card>
                  <CardHeader>
                      <CardTitle>Labs</CardTitle>
                      <CardDescription>Toggle experimental features. These may change or be removed at any time.</CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y divide-border">
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div>
                              <Label>AI-Powered Document Structuring</Label>
                              <p className="text-sm text-muted-foreground">Automatically organize your documents into a knowledge graph.</p>
                          </div>
                          <Switch />
                      </div>
                      <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div>
                              <Label>Offline Desktop App</Label>
                              <p className="text-sm text-muted-foreground">Sign up for early access to our native desktop experience.</p>
                          </div>
                          <Button variant="outline" className="w-full md:w-auto">Sign Up</Button>
                      </div>
                  </CardContent>
              </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="help" className="mt-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Need assistance? Find resources here.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label>Onboarding Guide</Label>
                          <p className="text-sm text-muted-foreground">Restart the initial tutorial to get a tour of the app's features.</p>
                      </div>
                      <Button variant="outline" onClick={startOnboarding} className="w-full md:w-auto">
                          Restart Tutorial
                      </Button>
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label>Documentation</Label>
                          <p className="text-sm text-muted-foreground">Browse our comprehensive guides and tutorials.</p>
                      </div>
                      <Button variant="outline" disabled className="w-full md:w-auto">View Docs</Button>
                  </div>
                  <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div>
                          <Label>Status Page</Label>
                          <p className="text-sm text-muted-foreground">Check our system uptime and maintenance schedule.</p>
                      </div>
                      <Button variant="outline" disabled className="w-full md:w-auto">View Status</Button>
                  </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                   <CardDescription>Describe your issue below and our team will get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                  <form className='space-y-4'>
                      <Textarea placeholder="Describe your issue..." />
                  </form>
              </CardContent>
              <CardFooter>
                 <Button disabled>Submit Feedback</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
    <TwoFactorAuthDialog isOpen={is2faDialogOpen} onOpenChange={setIs2faDialogOpen} />
    </>
  );
}
