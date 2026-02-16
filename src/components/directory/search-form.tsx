'use client';

import { useQueryState } from 'nuqs';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchFormProps {
  states: string[];
  serviceCategories: string[];
}

export function SearchForm({ states, serviceCategories }: SearchFormProps) {
  const [query, setQuery] = useQueryState('q', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [state, setState] = useQueryState('state', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [category, setCategory] = useQueryState('category', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [vaAccredited, setVaAccredited] = useQueryState('va', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [location, setLocation] = useQueryState('location', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [, setPage] = useQueryState('page', {
    defaultValue: '1',
    parse: (value) => value || '1',
    serialize: (value) => value,
  });

  // Local state for immediate input feedback
  const [searchInput, setSearchInput] = useState(query || '');
  const [locationInput, setLocationInput] = useState(location || '');

  // Update local state when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setSearchInput(query || '');
  }, [query]);

  useEffect(() => {
    setLocationInput(location || '');
  }, [location]);

  // Debounced search update (300ms delay)
  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setQuery(value || null);
    setPage('1'); // Reset to first page on search
  }, 300);

  const debouncedSetLocation = useDebouncedCallback((value: string) => {
    setLocation(value || null);
    setPage('1');
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSetQuery(value);
  };

  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    debouncedSetLocation(value);
  };

  const handleFilterChange = (setter: (value: string | null) => void) => (value: string) => {
    setter(value === 'all' ? null : value);
    setPage('1'); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setQuery(null);
    setLocation(null);
    setState(null);
    setCategory(null);
    setVaAccredited(null);
    setPage('1');
  };

  const hasActiveFilters = Boolean(query || state || category || vaAccredited || location);

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      {/* Search input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-base font-medium">
          Search Organizations
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Search by name, mission, or services..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search organizations"
          />
        </div>
      </div>

      {/* Location input */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          City or Zip Code
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Enter city name or zip code..."
          value={locationInput}
          onChange={(e) => handleLocationChange(e.target.value)}
          aria-label="Filter by city or zip code"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* State filter */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium">
            State
          </Label>
          <Select
            value={state || 'all'}
            onValueChange={handleFilterChange(setState)}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service category filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Service Category
          </Label>
          <Select
            value={category || 'all'}
            onValueChange={handleFilterChange(setCategory)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* VA Accredited filter */}
        <div className="space-y-2">
          <Label htmlFor="va-accredited" className="text-sm font-medium">
            VA Accreditation
          </Label>
          <Select
            value={vaAccredited || 'all'}
            onValueChange={handleFilterChange(setVaAccredited)}
          >
            <SelectTrigger id="va-accredited">
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              <SelectItem value="true">VA Accredited only</SelectItem>
              <SelectItem value="false">Non-accredited only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
