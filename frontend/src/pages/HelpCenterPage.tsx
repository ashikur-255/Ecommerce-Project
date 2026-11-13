import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowLeft,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";

/* =========================================================
   TYPES
========================================================= */

interface HelpArticle {
  id: number;
  category: string;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
}

interface Category {
  name: string;
  description: string;
  icon: React.ReactNode;
}

/* =========================================================
   HELP CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    name: "Orders",
    description: "Learn how to place, manage and track your orders.",
    icon: <FiShoppingBag size={24} />,
  },
  {
    name: "Payments",
    description: "Get help with payment methods and payment issues.",
    icon: <FiCreditCard size={24} />,
  },
  {
    name: "Shipping",
    description: "Information about delivery, tracking and shipping.",
    icon: <FiTruck size={24} />,
  },
  {
    name: "Returns",
    description: "Learn about returns, refunds and exchanges.",
    icon: <FiRefreshCw size={24} />,
  },
  {
    name: "Account",
    description: "Manage your profile, password and account settings.",
    icon: <FiUser size={24} />,
  },
  {
    name: "Security",
    description: "Learn how we help keep your account secure.",
    icon: <FiShield size={24} />,
  },
];

/* =========================================================
   HELP ARTICLES
========================================================= */

const helpArticles: HelpArticle[] = [
  {
    id: 1,
    category: "Orders",
    title: "How do I place an order?",
    description:
      "Learn how to browse products, add items to your cart and complete checkout.",
    content:
      "Browse our products, open the product you want to purchase, select the available options such as size or quantity, and add it to your cart. When you are ready, open your cart and continue to checkout. Enter or confirm your delivery information, choose your payment method, review your order and complete the purchase.",
    icon: <FiShoppingBag size={20} />,
  },
  {
    id: 2,
    category: "Orders",
    title: "How can I check my order status?",
    description:
      "Find out where to see your current and previous orders.",
    content:
      "After signing in to your account, go to My Orders. Select the order you want to view to see its current status, order information, items, payment information and delivery details when available.",
    icon: <FiPackage size={20} />,
  },
  {
    id: 3,
    category: "Orders",
    title: "Can I cancel my order?",
    description:
      "Understand when an order can be cancelled.",
    content:
      "Order cancellation depends on the current order status. If your order has not yet been processed or handed over to the delivery service, contact customer support as soon as possible. Once an order has entered the shipping process, cancellation may no longer be possible.",
    icon: <FiX size={20} />,
  },
  {
    id: 4,
    category: "Payments",
    title: "What payment methods are available?",
    description:
      "Learn about the payment options available at checkout.",
    content:
      "Available payment methods may include card payments, mobile financial services and Cash on Delivery, depending on your location and the options enabled for your order. The available methods will be displayed during checkout.",
    icon: <FiCreditCard size={20} />,
  },
  {
    id: 5,
    category: "Payments",
    title: "What should I do if my payment fails?",
    description:
      "Troubleshoot unsuccessful or interrupted payments.",
    content:
      "If a payment fails, first check your payment information and try again. Make sure your internet connection is stable and that your payment method is active. If the payment was deducted but your order was not completed, contact customer support with your order or payment information so we can investigate.",
    icon: <FiCreditCard size={20} />,
  },
  {
    id: 6,
    category: "Shipping",
    title: "How long does delivery take?",
    description:
      "Learn about estimated delivery times.",
    content:
      "Delivery time depends on your delivery location, courier availability, order processing time and other circumstances. Orders within Dhaka may arrive sooner than orders outside Dhaka. Please check the shipping information provided during checkout or contact support for assistance.",
    icon: <FiClock size={20} />,
  },
  {
    id: 7,
    category: "Shipping",
    title: "How can I track my order?",
    description:
      "Find out how to follow your delivery.",
    content:
      "When tracking information is available, you can view it from your account under My Orders. Open the relevant order to check the latest delivery information. Tracking availability may depend on the courier and order status.",
    icon: <FiTruck size={20} />,
  },
  {
    id: 8,
    category: "Shipping",
    title: "Do you deliver outside Dhaka?",
    description:
      "Learn about nationwide delivery.",
    content:
      "Delivery availability depends on the courier service and destination. We aim to provide delivery across Bangladesh where our delivery partners support the destination.",
    icon: <FiMapPin size={20} />,
  },
  {
    id: 9,
    category: "Returns",
    title: "How do I return a product?",
    description:
      "Learn the steps required to request a return.",
    content:
      "First, review our Return Policy to confirm that your product is eligible. Then contact customer support with your order number and reason for the return. Do not send the product back until the return process has been confirmed by our support team.",
    icon: <FiRefreshCw size={20} />,
  },
  {
    id: 10,
    category: "Returns",
    title: "How long does a refund take?",
    description:
      "Understand the refund process.",
    content:
      "After an approved return has been inspected, the applicable refund will be processed. The time required for the refund to appear may vary depending on the payment method and financial institution.",
    icon: <FiCreditCard size={20} />,
  },
  {
    id: 11,
    category: "Account",
    title: "How can I reset my password?",
    description:
      "Recover access to your account if you forget your password.",
    content:
      "Go to the Login page and select Forgot Password. Follow the instructions provided to reset your password. Make sure you have access to the email address associated with your account.",
    icon: <FiUser size={20} />,
  },
  {
    id: 12,
    category: "Account",
    title: "How can I update my profile?",
    description:
      "Manage your account information.",
    content:
      "Sign in to your account and open your Profile page. Depending on the available account settings, you can update your personal and contact information from there.",
    icon: <FiUser size={20} />,
  },
];

/* =========================================================
   HELP CENTER PAGE
========================================================= */

const HelpCenterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  /* =======================================================
     FILTER ARTICLES
  ======================================================== */

  const filteredArticles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return helpArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      if (!normalizedSearch) {
        return matchesCategory;
      }

      const searchableText = [
        article.title,
        article.description,
        article.content,
        article.category,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        searchableText.includes(normalizedSearch)
      );
    });
  }, [searchTerm, selectedCategory]);

  /* =======================================================
     TOGGLE ARTICLE
  ======================================================== */

  const toggleArticle = (id: number) => {
    setOpenArticle((current) => (current === id ? null : id));
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================== */

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("All");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Decorative elements */}
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-gray-400"
          >
            <Link
              to="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-white">Help Center</span>
          </nav>

          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiHelpCircle
                className="text-primary"
                size={16}
              />

              BDFashions Support
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              How Can We Help?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Find answers about orders, payments, shipping, returns,
              your account and more.
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-2xl">
              <FiSearch
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                size={21}
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search for help..."
                aria-label="Search help articles"
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 py-4 pl-14 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Search orders, payments, shipping, returns and account
              questions.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY SECTION
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Browse Topics
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-900">
              What can we help you with?
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSearchTerm("");
            }}
            className={`text-sm font-semibold transition ${
              selectedCategory === "All"
                ? "text-primary"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            View All Topics
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const isActive =
              selectedCategory === category.name;

            return (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setSearchTerm("");
                  setOpenArticle(null);
                }}
                className={`group rounded-3xl border bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isActive
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-gray-200 hover:border-primary/40"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  {category.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-gray-900">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>

                <div
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold transition ${
                    isActive
                      ? "text-primary"
                      : "text-gray-600 group-hover:text-primary"
                  }`}
                >
                  View articles
                  <FiArrowRight
                    className="transition group-hover:translate-x-1"
                    size={16}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          POPULAR ARTICLES
      ====================================================== */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Help Articles
            </p>

            <h2 className="mt-2 text-3xl font-black text-gray-900">
              {selectedCategory === "All"
                ? "Popular Questions"
                : `${selectedCategory} Help`}
            </h2>

            <p className="mt-2 text-gray-500">
              {filteredArticles.length}{" "}
              {filteredArticles.length === 1
                ? "article"
                : "articles"}{" "}
              available
            </p>
          </div>

          {/* Search result indicator */}
          {(searchTerm || selectedCategory !== "All") && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {searchTerm && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  Search:{" "}
                  <strong>
                    "{searchTerm}"
                  </strong>

                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="ml-1 text-gray-400 hover:text-gray-900"
                    aria-label="Remove search"
                  >
                    <FiX size={15} />
                  </button>
                </span>
              )}

              {selectedCategory !== "All" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                  Category:{" "}
                  <strong>
                    {selectedCategory}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCategory("All")
                    }
                    className="ml-1 hover:text-gray-900"
                    aria-label="Remove category filter"
                  >
                    <FiX size={15} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={clearSearch}
                className="text-sm font-semibold text-gray-500 transition hover:text-primary"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Articles */}
          {filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {filteredArticles.map((article) => {
                const isOpen = openArticle === article.id;

                return (
                  <div
                    key={article.id}
                    className={`overflow-hidden rounded-2xl border bg-white transition ${
                      isOpen
                        ? "border-primary/30 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleArticle(article.id)
                      }
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isOpen
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {article.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {article.category}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 sm:text-lg">
                          {article.title}
                        </h3>

                        {!isOpen && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {article.description}
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <FiChevronDown
                          size={19}
                          className={`transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50 px-5 pb-6 pt-5 sm:px-6">
                        <p className="text-sm leading-7 text-gray-600 sm:text-base">
                          {article.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty search result */
            <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                <FiSearch size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No articles found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                We couldn't find an article matching your search.
                Try a different keyword or browse another category.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          QUICK LINKS
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Customer Resources
          </p>

          <h2 className="mt-2 text-3xl font-black text-gray-900">
            Useful Information
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Shipping */}
          <Link
            to="/shipping"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiTruck size={24} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Shipping Information
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Learn about delivery areas, shipping times and order
              tracking.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition group-hover:text-primary">
              Learn More
              <FiArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>

          {/* Returns */}
          <Link
            to="/returns"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <FiRefreshCw size={24} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Return Policy
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Find out how returns, exchanges and refunds work.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition group-hover:text-primary">
              View Policy
              <FiArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>

          {/* FAQ */}
          <Link
            to="/faq"
            className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <FiHelpCircle size={24} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Frequently Asked Questions
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Find quick answers to common customer questions.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition group-hover:text-primary">
              View FAQs
              <FiArrowRight
                size={16}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>
        </div>
      </section>

      {/* =====================================================
          CONTACT SUPPORT
      ====================================================== */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 text-white sm:px-10 sm:py-14">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Content */}
              <div className="max-w-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <FiHelpCircle size={25} />
                </div>

                <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                  Still Need Help?
                </h2>

                <p className="mt-4 leading-7 text-gray-400">
                  Can't find what you're looking for? Our customer
                  support team is ready to help you with your order,
                  payment, delivery, return or account.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <FiClock className="text-primary" />
                    Customer Support
                  </span>

                  <span className="hidden sm:inline text-gray-700">
                    •
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FiMapPin className="text-primary" />
                    Dhaka, Bangladesh
                  </span>
                </div>
              </div>

              {/* Contact buttons */}
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="mailto:ashikurr255@gmail.com"
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white transition hover:opacity-90"
                >
                  <FiMail size={18} />
                  Email Support
                </a>

                <a
                  href="tel:+8801708588330"
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-3.5 font-semibold text-white transition hover:border-primary hover:text-primary"
                >
                  <FiPhone size={18} />
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BACK TO HOME
      ====================================================== */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary"
          >
            <FiArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default HelpCenterPage;

