
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  FileClock,
  Files,
  Star,
  Settings,
  Briefcase,
  User,
  Heart,
  Wallet,
  Scale,
  Sparkles,
  Zap,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

export function AppSidebar() {
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="shrink-0">
      <SidebarContent>
        <SidebarHeader className='justify-center'>
            <Zap className="h-8 w-8 text-primary" />
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive tooltip="Dashboard">
              <Home />
              <span className='group-data-[collapsible=icon]:hidden'>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Timeline">
              <FileClock />
               <span className='group-data-[collapsible=icon]:hidden'>Timeline</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="All Files">
              <Files />
               <span className='group-data-[collapsible=icon]:hidden'>All Files</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Favorites">
              <Star />
               <span className='group-data-[collapsible=icon]:hidden'>Favorites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Sparkles className="text-accent-foreground" />
             <span className='group-data-[collapsible=icon]:hidden'>Smart Collections</span>
          </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Tax Docs">
                  <Briefcase />
                   <span className='group-data-[collapsible=icon]:hidden'>Tax Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Design Portfolio">
                  <User />
                   <span className='group-data-[collapsible=icon]:hidden'>Design Portfolio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <span className='group-data-[collapsible=icon]:hidden'>Categories</span>
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Work">
                  <Briefcase />
                   <span className='group-data-[collapsible=icon]:hidden'>Work</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Personal">
                  <Heart />
                   <span className='group-data-[collapsible=icon]:hidden'>Personal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Finance">
                  <Wallet />
                   <span className='group-data-[collapsible=icon]:hidden'>Finance</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Legal">
                  <Scale />
                   <span className='group-data-[collapsible=icon]:hidden'>Legal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" tooltip="Settings">
              <Settings />
               <span className='group-data-[collapsible=icon]:hidden'>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
               <span className='group-data-[collapsible=icon]:hidden'>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name ?? ''} data-ai-hint="profile picture" />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-medium text-sm">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
