import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from "react-icons/fi";

/* =========================================================
   TYPES
========================================================= */

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
}

type FAQCategory =
  | "All"
  | "Orders"
  | "Shipping"
  | "Payments"
  | "Returns"
  | "Account";

/* =========================================================
   FAQ DATA
========================================================= */

const faqItems: FAQItem[] = [
  {
    id: 1,
    category: "Orders",
    question: "How do I place an order?",
    answer:
      "Browse our products, open the product you want, select the available options such as size or quantity, and add it to your cart. When you are ready, open your cart and continue to checkout. Enter your delivery information, choose your payment method and confirm your order.",
  },
  {
    id: 2,
    category: "Orders",
    question: "Can I change or cancel my order?",
    answer:
      "If you need to change or cancel an order, contact our support team as soon as possible and provide your order number. We will try to assist you before the order is processed or handed over to the courier. Once an order has been shipped, cancellation or changes may no longer be possible.",
  },
  {
    id: 3,
    category: "Orders",
    question: "Where can I see my order status?",
    answer:
      "Sign in to your account and open the My Orders page. Select the relevant order to view its details and current status. Tracking information may be displayed when it becomes available.",
  },
  {
    id: 4,
    category: "Orders",
    question: "What should I do if I receive the wrong product?",
    answer:
      "Please keep the product and its original packaging and contact our support team as soon as possible. Include your order number and, if requested, clear photos of the product and packaging so our team can investigate the issue.",
  },

  {
    id: 5,
    category: "Shipping",
    question: "Do you deliver throughout Bangladesh?",
    answer:
      "We aim to provide delivery throughout Bangladesh wherever our courier partners have coverage. Delivery availability and estimated delivery times may vary depending on your location.",
  },
  {
    id: 6,
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location, order processing time, courier availability and other circumstances. Dhaka deliveries generally take around 1–3 business days, while deliveries outside Dhaka may take around 2–5 business days after processing.",
  },
  {
    id: 7,
    category: "Shipping",
    question: "How much does shipping cost?",
    answer:
      "Shipping charges may depend on your delivery location, order details and courier service. The applicable shipping charge will be displayed during checkout when available.",
  },
  {
    id: 8,
    category: "Shipping",
    question: "Can I track my delivery?",
    answer:
      "Yes. You can check your order status from the My Orders section of your account. Courier tracking details may become available after your order has been handed over to the delivery partner.",
  },
  {
    id: 9,
    category: "Shipping",
    question: "What happens if I miss the delivery?",
    answer:
      "The courier may contact you to arrange another delivery attempt. If you are unable to receive your package, please contact our support team for assistance.",
  },

  {
    id: 10,
    category: "Payments",
    question: "What payment methods do you accept?",
    answer:
      "Available payment methods may include Cash on Delivery and online payment options such as cards or supported mobile financial services. The payment methods available to you will be shown during checkout.",
  },
  {
    id: 11,
    category: "Payments",
    question: "Is online payment secure?",
    answer:
      "We use secure payment processing and appropriate security measures to protect payment-related information. Never share your password, OTP, PIN or other confidential payment credentials with anyone.",
  },
  {
    id: 12,
    category: "Payments",
    question: "Can I pay with Cash on Delivery?",
    answer:
      "Cash on Delivery may be available for eligible orders and delivery locations. If it is available for your order, you will see the option during checkout.",
  },
  {
    id: 13,
    category: "Payments",
    question: "What should I do if my payment fails?",
    answer:
      "First, check that your payment information is correct and that your payment method is active. If money was deducted but your order was not completed, avoid making repeated payments immediately and contact support with your order or payment details.",
  },

  {
    id: 14,
    category: "Returns",
    question: "Can I return a product?",
    answer:
      "Returns depend on the product, condition and applicable return policy. Please review our Return Policy before requesting a return and make sure the product meets the stated eligibility requirements.",
  },
  {
    id: 15,
    category: "Returns",
    question: "How do I request a return?",
    answer:
      "Contact our support team with your order number and the reason for the return. Our team may request photos or additional information before approving the return.",
  },
  {
    id: 16,
    category: "Returns",
    question: "Can I return a damaged product?",
    answer:
      "If your product arrives damaged, contact us as soon as possible. Keep the product, packaging and any related materials until the issue has been reviewed by our support team.",
  },
  {
    id: 17,
    category: "Returns",
    question: "When will I receive my refund?",
    answer:
      "Refund timing depends on the return approval process and the payment method used. Once a refund is approved, processing time may vary by payment provider.",
  },

  {
    id: 18,
    category: "Account",
    question: "How do I create an account?",
    answer:
      "Click Register from the navigation menu and enter the requested information. Complete any required verification steps to activate your account.",
  },
  {
    id: 19,
    category: "Account",
    question: "I forgot my password. What should I do?",
    answer:
      "Go to the Login page and select Forgot Password. Enter your registered email address and follow the password reset instructions sent to you.",
  },
  {
    id: 20,
    category: "Account",
    question: "How can I update my profile information?",
    answer:
      "Sign in to your account and open your Profile page. From there you can update the profile information supported by your account.",
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories: {
  name: FAQCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    name: "All",
    label: "All Questions",
    icon: <FiHelpCircle size={22} />,
    description: "Browse all frequently asked questions.",
  },
  {
    name: "Orders",
    label: "Orders",
    icon: <FiShoppingBag size={22} />,
    description: "Ordering, cancellation and order status.",
  },
  {
    name: "Shipping",
    label: "Shipping",
    icon: <FiTruck size={22} />,
    description: "Delivery areas, time and tracking.",
  },
  {
    name: "Payments",
    label: "Payments",
    icon: <FiShield size={22} />,
    description: "Payment methods and payment issues.",
  },
  {
    name: "Returns",
    label: "Returns",
    icon: <FiRefreshCw size={22} />,
    description: "Returns, refunds and damaged products.",
  },
  {
    name: "Account",
    label: "Account",
    icon: <FiUser size={22} />,
    description: "Profile, login and account assistance.",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState<FAQCategory>("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* =======================================================
     FILTER FAQ
  ======================================================== */

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return faqItems.filter((faq) => {
      const categoryMatches =
        activeCategory === "All" ||
        faq.category === activeCategory;

      const searchMatches =
        normalizedSearch.length === 0 ||
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch) ||
        faq.category.toLowerCase().includes(normalizedSearch);

      return categoryMatches && searchMatches;
    });
  }, [activeCategory, searchTerm]);

  /* =======================================================
     TOGGLE FAQ
  ======================================================== */

  const toggleFaq = (id: number) => {
    setOpenFaq((current) => (current === id ? null : id));
  };

  /* =======================================================
     CATEGORY CHANGE
  ======================================================== */

  const handleCategoryChange = (category: FAQCategory) => {
    setActiveCategory(category);
    setOpenFaq(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-gray-950 text-white">

        {/* Background decorations */}

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

            <span className="text-white">
              FAQ
            </span>
          </nav>

          {/* Hero content */}

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiHelpCircle
                className="text-primary"
                size={17}
              />

              Frequently Asked Questions
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              How Can We Help?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Find quick answers about orders, shipping, payments,
              returns and your BDFashions account.
            </p>

            {/* Search */}

            <div className="relative mx-auto mt-8 max-w-2xl">

              <FiSearch
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
                size={21}
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search your question..."
                aria-label="Search frequently asked questions"
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 py-4 pl-14 pr-5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* ===================================================
            CATEGORY CARDS
        ==================================================== */}

        <div className="mb-12">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-gray-900">
              Browse by Category
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Choose a category to find the information you need.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {categories.map((category) => {

              const isActive =
                activeCategory === category.name;

              const categoryCount =
                category.name === "All"
                  ? faqItems.length
                  : faqItems.filter(
                      (faq) =>
                        faq.category === category.name
                    ).length;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(category.name)
                  }
                  className={`group rounded-2xl border p-5 text-left transition duration-300 ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                      : "border-gray-200 bg-white text-gray-900 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                  }`}
                >

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-gray-50 text-primary group-hover:bg-primary group-hover:text-white"
                    }`}
                  >
                    {category.icon}
                  </div>

                  <h3
                    className={`mt-4 font-bold ${
                      isActive
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {category.label}
                  </h3>

                  <p
                    className={`mt-2 text-xs leading-5 ${
                      isActive
                        ? "text-white/75"
                        : "text-gray-500"
                    }`}
                  >
                    {category.description}
                  </p>

                  <div
                    className={`mt-4 text-xs font-semibold ${
                      isActive
                        ? "text-white/80"
                        : "text-primary"
                    }`}
                  >
                    {categoryCount}{" "}
                    {categoryCount === 1
                      ? "question"
                      : "questions"}
                  </div>

                </button>
              );
            })}

          </div>

        </div>

        {/* ===================================================
            CONTENT GRID
        ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* =================================================
              FAQ LIST
          ================================================== */}

          <div>

            {/* Result header */}

            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory === "All"
                    ? "Frequently Asked Questions"
                    : `${activeCategory} Questions`}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredFaqs.length}{" "}
                  {filteredFaqs.length === 1
                    ? "result"
                    : "results"}{" "}
                  found
                </p>

              </div>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-primary hover:text-primary sm:self-auto"
                >
                  Clear Search
                </button>
              )}

            </div>

            {/* FAQ list */}

            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">

                {filteredFaqs.map((faq) => {

                  const isOpen = openFaq === faq.id;

                  return (
                    <div
                      key={faq.id}
                      className={`overflow-hidden rounded-2xl border bg-white transition duration-300 ${
                        isOpen
                          ? "border-primary/30 shadow-md"
                          : "border-gray-200 shadow-sm hover:border-gray-300"
                      }`}
                    >

                      {/* Question */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleFaq(faq.id)
                        }
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${faq.id}`}
                        className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                      >

                        {/* Number */}

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            isOpen
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {String(faq.id).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        {/* Question */}

                        <span className="flex-1">

                          <span className="block text-base font-bold text-gray-900 sm:text-lg">
                            {faq.question}
                          </span>

                          <span className="mt-1 block text-xs font-medium text-primary">
                            {faq.category}
                          </span>

                        </span>

                        {/* Icon */}

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                            isOpen
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >

                          <FiChevronDown
                            size={18}
                            className={`transition-transform duration-300 ${
                              isOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          />

                        </span>

                      </button>

                      {/* Answer */}

                      {isOpen && (
                        <div
                          id={`faq-answer-${faq.id}`}
                          className="border-t border-gray-100 bg-gray-50 px-5 pb-6 pt-5 sm:px-6"
                        >

                          <div className="flex gap-3">

                            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FiMessageCircle
                                size={15}
                              />
                            </div>

                            <p className="text-sm leading-7 text-gray-600">
                              {faq.answer}
                            </p>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            ) : (

              /* =================================================
                 NO RESULTS
              ================================================== */

              <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                  <FiSearch size={27} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  No questions found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  We couldn't find a question matching your
                  search. Try another keyword or browse a
                  different category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                    setOpenFaq(null);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Show All Questions
                  <FiArrowRight size={16} />
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="space-y-5">

              {/* Quick help */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiHelpCircle size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  Quick Help
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Need more information? Explore our other
                  customer support pages.
                </p>

                <div className="mt-5 space-y-2">

                  <SidebarLink
                    to="/help"
                    icon={<FiHelpCircle size={16} />}
                  >
                    Help Center
                  </SidebarLink>

                  <SidebarLink
                    to="/shipping"
                    icon={<FiTruck size={16} />}
                  >
                    Shipping Information
                  </SidebarLink>

                  <SidebarLink
                    to="/returns"
                    icon={<FiRefreshCw size={16} />}
                  >
                    Return Policy
                  </SidebarLink>

                </div>

              </div>

              {/* Order help */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiPackage size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  Looking for Your Order?
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sign in to view your order history and current
                  order status.
                </p>

                <Link
                  to="/orders"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  View My Orders
                  <FiArrowRight size={16} />
                </Link>

              </div>

              {/* Account */}

              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FiUser size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  Account Support
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Manage your profile, account information and
                  security settings.
                </p>

                <Link
                  to="/profile"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  Open Profile
                  <FiArrowRight size={16} />
                </Link>

              </div>

            </div>

          </aside>

        </div>

      </section>

      {/* =====================================================
          STILL NEED HELP
      ====================================================== */}

      <section className="border-t border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 text-center sm:px-10 sm:py-14">

            {/* Decorations */}

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <FiMessageCircle size={27} />
              </div>

              <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
                Still Need Help?
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                Can't find the answer you're looking for?
                Our customer support team is ready to help.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <Link
                  to="/help"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  <FiHelpCircle size={18} />
                  Visit Help Center
                </Link>

                <a
                  href="mailto:ashikurr255@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:border-primary hover:text-primary"
                >
                  <FiMail size={18} />
                  Email Support
                </a>

                <a
                  href="tel:+8801708588330"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:border-primary hover:text-primary"
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
          SHOPPING CTA
      ====================================================== */}

      <section className="bg-gray-50">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:p-8">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FiShoppingBag size={21} />
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Ready to Start Shopping?
                </h2>

              </div>

              <p className="mt-2 text-sm text-gray-500">
                Discover our latest products and find something you love.
              </p>

            </div>

            <Link
              to="/products"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Products
              <FiArrowRight size={17} />
            </Link>

          </div>

          {/* Back */}

          <div className="mt-8">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary"
            >
              <FiArrowLeft size={17} />
              Back to Home
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
};

/* =========================================================
   SIDEBAR LINK
========================================================= */

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  children,
}) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
    >
      <span className="text-primary">
        {icon}
      </span>

      <span className="flex-1">
        {children}
      </span>

      <FiArrowRight size={15} />
    </Link>
  );
};

export default FAQPage;