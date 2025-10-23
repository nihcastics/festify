'use client';

import { useState, useEffect } from 'react';
import { CategoryCard } from './category-card';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from './ui/skeleton';
import { Sparkles, Grid3x3 } from 'lucide-react';

export function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 py-20">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-gradient-to-tl from-white/10 to-transparent" />
        
        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Grid3x3 className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">Event Categories</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 text-white">
            Explore By Category
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Browse events across different categories and find experiences that match your interests
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container py-16 -mt-8 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">
                {categories.length} Categories Available
              </h2>
              <p className="text-muted-foreground">
                Click on any category to view related events
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
