'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import {events, type Event as EventType} from '@/lib/events';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent} from '@/components/ui/card';
import {Loader2, User, Mail, Ticket} from 'lucide-react';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const {user, loading: authLoading} = useAuth();
  const [event, setEvent] = useState<EventType | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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
      router.push(`/login?redirect=/events/${eventId}/ticket`);
    }
  }, [user, authLoading, router, eventId]);

  useEffect(() => {
    if (user && event) {
      const ticketData = {
        eventName: event.name,
        eventId: event.id,
        userName: user.displayName,
        userEmail: user.email,
        userId: user.uid,
        purchaseDate: new Date().toISOString(),
      };
      QRCode.toDataURL(JSON.stringify(ticketData))
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error('Failed to generate QR code:', err);
        });
    }
  }, [user, event]);

  if (authLoading || !event || !user || !qrCodeUrl) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <Card className="overflow-hidden shadow-2xl">
        <div className="bg-primary p-6 text-center text-primary-foreground">
          <h1 className="text-2xl font-bold">Your Ticket</h1>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">{event.name}</h2>
            <p className="text-muted-foreground">{event.date}</p>
            <p className="text-muted-foreground">{event.location}</p>
          </div>

          <div className="flex justify-center">
            {qrCodeUrl && <Image src={qrCodeUrl} alt="Event Ticket QR Code" width={200} height={200} />}
          </div>
          
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold text-center">Ticket Holder</h3>
             <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{user.displayName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
               <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono text-xs">{`TICKET-${event.id}-${user.uid.substring(0, 6)}`}</span>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
