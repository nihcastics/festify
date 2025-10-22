"use client";

import { colleges } from '@/lib/colleges';
import { events } from '@/lib/events';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CollegeDetailClient = dynamic(() => import('./college-detail-client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function CollegeDetailPage({ params }: { params: { id: string } }) {
  const collegeId = params.id;
  const college = colleges.find((c) => c.id === collegeId);

  if (!college) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">College not found</h1>
      </div>
    );
  }

  const collegeEvents = events.filter((event) => event.college === college.name);

  return <CollegeDetailClient college={college} events={collegeEvents} />;
}
