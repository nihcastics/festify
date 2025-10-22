'use client';

import { useState } from 'react';
import Link from 'next/link';
import { locations, colleges } from '@/lib/colleges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin } from 'lucide-react';

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const filteredColleges = colleges.filter(college =>
    (selectedLocation === 'All' || college.location === selectedLocation) &&
    college.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50/50 dark:bg-card">
        <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Find Your College</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore colleges and the exciting events they host.
            </p>
        </div>

        <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search College
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                        id="search"
                        type="text"
                        placeholder="Search for a college..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 text-base"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger id="location" className="w-full h-11 text-base pl-10">
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
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college) => (
              <Link key={college.id} href={`/colleges/${college.id}`} className="block h-full">
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader>
                    <CardTitle className="text-xl font-bold">{college.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{college.location}</p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                     <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-normal">{college.eventCount} Events</Badge>
                      </div>
                    </CardContent>
                </Card>
              </Link>
            ))}
        </div>
        {filteredColleges.length === 0 && (
             <div className="text-center py-16">
                <p className="text-muted-foreground">No colleges found matching your criteria.</p>
             </div>
        )}
        </div>
    </div>
  );
}
