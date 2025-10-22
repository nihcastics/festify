"use client";

import { events } from '@/lib/events';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const EventDetailClient = dynamic(() => import('./event-detail-client'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const eventId = params.id;
  const event = events.find(e => e.id === eventId);

  if (!event) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  return <EventDetailClient event={event} />;
}
