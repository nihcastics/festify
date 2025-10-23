'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Loader2, AlertTriangle, Users, User, Plus, X, Check} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {supabase} from '@/lib/supabase/client';
import {Badge} from '@/components/ui/badge';

type ParticipationType = 'individual' | 'team' | 'both';

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const {toast} = useToast();
  const {user, profile, loading: authLoading} = useAuth();
  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isEligible, setIsEligible] = useState(true);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);
  const [existingTeams, setExistingTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const eventId = params.id as string;

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/events/${eventId}/register`);
    }
  }, [user, authLoading, router, eventId]);

  useEffect(() => {
    if (event && profile) {
      checkEligibility();
    }
  }, [event, profile]);

  useEffect(() => {
    if (event && user && registrationType === 'team') {
      loadExistingTeams();
    }
  }, [event, user, registrationType]);

  const loadEvent = async () => {
    try {
      const {data, error} = await supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name),
          college:colleges(id, name, location),
          organizer:profiles!events_organizer_id_fkey(full_name, organization_name)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (!data) {
        router.push('/404');
        return;
      }

      setEvent(data);
      
      // Set default registration type based on event participation type
      if ((data as any).participation_type === 'team') {
        setRegistrationType('team');
      } else {
        setRegistrationType('individual');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      router.push('/404');
    } finally {
      setLoadingEvent(false);
    }
  };

  const loadExistingTeams = async () => {
    try {
      const {data, error} = await supabase
        .from('teams')
        .select(`
          *,
          team_members(
            id,
            user_id,
            is_leader,
            profiles:user_id(full_name, email)
          )
        `)
        .eq('event_id', eventId)
        .eq('is_full', false);

      if (error) throw error;
      setExistingTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const checkEligibility = () => {
    if (!event || !profile) return;

    // Global events are available to everyone
    if (event.is_global) {
      setIsEligible(true);
      return;
    }

    // Events without college are available to everyone (backwards compatibility)
    if (!event.college_id) {
      setIsEligible(true);
      return;
    }

    // College-specific event - check if user's college matches
    if (profile.college_id === event.college_id) {
      setIsEligible(true);
      return;
    }

    // User is not eligible
    setIsEligible(false);
    
    if (!profile.college_id) {
      setEligibilityMessage('This event is only available to students from specific colleges. Please update your profile with your college information.');
    } else {
      setEligibilityMessage(`This event is only available to students from ${event.college?.name || 'a specific college'}. Your profile shows you are from a different college.`);
    }
  };

  const handleIndividualRegistration = async () => {
    if (!isEligible || !user) return;

    setIsLoading(true);
    try {
      // Check if already registered
      const {data: existingRegistration} = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingRegistration) {
        toast({
          title: 'Already Registered',
          description: 'You are already registered for this event.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Create registration
      const {error: regError} = await supabase
        .from('registrations')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          event_id: eventId,
          user_id: user.id,
          registration_status: 'confirmed',
          is_team_registration: false,
        });

      if (regError) throw regError;

      // Update event attendee count
      // @ts-expect-error - RPC function type not generated
      const {error: updateError} = await supabase.rpc('increment_event_attendees', {event_id: eventId});
      
      if (updateError) console.error('Error updating attendee count:', updateError);

      toast({
        title: 'Registration Successful!',
        description: `You are now registered for ${event?.title}.`,
      });

      router.push(`/dashboard/attendee`);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamRegistration = async () => {
    if (!isEligible || !user || !teamName.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide a team name.',
        variant: 'destructive',
      });
      return;
    }

    const validMembers = teamMembers.filter(email => email.trim() !== '');
    const totalMembers = validMembers.length + 1; // +1 for leader

    if (totalMembers < (event.team_size_min || 1)) {
      toast({
        title: 'Team Too Small',
        description: `Minimum team size is ${event.team_size_min} members.`,
        variant: 'destructive',
      });
      return;
    }

    if (totalMembers > (event.team_size_max || 1)) {
      toast({
        title: 'Team Too Large',
        description: `Maximum team size is ${event.team_size_max} members.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create team
      const {data: teamData, error: teamError} = await supabase
        .from('teams')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          event_id: eventId,
          name: teamName,
          leader_id: user.id,
          max_members: event.team_size_max,
          current_members: 1, // Will be updated by trigger
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Create registration for leader
      const {error: regError} = await supabase
        .from('registrations')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          event_id: eventId,
          user_id: user.id,
          team_id: (teamData as any).id,
          registration_status: 'confirmed',
          is_team_registration: true,
        });

      if (regError) throw regError;

      // TODO: Send invites to team members via email
      // For now, we'll create a notification system for this

      toast({
        title: 'Team Created!',
        description: `Team "${teamName}" has been created successfully.`,
      });

      router.push(`/dashboard/attendee`);
    } catch (error: any) {
      console.error('Team registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to create team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam || !user) return;

    setIsLoading(true);
    try {
      // Add member to team
      const {error: memberError} = await supabase
        .from('team_members')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          team_id: selectedTeam,
          user_id: user.id,
          is_leader: false,
        });

      if (memberError) throw memberError;

      // Create registration
      const {error: regError} = await supabase
        .from('registrations')
        // @ts-expect-error - Supabase type generation issue
        .insert({
          event_id: eventId,
          user_id: user.id,
          team_id: selectedTeam,
          registration_status: 'confirmed',
          is_team_registration: true,
        });

      if (regError) throw regError;

      toast({
        title: 'Joined Team!',
        description: 'You have successfully joined the team.',
      });

      router.push(`/dashboard/attendee`);
    } catch (error: any) {
      console.error('Join team error:', error);
      toast({
        title: 'Failed to Join',
        description: error?.message || 'Failed to join team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMemberField = () => {
    setTeamMembers([...teamMembers, '']);
  };

  const removeTeamMemberField = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, value: string) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  if (authLoading || loadingEvent || !event || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="container mx-auto max-w-lg py-12 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-destructive/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Not Eligible</CardTitle>
            </div>
            <CardDescription>You cannot register for this event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Registration Restricted</AlertTitle>
              <AlertDescription>{eligibilityMessage}</AlertDescription>
            </Alert>
            
            <div className="space-y-2 pt-4">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">
                {event.college?.name ? `College: ${event.college.name}` : 'Global Event'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/events/${eventId}`}>Back to Event Details</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/events">Browse Other Events</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const canRegisterIndividual = event.participation_type === 'individual' || event.participation_type === 'both';
  const canRegisterTeam = event.participation_type === 'team' || event.participation_type === 'both';

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register for Event</CardTitle>
          <CardDescription>Choose your registration method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {event.college?.name && (
              <p className="text-sm text-muted-foreground">
                {event.is_global ? '🌍 Global Event' : `🏛️ ${event.college.name}`}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              {event.participation_type === 'individual' && (
                <Badge><User className="h-3 w-3 mr-1" /> Individual Only</Badge>
              )}
              {event.participation_type === 'team' && (
                <Badge><Users className="h-3 w-3 mr-1" /> Team Only ({event.team_size_min}-{event.team_size_max} members)</Badge>
              )}
              {event.participation_type === 'both' && (
                <>
                  <Badge variant="secondary"><User className="h-3 w-3 mr-1" /> Individual</Badge>
                  <Badge variant="secondary"><Users className="h-3 w-3 mr-1" /> Team ({event.team_size_min}-{event.team_size_max})</Badge>
                </>
              )}
            </div>
          </div>

          {/* Registration Tabs */}
          {event.participation_type === 'both' ? (
            <Tabs value={registrationType} onValueChange={(v) => setRegistrationType(v as 'individual' | 'team')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual" disabled={!canRegisterIndividual}>
                  <User className="h-4 w-4 mr-2" /> Individual
                </TabsTrigger>
                <TabsTrigger value="team" disabled={!canRegisterTeam}>
                  <Users className="h-4 w-4 mr-2" /> Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual" className="space-y-4">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Individual Registration</AlertTitle>
                  <AlertDescription>
                    Register as an individual participant for this event.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Tabs defaultValue="create">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Team</TabsTrigger>
                    <TabsTrigger value="join">Join Team</TabsTrigger>
                  </TabsList>

                  <TabsContent value="create" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="teamName">Team Name *</Label>
                        <Input
                          id="teamName"
                          placeholder="Enter your team name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Team Members (Optional)</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addTeamMemberField}
                            disabled={teamMembers.length >= (event.team_size_max - 1)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Member
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You can invite {event.team_size_min - 1} to {event.team_size_max - 1} members. You'll be the team leader.
                        </p>
                        
                        {teamMembers.map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Member email address"
                              type="email"
                              value={member}
                              onChange={(e) => updateTeamMember(index, e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTeamMemberField(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Alert>
                        <AlertDescription>
                          Team size: {event.team_size_min} - {event.team_size_max} members. 
                          You can add members now or invite them later.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  <TabsContent value="join" className="space-y-4 mt-4">
                    {existingTeams.length > 0 ? (
                      <div className="space-y-3">
                        <Label>Available Teams</Label>
                        {existingTeams.map((team) => (
                          <Card key={team.id} className={selectedTeam === team.id ? 'border-primary' : ''}>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{team.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {team.current_members} / {team.max_members} members
                                  </p>
                                </div>
                                <Button
                                  variant={selectedTeam === team.id ? 'default' : 'outline'}
                                  onClick={() => setSelectedTeam(team.id)}
                                >
                                  {selectedTeam === team.id ? 'Selected' : 'Select'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertDescription>
                          No teams available yet. Be the first to create one!
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              {registrationType === 'team' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName">Team Name *</Label>
                    <Input
                      id="teamName"
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Team Members (Optional)</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addTeamMemberField}
                        disabled={teamMembers.length >= (event.team_size_max - 1)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Member
                      </Button>
                    </div>
                    
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Member email address"
                          type="email"
                          value={member}
                          onChange={(e) => updateTeamMember(index, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMemberField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            onClick={
              registrationType === 'individual' 
                ? handleIndividualRegistration 
                : selectedTeam 
                  ? handleJoinTeam 
                  : handleTeamRegistration
            } 
            disabled={isLoading} 
            className="w-full" 
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : registrationType === 'individual' ? (
              'Confirm Registration'
            ) : selectedTeam ? (
              'Join Team'
            ) : (
              'Create Team & Register'
            )}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/events/${eventId}`}>Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
