'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function AdminAccessButton() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    // Check if admin mode is active
    const checkAdminMode = () => {
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsAdminMode(adminMode);
    };

    checkAdminMode();
    window.addEventListener('storage', checkAdminMode);
    const interval = setInterval(checkAdminMode, 500);

    return () => {
      window.removeEventListener('storage', checkAdminMode);
      clearInterval(interval);
    };
  }, []);

  // Don't render if admin mode is active
  if (isAdminMode) {
    return null;
  }

  // Show button on triple click within 1 second
  const handleTouchSequence = () => {
    setIsVisible(true);
    // Auto-hide after 10 seconds if not used
    setTimeout(() => setIsVisible(false), 10000);
  };

  return (
    <>
      {/* Hidden trigger area - triple click bottom-right corner to reveal */}
      <div
        className="fixed bottom-0 right-0 w-24 h-24 z-40 cursor-pointer opacity-0 hover:opacity-5"
        onDoubleClick={handleTouchSequence}
        title="Admin access"
      />

      {/* Floating admin button - only visible after trigger */}
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in duration-300">
          <Button
            onClick={() => router.push('/admin/login')}
            className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 hover:from-red-700 hover:via-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 glow-md group"
            title="Admin Dashboard"
          >
            <Shield className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
          </Button>
        </div>
      )}
    </>
  );
}
