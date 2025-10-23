'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useTheme} from 'next-themes';
import { User, UserCircle, Sparkles, LogOut, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import {useAuth} from '@/hooks/use-auth';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useRouter} from 'next/navigation';
import { SearchBar } from './search-bar';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import FestifyLogo from './festify-logo';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const {user, profile, loading, signOut: authSignOut} = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check if admin mode is active
    const checkAdminMode = () => {
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsAdminMode(adminMode);
    };

    // Check on mount
    checkAdminMode();

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', checkAdminMode);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkAdminMode, 500);

    return () => {
      window.removeEventListener('storage', checkAdminMode);
      clearInterval(interval);
    };
  }, []);

  // Don't render header if admin mode is active
  if (isAdminMode) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await authSignOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const roleColors = {
    admin: 'bg-gradient-to-r from-red-500 to-orange-500',
    organizer: 'bg-gradient-to-r from-purple-500 to-pink-500',
    attendee: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500 border-b',
        scrolled 
          ? 'bg-background/80 backdrop-blur-2xl shadow-lg shadow-purple-500/5 border-border/60' 
          : 'bg-background/40 backdrop-blur-xl border-transparent'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo with glow effect */}
        <Link href="/" className="flex items-center">
          <FestifyLogo size="md" showIcon />
        </Link>
        
        {/* Navigation with hover effects */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            href="/" 
            className="relative px-4 py-2 rounded-xl transition-all duration-300 hover:bg-purple-500/10 font-medium text-sm group overflow-hidden"
          >
            <span className="relative z-10">Home</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link 
            href="/events" 
            className="relative px-4 py-2 rounded-xl transition-all duration-300 hover:bg-indigo-500/10 text-muted-foreground hover:text-foreground text-sm group overflow-hidden"
          >
            <span className="relative z-10">Events</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/10 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link 
            href="/categories" 
            className="relative px-4 py-2 rounded-xl transition-all duration-300 hover:bg-violet-500/10 text-muted-foreground hover:text-foreground text-sm group overflow-hidden"
          >
            <span className="relative z-10">Categories</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/10 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link 
            href="/colleges" 
            className="relative px-4 py-2 rounded-xl transition-all duration-300 hover:bg-blue-500/10 text-muted-foreground hover:text-foreground text-sm group overflow-hidden"
          >
            <span className="relative z-10">Colleges</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </nav>
        
        {/* Right side */}
        <div className="flex items-center gap-3">
          <SearchBar />
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-background hover:ring-primary/50 transition-all">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn("text-white font-semibold", roleColors[profile.role as keyof typeof roleColors] || roleColors.attendee)}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                {/* Enhanced User Info Header */}
                <div className="relative overflow-hidden">
                  <div className={cn("absolute inset-0 opacity-10", roleColors[profile.role as keyof typeof roleColors] || roleColors.attendee)} />
                  <DropdownMenuLabel className="font-normal relative p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                        <AvatarFallback className={cn("text-white font-bold text-lg", roleColors[profile.role as keyof typeof roleColors] || roleColors.attendee)}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-none truncate mb-1">{profile.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate mb-2">{profile.email}</p>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "w-fit text-xs capitalize font-medium",
                            profile.role === 'admin' && "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
                            profile.role === 'organizer' && "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                            profile.role === 'attendee' && "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          )}
                        >
                          ✨ {profile.role}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Menu Items */}
                <div className="p-1">
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2">
                      <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-1.5 rounded-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Profile</p>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href={`/dashboard/${profile?.role || 'attendee'}`} className="flex items-center gap-3 px-3 py-2">
                      <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", roleColors[profile.role as keyof typeof roleColors] || roleColors.attendee)}>
                        <LayoutDashboard className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Dashboard</p>
                        <p className="text-xs text-muted-foreground">View your dashboard</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                    <Link href="/events" className="flex items-center gap-3 px-3 py-2">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Browse Events</p>
                        <p className="text-xs text-muted-foreground">Discover new events</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <div className="p-1">
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rounded-lg text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50">
                    <div className="flex items-center gap-3 px-3 py-2 w-full">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 p-1.5 rounded-lg">
                        <LogOut className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Log out</p>
                        <p className="text-xs opacity-80">Sign out of your account</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg glow-primary transition-all duration-300 hover:scale-105 hover:shadow-xl h-10 px-6">
              <Link href="/login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
