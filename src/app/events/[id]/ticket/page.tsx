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

      // Load registration with all team data
      const {data: regData, error: regError} = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user!.id)
        .single();

      if (regError) {
        console.error('No registration found:', regError);
        router.push(`/events/${eventId}`);
        return;
      }

      setRegistration(regData);

      // If team registration, load team details
      if (regData.is_team && regData.team_name) {
        // Load team members if available
        const {data: teamData} = await supabase
          .from('teams')
          .select(`
            *,
            team_members(*)
          `)
          .eq('registration_id', regData.id)
          .single();
        
        if (teamData) {
          setTeam(teamData);
        }
      }

      // Generate QR code with comprehensive data
      const ticketData = {
        eventTitle: eventData.title,
        eventId: eventData.id,
        eventDate: eventData.start_date,
        eventLocation: eventData.location,
        userName: profile?.full_name || user!.email,
        userEmail: user!.email,
        userId: user!.id,
        registrationId: regData.id,
        registrationDate: regData.created_at,
        registrationStatus: regData.registration_status,
        paymentStatus: regData.payment_status,
        paymentAmount: regData.payment_amount,
        isTeam: regData.is_team,
        teamSize: regData.team_size,
        teamName: regData.team_name,
        teamLeader: regData.team_leader_name,
        ticketCode: `${regData.id.substring(0, 8).toUpperCase()}-${eventId.substring(0, 4).toUpperCase()}`,
        generatedAt: new Date().toISOString()
      };

      const qrUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
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
                <div className="flex items-start gap-3">
                  <Ticket className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Ticket ID</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {registration.id.substring(0, 8).toUpperCase()}-{eventId.substring(0, 4).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Information */}
          {registration.is_team && registration.team_name && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Team Information
              </h3>
              <div className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium">Team Name</p>
                  <p className="text-lg font-bold text-primary">{registration.team_name}</p>
                </div>
                
                {registration.team_leader_name && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Team Leader</p>
                      <p className="font-medium">{registration.team_leader_name}</p>
                      {registration.team_leader_email && (
                        <p className="text-xs text-muted-foreground mt-1">{registration.team_leader_email}</p>
                      )}
                      {registration.team_leader_phone && (
                        <p className="text-xs text-muted-foreground">{registration.team_leader_phone}</p>
                      )}
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Team Size</p>
                      <p className="font-medium">{registration.team_size} members</p>
                      {registration.team_leader_university_reg && (
                        <p className="text-xs text-muted-foreground mt-1">Reg: {registration.team_leader_university_reg}</p>
                      )}
                    </div>
                  </div>
                )}

                {team && team.team_members && team.team_members.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Team Members</p>
                    <div className="space-y-2">
                      {team.team_members.map((member: any, index: number) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-lg flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.is_leader ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {member.is_leader ? '★' : index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.member_name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                              {member.member_email && <span>✉ {member.member_email}</span>}
                              {member.member_phone && <span>📱 {member.member_phone}</span>}
                              {member.university_registration_number && <span>🎓 {member.university_registration_number}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment & Status Information */}
          <div className="bg-muted/50 p-4 rounded-lg text-sm border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registration Status:</span>
              <Badge variant={registration.registration_status === 'registered' ? 'default' : 'secondary'} className="capitalize">
                {registration.registration_status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant={registration.payment_status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                {registration.payment_status}
              </Badge>
            </div>
            {registration.payment_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">₹{registration.payment_amount}</span>
              </div>
            )}
            {registration.transaction_id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs">{registration.transaction_id}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">Registered on:</span>
              <span>{new Date(registration.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
