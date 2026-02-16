'use client';

import { useQueryState } from 'nuqs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export function PaginationControls({
  totalCount,
  currentPage,
  pageSize,
  totalPages,
}: PaginationControlsProps) {
  const [, setPage] = useQueryState('page', {
    defaultValue: '1',
    parse: (value) => value || '1',
    serialize: (value) => value,
  });

  // No pagination needed if 0 results or only 1 page
  if (totalCount === 0 || totalPages <= 1) {
    return null;
  }

  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalCount);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(String(newPage));
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <p className="text-sm text-muted-foreground">
        Showing {startResult}-{endResult} of {totalCount.toLocaleString()} results
      </p>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {/* First page */}
          {currentPage > 2 && (
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(1);
                }}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Previous page */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className="cursor-pointer"
              >
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Current page */}
          <PaginationItem>
            <PaginationLink
              isActive
              onClick={(e) => e.preventDefault()}
              className="cursor-default"
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>

          {/* Next page */}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className="cursor-pointer"
              >
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(totalPages);
                }}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
