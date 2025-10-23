'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, Building2, Tag, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  
  const [events, setEvents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Search events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*, categories(name)')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
        .eq('status', 'published')
        .order('start_date', { ascending: true })
        .limit(20);

      // Search colleges
      const { data: collegesData } = await supabase
        .from('colleges')
        .select('*')
        .or(`name.ilike.${searchTerm},location.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(20);

      // Search categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(20);

      setEvents(eventsData || []);
      setColleges(collegesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = events.length + colleges.length + categories.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 py-20">
          <div className="container mx-auto px-4 text-center">
            <Skeleton className="h-16 w-96 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-8 w-64 mx-auto bg-white/10" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-12 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-900 dark:via-violet-900 dark:to-indigo-900 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Search className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">{totalResults} Results Found</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Search Results for
            </h1>
            <p className="text-2xl text-white/90 font-semibold">"{query}"</p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {totalResults === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-8">
                Try different keywords or browse our categories
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/events" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:scale-105 transition-transform">
                  Browse Events
                </Link>
                <Link href="/colleges" className="px-6 py-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                  View Colleges
                </Link>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
                <TabsTrigger value="colleges">Colleges ({colleges.length})</TabsTrigger>
                <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {events.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-purple-600" />
                      Events
                    </h2>
                    <div className="grid gap-4">
                      {events.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`}>
                          <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                            <CardContent className="p-6">
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all">
                                    {event.title}
                                  </h3>
                                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                    {event.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {format(new Date(event.start_date), 'MMM d, yyyy')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </span>
                                    {event.categories && (
                                      <Badge variant="secondary">{event.categories.name}</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {colleges.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-teal-600" />
                      Colleges
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {colleges.map((college) => (
                        <Link key={college.id} href={`/colleges/${college.id}`}>
                          <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-bold mb-2 group-hover:text-gradient transition-all">
                                {college.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {college.location}
                              </p>
                              {college.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {college.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Tag className="h-6 w-6 text-violet-600" />
                      Categories
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <Link key={category.id} href={`/events?category=${category.id}`}>
                          <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-center">
                            <CardContent className="p-6">
                              <div className="text-4xl mb-2">{category.icon}</div>
                              <h3 className="font-bold group-hover:text-gradient transition-all">
                                {category.name}
                              </h3>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events">
                {events.length > 0 ? (
                  <div className="grid gap-4">
                    {events.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2 group-hover:text-gradient transition-all">
                                  {event.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                  {event.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(event.start_date), 'MMM d, yyyy')}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                  </span>
                                  {event.categories && (
                                    <Badge variant="secondary">{event.categories.name}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No events found for "{query}"</p>
                )}
              </TabsContent>

              <TabsContent value="colleges">
                {colleges.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {colleges.map((college) => (
                      <Link key={college.id} href={`/colleges/${college.id}`}>
                        <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                          <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2 group-hover:text-gradient transition-all">
                              {college.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {college.location}
                            </p>
                            {college.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {college.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No colleges found for "{query}"</p>
                )}
              </TabsContent>

              <TabsContent value="categories">
                {categories.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <Link key={category.id} href={`/events?category=${category.id}`}>
                        <Card className="glass hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-center">
                          <CardContent className="p-6">
                            <div className="text-4xl mb-2">{category.icon}</div>
                            <h3 className="font-bold group-hover:text-gradient transition-all">
                              {category.name}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No categories found for "{query}"</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
}
