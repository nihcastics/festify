'use client';
import type { College } from '@/lib/colleges';
import type { Event } from '@/lib/events';
import { EventCard } from '@/components/event-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CollegeDetailClient({ college, events }: { college: College, events: Event[] }) {
  return (
    <div className="bg-gray-50/50 dark:bg-card">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2">{college.name}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">{college.location}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Events hosted at {college.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">This college has not hosted any events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
