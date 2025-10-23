'use client';
import { useState, useEffect } from 'react';
import { EventCard } from '@/components/event-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export function EventsPageClient() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  useEffect(() => {
    loadEventsAndCategories();
  }, []); // Remove profile dependency to prevent re-loading

  const loadEventsAndCategories = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Load published events with visibility filtering
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name),
          college:colleges(id, name, location),
          organizer:profiles!events_organizer_id_fkey(full_name, organization_name)
        `)
        .eq('event_status', 'published')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      const { data: eventsData } = await query;

      // Filter events based on user's college eligibility
      let filteredEvents = eventsData || [];
      if (profile) {
        filteredEvents = (eventsData || []).filter((event: any) => {
          // Global events are visible to everyone
          if (event.is_global) return true;
          
          // Events without a college are visible to everyone
          if (!event.college_id) return true;
          
          // If user has no college, they only see global events
          if (!profile.college_id) return event.is_global || !event.college_id;
          
          // College-specific events are only visible to users from that college
          return event.college_id === profile.college_id;
        });
      } else {
        // Not logged in users only see global events and events without college
        filteredEvents = (eventsData || []).filter((event: any) => 
          event.is_global || !event.college_id
        );
      }

      setCategories(categoriesData || []);
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category?.name === selectedCategory;
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.college?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20">
          <Skeleton className="h-16 w-96 mx-auto mb-4" />
          <Skeleton className="h-8 w-[600px] mx-auto" />
        </div>
        <div className="container mx-auto py-12 px-4">
          <Skeleton className="h-32 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-black/10 to-transparent" />
        
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Calendar className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">{events.length} Events Available</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-white">
            Discover Amazing Events
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            From tech conferences to cultural festivals, find experiences that inspire and excite you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 pb-16">
        {/* Enhanced Filter Card */}
        <div className="mb-12 p-8 bg-card/80 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl shadow-purple-500/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Filter Events</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, description, or location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 text-base border-2 focus-visible:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full h-12 text-base border-2 focus:ring-purple-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory !== 'All') && (
            <div className="flex items-center gap-2 mt-6 pt-6 border-t">
              <span className="text-sm font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                </Badge>
              )}
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {selectedCategory}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {filteredEvents.length > 0 
              ? `${filteredEvents.length} Event${filteredEvents.length !== 1 ? 's' : ''} Found` 
              : 'No Events Found'}
          </h2>
          {filteredEvents.length > 0 && (
            <p className="text-muted-foreground">Showing all results</p>
          )}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            {(searchTerm || selectedCategory !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
