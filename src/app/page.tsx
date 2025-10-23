'use client';

import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';


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
  const { profile } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedEvents();
  }, [profile]);

  const loadFeaturedEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(id, name),
          college:colleges(id, name, location)
        `)
        .eq('event_status', 'published')
        .gte('end_date', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('start_date', { ascending: true })
        .limit(9);

      // Filter events based on user's college eligibility
      let filteredEvents = data || [];
      if (profile) {
        filteredEvents = (data || []).filter((event: any) => {
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
        filteredEvents = (data || []).filter((event: any) => 
          event.is_global || !event.college_id
        );
      }

      setFeaturedEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
    {/* Hero Section - Immersive with particles and glow */}
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-pink-900/20" />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Floating orbs with glow */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl border border-purple-500/20 px-6 py-2.5 text-sm font-medium shadow-lg glow-sm">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-gradient">India's Premier College Events Platform</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2">
              Discover Amazing
            </h1>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
              <span className="text-gradient inline-block hover:scale-105 transition-transform duration-300">
                College Events
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
          >
            Your one-stop destination to explore, book, and experience the best
            college fests, workshops, and competitions across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl glow-primary transition-all duration-300 hover:scale-105 text-base px-8 py-6 rounded-xl">
              <Link href="/events">
                <span className="mr-2">Explore Events</span>
                <Star className="h-5 w-5 fill-white" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-purple-500/50 hover:bg-purple-500/10 backdrop-blur-xl text-base px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105">
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <Button variant="ghost" className="rounded-full border border-border/50 hover:border-purple-500/50 backdrop-blur-sm hover:bg-purple-500/10 transition-all duration-300 hover:scale-110 hover:shadow-lg" asChild>
                  <Link href={category.href}>
                    <category.icon className="mr-2 h-4 w-4" />
                    {category.name}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
        {/* Featured Events Section - Glass morphism */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-500/5 to-background" />
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 px-4 py-1.5 mb-4">
                <Star className="h-4 w-4 text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Featured Events</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient">Trending Now</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Don't miss out on these amazing events happening soon
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
             {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {[...Array(6)].map((_, i) => (
                   <Skeleton key={i} className="h-[450px] rounded-2xl" />
                 ))}
               </div>
             ) : (
               <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                    stopOnInteraction: true,
                  }),
                ]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {featuredEvents.map((event, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="h-full">
                        <EventCard event={event} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-8">
                  <CarouselPrevious className="relative left-0 translate-x-0 hover:bg-purple-500/20 border-purple-500/50" />
                  <CarouselNext className="relative right-0 translate-x-0 hover:bg-purple-500/20 border-purple-500/50" />
                </div>
              </Carousel>
             )}
            </motion.div>
            
             <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Button asChild size="lg" variant="outline" className="border-2 border-purple-500/50 hover:bg-purple-500/10 rounded-xl px-8 py-6 text-base hover:scale-105 transition-all duration-300">
                <Link href="/events">Explore All Events →</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* Why Choose Us Section - Cards with subtle glow */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/20 px-4 py-1.5 mb-4">
                <Ticket className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Why Festify</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your ultimate companion for discovering and experiencing college life to the fullest
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {whyChooseUs.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <Card className="group relative text-center p-8 border-2 border-border/50 hover:border-purple-500/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:via-indigo-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg glow-sm group-hover:glow-md transition-all duration-300 group-hover:scale-110">
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-gradient transition-all duration-300">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section - Premium glass cards */}
        <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-background via-indigo-500/5 to-background">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 backdrop-blur-sm border border-pink-500/20 px-4 py-1.5 mb-4">
                <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-pink-600 dark:text-pink-400">Testimonials</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gradient-warm">Loved by Students</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                See what students across India are saying about Festify
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <Card className="group relative h-full bg-card/50 backdrop-blur-xl border-2 border-border/50 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2 overflow-hidden">
                    {/* Gradient glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
                    
                    <CardContent className="p-8 relative z-10">
                      {/* Quote mark */}
                      <div className="text-6xl text-purple-500/20 font-serif mb-4">"</div>
                      
                      <p className="text-muted-foreground italic mb-6 leading-relaxed">
                        {testimonial.quote}
                      </p>
                      
                      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                        <Avatar className="h-12 w-12 ring-2 ring-purple-500/50">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold group-hover:text-gradient transition-all duration-300">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.college}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
    </>
  );
}
