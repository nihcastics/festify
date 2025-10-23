'use client';

import {useEffect, useState} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Loader2, AlertTriangle, AlertCircle, Users, User, IndianRupee, Plus, Trash2} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import Link from 'next/link';
import {supabase} from '@/lib/supabase/client';
import {calculateRegistrationPrice, processRegistrationPayment, formatPrice} from '@/lib/pricing-utils';
import {createTeamWithMembers, validateTeamData, type TeamMember, type TeamData} from '@/lib/team-utils';
import PaymentProcessing from '@/components/payment-processing';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';

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
  const [teamSize, setTeamSize] = useState(2);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  // Team form state
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [leaderUniversityReg, setLeaderUniversityReg] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

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
      calculatePrice();
    }
  }, [event, profile, registrationType, teamSize]);

  // Auto-initialize team members based on team size
  useEffect(() => {
    if (registrationType === 'team' && teamSize > 0) {
      const neededMembers = teamSize - 1; // Excluding leader
      if (teamMembers.length < neededMembers) {
        // Add more members
        const toAdd = Array(neededMembers - teamMembers.length)
          .fill(null)
          .map(() => ({ name: '', email: '', phone: '', university_reg: '' }));
        setTeamMembers([...teamMembers, ...toAdd]);
      } else if (teamMembers.length > neededMembers) {
        // Remove excess members
        setTeamMembers(teamMembers.slice(0, neededMembers));
      }
    }
  }, [teamSize, registrationType]);

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
    } catch (error) {
      console.error('Error loading event:', error);
      router.push('/404');
    } finally {
      setLoadingEvent(false);
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

  const calculatePrice = async () => {
    if (!event) return;
    
    setPriceLoading(true);
    try {
      const isTeam = registrationType === 'team';
      const size = isTeam ? teamSize : 1;
      const price = await calculateRegistrationPrice(eventId, isTeam, size);
      setCalculatedPrice(price);
    } catch (error) {
      console.error('Error calculating price:', error);
      setCalculatedPrice(0);
    } finally {
      setPriceLoading(false);
    }
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, {
      name: '',
      email: '',
      phone: '',
      university_reg: ''
    }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleRegistration = async () => {
    if (!isEligible) {
      toast({
        title: 'Not Eligible',
        description: eligibilityMessage,
        variant: 'destructive',
      });
      return;
    }

    // Validate team data if team registration
    if (registrationType === 'team') {
      const teamData: TeamData = {
        team_name: teamName,
        team_leader_name: leaderName,
        team_leader_email: leaderEmail,
        team_leader_phone: leaderPhone,
        team_leader_university_reg: leaderUniversityReg,
        members: teamMembers
      };

      const validation = validateTeamData(teamData, teamSize);
      if (!validation.valid) {
        toast({
          title: 'Validation Error',
          description: validation.errors[0],
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Check if already registered
      const {data: existingRegistration} = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user!.id)
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

      // Determine if this is a team registration
      const isTeam = registrationType === 'team';

      // Create registration
      const {data: newRegistration, error} = await supabase
        .from('registrations')
        // @ts-expect-error - Supabase type inference issue with RLS
        .insert({
          event_id: eventId,
          user_id: user!.id,
          registration_status: 'pending',
          is_team: isTeam,
          team_size: isTeam ? teamSize : 1,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // @ts-expect-error - Supabase type inference
      const regId = newRegistration.id;
      setRegistrationId(regId);

      // If team registration, create team with members
      if (isTeam && regId) {
        const teamData: TeamData = {
          team_name: teamName,
          team_leader_name: leaderName,
          team_leader_email: leaderEmail,
          team_leader_phone: leaderPhone,
          team_leader_university_reg: leaderUniversityReg,
          members: teamMembers
        };

        const teamId = await createTeamWithMembers(regId, eventId, teamData);
        if (!teamId) {
          throw new Error('Failed to create team');
        }
      }

      // Show payment modal
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!registrationId) return;

    const MAX_TIMEOUT = 30000; // 30 seconds timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Payment processing timeout. Please check your registration status.')), MAX_TIMEOUT)
    );

    try {
      // Race between payment processing and timeout
      await Promise.race([
        (async () => {
          // Process payment - try RPC first, fallback to direct update
          let success = await processRegistrationPayment(
            registrationId,
            calculatedPrice,
            'bypass'
          );

          const txId = `BYPASS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // If RPC fails, update directly
          if (!success) {
            const { error: updateError } = await supabase
              .from('registrations')
              // @ts-expect-error - Supabase type inference issue with RLS
              .update({
                payment_status: 'completed',
                payment_amount: calculatedPrice,
                payment_method: 'bypass',
                transaction_id: txId,
                paid_at: new Date().toISOString(),
                registration_status: 'registered'
              })
              .eq('id', registrationId);

            if (updateError) {
              throw updateError;
            }
            success = true;
          }

          if (success) {
            // Create ticket record
            const ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}-${registrationId.substring(0, 6).toUpperCase()}`;
            
            const { data: ticketData, error: ticketError } = await supabase
              .from('tickets')
              // @ts-expect-error - Supabase type inference issue
              .insert({
                event_id: eventId,
                registration_id: registrationId,
                ticket_type: calculatedPrice > 0 ? 'paid' : 'free',
                price: calculatedPrice,
                ticket_code: ticketCode,
                is_valid: true,
                issued_at: new Date().toISOString()
              })
              .select()
              .single();

            if (ticketError) {
              console.error('Error creating ticket:', ticketError);
            }

            // Create payment record if there was a payment
            if (calculatedPrice > 0) {
              const { error: paymentError } = await supabase
                .from('payments')
                // @ts-expect-error - Supabase type inference issue
                .insert({
                  registration_id: registrationId,
                  ticket_id: (ticketData as any)?.id,
                  amount: calculatedPrice,
                  payment_status: 'completed',
                  payment_method: 'bypass',
                  transaction_id: txId,
                  payment_date: new Date().toISOString()
                });

              if (paymentError) {
                console.error('Error creating payment record:', paymentError);
              }
            }

            // Update user's profile if needed (mark as registered attendee)
            const { error: profileError } = await supabase
              .from('profiles')
              // @ts-expect-error - Supabase type inference issue
              .update({
                updated_at: new Date().toISOString()
              })
              .eq('id', user!.id);

            if (profileError) {
              console.error('Error updating profile:', profileError);
            }

            toast({
              title: 'Registration Successful!',
              description: `You are now registered for ${event?.title}.`,
            });

            // Small delay to ensure database is updated
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirect to ticket page
            router.push(`/events/${eventId}/ticket`);
          } else {
            throw new Error('Payment processing failed');
          }
        })(),
        timeoutPromise
      ]);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error?.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
      setShowPaymentModal(false);
      setIsLoading(false);
    }
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
            
            {event && (
              <div className="space-y-2 pt-4">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {event.college?.name ? `College: ${event.college.name}` : 'Global Event'}
                </p>
                {!event.is_global && event.college_id && (
                  <p className="text-sm text-muted-foreground">
                    This is a college-specific event.
                  </p>
                )}
              </div>
            )}
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

  return (
    <>
      {showPaymentModal && (
        <PaymentProcessing
          amount={calculatedPrice}
          eventTitle={event?.title || 'Event Registration'}
          onComplete={handlePaymentComplete}
          processingTime={3000}
        />
      )}
      
      <div className="container mx-auto max-w-lg py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Confirm Registration</CardTitle>
            <CardDescription>You are about to register for the following event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Details */}
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(event.start_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {event.college?.name && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.is_global ? '🌍 Global Event' : `🏛️ ${event.college.name}`}
                </p>
              )}
            </div>

            {/* Registration Type Selection */}
            {event.participation_type === 'both' && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-base font-semibold">Registration Type</Label>
                <RadioGroup
                  value={registrationType}
                  onValueChange={(value) => setRegistrationType(value as 'individual' | 'team')}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="flex-1 cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Individual Registration</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="flex-1 cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Team Registration</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Team Size Selection */}
            {(registrationType === 'team' || event.participation_type === 'team') && (
              <div className="space-y-3 border-t pt-4">
                <Label htmlFor="teamSize" className="text-base font-semibold">
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  type="number"
                  min={event.team_size_min || 2}
                  max={event.team_size_max || 10}
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value) || 2)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Team size must be between {event.team_size_min || 2} and {event.team_size_max || 10} members
                </p>
              </div>
            )}

            {/* Team Information Form */}
            {(registrationType === 'team' || event.participation_type === 'team') && (
              <div className="space-y-4 border-t pt-4">
                {/* Team Name */}
                <div>
                  <Label htmlFor="teamName" className="text-base font-semibold">
                    Team Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className="mt-2"
                  />
                </div>
                
                {/* Team Leader Information */}
                <div className="space-y-3 border p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Leader Information
                  </h4>
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="leaderName">Full Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="leaderName"
                        placeholder="Leader Full Name"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="leaderEmail">Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="leaderEmail"
                        type="email"
                        placeholder="Leader Email"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="leaderPhone">Phone <span className="text-destructive">*</span></Label>
                      <Input
                        id="leaderPhone"
                        type="tel"
                        placeholder="Leader Phone Number"
                        value={leaderPhone}
                        onChange={(e) => setLeaderPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="leaderUniversityReg">University Registration Number <span className="text-destructive">*</span></Label>
                      <Input
                        id="leaderUniversityReg"
                        placeholder="University Registration Number"
                        value={leaderUniversityReg}
                        onChange={(e) => setLeaderUniversityReg(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Team Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Members
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTeamMember}
                      disabled={teamMembers.length >= teamSize - 1}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  
                  {teamMembers.map((member, index) => (
                    <div key={index} className="border p-4 rounded-lg space-y-3 bg-card">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">Member {index + 1}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor={`member-name-${index}`}>Full Name <span className="text-destructive">*</span></Label>
                          <Input
                            id={`member-name-${index}`}
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-email-${index}`}>Email <span className="text-destructive">*</span></Label>
                          <Input
                            id={`member-email-${index}`}
                            type="email"
                            placeholder="Email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-phone-${index}`}>Phone <span className="text-destructive">*</span></Label>
                          <Input
                            id={`member-phone-${index}`}
                            type="tel"
                            placeholder="Phone Number"
                            value={member.phone}
                            onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-university-${index}`}>University Registration Number <span className="text-destructive">*</span></Label>
                          <Input
                            id={`member-university-${index}`}
                            placeholder="University Registration Number"
                            value={member.university_reg}
                            onChange={(e) => updateTeamMember(index, 'university_reg', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {teamMembers.length < teamSize - 1 && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed">
                      <p className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Add {teamSize - 1 - teamMembers.length} more member(s) to complete your team
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Registration Fee</span>
                <span className="font-medium">
                  {priceLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    formatPrice(calculatedPrice)
                  )}
                </span>
              </div>

              {registrationType === 'team' && !event.has_custom_team_pricing && event.price_per_member > 0 && (
                <>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Base Price</span>
                    <span>{formatPrice(event.team_base_price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Additional Members ({teamSize - 1} × {formatPrice(event.price_per_member)})</span>
                    <span>{formatPrice((teamSize - 1) * (event.price_per_member || 0))}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-lg font-bold flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-primary">
                  {priceLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    formatPrice(calculatedPrice)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={handleRegistration}
              disabled={isLoading || priceLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full" asChild disabled={isLoading}>
              <Link href={`/events/${eventId}`}>Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
