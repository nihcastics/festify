import Image from 'next/image';
import Link from 'next/link';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {CalendarDays, MapPin, Users, Star, ArrowRight} from 'lucide-react';
import {getValidImageUrl, getCategoryPlaceholder, handleImageError} from '@/lib/image-utils';

type EventCardProps = {
  event: any;
};

export function EventCard({event}: EventCardProps) {
  const eventDate = new Date(event.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const imageUrl = event.image_url 
    ? getValidImageUrl(event.image_url, event.title)
    : getCategoryPlaceholder(event.category?.name || 'Event');

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden h-full flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-2 border-border/50 hover:border-purple-500/50 bg-card/50 backdrop-blur-sm relative">
        {/* Animated gradient glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-indigo-500/10 group-hover:to-pink-500/10 transition-all duration-500 rounded-xl" />
        <div className="absolute -inset-px bg-gradient-to-br from-purple-600/0 via-indigo-600/0 to-pink-600/0 group-hover:from-purple-600/50 group-hover:via-indigo-600/50 group-hover:to-pink-600/50 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 -z-10" />
        
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="relative h-56 w-full bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10">
            <Image
              src={imageUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => handleImageError(e, event.title)}
            />
            {/* Gradient overlay with animated opacity */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Badges with glow */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Badge className="bg-white/95 backdrop-blur-md text-foreground shadow-lg border-0 font-semibold hover:bg-white transition-all duration-300 glow-sm">
                {event.category?.name || 'Event'}
              </Badge>
              {event.is_featured && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl border-0 font-semibold glow-md">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Quick view arrow with glow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
              <div className="bg-white dark:bg-gray-900 rounded-full p-2.5 shadow-xl glow-primary">
                <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 flex-grow relative z-10">
          <CardTitle className="text-xl font-bold mb-3 leading-snug group-hover:text-gradient transition-all duration-500 line-clamp-2">
            {event.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex flex-col gap-3 relative z-10">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-md glow-sm">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">{eventDate}</span>
          </div>
          
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg shadow-md glow-sm">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="line-clamp-1 flex-1">{event.college?.name || event.location}</span>
          </div>
          
          {event.max_attendees && (
            <div className="flex items-center justify-between gap-3 text-sm mt-2">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-md glow-sm">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="text-muted-foreground font-medium">
                  {event.current_attendees || 0}/{event.max_attendees}
                </span>
              </div>
              <div className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-700 shadow-lg glow-success"
                  style={{width: `${Math.min(((event.current_attendees || 0) / event.max_attendees) * 100, 100)}%`}}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
