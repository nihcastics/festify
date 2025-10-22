import { Code, Trophy, Music, Palette, Mic, Drama } from 'lucide-react';

export const categories = [
  {
    name: 'Tech',
    description: 'Discover amazing tech events happening near you',
    icon: Code,
    eventCount: '25+',
    href: '/events?category=Tech',
  },
  {
    name: 'Sports',
    description: 'Discover amazing sports events happening near you',
    icon: Trophy,
    eventCount: '25+',
    href: '/events?category=Sports',
  },
  {
    name: 'Dance',
    description: 'Discover amazing dance events happening near you',
    icon: Music, // Using Music icon for Dance as a close alternative
    eventCount: '25+',
    href: '/events?category=Cultural',
  },
  {
    name: 'Art',
    description: 'Discover amazing art events happening near you',
    icon: Palette,
    eventCount: '25+',
    href: '/events?category=Cultural',
  },
  {
    name: 'Music',
    description: 'Discover amazing music events happening near you',
    icon: Mic,
    eventCount: '25+',
    href: '/events?category=Cultural',
  },
  {
    name: 'Drama',
    description: 'Discover amazing drama events happening near you',
    icon: Drama,
    eventCount: '25+',
    href: '/events?category=Cultural',
  },
];
