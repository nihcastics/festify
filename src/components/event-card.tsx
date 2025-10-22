import Image from 'next/image';
import Link from 'next/link';
import type {Event} from '@/lib/events';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {CalendarDays, MapPin, IndianRupee} from 'lucide-react';

type EventCardProps = {
  event: Event;
};

export function EventCard({event}: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={event.image}
              alt={event.name}
              data-ai-hint={`${event.category.toLowerCase()} event`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
             <div className="absolute top-2 right-2">
               <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground">
                {event.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-bold mb-2 leading-snug group-hover:text-primary transition-colors">{event.name}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex flex-col items-start gap-2 border-t mt-auto mx-4">
          <div className="flex items-center gap-2 pt-4">
            <CalendarDays className="h-4 w-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="w-full flex justify-end items-center gap-2 font-bold text-base text-primary">
            <IndianRupee className="h-4 w-4" />
            <span>{event.price > 0 ? `${event.price}` : 'Free'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
