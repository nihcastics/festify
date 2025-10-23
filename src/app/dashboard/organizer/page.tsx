'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {
  Calendar,
  Plus,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Settings,
  Sparkles,
  CheckCircle,
  XCircle,
  Activity,
  Target,
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
import Link from 'next/link';
import {supabase} from '@/lib/supabase/client';
import {Progress} from '@/components/ui/progress';

export default function OrganizerDashboard() {
  const {user, profile, loading} = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalRegistrations: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'organizer')) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (user && profile?.role === 'organizer') {
      loadEvents();
    }
  }, [user, profile]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      const {data: eventsData, error} = await supabase
        .from('events')
        .select('*, category:categories(name), college:colleges(name), registrations(count)')
        .eq('organizer_id', user.id)
        .order('created_at', {ascending: false});

      if (error) throw error;

      setEvents(eventsData || []);

      // Calculate stats
      const now = new Date();
      const totalEvents = eventsData?.length || 0;
      const upcomingEvents = eventsData?.filter((e: any) =>
        new Date(e.start_date) > now && e.event_status === 'published'
      ).length || 0;
      const activeEvents = eventsData?.filter((e: any) => e.event_status === 'published').length || 0;

      // Get total registrations
      const {count: totalRegistrations} = await supabase
        .from('registrations')
        .select('*', {count: 'exact', head: true})
        .in('event_id', eventsData?.map((e: any) => e.id) || []);

      setStats({
        totalEvents,
        upcomingEvents,
        totalRegistrations: totalRegistrations || 0,
        activeEvents,
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

  if (!user || profile?.role !== 'organizer') {
    return null;
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <h1 className="text-3xl font-bold tracking-tight">Organizer Command Center</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Welcome back, <span className="font-semibold">{profile?.organization_name || profile?.full_name}</span>! 
            </p>
            <p className="text-purple-200 text-sm">
              Manage your events, track registrations, and grow your community.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" variant="secondary" className="gap-2 shadow-lg">
              <Link href="/dashboard/organizer/analytics">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </Link>
            </Button>
            <Button asChild size="lg" className="gap-2 bg-white text-purple-600 hover:bg-purple-50 shadow-lg">
              <Link href="/dashboard/organizer/create-event">
                <Plus className="h-5 w-5" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Total Events</CardTitle>
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.totalEvents}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">All time events created</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Upcoming Events</CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.upcomingEvents}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Scheduled in the future</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Total Registrations</CardTitle>
            <div className="rounded-lg bg-green-500/10 p-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalRegistrations}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">People registered</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full -mr-10 -mt-10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Active Events</CardTitle>
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.activeEvents}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Published & live</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {events.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Start creating amazing events for your college community. Click the button below to get started.
                </p>
                <Button asChild>
                  <Link href="/dashboard/organizer/create-event">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => {
                const registrationCount = event.registrations?.[0]?.count || event.current_attendees || 0;
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
                        <Badge
                          variant={event.event_status === 'published' ? 'default' : 'secondary'}
                          className="shrink-0"
                        >
                          {event.event_status}
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
                        <MapPin className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4 shrink-0" />
                        <span>{registrationCount} registrations</span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 flex-wrap">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">Create an event to see it here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No past events</h3>
              <p className="text-muted-foreground">Your completed events will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Edit className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No drafts</h3>
              <p className="text-muted-foreground">Save events as drafts before publishing</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for event management</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link href="/dashboard/organizer/create-event">
              <Plus className="h-6 w-6" />
              <span>Create Event</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link href="/dashboard/organizer/analytics">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
            <Link href="/profile">
              <Settings className="h-6 w-6" />
              <span>Manage Profile</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
