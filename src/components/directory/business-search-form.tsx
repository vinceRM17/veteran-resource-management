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

interface BusinessSearchFormProps {
  states: string[];
  businessTypes: string[];
}

export function BusinessSearchForm({ states, businessTypes }: BusinessSearchFormProps) {
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

  const [businessType, setBusinessType] = useQueryState('type', {
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
    setBusinessType(null);
    setPage('1');
  };

  const hasActiveFilters = Boolean(query || state || businessType || location);

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      {/* Search input */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-base font-medium">
          Search Veteran-Owned Businesses
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Search by business name or industry..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search businesses"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Business type filter */}
        <div className="space-y-2">
          <Label htmlFor="business-type" className="text-sm font-medium">
            Business Type
          </Label>
          <Select
            value={businessType || 'all'}
            onValueChange={handleFilterChange(setBusinessType)}
          >
            <SelectTrigger id="business-type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
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
