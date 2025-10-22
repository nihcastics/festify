'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Code,
  Trophy,
  Music,
  Palette,
  Mic,
  Drama,
  TrendingUp,
  Star,
  Ticket,
  Users,
  Building,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/event-card';
import { events } from '@/lib/events';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const categories = [
  { name: 'Tech', icon: Code, href: '/events?category=Tech' },
  { name: 'Sports', icon: Trophy, href: '/events?category=Sports' },
  { name: 'Dance', icon: Music, href: '/events?category=Cultural' },
  { name: 'Art', icon: Palette, href: '/events?category=Cultural' },
  { name: 'Music', icon: Mic, href: '/events?category=Cultural' },
  { name: 'Drama', icon: Drama, href: '/events?category=Cultural' },
];

const whyChooseUs = [
  {
    icon: Ticket,
    title: 'Exclusive Events',
    description: 'Access a wide range of events, from tech fests to cultural nights, all in one place.',
  },
  {
    icon: Star,
    title: 'Seamless Experience',
    description: 'Easy registration and ticketing process. Get your QR code ticket in seconds.',
  },
  {
    icon: Users,
    title: 'Vibrant Community',
    description: 'Connect with fellow students, join clubs, and be part of a thriving campus ecosystem.',
  },
   {
    icon: Building,
    title: 'Discover Colleges',
    description: 'Explore clubs and events from various colleges across the country.',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    college: 'IIT Bombay',
    avatar: '/avatars/01.png',
    quote: 'Festify is a game-changer for college students! I discovered so many amazing events I would have otherwise missed. The ticketing process is super smooth.',
  },
  {
    name: 'Rahul Verma',
    college: 'SRMIST, Chennai',
    avatar: '/avatars/02.png',
    quote: 'As a club organizer, this platform has made it so much easier to promote our events and reach a wider audience. Highly recommended!',
  },
  {
    name: 'Ananya Singh',
    college: 'Delhi University',
    avatar: '/avatars/03.png',
    quote: 'I love how easy it is to find events happening around me. The categories section helps me find exactly what I\'m looking for. A must-have app for every student!',
  },
];


export default function Home() {
  const featuredEvents = events.slice(0, 9);
  
  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 h-full w-full bg-background bg-[radial-gradient(#2d2d3c_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        <div className="z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              India's Premier College Events Platform
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            Discover Amazing
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4"
          >
            College Events
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-2xl mx-auto text-muted-foreground md:text-lg mb-8"
          >
            Your one-stop destination to explore, book, and experience the best
            college fests, workshops, and competitions across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                <Link href="/events">Explore Events</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-8"
          >
            {categories.map((category) => (
              <Button key={category.name} variant="outline" className="rounded-full border-border" asChild>
                <Link href={category.href}>
                  <category.icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Link>
              </Button>
            ))}
          </motion.div>
        </div>
      </div>
      
        <section className="py-16 md:py-24 bg-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Featured Events</h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
             <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {featuredEvents.map((event, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <EventCard event={event} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            </motion.div>
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button asChild size="lg">
                <Link href="/events">Explore All Events</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose Festify?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Your ultimate companion for discovering and experiencing college life to the fullest.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {whyChooseUs.map((feature, index) => (
              <Card key={index} className="text-center p-6 border-0 bg-card/50">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-headline">What Students Say</h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <p className="text-muted-foreground italic mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
