import { categories } from '@/lib/categories';
import { CategoryCard } from './category-card';

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2 text-foreground">Event Categories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore events across different categories and find what interests you
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
