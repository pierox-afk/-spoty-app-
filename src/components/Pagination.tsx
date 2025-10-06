import { useMemo } from "react";
import "./Pagination.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const DOTS = "...";

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const usePagination = ({
  totalPages,
  siblingCount = 1,
  currentPage,
}: Omit<PaginationProps, "onPageChange">) => {
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, Math.min(leftItemCount, totalPages));

      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      if (middleRange.length > 3) {
        middleRange = range(currentPage - 1, currentPage + 1);
      }
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }
    return [];
  }, [totalPages, siblingCount, currentPage]);

  return paginationRange;
};

export default function Pagination({
  onPageChange,
  currentPage,
  totalPages,
  siblingCount = 1,
}: PaginationProps) {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => onPageChange(currentPage + 1);
  const onPrevious = () => onPageChange(currentPage - 1);

  return (
    <div className="pagination">
      <button
        className="pagination-btn nav-btn"
        disabled={currentPage === 1}
        onClick={onPrevious}
      >
        ‹
      </button>
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={`dots-${index}`} className="pagination-dots">
              {DOTS}
            </span>
          );
        }
        return (
          <button
            key={pageNumber}
            className={`pagination-btn ${
              pageNumber === currentPage ? "active" : ""
            }`}
            onClick={() => onPageChange(pageNumber as number)}
          >
            {pageNumber}
          </button>
        );
      })}
      <button
        className="pagination-btn nav-btn"
        disabled={currentPage === totalPages}
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}
