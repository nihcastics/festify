import type {ReactNode} from 'react';

export default function AuthLayout({children}: {children: ReactNode}) {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      {children}
    </div>
  );
}
