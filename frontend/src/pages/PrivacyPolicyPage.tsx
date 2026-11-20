import React from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiLock,
  FiEye,
  FiUserCheck,
  FiServer,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiGlobe,
  FiDatabase,
  FiRefreshCw,
} from "react-icons/fi";

const PrivacyPolicyPage: React.FC = () => {
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
            <span className="text-white">Privacy Policy</span>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiShield className="text-primary" size={16} />
              Your Privacy & Trust Matter To Us
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              At BDFashions Store, we value your privacy and are committed to protecting
              your personal data. This policy outlines how we collect, use, safeguard,
              and manage your information across our website (clickebd.xyz).
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
              MAIN POLICY CONTENT
          ====================================================== */}
          <div className="space-y-8">
            {/* Introduction / Overview */}
            <section
              id="overview"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiGlobe size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Overview & Scope
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    This Privacy Policy applies to the website{" "}
                    <strong className="text-gray-900 font-semibold">
                      https://www.clickebd.xyz
                    </strong>{" "}
                    (and all subdomains), operated by{" "}
                    <strong className="text-gray-900 font-semibold">
                      BDFashions Store
                    </strong>{" "}
                    (“we,” “our,” or “us”). By accessing or using our services, registering
                    an account, or purchasing products, you consent to the collection,
                    storage, and use of your information as described in this policy.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section
              id="information-collected"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiDatabase size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. Information We Collect
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    The types of information collected when you interact with our platform.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-6 text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    A. Personal Identification Information
                  </h3>
                  <p>
                    When you register, place an order, or contact us, we may collect:
                    full name, email address, phone number, shipping address, and billing details.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    B. Google OAuth & Account Authentication Data
                  </h3>
                  <p>
                    If you choose to sign in using Google OAuth (“Continue with Google”), we
                    receive basic profile details from Google Identity Services: your name,
                    verified email address, and profile photo URL. We do not receive or store
                    your Google password.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    C. Transaction & Order Details
                  </h3>
                  <p>
                    We maintain records of products ordered, order amounts, delivery status,
                    and payment references. Sensitive financial credentials (such as credit
                    card numbers or mobile banking PINs) are processed directly by certified
                    payment gateways (bKash, SSLCommerz, Stripe) and are{" "}
                    <strong>never stored on our servers</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    D. Technical & Browsing Data
                  </h3>
                  <p>
                    Standard logs including your IP address, browser type, device information,
                    pages visited, and cookies for shopping cart functionality and user session
                    persistence.
                  </p>
                </div>
              </div>
            </section>

            {/* Google API Services User Data Policy / Limited Use Disclosure */}
            <section
              id="google-user-data"
              className="rounded-3xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <FiLock size={23} />
                </div>

                <div>
                  <div className="inline-block rounded-md bg-amber-200/60 px-2 py-0.5 text-xs font-bold text-amber-900 mb-2 uppercase tracking-wide">
                    Google OAuth Compliance
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    3. Google User Data Policy & Limited Use Disclosure
                  </h2>

                  <div className="mt-3 space-y-3 leading-7 text-gray-700 text-sm">
                    <p>
                      BDFashions complies strictly with the{" "}
                      <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 underline"
                      >
                        Google API Services User Data Policy
                      </a>
                      , including the Limited Use requirements.
                    </p>

                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Purpose:</strong> We access Google user data solely to facilitate
                        seamless user login, account registration, and authentication on our
                        website.
                      </li>
                      <li>
                        <strong>No Third-Party Advertising:</strong> We do not sell, rent, or transfer
                        Google user data to third-party data brokers, advertising platforms, or data
                        aggregators.
                      </li>
                      <li>
                        <strong>No AI Model Training:</strong> We do not use Google user data to train
                        machine learning or artificial intelligence models.
                      </li>
                      <li>
                        <strong>Data Minimization:</strong> We only request the minimum required scopes
                        (email, basic profile) needed to verify your identity.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section
              id="how-we-use"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiUserCheck size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    4. How We Use Your Information
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Legitimate purposes for processing your information.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Order Fulfillment
                  </h3>
                  <p>
                    Processing orders, packaging items, coordinating delivery with couriers,
                    and providing live parcel tracking.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Account Management
                  </h3>
                  <p>
                    Authenticating your logins, managing wishlists and shopping carts, and
                    enabling password recovery.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Customer Support
                  </h3>
                  <p>
                    Responding to customer inquiries, resolving return or exchange requests,
                    and providing order support.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Security & Fraud Prevention
                  </h3>
                  <p>
                    Preventing unauthorized transactions, protecting user accounts, and
                    ensuring compliance with applicable laws.
                  </p>
                </div>
              </div>
            </section>

            {/* Sharing & Third-Party Service Providers */}
            <section
              id="third-parties"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FiServer size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Third-Party Service Providers
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Trusted partners required for operating our store.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-6 text-gray-600">
                <p>
                  We share personal information strictly on a need-to-know basis with trusted
                  service providers that support our business operations:
                </p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="font-bold text-gray-900 shrink-0">Logistics & Couriers:</span>
                    <span>
                      Courier partners (e.g., Steadfast Courier) receive your name, contact phone,
                      and shipping address solely to deliver your orders.
                    </span>
                  </li>

                  <li className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="font-bold text-gray-900 shrink-0">Payment Gateways:</span>
                    <span>
                      Authorized payment partners (SSLCommerz, bKash, Stripe) handle payment
                      authorization under bank-grade PCI-DSS compliance.
                    </span>
                  </li>

                  <li className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="font-bold text-gray-900 shrink-0">SMS & Email Notifications:</span>
                    <span>
                      SMS service providers (sms.net.bd) and email servers deliver order confirmations,
                      receipts, and verification notices.
                    </span>
                  </li>
                </ul>

                <p className="mt-2 text-xs text-gray-500">
                  We never sell, rent, or trade your personal data to any external marketing firms or advertisers.
                </p>
              </div>
            </section>

            {/* Cookies & Tracking */}
            <section
              id="cookies"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiEye size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Cookies & Tracking Technologies
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enhancing your browsing and shopping experience.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-7 text-gray-600">
                Our website uses cookies and browser local storage to maintain user sessions,
                remember shopping cart items, and preserve your preferences across visits. You
                can configure your browser to decline or delete cookies at any time, though
                certain features (such as maintaining a persistent cart or active login) may
                require them.
              </p>
            </section>

            {/* Data Security & Retention */}
            <section
              id="security"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <FiLock size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    7. Data Security & Retention
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Industry-standard safeguards to protect your personal information.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>
                  We implement robust technical and organizational security measures:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>256-bit SSL/TLS encryption for all website communications (HTTPS).</li>
                  <li>Cryptographic password hashing using industry-standard BCrypt algorithms.</li>
                  <li>Restricted, role-based database access with security logging and monitoring.</li>
                </ul>
                <p>
                  Personal data is retained only for as long as needed to fulfill orders,
                  maintain your account, or comply with statutory accounting and tax regulations.
                </p>
              </div>
            </section>

            {/* Your Rights (Data Control & Deletion) */}
            <section
              id="user-rights"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <FiRefreshCw size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    8. Your Rights & Data Choices
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    You have full control over your personal data.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-gray-600">
                <p>Depending on applicable regulations, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Access & Review:</strong> View and update your profile and shipping
                    addresses through your{" "}
                    <Link to="/profile" className="text-primary font-medium underline">
                      Account Profile
                    </Link>.
                  </li>
                  <li>
                    <strong>Data Deletion (Right to Be Forgotten):</strong> Request the permanent
                    deletion of your account and associated personal information by emailing us
                    at{" "}
                    <a
                      href="mailto:ashikurr255@gmail.com"
                      className="text-primary font-medium underline"
                    >
                      ashikurr255@gmail.com
                    </a>.
                  </li>
                  <li>
                    <strong>Opt-Out:</strong> Unsubscribe from promotional announcements or
                    newsletters at any time.
                  </li>
                </ul>
              </div>
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
                    9. Contact Our Data Protection Team
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Have questions about this Privacy Policy or your data?
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
                  Policy Navigation
                </h3>

                <nav className="space-y-1 text-sm">
                  <a
                    href="#overview"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    1. Overview & Scope
                  </a>
                  <a
                    href="#information-collected"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    2. Information Collected
                  </a>
                  <a
                    href="#google-user-data"
                    className="block rounded-xl px-3 py-2 font-medium text-amber-700 bg-amber-50/50 rounded-xl transition hover:bg-amber-100/50"
                  >
                    3. Google User Data Policy
                  </a>
                  <a
                    href="#how-we-use"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    4. How We Use Info
                  </a>
                  <a
                    href="#third-parties"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    5. Third Parties
                  </a>
                  <a
                    href="#cookies"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    6. Cookies & Tracking
                  </a>
                  <a
                    href="#security"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    7. Data Security
                  </a>
                  <a
                    href="#user-rights"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    8. Your Rights & Choices
                  </a>
                  <a
                    href="#contact"
                    className="block rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    9. Contact Us
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
                      to="/terms"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                    >
                      <span>Terms of Service</span>
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

export default PrivacyPolicyPage;
