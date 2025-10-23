import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Music, 
  Trophy, 
  Briefcase, 
  Palette, 
  BookOpen, 
  Users, 
  Gamepad2,
  Folder,
  ArrowRight
} from 'lucide-react';

const iconMap: Record<string, any> = {
  laptop: Code,
  music: Music,
  trophy: Trophy,
  briefcase: Briefcase,
  palette: Palette,
  book: BookOpen,
  users: Users,
  gamepad: Gamepad2,
};

// Beautiful gradient color schemes for categories
const gradientColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-green-500 to-emerald-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-fuchsia-500',
  'from-lime-500 to-green-500',
];

type CategoryCardProps = {
  category: {
    id: string;
    name: string;
    description: string | null;
    icon_name: string | null;
  };
  index?: number;
};

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const Icon = category.icon_name && iconMap[category.icon_name] ? iconMap[category.icon_name] : Folder;
  const gradientClass = gradientColors[index % gradientColors.length];
  
  return (
    <Link href={`/events?category=${encodeURIComponent(category.name)}`}>
      <Card className="group relative overflow-hidden border-2 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 h-full">
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Decorative element */}
        <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity`} />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <div className={`bg-gradient-to-br ${gradientClass} p-3 rounded-xl shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <CardTitle className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
            {category.name}
          </CardTitle>
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
