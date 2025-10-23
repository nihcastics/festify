'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {CalendarDays, Loader2, MapPin, User, IndianRupee, Users as UsersIcon, Ticket} from 'lucide-react';
import {getValidImageUrl} from '@/lib/image-utils';
import {supabase} from '@/lib/supabase/client';

export default function EventDetailClient({event}: {event: any}) {
  const {user, loading} = useAuth();
  const router = useRouter();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/events/' + event.id);
    }
  }, [user, loading, router, event.id]);

  useEffect(() => {
    if (user && event.id) {
      checkRegistration();
    }
  }, [user, event.id]);

  const checkRegistration = async () => {
    try {
      const {data} = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event.id)
        .eq('user_id', user!.id)
        .single();

      setHasRegistered(!!data);
    } catch (error) {
      setHasRegistered(false);
    } finally {
      setCheckingRegistration(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const imageUrl = getValidImageUrl(event.image_url, event.category?.name || 'Event');
  const organizerName = event.organizer?.organization_name || event.organizer?.full_name || 'Unknown';
  const categoryName = event.category?.name || 'Event';

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
        <Image 
          src={imageUrl} 
          alt={event.title} 
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <Badge variant="secondary" className="mb-2 text-sm">
            {categoryName}
          </Badge>
          <h1 className="text-4xl font-bold text-white font-headline">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 font-headline">About this event</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
          
          {event.participation_type && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Participation</h3>
              <div className="flex gap-2">
                {event.participation_type === 'individual' && (
                  <Badge variant="outline">Individual Only</Badge>
                )}
                {event.participation_type === 'team' && (
                  <Badge variant="outline">Team Only ({event.team_size_min}-{event.team_size_max} members)</Badge>
                )}
                {event.participation_type === 'both' && (
                  <>
                    <Badge variant="outline">Individual</Badge>
                    <Badge variant="outline">Team ({event.team_size_min}-{event.team_size_max} members)</Badge>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Price</p>
                  <p className="text-muted-foreground">
                    {event.participation_type === 'individual' && event.individual_price > 0 ? (
                      `₹${event.individual_price}`
                    ) : event.participation_type === 'team' && event.team_base_price > 0 ? (
                      `From ₹${event.team_base_price}`
                    ) : event.participation_type === 'both' ? (
                      event.individual_price > 0 || event.team_base_price > 0 ? (
                        `Individual: ₹${event.individual_price || 0} | Team: From ₹${event.team_base_price || 0}`
                      ) : 'Free'
                    ) : (
                      'Free'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">
                    {new Date(event.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.start_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{event.location}</p>
                  {event.college && (
                    <p className="text-xs text-muted-foreground mt-1">{event.college.name}</p>
                  )}
                </div>
              </div>
              {event.max_attendees && (
                <div className="flex items-start gap-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-muted-foreground">
                      {event.current_attendees || 0} / {event.max_attendees} registered
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Organizer</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={event.organizer?.avatar_url} alt={organizerName} />
                      <AvatarFallback>{organizerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-muted-foreground">{organizerName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!checkingRegistration && (
            <>
              {hasRegistered ? (
                <div className="space-y-3">
                  <Button size="lg" className="w-full" variant="default" asChild>
                    <Link href={`/events/${event.id}/ticket`}>
                      <Ticket className="mr-2 h-5 w-5" />
                      View My Ticket
                    </Link>
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    You are already registered for this event
                  </p>
                </div>
              ) : (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/events/${event.id}/register`}>
                    <IndianRupee className="mr-2 h-5 w-5" />
                    {event.participation_type === 'individual' && event.individual_price > 0 ? (
                      `Register for ₹${event.individual_price}`
                    ) : event.participation_type === 'team' && event.team_base_price > 0 ? (
                      `Register Team from ₹${event.team_base_price}`
                    ) : event.individual_price > 0 || event.team_base_price > 0 ? (
                      'Register Now'
                    ) : (
                      'Register for Free'
                    )}
                  </Link>
                </Button>
              )}
            </>
          )}
          {checkingRegistration && (
            <Button size="lg" className="w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
