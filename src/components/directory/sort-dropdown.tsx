'use client';

import { useEffect, useRef } from 'react';
import { useQueryState } from 'nuqs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

export function SortDropdown() {
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [location] = useQueryState('location', {
    defaultValue: '',
    parse: (value) => value || '',
    serialize: (value) => value || '',
  });

  const [, setPage] = useQueryState('page', {
    defaultValue: '1',
    parse: (value) => value || '1',
    serialize: (value) => value,
  });

  const prevLocationRef = useRef(location);
  const hasLocation = location.trim().length > 0;
  const currentSort = sort || 'relevance';

  // Auto-switch to distance when location transitions from empty → filled
  // Revert to relevance when location is cleared and sort was distance
  useEffect(() => {
    const prevLocation = prevLocationRef.current;
    prevLocationRef.current = location;

    const wasEmpty = !prevLocation || prevLocation.trim().length === 0;
    const nowFilled = location.trim().length > 0;
    const nowEmpty = !location || location.trim().length === 0;

    if (wasEmpty && nowFilled) {
      setSort('distance');
      setPage('1');
    } else if (nowEmpty && currentSort === 'distance') {
      setSort(null);
      setPage('1');
    }
  }, [location, currentSort, setSort, setPage]);

  const handleSortChange = (value: string) => {
    setSort(value === 'relevance' ? null : value);
    setPage('1');
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[160px]" id="sort-select">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="relevance">Relevance</SelectItem>
          <SelectItem value="distance" disabled={!hasLocation}>
            Distance{!hasLocation ? ' (enter location)' : ''}
          </SelectItem>
          <SelectItem value="name">Name A–Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
