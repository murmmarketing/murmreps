"use client";

import { cn } from "@/lib/utils";
import { usePagination } from "@/components/hooks/use-pagination";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  const { range, totalPages } = usePagination({
    totalItems,
    itemsPerPage,
    currentPage,
  });

  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#1a1a1a] text-[#9CA3AF] transition-colors hover:bg-[#1f1f1f] hover:text-white disabled:pointer-events-none disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      {range.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#6C757D]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              "flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
              currentPage === page
                ? "bg-[#FE4205] text-white"
                : "border border-white/[0.08] bg-[#1a1a1a] text-[#9CA3AF] hover:bg-[#1f1f1f] hover:text-white"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#1a1a1a] text-[#9CA3AF] transition-colors hover:bg-[#1f1f1f] hover:text-white disabled:pointer-events-none disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
