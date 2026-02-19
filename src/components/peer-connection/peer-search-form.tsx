'use client';

import { useQueryState } from 'nuqs';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';
import { z } from 'zod';
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
import { X } from 'lucide-react';

// Zod validation for location field
// Accepts: city names (letters, spaces, hyphens) or ZIP codes (5 digits or ZIP+4 format)
const locationSchema = z
  .string()
  .min(2, 'Enter at least 2 characters')
  .refine(
    (val) => /^[A-Za-z\s\-]+$/.test(val) || /^\d{5}(-\d{4})?$/.test(val),
    'Enter a city name or ZIP code (e.g., "Louisville" or "40202")'
  );

export function PeerSearchForm() {
  const [location, setLocation] = useQueryState('location', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [branch, setBranch] = useQueryState('branch', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [era, setEra] = useQueryState('era', {
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
  const [locationInput, setLocationInput] = useState(location || '');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Keep local state in sync with URL (browser back/forward)
  useEffect(() => {
    setLocationInput(location || '');
  }, [location]);

  // Debounced location update (300ms) with Zod validation
  const debouncedSetLocation = useDebouncedCallback((value: string) => {
    if (!value) {
      setLocationError(null);
      setLocation(null);
      setPage('1');
      return;
    }

    const result = locationSchema.safeParse(value);
    if (result.success) {
      setLocationError(null);
      setLocation(value);
      setPage('1');
    } else {
      setLocationError(result.error.issues[0]?.message || 'Invalid location');
    }
  }, 300);

  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    debouncedSetLocation(value);
  };

  const handleFilterChange =
    (setter: (value: string | null) => void) => (value: string) => {
      setter(value === 'all' ? null : value);
      setPage('1');
    };

  const clearFilters = () => {
    setLocationInput('');
    setLocationError(null);
    setLocation(null);
    setBranch(null);
    setEra(null);
    setPage('1');
  };

  const hasActiveFilters = Boolean(location || branch || era);

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      {/* Location input */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base font-medium">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="City name or ZIP code"
          value={locationInput}
          onChange={(e) => handleLocationChange(e.target.value)}
          aria-label="Filter by city name or ZIP code"
          aria-describedby={locationError ? 'location-error' : undefined}
          aria-invalid={locationError ? true : undefined}
          className={locationError ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {locationError && (
          <p id="location-error" className="text-xs text-red-600" role="alert">
            {locationError}
          </p>
        )}
      </div>

      {/* Branch and Era filters side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Military branch filter */}
        <div className="space-y-2">
          <Label htmlFor="branch" className="text-sm font-medium">
            Military Branch
          </Label>
          <Select
            value={branch || 'all'}
            onValueChange={handleFilterChange(setBranch)}
          >
            <SelectTrigger id="branch">
              <SelectValue placeholder="All branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              <SelectItem value="Army">Army</SelectItem>
              <SelectItem value="Navy">Navy</SelectItem>
              <SelectItem value="Air Force">Air Force</SelectItem>
              <SelectItem value="Marine Corps">Marine Corps</SelectItem>
              <SelectItem value="Coast Guard">Coast Guard</SelectItem>
              <SelectItem value="Space Force">Space Force</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service era filter */}
        <div className="space-y-2">
          <Label htmlFor="era" className="text-sm font-medium">
            Service Era
          </Label>
          <Select
            value={era || 'all'}
            onValueChange={handleFilterChange(setEra)}
          >
            <SelectTrigger id="era">
              <SelectValue placeholder="All eras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All eras</SelectItem>
              <SelectItem value="Post-9/11">Post-9/11</SelectItem>
              <SelectItem value="Gulf War">Gulf War</SelectItem>
              <SelectItem value="Vietnam">Vietnam</SelectItem>
              <SelectItem value="Korea">Korea</SelectItem>
              <SelectItem value="WWII">WWII</SelectItem>
              <SelectItem value="Peacetime">Peacetime</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear filters button (only shown when filters active) */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
