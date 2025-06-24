import React from 'react';
import { Filter, X } from 'lucide-react';
import { Genre, SortBy } from '../../types/movie';
import { Button } from '../ui/Button';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  genres: Genre[];
  selectedGenres: number[];
  onGenreChange: (genreIds: number[]) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  yearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  ratingRange: [number, number];
  onRatingRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  isOpen,
  onClose,
  genres,
  selectedGenres,
  onGenreChange,
  sortBy,
  onSortChange,
  yearRange,
  onYearRangeChange,
  ratingRange,
  onRatingRangeChange,
  onClearFilters
}: FilterPanelProps) {
  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'primary_release_date.desc', label: 'Newest First' },
    { value: 'title.asc', label: 'Title A-Z' }
  ];

  const currentYear = new Date().getFullYear();
  const startYear = 1900;

  const handleGenreToggle = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenreChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenreChange([...selectedGenres, genreId]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-stretch justify-end">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white w-full max-w-md shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedGenres.includes(genre.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Release Year: {yearRange[0]} - {yearRange[1]}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">From</label>
                  <input
                    type="range"
                    min={startYear}
                    max={currentYear}
                    value={yearRange[0]}
                    onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange[1]])}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">To</label>
                  <input
                    type="range"
                    min={startYear}
                    max={currentYear}
                    value={yearRange[1]}
                    onChange={(e) => onYearRangeChange([yearRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rating: {ratingRange[0]} - {ratingRange[1]}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Minimum</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={ratingRange[0]}
                    onChange={(e) => onRatingRangeChange([parseFloat(e.target.value), ratingRange[1]])}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Maximum</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={ratingRange[1]}
                    onChange={(e) => onRatingRangeChange([ratingRange[0], parseFloat(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}