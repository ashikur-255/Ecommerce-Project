import React from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAward,
} from "react-icons/fi";

const TermsOfServicePage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* =========================================================
          HERO / PAGE HEADER
      ========================================================== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Decorative background glow */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-gray-400"
          >
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Terms of Service</span>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiAward className="text-primary" size={16} />
              Fair & Transparent Store Policies
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Welcome to BDFashions Store. These Terms of Service govern your use of our
              website (clickebd.xyz), products, and customer services.
            </p>

            <p className="mt-5 text-sm text-gray-500">
              Last updated: November 20, 2026
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* =====================================================
              MAIN TERMS CONTENT
          ====================================================== */}
          <div className="space-y-8">
            {/* Agreement to Terms */}
            <section
              id="agreement"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiFileText size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Agreement to Terms
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    By accessing, browsing, or shopping on{" "}
                    <strong className="text-gray-900 font-semibold">
                      https://www.clickebd.xyz
                    </strong>{" "}
                    (operated by <strong className="text-gray-900">BDFashions Store</strong>),
                    you agree to be bound by these Terms of Service and our associated{" "}
                    <Link to="/privacy" className="text-primary font-medium hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link to="/returns" className="text-primary font-medium hover:underline">
                      Return Policy
                    </Link>
                    . If you do not agree with any part of these terms, please discontinue use
                    of our website immediately.
                  </p>
                </div>
              </div>
            </section>

            {/* Eligibility & Accounts */}
            <section
              id="eligibility-accounts"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiShield size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. User Accounts & Eligibility
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Requirements for creating and maintaining an account.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>
                  To register an account or place orders, you must provide true, accurate,
                  and complete contact information (Full Name, Phone Number, Email, and Delivery Address).
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Account Security:</strong> You are responsible for maintaining the
                    confidentiality of your login credentials and password.
                  </li>
                  <li>
                    <strong>Google Sign-In:</strong> You may authenticate using Google OAuth.
                    You agree that your Google account is personal and legitimately owned by you.
                  </li>
                  <li>
                    <strong>Single Account Principle:</strong> Creating fraudulent, duplicate, or
                    misleading accounts is strictly prohibited.
                  </li>
                </ul>
              </div>
            </section>

            {/* Products, Pricing & Availability */}
            <section
              id="products-pricing"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <FiShoppingBag size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    3. Products, Pricing & Accuracy
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Product descriptions, catalog items, and currency details.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>
                  All prices listed on BDFashions Store are quoted in Bangladeshi Taka (BDT) and
                  are subject to applicable taxes or promotional discounts.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Product Descriptions:</strong> We strive for maximum accuracy in colors,
                    sizing charts, and specifications. However, actual colors may slightly vary due
                    to screen calibrations or photography lighting.
                  </li>
                  <li>
                    <strong>Stock & Availability:</strong> All products are subject to stock
                    availability. If an item becomes unavailable after placing an order, our support
                    team will promptly notify you and issue a full refund if prepaid.
                  </li>
                  <li>
                    <strong>Price Adjustments:</strong> We reserve the right to revise prices or
                    correct unintentional typographical errors at any time before order confirmation.
                  </li>
                </ul>
              </div>
            </section>

            {/* Orders & Payments */}
            <section
              id="orders-payments"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiCreditCard size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    4. Orders, Payments & Billing
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted payment channels and order confirmation guidelines.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-6 text-gray-600">
                <p>
                  Placing an order constitutes an offer to purchase. An order is confirmed once you
                  receive an order confirmation notification via SMS, Email, or on-screen receipt.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Cash on Delivery (COD)</h3>
                    <p className="text-xs text-gray-600">
                      Pay in cash directly to the delivery agent upon receiving and inspecting your package.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">MFS (bKash, Nagad, Rocket)</h3>
                    <p className="text-xs text-gray-600">
                      Instant, secure digital mobile wallet payments via authorized payment gateways.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Visa & MasterCard</h3>
                    <p className="text-xs text-gray-600">
                      Bank-grade 256-bit encrypted checkout handled via SSLCommerz / Stripe.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Order Cancellation</h3>
                    <p className="text-xs text-gray-600">
                      Orders can be cancelled before dispatch by calling our hotline or via My Orders page.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping & Delivery */}
            <section
              id="shipping-delivery"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiTruck size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Shipping & Delivery
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Doorstep deliveries across all 64 districts of Bangladesh.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>
                  Deliveries are handled through reputable logistics partners, including
                  Steadfast Courier.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Inside Dhaka:</strong> Delivery typically within 24 to 48 hours.
                  </li>
                  <li>
                    <strong>Outside Dhaka:</strong> Delivery typically within 2 to 4 business days.
                  </li>
                  <li>
                    <strong>Package Inspection:</strong> We encourage customers to inspect the outer
                    packaging upon arrival and ensure the parcel seal is intact.
                  </li>
                </ul>
                <p className="pt-1">
                  For complete delivery rates and tracking details, review our{" "}
                  <Link to="/shipping" className="text-primary font-medium hover:underline">
                    Shipping Information Page
                  </Link>.
                </p>
              </div>
            </section>

            {/* Returns & Refunds */}
            <section
              id="returns-refunds"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiRefreshCw size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Returns, Refunds & Exchanges
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Our 7-day hassle-free return guarantee.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                We offer a transparent 7-day return policy for unused, unwashed items in their
                original packaging with tags attached. Defective or wrong items are replaced or
                fully refunded including delivery costs. Please read our comprehensive{" "}
                <Link to="/returns" className="text-primary font-semibold hover:underline">
                  Return Policy
                </Link>{" "}
                for claim submission steps.
              </p>
            </section>

            {/* Intellectual Property */}
            <section
              id="intellectual-property"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FiShield size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    7. Intellectual Property Rights
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Ownership of content, graphics, and trademarks.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                All content published on this website—including brand logos, images, UI design,
                graphics, product text, code, and stylesheets—is the proprietary property of
                BDFashions Store or used under license. Copying, scraping, reproducing, or
                distributing any website assets without prior written consent is strictly prohibited.
              </p>
            </section>

            {/* Prohibited Activities */}
            <section
              id="prohibited-activities"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <FiAlertCircle size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    8. Prohibited User Conduct
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Maintaining a safe and secure marketplace.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm leading-6 text-gray-600">
                <p>Users must not engage in any of the following activities:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Attempting unauthorized access to servers, databases, or user accounts.</li>
                  <li>Using automated bots, crawlers, or scrapers without express authorization.</li>
                  <li>Submitting false, fraudulent, or harassing orders.</li>
                  <li>Interfering with payment processing or security safeguards.</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section
              id="liability"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                  <FiAward size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    9. Limitation of Liability
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Disclaimers and scope of damages.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                To the fullest extent permitted by applicable law, BDFashions Store shall not be
                liable for indirect, incidental, or consequential damages resulting from website
                downtime, delays caused by third-party delivery services, or unauthorized access
                to transmissions beyond our reasonable control. Our total liability for any claim
                shall not exceed the purchase price paid for the specific product in dispute.
              </p>
            </section>

            {/* Governing Law */}
            <section
              id="governing-law"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiFileText size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    10. Governing Law & Dispute Resolution
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Applicable legal jurisdiction.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                These Terms of Service are governed by and construed in accordance with the laws
                of the People&apos;s Republic of Bangladesh. Any dispute arising out of or related to
                these terms shall be subject to amicable settlement, failing which the courts of
                Dhaka, Bangladesh shall hold jurisdiction.
              </p>
            </section>

            {/* Contact Information */}
            <section
              id="contact"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiMail size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    11. Contact & Customer Support
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Have questions regarding these Terms of Service?
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMapPin className="text-primary shrink-0" size={17} />
                  <span><strong>BDFashions Store</strong>, Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMail className="text-primary shrink-0" size={17} />
                  <span>
                    Email:{" "}
                    <a
                      href="mailto:ashikurr255@gmail.com"
                      className="text-primary font-semibold hover:underline"
                    >
                      ashikurr255@gmail.com
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiPhone className="text-primary shrink-0" size={17} />
                  <span>
                    Phone:{" "}
                    <a
                      href="tel:+8801708588330"
                      className="text-primary font-semibold hover:underline"
                    >
                      +880 1708-588330
                    </a>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* =====================================================
              SIDEBAR (QUICK NAVIGATION & SUPPORT)
          ====================================================== */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Quick Links */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Terms Navigation
                </h3>

                <nav className="space-y-1 text-sm">
                  <a
                    href="#agreement"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    1. Agreement
                  </a>
                  <a
                    href="#eligibility-accounts"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    2. Accounts & Eligibility
                  </a>
                  <a
                    href="#products-pricing"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    3. Products & Pricing
                  </a>
                  <a
                    href="#orders-payments"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    4. Orders & Payments
                  </a>
                  <a
                    href="#shipping-delivery"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    5. Shipping & Delivery
                  </a>
                  <a
                    href="#returns-refunds"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    6. Returns & Refunds
                  </a>
                  <a
                    href="#intellectual-property"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    7. Intellectual Property
                  </a>
                  <a
                    href="#prohibited-activities"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    8. Prohibited Conduct
                  </a>
                  <a
                    href="#liability"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    9. Liability
                  </a>
                  <a
                    href="#governing-law"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    10. Governing Law
                  </a>
                  <a
                    href="#contact"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    11. Contact Us
                  </a>
                </nav>
              </div>

              {/* Related Customer Care Links */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  Customer Care
                </h3>

                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/privacy"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                    >
                      <span>Privacy Policy</span>
                      <span>&rarr;</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/returns"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                    >
                      <span>Return Policy</span>
                      <span>&rarr;</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/shipping"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                    >
                      <span>Shipping Information</span>
                      <span>&rarr;</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/faq"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                    >
                      <span>Frequently Asked Questions</span>
                      <span>&rarr;</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default TermsOfServicePage;
