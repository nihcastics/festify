"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const CollegeDetailClient = dynamic(() => import('./college-detail-client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [college, setCollege] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollege();
  }, [id]);

  const loadCollege = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCollege(data);
    } catch (error) {
      console.error('Error loading college:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">College not found</h1>
      </div>
    );
  }

  return <CollegeDetailClient college={college} events={[]} />;
}

