'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useTheme} from 'next-themes';
import { User, UserCircle } from 'lucide-react';
import {useAuth} from '@/hooks/use-auth';
import {auth} from '@/lib/firebase/config';
import {signOut} from 'firebase/auth';
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const {user, loading} = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary h-7 w-7 flex items-center justify-center rounded-md">
            <span className="font-bold text-lg text-primary-foreground">F</span>
          </div>
          <span className="text-xl font-bold font-headline">Festify</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="transition-colors hover:text-primary font-medium">
            Home
          </Link>
          <Link href="/categories" className="transition-colors hover:text-primary text-muted-foreground">
            Categories
          </Link>
          <Link href="/colleges" className="transition-colors hover:text-primary text-muted-foreground">
            Colleges
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <SearchBar />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Registered Events</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full">
              <Link href="/login">
                <User className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
