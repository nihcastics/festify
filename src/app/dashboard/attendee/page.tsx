'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {
  Calendar,
  Ticket,
  Heart,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  Award,
  Search,
  CalendarDays,
  User,
  Tag,
  Zap,
  Trophy,
  Target,
  PartyPopper,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {Input} from '@/components/ui/input';
import Link from 'next/link';
import {supabase} from '@/lib/supabase/client';
import {Progress} from '@/components/ui/progress';

export default function AttendeeDashboard() {
  const {user, profile, loading} = useAuth();
  const router = useRouter();
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [stats, setStats] = useState({
    eventsAttended: 0,
    upcomingEvents: 0,
    savedEvents: 0,
    points: 0,
  });

  // Filter events by date
  const now = new Date();
  const upcomingEvents = registeredEvents.filter(
    (event: any) => new Date(event.start_date) > now
  );
  const pastEvents = registeredEvents.filter(
    (event: any) => new Date(event.end_date) < now
  );

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'attendee')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (user && profile?.role === 'attendee') {
      loadUserEvents();
    }
  }, [user, profile]);

  const loadUserEvents = async () => {
    if (!user) return;

    try {
      // Fetch registered events
      const {data: registrations, error: regError} = await supabase
        .from('registrations')
        .select(`
          *,
          event:events(
            *,
            category:categories(name),
            college:colleges(name),
            organizer:profiles!events_organizer_id_fkey(full_name, organization_name)
          )
        `)
        .eq('user_id', user.id)
        .order('registration_date', {ascending: false});

      if (regError) throw regError;

      const events = registrations?.map((r: any) => ({
        ...r.event,
        registration_status: r.registration_status,
        registration_date: r.registration_date,
      })) || [];

      setRegisteredEvents(events);

      // Calculate stats
      const now = new Date();
      const upcomingEvents = events.filter((e: any) =>
        new Date(e.start_date) > now
      ).length;
      const attendedEvents = events.filter((e: any) =>
        new Date(e.end_date) < now
      ).length;

      setStats({
        eventsAttended: attendedEvents,
        upcomingEvents,
        savedEvents: 0,
        points: attendedEvents * 10, // Example: 10 points per event
      });
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (loading || loadingEvents) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'attendee') {
    return null;
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <PartyPopper className="h-7 w-7" />
            <h1 className="text-3xl font-bold tracking-tight">Hey, {profile?.full_name}!</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Your adventure awaits! Discover amazing events, earn rewards, and create unforgettable memories.
          </p>
          
          {/* Level Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold">Event Explorer Level {Math.floor(stats.points / 50) + 1}</span>
              </div>
              <span className="text-sm text-blue-100">{stats.points} pts</span>
            </div>
            <Progress value={(stats.points % 50) * 2} className="h-2 bg-white/20" />
            <p className="text-xs text-blue-200 mt-1">{50 - (stats.points % 50)} points to next level</p>
          </div>

          <Button asChild size="lg" variant="secondary" className="gap-2 shadow-lg mt-4">
            <Link href="/events">
              <Search className="h-5 w-5" />
              Explore Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Events Attended</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2.5">
              <Ticket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.eventsAttended}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Keep going!
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/20 rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Upcoming</CardTitle>
            <div className="rounded-full bg-cyan-500/10 p-2.5">
              <CalendarDays className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.upcomingEvents}</div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Events to look forward to</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-950/30 dark:to-pink-900/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-400/20 rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-pink-900 dark:text-pink-100">Saved Events</CardTitle>
            <div className="rounded-full bg-pink-500/10 p-2.5">
              <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900 dark:text-pink-100">{stats.savedEvents}</div>
            <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">Events you're interested in</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/20 rounded-full -mr-12 -mt-12" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Reward Points</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2.5">
              <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.points}</div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">+10 pts per event</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="registered" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registered">My Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="space-y-4">
          {registeredEvents.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Ticket className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No registered events</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Discover amazing events happening in your college. Browse events and register to get started.
                </p>
                <Button asChild>
                  <Link href="/events">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {registeredEvents.map((event: any) => {
                const isUpcoming = new Date(event.start_date) > new Date();
                return (
                  <Card key={event.id} className="group hover:shadow-lg transition-all overflow-hidden">
                    {event.image_url && (
                      <div className="h-40 overflow-hidden bg-muted">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {event.description}
                          </CardDescription>
                        </div>
                        <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {new Date(event.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {new Date(event.start_date).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/events/${event.id}`}>View Details</Link>
                      </Button>
                      {isUpcoming && (
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/events/${event.id}/ticket`}>View Ticket</Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CalendarDays className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  You don't have any upcoming events. Check out what's happening soon!
                </p>
                <Button asChild>
                  <Link href="/events">
                    <Search className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event: any) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all overflow-hidden">
                  {event.image_url && (
                    <div className="h-40 overflow-hidden bg-muted">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {event.description}
                        </CardDescription>
                      </div>
                      {event.category && (
                        <Badge variant="outline">{event.category.name}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {new Date(event.start_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {new Date(event.start_date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.organizer && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {event.organizer.organization_name || event.organizer.full_name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/events/${event.id}/ticket`}>View Ticket</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No past events</h3>
                <p className="text-muted-foreground">Your attended events will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event: any) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all overflow-hidden">
                  {event.image_url && (
                    <div className="h-40 overflow-hidden bg-muted">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {event.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Attended</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {new Date(event.start_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.category && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Tag className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{event.category.name}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/events/${event.id}`}>View Event</Link>
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Star className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {savedEvents.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved events</h3>
                <p className="text-muted-foreground">Save events you're interested in</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedEvents.map((event) => (
                <Card key={event.id} className="group hover:shadow-lg transition-all">
                  {/* Event card content */}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommended Events */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended for You
          </CardTitle>
          <CardDescription>Events based on your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p>Explore events to get personalized recommendations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
