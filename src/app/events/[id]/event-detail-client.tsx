'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {type Event as EventType} from '@/lib/events';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {CalendarDays, Loader2, MapPin, User, IndianRupee} from 'lucide-react';

export default function EventDetailClient({event}: {event: EventType}) {
  const {user, loading} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/events/' + event.id);
    }
  }, [user, loading, router, event.id]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
        <Image src={event.image} alt={event.name} layout="fill" objectFit="cover" data-ai-hint={`${event.category.toLowerCase()} event`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <Badge variant="secondary" className="mb-2 text-sm">
            {event.category}
          </Badge>
          <h1 className="text-4xl font-bold text-white font-headline">{event.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 font-headline">About this event</h2>
          <p className="text-muted-foreground leading-relaxed">{event.longDescription}</p>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-muted-foreground">{event.price > 0 ? `₹${event.price}` : 'Free'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{event.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Organizer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                      <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground">{event.organizer.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button size="lg" className="w-full" asChild>
             <Link href={`/events/${event.id}/register`}>
              {event.price > 0 ? `Register for ₹${event.price}` : 'Register for Free'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
