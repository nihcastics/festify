'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import {useAuth} from '@/hooks/use-auth';
import {Card, CardContent} from '@/components/ui/card';
import {Loader2, User, Mail, Ticket, Calendar, MapPin, Users as UsersIcon} from 'lucide-react';
import {supabase} from '@/lib/supabase/client';
import {Badge} from '@/components/ui/badge';

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const {user, profile, loading: authLoading} = useAuth();
  const [event, setEvent] = useState<any | null>(null);
  const [registration, setRegistration] = useState<any | null>(null);
  const [team, setTeam] = useState<any | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const eventId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/events/${eventId}/ticket`);
    }
  }, [user, authLoading, router, eventId]);

  useEffect(() => {
    if (user && !authLoading) {
      loadTicketData();
    }
  }, [user, authLoading, eventId]);

  const loadTicketData = async () => {
    try {
      // Load event details
      const {data: eventData, error: eventError} = await supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name),
          college:colleges(id, name, location),
          organizer:profiles!events_organizer_id_fkey(full_name, organization_name)
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Load registration - only show ticket if payment is completed
      const {data: regData, error: regError} = await supabase
        .from('registrations')
        .select('*, teams(name, current_members, max_members)')
        .eq('event_id', eventId)
        .eq('user_id', user!.id)
        .single();

      if (regError) {
        console.error('No registration found:', regError);
        router.push(`/events/${eventId}`);
        return;
      }

      // Check if payment is completed
      if ((regData as any).payment_status !== 'completed') {
        console.warn('Payment not completed, redirecting to event page');
        router.push(`/events/${eventId}`);
        return;
      }

      setRegistration(regData);
      if ((regData as any).team_id && (regData as any).teams) {
        setTeam((regData as any).teams);
      }

      // Generate QR code
      const ticketData = {
        eventTitle: (eventData as any).title,
        eventId: (eventData as any).id,
        userName: profile?.full_name || user!.email,
        userEmail: user!.email,
        userId: user!.id,
        registrationId: (regData as any).id,
        registrationDate: (regData as any).created_at,
        teamName: (regData as any).teams?.name,
        isTeam: (regData as any).is_team_registration,
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error loading ticket:', error);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !event || !registration || !qrCodeUrl) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="overflow-hidden shadow-2xl border-2">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <Ticket className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Event Ticket</h1>
          <p className="text-purple-100">Present this QR code at the venue</p>
        </div>
        
        <CardContent className="p-8 space-y-8">
          <div className="text-center border-b pb-6">
            <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
            <Badge variant="secondary" className="text-sm">
              {event.category?.name || 'Event'}
            </Badge>
          </div>

          <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-dashed">
            {qrCodeUrl && (
              <Image 
                src={qrCodeUrl} 
                alt="Event Ticket QR Code" 
                width={300} 
                height={300}
                className="rounded-lg"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Event Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground">{event.college.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Ticket Holder</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-muted-foreground">{profile?.full_name || user!.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground text-xs break-all">{user!.email}</p>
                  </div>
                </div>
                {team && (
                  <div className="flex items-start gap-3">
                    <UsersIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Team</p>
                      <p className="text-muted-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.current_members}/{team.max_members} members
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Ticket ID</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {registration.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-center text-sm text-muted-foreground border-t">
            <p>Registration Status: <Badge variant={registration.registration_status === 'confirmed' ? 'default' : 'secondary'}>{registration.registration_status}</Badge></p>
            <p className="mt-2">Registered on {new Date(registration.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
