import Link from 'next/link';
import {Music2, Twitter, Instagram, Facebook} from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Music2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">Festify</span>
          </Link>
        </div>
        <nav className="flex flex-wrap justify-center -mx-5 -my-2 mb-8">
          <div className="px-5 py-2">
            <Link href="/events" className="text-base text-muted-foreground hover:text-primary">
              Events
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/#about" className="text-base text-muted-foreground hover:text-primary">
              About
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-muted-foreground hover:text-primary">
              Contact
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="#" className="text-base text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </nav>
        <div className="flex justify-center space-x-6 mb-8">
          <Link href="#" className="text-muted-foreground hover:text-primary">
            <Twitter className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            <Instagram className="h-6 w-6" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary">
            <Facebook className="h-6 w-6" />
          </Link>
        </div>
        <p className="text-center text-base text-muted-foreground">&copy; {new Date().getFullYear()} Festify. All rights reserved.</p>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>Made by:</p>
          <p>Allan Roy - RA2411030010028</p>
          <p>Shreya Sunil - RA2411030010048</p>
          <p>Rishika Raj - RA2411030010059</p>
        </div>
      </div>
    </footer>
  );
}
