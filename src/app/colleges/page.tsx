'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building2, ArrowRight, GraduationCap, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [colleges, setColleges] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      const { data } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      setColleges(data || []);
      
      // Extract unique locations
      const uniqueLocations = Array.from(new Set(data?.map((c: any) => c.location).filter(Boolean))) as string[];
      setLocations(uniqueLocations.sort());
    } catch (error) {
      console.error('Error loading colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter(college =>
    (selectedLocation === 'All' || college.location === selectedLocation) &&
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 py-20">
          <Skeleton className="h-16 w-96 mx-auto mb-4" />
          <Skeleton className="h-8 w-[600px] mx-auto" />
        </div>
        <div className="container mx-auto py-12 px-4">
          <Skeleton className="h-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 py-20">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-tr from-black/10 to-transparent" />
        
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <GraduationCap className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">{colleges.length} Colleges</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-white">
            Explore Colleges
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Discover educational institutions and the exciting events they host for students
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 pb-16">
        {/* Enhanced Search and Filter Card */}
        <div className="mb-12 p-8 bg-card/80 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl shadow-teal-500/10">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Find Your College</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search College</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by college name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 text-base border-2 focus-visible:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full h-12 text-base border-2 focus:ring-teal-500">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedLocation !== 'All') && (
            <div className="flex items-center gap-2 mt-6 pt-6 border-t">
              <span className="text-sm font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">Search: {searchTerm}</Badge>
              )}
              {selectedLocation !== 'All' && (
                <Badge variant="secondary">Location: {selectedLocation}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {filteredColleges.length > 0 
              ? `${filteredColleges.length} College${filteredColleges.length !== 1 ? 's' : ''} Found` 
              : 'No Colleges Found'}
          </h2>
          {filteredColleges.length > 0 && (
            <p className="text-muted-foreground">Click to view details</p>
          )}
        </div>

        {filteredColleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college) => (
              <Link key={college.id} href={`/colleges/${college.id}`} className="block h-full group">
                <Card className="h-full flex flex-col hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 hover:-translate-y-1 border-2 hover:border-teal-500/50 relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  
                  {/* College Logo/Image */}
                  {college.logo_url && (
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                      <div className="absolute inset-0 flex items-center justify-center p-6">
                        <img 
                          src={college.logo_url} 
                          alt={`${college.name} logo`}
                          className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-emerald-600 group-hover:to-teal-600 transition-all line-clamp-2">
                          {college.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <span>{college.location}</span>
                        </div>
                      </div>
                      {!college.logo_url && (
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg shrink-0">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow relative">
                    {college.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {college.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {college.established_year && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>Established {college.established_year}</span>
                        </div>
                      )}
                      {college.website && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate">{college.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm font-medium text-teal-600 group-hover:text-teal-700">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            {(searchTerm || selectedLocation !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('All');
                }}
                className="text-teal-600 hover:underline font-medium"
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
