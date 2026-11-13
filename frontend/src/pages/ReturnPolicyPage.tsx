import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

const ReturnPolicyPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* =========================================================
          HERO / PAGE HEADER
      ========================================================== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Decorative background */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
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

            <span className="text-white">Return Policy</span>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiRefreshCw className="text-primary" size={16} />
              Easy & Transparent Returns
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Return Policy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              We want you to be completely satisfied with your purchase.
              Learn how returns, exchanges, refunds, and damaged-product
              claims work at BDFashions.
            </p>

            <p className="mt-5 text-sm text-gray-500">
              Last updated: August 21, 2026
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
              MAIN POLICY CONTENT
          ====================================================== */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiInfo size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Our Return Policy
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    At BDFashions, customer satisfaction is important to us.
                    If you receive a product that does not meet your
                    expectations, you may be eligible for a return or
                    exchange according to the conditions described below.
                  </p>
                </div>
              </div>
            </section>

            {/* ===================================================
                ELIGIBILITY
            ==================================================== */}
            <section
              id="eligibility"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <FiCheckCircle size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Return Eligibility
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Make sure your order meets these conditions.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <PolicyItem>
                  The product should be unused and in its original condition.
                </PolicyItem>

                <PolicyItem>
                  The original packaging, tags, labels, and accessories should
                  be included whenever applicable.
                </PolicyItem>

                <PolicyItem>
                  Return requests should be submitted within the return period
                  specified for the product or order.
                </PolicyItem>

                <PolicyItem>
                  You may be asked to provide your order number and reason for
                  the return.
                </PolicyItem>

                <PolicyItem>
                  Products must pass our return inspection before a refund or
                  exchange is approved.
                </PolicyItem>
              </div>
            </section>

            {/* ===================================================
                NON RETURNABLE
            ==================================================== */}
            <section
              id="non-returnable"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <FiXCircle size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Non-Returnable Products
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Some products may not qualify for return.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <ul className="space-y-3 text-sm leading-6 text-gray-700">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    Products that have been used, washed, damaged, or altered
                    after delivery may not be accepted.
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    Products returned without required accessories or original
                    packaging may be rejected.
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    Products specifically marked as non-returnable may not be
                    eligible for return.
                  </li>

                  <li className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    Returns caused by customer misuse or damage may not qualify
                    for a refund or replacement.
                  </li>
                </ul>
              </div>
            </section>

            {/* ===================================================
                RETURN PROCESS
            ==================================================== */}
            <section
              id="process"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiPackage size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    How to Request a Return
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Follow these simple steps.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ReturnStep
                  number="01"
                  title="Contact Support"
                  description="Contact our customer support team and provide your order number together with the reason for the return."
                />

                <ReturnStep
                  number="02"
                  title="Return Approval"
                  description="Our support team will review your request and let you know whether the product is eligible for return."
                />

                <ReturnStep
                  number="03"
                  title="Prepare the Product"
                  description="Pack the product safely with its original packaging, tags, accessories, and other included items."
                />

                <ReturnStep
                  number="04"
                  title="Product Inspection"
                  description="Once we receive the product, our team will inspect it to confirm that it meets the return conditions."
                />

                <ReturnStep
                  number="05"
                  title="Refund or Exchange"
                  description="After approval, the applicable refund or exchange process will be started."
                  last
                />
              </div>
            </section>

            {/* ===================================================
                REFUND
            ==================================================== */}
            <section
              id="refund"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FiCreditCard size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Refund Policy
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    What happens after your return is approved?
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-gray-600 leading-7">
                <p>
                  Once the returned product has been inspected and approved,
                  we will process the applicable refund according to the
                  payment method used for the order.
                </p>

                <p>
                  The time required for the refund to appear in your account
                  may vary depending on the payment provider or financial
                  institution.
                </p>

                <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5">
                  <div className="flex gap-3">
                    <FiClock className="mt-1 shrink-0 text-purple-600" />

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Refund Processing Time
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        Refund timelines depend on the payment method and
                        provider. Our support team will provide relevant
                        information after your return is approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================
                EXCHANGE
            ==================================================== */}
            <section
              id="exchange"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <FiRefreshCw size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Exchange Policy
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Need a different size or product?
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                Exchanges may be available depending on product availability
                and eligibility. If you would like to exchange an item, contact
                our support team before sending the product back.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<FiShoppingBag size={20} />}
                  title="Product Availability"
                  description="Exchange requests are subject to available stock."
                />

                <InfoCard
                  icon={<FiShield size={20} />}
                  title="Product Condition"
                  description="The returned item must meet our return conditions."
                />
              </div>
            </section>

            {/* ===================================================
                DAMAGED / WRONG ITEM
            ==================================================== */}
            <section
              id="damaged"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                  <FiShield size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Damaged or Incorrect Product
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Received something different from what you ordered?
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                If you receive a damaged, defective, or incorrect product,
                please contact our support team as soon as possible. Include
                your order number and clear photos of the product when
                requested.
              </p>

              <div className="mt-5 rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                <p className="text-sm leading-6 text-gray-700">
                  <strong>Important:</strong> Please keep the product,
                  packaging, labels, and accessories until our support team
                  confirms the next steps.
                </p>
              </div>
            </section>

            {/* ===================================================
                CANCELLATION
            ==================================================== */}
            <section
              id="cancellation"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                  <FiTruck size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Cancellation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Cancellation depends on order status.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                If you need to cancel an order, contact us as soon as possible.
                Cancellation may not be possible once an order has already
                been processed or handed over to the delivery service.
              </p>

              <div className="mt-5 flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <FiHelpCircle className="mt-1 shrink-0 text-primary" />

                <p className="text-sm leading-6 text-gray-600">
                  For the fastest assistance, keep your order number available
                  when contacting customer support.
                </p>
              </div>
            </section>

            {/* ===================================================
                POLICY CHANGES
            ==================================================== */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Policy Updates
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                BDFashions may update this return policy when necessary to
                reflect changes in our services, products, payment methods, or
                business practices. Any updated policy will be published on
                this page.
              </p>
            </section>
          </div>

          {/* =====================================================
              SIDEBAR
          ====================================================== */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5">
              {/* Quick navigation */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Return Policy
                </h3>

                <nav className="mt-4 space-y-1">
                  <SidebarLink href="#eligibility">
                    Return Eligibility
                  </SidebarLink>

                  <SidebarLink href="#non-returnable">
                    Non-Returnable Products
                  </SidebarLink>

                  <SidebarLink href="#process">
                    Return Process
                  </SidebarLink>

                  <SidebarLink href="#refund">
                    Refund Policy
                  </SidebarLink>

                  <SidebarLink href="#exchange">
                    Exchange Policy
                  </SidebarLink>

                  <SidebarLink href="#damaged">
                    Damaged Products
                  </SidebarLink>

                  <SidebarLink href="#cancellation">
                    Cancellation
                  </SidebarLink>
                </nav>
              </div>

              {/* Need Help */}
              <div className="overflow-hidden rounded-3xl bg-gray-950 p-6 text-white shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <FiHelpCircle size={24} />
                </div>

                <h3 className="text-xl font-bold">
                  Need Help?
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Have questions about a return, exchange, or refund? Our
                  support team is ready to help.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href="mailto:ashikurr255@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm transition hover:border-primary hover:text-primary"
                  >
                    <FiMail size={17} />
                    <span>Contact Support</span>
                  </a>

                  <a
                    href="tel:+8801708588330"
                    className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm transition hover:border-primary hover:text-primary"
                  >
                    <FiMapPin size={17} />
                    <span>Call Customer Service</span>
                  </a>
                </div>
              </div>

              {/* Related links */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Useful Links
                </h3>

                <div className="mt-4 space-y-2">
                  <Link
                    to="/shipping"
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
                  >
                    <span>Shipping Information</span>
                    <span>→</span>
                  </Link>

                  <Link
                    to="/faq"
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
                  >
                    <span>Frequently Asked Questions</span>
                    <span>→</span>
                  </Link>

                  <Link
                    to="/help"
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
                  >
                    <span>Help Center</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =========================================================
          CONTACT CTA
      ========================================================== */}
      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                <FiHelpCircle size={27} />
              </div>

              <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
                Still Have Questions?
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                Our customer support team is here to help you with returns,
                exchanges, refunds, orders, and other questions.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/help"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  <FiHelpCircle size={18} />
                  Visit Help Center
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-white transition hover:border-primary hover:text-primary"
                >
                  <FiShoppingBag size={18} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BACK TO TOP / HOME
      ========================================================== */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary"
          >
            <FiArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
};

/* =============================================================
   POLICY ITEM
============================================================= */
interface PolicyItemProps {
  children: React.ReactNode;
}

const PolicyItem: React.FC<PolicyItemProps> = ({ children }) => {
  return (
    <div className="flex items-start gap-3">
      <FiCheckCircle
        className="mt-1 shrink-0 text-green-500"
        size={18}
      />

      <p className="text-sm leading-6 text-gray-600">
        {children}
      </p>
    </div>
  );
};

/* =============================================================
   RETURN STEP
============================================================= */
interface ReturnStepProps {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}

const ReturnStep: React.FC<ReturnStepProps> = ({
  number,
  title,
  description,
  last = false,
}) => {
  return (
    <div className="flex gap-4">
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-950 text-sm font-bold text-white">
          {number}
        </div>

        {!last && (
          <div className="mt-2 h-full min-h-8 w-px bg-gray-200" />
        )}
      </div>

      <div className="pb-5">
        <h3 className="font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

/* =============================================================
   INFO CARD
============================================================= */
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
};

/* =============================================================
   SIDEBAR LINK
============================================================= */
interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  children,
}) => {
  return (
    <a
      href={href}
      className="block rounded-xl px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-primary"
    >
      {children}
    </a>
  );
};

export default ReturnPolicyPage;

