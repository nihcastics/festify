import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

type CategoryCardProps = {
  category: {
    name: string;
    description: string;
    icon: LucideIcon;
    eventCount: string;
    href: string;
  };
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;
  return (
    <Link href={category.href}>
      <Card className="bg-card/50 hover:bg-card/90 dark:bg-card/80 dark:hover:bg-card transition-colors group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">{category.eventCount} Events</Badge>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{category.name}</CardTitle>
          <p className="text-muted-foreground mt-1">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
