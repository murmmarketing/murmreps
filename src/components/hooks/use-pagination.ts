import { useMemo } from "react";

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  siblingCount?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  currentPage,
  siblingCount = 1,
}: UsePaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const range = useMemo(() => {
    // Always show first, last, current, and siblings
    const pages: (number | "...")[] = [];
    const left = Math.max(2, currentPage - siblingCount);
    const right = Math.min(totalPages - 1, currentPage + siblingCount);

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  }, [totalPages, currentPage, siblingCount]);

  return { range, totalPages };
}
