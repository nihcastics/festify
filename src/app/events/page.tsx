
import { Suspense } from 'react';
import { EventsPageClient } from './events-page-client';
import { Loader2 } from 'lucide-react';

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <EventsPageClient />
    </Suspense>
  );
}
