import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  showTotal?: boolean;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit = 20,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showTotal = true,
  className = "",
}: Props) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + current + first + last + ellipsis
    const firstPage = 1;
    const lastPage = totalPages;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, i) => i + 1
      );
      return [...leftRange, "...", lastPageIndex];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return [];
  };

  const paginationRange = getPaginationRange();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${className}`}>
      {/* Left section - Showing results */}
      {showTotal && (
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          Showing <span className="font-medium">{start}</span> to{" "}
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{total}</span> results
        </p>
      )}

      {/* Right section - Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 
                     hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-200"
            aria-label="First page"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 
                   hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors duration-200"
          aria-label="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {paginationRange.map((item, index) => {
            if (item === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = Number(item);
            const isActive = pageNumber === page;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`
                  flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }
                `}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 
                   hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors duration-200"
          aria-label="Next page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>

        {/* Last page button */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 
                     hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors duration-200"
            aria-label="Last page"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}