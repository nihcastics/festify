'use client';

import {ThemeProvider as NextThemesProvider} from 'next-themes';
import type {ThemeProviderProps} from 'next-themes/dist/types';
import {SupabaseAuthProvider} from '@/context/supabase-auth-provider';
import {PageTransition} from '@/components/page-transition';

export function Providers({children, ...props}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SupabaseAuthProvider>
        <PageTransition>{children}</PageTransition>
      </SupabaseAuthProvider>
    </NextThemesProvider>
  );
}
