'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/use-auth';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {supabase} from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AnalyticsPage() {
  const {user, profile, loading: authLoading} = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    totalRegistrations: 0,
    totalViews: 0,
    averageAttendance: 0,
    topEvents: [] as any[],
    recentRegistrations: [] as any[],
    categoryBreakdown: [] as any[],
  });

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'organizer')) {
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (user && profile?.role === 'organizer') {
      loadAnalytics();
    }
  }, [user, profile, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch events
      const {data: events, error: eventsError} = await supabase
        .from('events')
        .select('*, category:categories(name), registrations(count)')
        .eq('organizer_id', user.id);

      if (eventsError) throw eventsError;

      // Calculate stats
      const totalEvents = events?.length || 0;
      const publishedEvents = events?.filter((e: any) => e.event_status === 'published').length || 0;
      const draftEvents = events?.filter((e: any) => e.event_status === 'draft').length || 0;

      // Fetch registrations
      const {data: registrations, error: regError} = await supabase
        .from('registrations')
        .select('*, event:events!inner(organizer_id, title)')
        .eq('event.organizer_id', user.id);

      if (regError) throw regError;

      const totalRegistrations = registrations?.length || 0;

      // Top performing events
      const topEvents = events
        ?.map((event: any) => ({
          ...event,
          registrationCount: registrations?.filter((r: any) => r.event_id === event.id).length || 0,
        }))
        .sort((a: any, b: any) => b.registrationCount - a.registrationCount)
        .slice(0, 5) || [];

      // Category breakdown
      const categoryMap = new Map();
      events?.forEach((event: any) => {
        const categoryName = event.category?.name || 'Uncategorized';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));

      setAnalytics({
        totalEvents,
        publishedEvents,
        draftEvents,
        totalRegistrations,
        totalViews: 0, // Would need a views tracking system
        averageAttendance: totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0,
        topEvents,
        recentRegistrations: registrations?.slice(0, 5) || [],
        categoryBreakdown,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Track your event performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.publishedEvents} published, {analytics.draftEvents} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.averageAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per event average
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Event page views
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Events */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Events</CardTitle>
            <CardDescription>Events with highest registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{event.registrationCount}</p>
                      <p className="text-xs text-muted-foreground">registrations</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
            <CardDescription>Distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categoryBreakdown.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No category data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.categoryBreakdown.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.count} events</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${(category.count / analytics.totalEvents) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Key takeaways from your events</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-background/50 border">
            <p className="text-sm text-muted-foreground">Most Popular Category</p>
            <p className="text-xl font-bold mt-1">
              {analytics.categoryBreakdown[0]?.name || 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border">
            <p className="text-sm text-muted-foreground">Published Events</p>
            <p className="text-xl font-bold mt-1">{analytics.publishedEvents}</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border">
            <p className="text-sm text-muted-foreground">Draft Events</p>
            <p className="text-xl font-bold mt-1">{analytics.draftEvents}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
