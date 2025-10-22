'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {events, type Event as EventType} from '@/lib/events';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import Link from 'next/link';

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const {toast} = useToast();
  const {user, loading: authLoading} = useAuth();
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    const foundEvent = events.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      router.push('/404');
    }
  }, [eventId, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/events/${eventId}/register`);
    }
  }, [user, authLoading, router, eventId]);

  const handleRegistration = async () => {
    setIsLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    toast({
      title: 'Registration Successful!',
      description: `You are now registered for ${event?.name}.`,
    });
    
    router.push(`/events/${eventId}/ticket`);
  };

  if (authLoading || !event || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Confirm Registration</CardTitle>
          <CardDescription>You are about to register for the following event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{event.name}</h3>
            <p className="text-muted-foreground">{event.date}</p>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-lg font-medium">Total Price</span>
            <span className="text-lg font-bold">{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleRegistration} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm & ${event.price > 0 ? 'Pay' : 'Register'}`
            )}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/events/${event.id}`}>Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
