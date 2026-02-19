import { Suspense } from 'react';
import { searchOrganizations, getDistinctStates, getServiceCategories } from '@/lib/db/queries';
import { SearchForm } from '@/components/directory/search-form';
import { OrgCard } from '@/components/directory/org-card';
import { PaginationControls } from '@/components/directory/pagination-controls';
import { SortDropdown } from '@/components/directory/sort-dropdown';
import { Loader2 } from 'lucide-react';
import type { SortOption } from '@/lib/db/types';

interface DirectoryPageProps {
  searchParams: Promise<{
    q?: string;
    state?: string;
    category?: string;
    va?: string;
    location?: string;
    sort?: string;
    page?: string;
  }>;
}

async function DirectoryResults({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;

  // Parse search parameters
  const query = params.q || undefined;
  const state = params.state || undefined;
  const serviceCategory = params.category || undefined;
  const vaAccredited =
    params.va === 'true' ? true : params.va === 'false' ? false : undefined;
  const location = params.location || undefined;
  const sortBy = (['relevance', 'distance', 'name'].includes(params.sort || '')
    ? params.sort as SortOption
    : undefined);
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  // Fetch search results
  const { results, totalCount, pageSize, totalPages } = await searchOrganizations({
    query,
    state,
    serviceCategory,
    vaAccredited,
    location,
    sortBy,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount === 0 ? (
            'No organizations found'
          ) : (
            <>
              Found <span className="font-semibold">{totalCount.toLocaleString()}</span> organization
              {totalCount === 1 ? '' : 's'}
            </>
          )}
        </p>
      </div>

      {/* Results or empty state */}
      {results.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg border border-dashed">
          <h3 className="text-lg font-medium mb-2">No organizations found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search or broadening your filters
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Remove some filters to see more results</li>
            <li>• Try different keywords</li>
            <li>• Check your spelling</li>
          </ul>
        </div>
      ) : (
        <>
          {/* Organization cards */}
          <div className="grid gap-6">
            {results.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}

function LoadingResults() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading organizations...</span>
    </div>
  );
}

export default async function DirectoryPage(props: DirectoryPageProps) {
  // Fetch data for filters (these are fast queries and don't change often)
  const [states, serviceCategories] = await Promise.all([
    getDistinctStates(),
    Promise.resolve(getServiceCategories()),
  ]);

  return (
    <div className="space-y-8">
      {/* Search form */}
      <SearchForm states={states} serviceCategories={serviceCategories} />

      {/* Sort control (own Suspense so it persists across result re-renders) */}
      <Suspense fallback={null}>
        <SortDropdown />
      </Suspense>

      {/* Results with suspense boundary */}
      <Suspense fallback={<LoadingResults />}>
        <DirectoryResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
