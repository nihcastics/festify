'use client';

import Link from 'next/link';
import { Sparkles, Calendar, Building2, Mail, Twitter, Instagram, Facebook, Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Check if admin mode is active
    const checkAdminMode = () => {
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsAdminMode(adminMode);
    };

    // Check on mount
    checkAdminMode();

    // Listen for storage changes
    window.addEventListener('storage', checkAdminMode);
    
    // Check periodically
    const interval = setInterval(checkAdminMode, 500);

    return () => {
      window.removeEventListener('storage', checkAdminMode);
      clearInterval(interval);
    };
  }, []);

  // Don't render footer if admin mode is active
  if (isAdminMode) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950 text-white py-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center glow-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">Festify</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Your premier platform for discovering and managing college events across India.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:bg-white transition-colors"></span>
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:bg-white transition-colors"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/colleges" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:bg-white transition-colors"></span>
                  Colleges
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-violet-400" />
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 group-hover:bg-white transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 group-hover:bg-white transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors duration-300 text-sm flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 group-hover:bg-white transition-colors"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-400" />
              Connect
            </h3>
            <p className="text-white/70 text-sm mb-4">Follow us on social media</p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <Facebook className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <Twitter className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <Instagram className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                <Linkedin className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} Festify. All rights reserved.
            </p>
            <p className="text-white/60 text-sm text-center md:text-right">
              Developed with 💜 by <span className="text-white font-medium">Rishika Raj</span> (RA2411030010059), <span className="text-white font-medium">Allan Roy</span> (RA2411030010028) & <span className="text-white font-medium">Shreya Sunil</span> (RA2411030010048)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
