import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Loader2, ArrowLeft } from 'lucide-react';
import { searchPeerConnections } from '@/lib/db/peer-queries';
import { PeerConnectionCard } from '@/components/peer-connection/peer-connection-card';
import { PeerSearchForm } from '@/components/peer-connection/peer-search-form';
import { PaginationControls } from '@/components/directory/pagination-controls';

export const metadata: Metadata = {
  title: 'Opportunities | Veteran Resource Management',
  description:
    'Find employment programs, volunteer roles, and vocational training from verified veteran organizations near you.',
};

interface OpportunitiesPageProps {
  searchParams: Promise<{
    location?: string;
    branch?: string;
    era?: string;
    page?: string;
  }>;
}

async function OpportunitiesResults({ searchParams }: OpportunitiesPageProps) {
  const params = await searchParams;
  const location = params.location || undefined;
  const branch = params.branch || undefined;
  const era = params.era || undefined;
  const page = params.page ? Number.parseInt(params.page, 10) : 1;

  const { results, totalCount, pageSize, totalPages } = await searchPeerConnections({
    type: 'opportunities',
    location,
    branch,
    era,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount === 0 ? (
            'No opportunities found'
          ) : (
            <>
              Found <span className="font-semibold">{totalCount.toLocaleString()}</span> opportunit
              {totalCount === 1 ? 'y' : 'ies'}
            </>
          )}
        </p>
      </div>

      {/* Results or empty state */}
      {results.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
          <p className="text-sm text-gray-600 mb-4">
            Try broadening your search to find more results
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>Try a different city or ZIP code</li>
            <li>Remove the branch or era filter</li>
            <li>Clear all filters to see all opportunities</li>
          </ul>
        </div>
      ) : (
        <>
          {/* Opportunity cards */}
          <div className="grid gap-6">
            {results.map((org) => (
              <PeerConnectionCard key={org.id} org={org} />
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
      <span className="ml-2 text-muted-foreground">Loading opportunities...</span>
    </div>
  );
}

export default async function OpportunitiesPage(props: OpportunitiesPageProps) {
  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/peer-connection"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Peer Connections
        </Link>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Opportunities</h1>
        <p className="text-muted-foreground text-lg">
          Find employment programs, volunteer roles, and vocational training from verified veteran organizations.
        </p>
      </div>

      {/* Search form wrapped in Suspense (uses useQueryState / useSearchParams) */}
      <Suspense fallback={<div className="h-40 bg-white rounded-lg border animate-pulse" />}>
        <PeerSearchForm />
      </Suspense>

      {/* Results with Suspense boundary */}
      <Suspense fallback={<LoadingResults />}>
        <OpportunitiesResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
