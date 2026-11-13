import { useEffect, useState, useMemo, useCallback } from "react";
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchProducts, fetchCategories } from "../store/slices/productSlice";
import ProductCard from "../components/product/ProductCard";
import type { Product, ProductQuery } from "../types";
import { useSearchParams } from "react-router-dom";
import ScrollToTopButton from "../components/ui/ScrollToTopButton";

const PRODUCTS_PER_PAGE = 12;
// When the "sale" filter is active we paginate client-side, so we need a
// much bigger pool of products from the API to filter/paginate correctly.
const SALE_FETCH_LIMIT = 200;

function getDiscount(product: Product): number {
  if (!product.originalPrice) return 0;
  return Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );
}

// Small signature motif — three diagonal bars, echoing athletic stripe
// branding without copying any specific logo. Used once, deliberately.
function StripeMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      <span className="w-1.5 h-4 bg-dark skew-x-[-12deg] rounded-[1px]" />
      <span className="w-1.5 h-6 bg-primary skew-x-[-12deg] rounded-[1px]" />
      <span className="w-1.5 h-8 bg-dark skew-x-[-12deg] rounded-[1px]" />
    </div>
  );
}

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "";
  const searchFromUrl = searchParams.get("search") || "";
  const saleFromUrl = searchParams.get("sale") === "true";

  const { products, categories, page, totalPages, isLoading } = useAppSelector(
    (state) => state.products
  );

  const [filters, setFilters] = useState<ProductQuery>({
    search: searchFromUrl,
    category: categoryFromUrl,
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: saleFromUrl ? SALE_FETCH_LIMIT : PRODUCTS_PER_PAGE,
  });
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination state used only while the "sale" filter is active
  const [currentDisplayPage, setCurrentDisplayPage] = useState(1);

  // ========== Split products into sale (>=50% off) and regular ==========
  const { saleProducts, nonSaleProducts } = useMemo(() => {
    const sale: Product[] = [];
    const nonSale: Product[] = [];

    for (const p of products) {
      if (getDiscount(p) >= 50) {
        sale.push(p);
      } else {
        nonSale.push(p);
      }
    }

    sale.sort((a, b) => getDiscount(b) - getDiscount(a));

    return { saleProducts: sale, nonSaleProducts: nonSale };
  }, [products]);

  // ========== Memoized pagination logic ==========
  const { displayedProducts, displayTotalPages } = useMemo(() => {
    if (products.length === 0) {
      return { displayedProducts: [] as Product[], displayTotalPages: 1 };
    }

    if (!saleFromUrl) {
      // Normal view - standard server-side pagination
      return {
        displayedProducts: products,
        displayTotalPages: totalPages,
      };
    }

    const saleCount = saleProducts.length;

    // No sale products at all -> just paginate the regular list
    if (saleCount === 0) {
      const startIndex = (currentDisplayPage - 1) * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;
      return {
        displayedProducts: nonSaleProducts.slice(startIndex, endIndex),
        displayTotalPages:
          Math.ceil(nonSaleProducts.length / PRODUCTS_PER_PAGE) || 1,
      };
    }

    let productsToShow: Product[];
    let totalPagesCount: number;

    if (currentDisplayPage === 1) {
      // Page 1: show all sale products first, then fill remaining slots
      if (saleCount >= PRODUCTS_PER_PAGE) {
        productsToShow = saleProducts.slice(0, PRODUCTS_PER_PAGE);
        totalPagesCount = Math.ceil(saleCount / PRODUCTS_PER_PAGE);

        if (nonSaleProducts.length > 0) {
          totalPagesCount += Math.ceil(
            nonSaleProducts.length / PRODUCTS_PER_PAGE
          );
        }
      } else {
        const remainingSlots = PRODUCTS_PER_PAGE - saleCount;
        productsToShow = [
          ...saleProducts,
          ...nonSaleProducts.slice(0, remainingSlots),
        ];

        const remainingNonSale = nonSaleProducts.slice(remainingSlots);
        totalPagesCount =
          1 + Math.ceil(remainingNonSale.length / PRODUCTS_PER_PAGE);
      }
    } else {
      // Page 2+: show remaining non-sale products
      let nonSaleStartIndex = 0;

      if (saleCount < PRODUCTS_PER_PAGE) {
        nonSaleStartIndex = PRODUCTS_PER_PAGE - saleCount;
      }

      const pageOffset = currentDisplayPage - 2;
      const startIndex = nonSaleStartIndex + pageOffset * PRODUCTS_PER_PAGE;
      const endIndex = startIndex + PRODUCTS_PER_PAGE;

      productsToShow = nonSaleProducts.slice(startIndex, endIndex);

      const remainingNonSaleAfterPage1 = nonSaleProducts.slice(
        nonSaleStartIndex
      );
      totalPagesCount =
        1 + Math.ceil(remainingNonSaleAfterPage1.length / PRODUCTS_PER_PAGE);
    }

    totalPagesCount = Math.max(1, totalPagesCount);

    return {
      displayedProducts: productsToShow,
      displayTotalPages: totalPagesCount,
    };
  }, [
    products,
    saleFromUrl,
    currentDisplayPage,
    totalPages,
    saleProducts,
    nonSaleProducts,
  ]);

  // ========== Sync filters from URL params ==========
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === searchFromUrl && prev.category === categoryFromUrl) {
        return prev;
      }
      return {
        ...prev,
        search: searchFromUrl,
        category: categoryFromUrl,
        page: 1,
      };
    });
  }, [searchFromUrl, categoryFromUrl]);

  // ========== Reset page + fetch limit when sale filter changes ==========
  useEffect(() => {
    setCurrentDisplayPage(1);
    setFilters((prev) => {
      const nextLimit = saleFromUrl ? SALE_FETCH_LIMIT : PRODUCTS_PER_PAGE;
      if (prev.limit === nextLimit && prev.page === 1) return prev;
      return { ...prev, limit: nextLimit, page: 1 };
    });
  }, [saleFromUrl]);

  // ========== Fetch categories on mount ==========
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // ========== Fetch products when filters change ==========
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // ========== Debounced search ==========
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchTerm.trim(),
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // ========== Handle page change ==========
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (saleFromUrl) {
        setCurrentDisplayPage(newPage);
      } else {
        setFilters((prev) => ({
          ...prev,
          page: newPage,
        }));
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [saleFromUrl]
  );

  // ========== Handle filter changes ==========
  const handleFilterChange = useCallback(
    (key: keyof ProductQuery, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1,
      }));
    },
    []
  );

  // ========== Clear search ==========
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setFilters((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  }, []);

  // ========== Clear all filters ==========
  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      search: "",
      category: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: PRODUCTS_PER_PAGE,
    });
  }, []);

  // ========== Count sale products on the current page ==========
  const saleCountOnPage = useMemo(() => {
    return displayedProducts.filter((p) => getDiscount(p) >= 50).length;
  }, [displayedProducts]);

  const currentPage = saleFromUrl ? currentDisplayPage : page;
  const activeFilterCount = (filters.search ? 1 : 0) + (filters.category ? 1 : 0);

  return (
    <main className="min-h-screen bg-light pt-24 pb-20">
      <ScrollToTopButton />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Header ===== */}
        <div className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <StripeMark />
                <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  {saleFromUrl ? "Limited Time" : "Full Catalog"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark leading-[1.05] tracking-tight break-words">
                {saleFromUrl ? (
                  <>
                    Up to <span className="text-primary">50% Off</span>
                  </>
                ) : (
                  "Premium Collection"
                )}
              </h1>

              <p className="text-gray-500 mt-2.5 text-sm sm:text-base max-w-xl">
                {saleFromUrl
                  ? "Our steepest discounts, updated live — grab them before they're gone."
                  : "Performance gear and everyday essentials, built for how you move."}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 self-start sm:self-auto shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Switch to grid view"
                aria-pressed={viewMode === "grid"}
                title="Grid View"
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  viewMode === "grid"
                    ? "bg-dark text-white shadow-sm"
                    : "text-gray-400 hover:text-dark hover:bg-light"
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Switch to list view"
                aria-pressed={viewMode === "list"}
                title="List View"
                className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  viewMode === "list"
                    ? "bg-dark text-white shadow-sm"
                    : "text-gray-400 hover:text-dark hover:bg-light"
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          {/* Badges */}
          {(saleFromUrl || filters.search || filters.category || (saleFromUrl && currentDisplayPage === 1 && displayedProducts.length > 0)) && (
            <div className="flex flex-wrap gap-2 mt-5">
              {saleFromUrl && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-dark text-white text-xs font-bold uppercase tracking-wide">
                  🔥 50%+ off
                </span>
              )}

              {filters.search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-dark text-xs font-medium hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <FiSearch size={12} />
                  <span className="max-w-[140px] truncate">{filters.search}</span>
                  <span aria-hidden="true">✕</span>
                </button>
              )}

              {filters.category && (
                <button
                  type="button"
                  onClick={() => handleFilterChange("category", "")}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-dark text-xs font-medium capitalize hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  📁 {filters.category}
                  <span aria-hidden="true">✕</span>
                </button>
              )}

              {saleFromUrl && currentDisplayPage === 1 && displayedProducts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  ✅ {saleCountOnPage} sale items on this page
                </span>
              )}
            </div>
          )}
        </div>

        {/* ===== Filter Toolbar ===== */}
        <div className="sticky top-16 sm:top-20 z-30 mb-8">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl outline-none focus:border-dark focus:ring-2 focus:ring-dark/10 transition-all duration-200 bg-light text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full pl-4 pr-9 py-3 border border-gray-200 rounded-xl outline-none focus:border-dark focus:ring-2 focus:ring-dark/10 transition-all duration-200 bg-light text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </div>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full pl-4 pr-9 py-3 border border-gray-200 rounded-xl outline-none focus:border-dark focus:ring-2 focus:ring-dark/10 transition-all duration-200 bg-light text-sm appearance-none cursor-pointer"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Active filters summary */}
            {activeFilterCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 font-semibold hover:text-red-600 transition"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== Loading Skeletons ===== */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-square bg-white rounded-2xl border border-gray-100" />
                <div className="h-3.5 bg-gray-200 rounded-full mt-3 w-1/3" />
                <div className="h-4 bg-gray-200 rounded-full mt-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full mt-2 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* ===== Products Grid ===== */}
        {!isLoading && displayedProducts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiFilter size={14} />
                <span>
                  <span className="font-bold text-dark">{displayedProducts.length}</span> products
                  {saleFromUrl && currentDisplayPage === 1 && (
                    <span className="ml-2 text-primary font-semibold">✨ all sale items first</span>
                  )}
                  {saleFromUrl && currentDisplayPage > 1 && (
                    <span className="ml-2 text-blue-600 font-semibold">
                      · regular products, page {currentDisplayPage}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-400 font-medium">
                Page {currentPage} of {displayTotalPages}
              </div>
            </div>

            <div
              className={`grid ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
              } gap-5 sm:gap-6`}
            >
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className={viewMode === "list" ? "w-full" : ""}
                >
                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== Empty State ===== */}
        {!isLoading && displayedProducts.length === 0 && (
          <div className="text-center py-20 sm:py-24 bg-white rounded-3xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-light flex items-center justify-center mx-auto mb-5">
              <FiSearch size={26} className="text-gray-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-dark">
              No products found
            </h3>
            <p className="text-gray-400 mt-2.5 max-w-md mx-auto text-sm">
              We couldn't find anything matching your filters. Try a different search term or clear your filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-6 px-6 py-3 bg-dark text-white rounded-xl font-semibold text-sm hover:bg-black transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ===== Pagination ===== */}
        {!isLoading && displayTotalPages > 1 && (
          <div className="flex flex-col items-center mt-14 gap-3">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-dark hover:bg-dark hover:text-white transition-all duration-200 font-medium text-sm"
              >
                <FiChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from(
                  { length: Math.min(displayTotalPages, 7) },
                  (_, i) => {
                    let pageNumber: number | string = i + 1;

                    if (displayTotalPages > 7) {
                      if (i === 0) pageNumber = 1;
                      else if (i === 1 && currentPage > 3) pageNumber = "...";
                      else if (
                        i === displayTotalPages - 2 &&
                        currentPage < displayTotalPages - 2
                      )
                        pageNumber = "...";
                      else if (i === displayTotalPages - 1)
                        pageNumber = displayTotalPages;
                      else if (i >= 2 && i <= displayTotalPages - 3) {
                        const start = Math.max(2, currentPage - 1);
                        pageNumber = start + (i - 2);
                        if ((pageNumber as number) > displayTotalPages - 1) {
                          pageNumber = displayTotalPages;
                        }
                      }
                    }

                    if (pageNumber === "...") {
                      return (
                        <span key={i} className="px-2 text-gray-300 text-sm">
                          ···
                        </span>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handlePageChange(pageNumber as number)}
                        className={`min-w-[38px] h-[38px] rounded-full font-semibold text-sm transition-all duration-200 ${
                          currentPage === pageNumber
                            ? "bg-dark text-white shadow-md scale-105"
                            : "border border-gray-200 bg-white text-gray-500 hover:border-dark hover:text-dark"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === displayTotalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-dark hover:bg-dark hover:text-white transition-all duration-200 font-medium text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <FiChevronRight size={16} />
              </button>
            </div>

            {/* Page info */}
            <div className="text-xs text-gray-400">
              Page {currentPage} of {displayTotalPages}
              {saleFromUrl && currentDisplayPage === 1 && (
                <span className="ml-2 text-primary font-medium">
                  · all sale items displayed
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}