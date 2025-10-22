'use client';

import {useState} from 'react';
import {Search} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/events?search=${query}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
      <Input
        type="search"
        placeholder="Search events..."
        className="pr-10"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
