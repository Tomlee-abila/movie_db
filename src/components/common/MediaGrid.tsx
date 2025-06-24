import React from 'react';
import { TMDBMovie, TMDBTVShow } from '../../types/movie';
import { MediaCard } from './MediaCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface MediaGridProps {
  items: (TMDBMovie | TMDBTVShow)[];
  type: 'movie' | 'tv' | 'multi';
  loading?: boolean;
  error?: string;
}

export function MediaGrid({ items, type, loading = false, error }: MediaGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No results found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item) => {
        const mediaType = type === 'multi' 
          ? ('name' in item ? 'tv' : 'movie')
          : type === 'movie' ? 'movie' : 'tv';
        
        return (
          <MediaCard
            key={`${mediaType}-${item.id}`}
            item={item}
            type={mediaType}
          />
        );
      })}
    </div>
  );
}