'use client';

import {useEffect, useState} from 'react';
import {MapPin, Calendar, Mail, Phone, Globe, GraduationCap, Loader2} from 'lucide-react';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {EventCard} from '@/components/event-card';
import {supabase} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import Link from 'next/link';

interface CollegeDetailClientProps {
  college: any;
  events: any[];
}

export default function CollegeDetailClient({college: initialCollege, events: initialEvents}: CollegeDetailClientProps) {
  const [college, setCollege] = useState(initialCollege);
  const [events, setEvents] = useState<any[]>(initialEvents || []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  });

  useEffect(() => {
    loadCollegeData();
  }, [initialCollege.id]);

  const loadCollegeData = async () => {
    try {
      // Load college details
      const {data: collegeData} = await supabase
        .from('colleges')
        .select('*')
        .eq('id', initialCollege.id)
        .single();

      if (collegeData) {
        setCollege(collegeData);
      }

      // Load events for this college
      const {data: eventsData} = await supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name, icon_name),
          college:colleges(id, name, location),
          organizer:profiles!events_organizer_id_fkey(id, full_name, organization_name, avatar_url)
        `)
        .eq('college_id', initialCollege.id)
        .eq('event_status', 'published')
        .order('start_date', {ascending: true});

      if (eventsData) {
        setEvents(eventsData);
        
        const now = new Date();
        const upcoming = eventsData.filter((e: any) => new Date(e.start_date) >= now).length;
        const past = eventsData.filter((e: any) => new Date(e.start_date) < now).length;
        
        setStats({
          totalEvents: eventsData.length,
          upcomingEvents: upcoming,
          pastEvents: past,
        });
      }
    } catch (error) {
      console.error('Error loading college data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* College Logo */}
              {college.logo_url && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white/50">
                    <img
                      src={college.logo_url.startsWith('http') ? college.logo_url : `https://via.placeholder.com/200?text=${encodeURIComponent(college.name)}`}
                      alt={college.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/200?text=${encodeURIComponent(college.name)}`;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* College Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">{college.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{college.location}</span>
                  </div>
                </div>

                {college.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {college.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {college.established_year && (
                    <Badge variant="secondary" className="px-4 py-2 text-sm">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Est. {college.established_year}
                    </Badge>
                  )}
                  {college.contact_email && (
                    <a 
                      href={`mailto:${college.contact_email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {college.contact_email}
                    </a>
                  )}
                  {college.contact_phone && (
                    <a 
                      href={`tel:${college.contact_phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {college.contact_phone}
                    </a>
                  )}
                  {college.website && (
                    <a 
                      href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{stats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Events</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.upcomingEvents}</p>
                  <p className="text-sm text-muted-foreground mt-1">Upcoming Events</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">{stats.pastEvents}</p>
                  <p className="text-sm text-muted-foreground mt-1">Past Events</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Events at {college.name}</h2>
                <p className="text-muted-foreground mt-1">
                  {events.length > 0 
                    ? `Discover ${events.length} amazing event${events.length !== 1 ? 's' : ''} happening here` 
                    : 'No events found for this college'}
                </p>
              </div>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
                    <p className="text-muted-foreground">
                      This college hasn't hosted any events yet. Check back later!
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/events">Browse All Events</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
