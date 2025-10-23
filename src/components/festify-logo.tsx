'use client';

import { Sparkles } from 'lucide-react';

interface FestifyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function FestifyLogo({ size = 'md', showIcon = true }: FestifyLogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <div className="flex items-center gap-2 group">
      {showIcon && (
        <div className="relative">
          {/* Outer glow circle */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Inner circle */}
          <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center glow-primary group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
        </div>
      )}
      <div className={`font-bold ${sizeClasses[size]} relative`}>
        <span className="relative z-10 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-violet-500 group-hover:to-indigo-500 transition-all duration-300">
          Fest
        </span>
        <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:via-violet-500 group-hover:to-purple-500 transition-all duration-300">
          ify
        </span>
        {/* Animated underline */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:w-full transition-all duration-300" />
      </div>
    </div>
  );
}
