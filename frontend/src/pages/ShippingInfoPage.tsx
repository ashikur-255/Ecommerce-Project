import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiSearch,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiChevronDown
} from "react-icons/fi";

/* =========================================================
   TYPES
========================================================= */

interface DeliveryZone {
  title: string;
  description: string;
  deliveryTime: string;
  shippingCost: string;
  icon: React.ReactNode;
}

interface ShippingStepProps {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}

interface ShippingFaq {
  question: string;
  answer: string;
}

/* =========================================================
   SHIPPING ZONES
========================================================= */

const deliveryZones: DeliveryZone[] = [
  {
    title: "Dhaka City",
    description:
      "Delivery within Dhaka City through our available delivery partners.",
    deliveryTime: "Estimated 1–3 business days",
    shippingCost: "Shipping fee calculated at checkout",
    icon: <FiMapPin size={24} />,
  },
  {
    title: "Outside Dhaka",
    description:
      "Delivery to supported destinations outside Dhaka through our courier partners.",
    deliveryTime: "Estimated 2–5 business days",
    shippingCost: "Shipping fee calculated at checkout",
    icon: <FiTruck size={24} />,
  },
  {
    title: "Nationwide Delivery",
    description:
      "We aim to deliver to customers across Bangladesh where courier service is available.",
    deliveryTime: "Estimated 2–7 business days",
    shippingCost: "Depends on destination",
    icon: <FiPackage size={24} />,
  },
];

/* =========================================================
   SHIPPING FAQ
========================================================= */

const shippingFaqs: ShippingFaq[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your location, order processing time, courier availability, weather, holidays and other circumstances. Dhaka deliveries may generally arrive sooner than deliveries outside Dhaka.",
  },
  {
    question: "Do you deliver outside Dhaka?",
    answer:
      "Yes. We aim to provide delivery throughout Bangladesh where our courier partners support the destination.",
  },
  {
    question: "How is the shipping fee calculated?",
    answer:
      "Shipping charges may depend on your delivery location, order details and the courier service used. The applicable shipping charge will be shown during checkout when available.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After signing in, go to My Orders and open the relevant order. When tracking information is available, the latest delivery information will be displayed there.",
  },
  {
    question: "Can I change my delivery address?",
    answer:
      "Contact customer support as soon as possible if you need to change your delivery address. Address changes may not be possible after the order has been processed or handed over to the courier.",
  },
  {
    question: "What happens if I am unavailable during delivery?",
    answer:
      "The courier may contact you to arrange delivery. If delivery cannot be completed, the courier may attempt another delivery or return the package according to their delivery process.",
  },
];

/* =========================================================
   SHIPPING INFO PAGE
========================================================= */

const ShippingInfoPage: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HERO / PAGE HEADER
      ====================================================== */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Decorative background */}
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
              Shipping Information
            </span>
          </nav>

          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-300">
              <FiTruck
                className="text-primary"
                size={16}
              />

              Fast & Reliable Delivery
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Shipping Information
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
              Everything you need to know about delivery areas,
              estimated delivery times, shipping charges, tracking
              and order delivery.
            </p>

            <p className="mt-5 text-sm text-gray-500">
              Last updated: August 21, 2026
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* ===================================================
              MAIN COLUMN
          ==================================================== */}
          <div className="space-y-8">
            {/* =================================================
                INTRODUCTION
            ================================================== */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FiInfo size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Our Shipping Service
                  </h2>

                  <p className="mt-3 leading-7 text-gray-600">
                    At BDFashions, we work with delivery partners to
                    get your orders to you as safely and efficiently as
                    possible. Delivery time and shipping charges can
                    vary depending on your location, order details and
                    courier availability.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                DELIVERY ZONES
            ================================================== */}
            <section
              id="delivery-zones"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <FiMapPin size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Delivery Areas
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Delivery availability depends on courier coverage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {deliveryZones.map((zone) => (
                  <div
                    key={zone.title}
                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white">
                      {zone.icon}
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                      {zone.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {zone.description}
                    </p>

                    <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-start gap-3">
                        <FiClock
                          className="mt-0.5 shrink-0 text-primary"
                          size={17}
                        />

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Delivery
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {zone.deliveryTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FiChevronDown
                          className="mt-0.5 shrink-0 text-primary"
                          size={17}
                        />

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Shipping
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {zone.shippingCost}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* =================================================
                DELIVERY TIME
            ================================================== */}
            <section
              id="delivery-time"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <FiClock size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Estimated Delivery Time
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Delivery times are estimates and may vary.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <DeliveryTimeCard
                  title="Order Processing"
                  time="1–2 business days"
                  description="Time required to prepare and process your order."
                />

                <DeliveryTimeCard
                  title="Dhaka"
                  time="1–3 business days"
                  description="Estimated delivery after order processing."
                />

                <DeliveryTimeCard
                  title="Outside Dhaka"
                  time="2–5 business days"
                  description="Estimated delivery after order processing."
                />
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
                <FiInfo
                  className="mt-0.5 shrink-0 text-yellow-600"
                  size={19}
                />

                <p className="text-sm leading-6 text-gray-700">
                  Delivery times are estimates only. Delays may occur
                  because of holidays, weather conditions, traffic,
                  courier capacity, promotional campaigns or other
                  unexpected circumstances.
                </p>
              </div>
            </section>

            {/* =================================================
                SHIPPING COST
            ================================================== */}
            <section
              id="shipping-cost"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <FiShoppingBag size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Shipping Charges
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Shipping fees may vary by destination.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                Shipping charges may depend on your delivery
                location, order details and the courier service used.
                The applicable shipping charge will be displayed during
                checkout when available.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <FiMapPin size={20} />
                    </div>

                    <h3 className="font-bold text-gray-900">
                      Dhaka
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    The delivery fee will be calculated according to
                    your delivery address and current shipping rules.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <FiTruck size={20} />
                    </div>

                    <h3 className="font-bold text-gray-900">
                      Outside Dhaka
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Delivery fees may differ depending on the
                    destination and courier coverage.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                SHIPPING PROCESS
            ================================================== */}
            <section
              id="shipping-process"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <FiPackage size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    How Delivery Works
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Follow your order from checkout to delivery.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <ShippingStep
                  number="01"
                  title="Place Your Order"
                  description="Choose your products, add them to your cart and complete the checkout process with your delivery information and payment method."
                />

                <ShippingStep
                  number="02"
                  title="Order Confirmation"
                  description="After your order is successfully submitted, you can view the order details from your account."
                />

                <ShippingStep
                  number="03"
                  title="Order Processing"
                  description="Our team prepares your products and gets the order ready for shipment."
                />

                <ShippingStep
                  number="04"
                  title="Courier Handover"
                  description="Once your order is ready, it may be handed over to our delivery partner for transportation."
                />

                <ShippingStep
                  number="05"
                  title="Out for Delivery"
                  description="The courier delivers your package to the delivery address provided during checkout."
                />

                <ShippingStep
                  number="06"
                  title="Order Delivered"
                  description="After successful delivery, your order status will be updated accordingly."
                  last
                />
              </div>
            </section>

            {/* =================================================
                ORDER TRACKING
            ================================================== */}
            <section
              id="tracking"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FiSearch size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Track Your Order
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Keep an eye on your delivery status.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                You can check your order status from your customer
                account. Open{" "}
                <strong className="text-gray-900">
                  My Orders
                </strong>{" "}
                and select the order you want to track.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <TrackingCard
                  title="Processing"
                  description="Your order is being prepared."
                  icon={<FiPackage size={20} />}
                />

                <TrackingCard
                  title="Shipped"
                  description="Your order has been handed to the courier."
                  icon={<FiTruck size={20} />}
                />

                <TrackingCard
                  title="Delivered"
                  description="Your order has been successfully delivered."
                  icon={<FiCheckCircle size={20} />}
                />
              </div>

              <div className="mt-6">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  View My Orders
                  <FiArrowRight size={17} />
                </Link>
              </div>
            </section>

            {/* =================================================
                DELIVERY ADDRESS
            ================================================== */}
            <section
              id="delivery-address"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiMapPin size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Delivery Address
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Make sure your address is accurate.
                  </p>
                </div>
              </div>

              <p className="leading-7 text-gray-600">
                Please provide a complete and accurate delivery address
                during checkout. Include your area, road or building
                information, district and a phone number where the
                courier can reach you.
              </p>

              <div className="mt-6 space-y-3">
                <AddressTip>
                  Enter your full name and active phone number.
                </AddressTip>

                <AddressTip>
                  Provide the correct house, road, area and district
                  information.
                </AddressTip>

                <AddressTip>
                  Double-check your address before placing the order.
                </AddressTip>

                <AddressTip>
                  Keep your phone available around the expected delivery
                  time.
                </AddressTip>
              </div>

              <div className="mt-6">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                >
                  <FiUser size={17} />
                  Manage My Profile
                </Link>
              </div>
            </section>

            {/* =================================================
                DELIVERY ISSUES
            ================================================== */}
            <section
              id="delivery-issues"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <FiShield size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Delivery Problems
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    What to do if something goes wrong.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ProblemCard
                  title="Package Is Delayed"
                  description="Check your order status first. If there has been an unusual delay, contact our support team."
                />

                <ProblemCard
                  title="Incorrect Product"
                  description="Keep the product and packaging and contact support as soon as possible."
                />

                <ProblemCard
                  title="Damaged Product"
                  description="Take clear photos if requested and contact support before returning the item."
                />

                <ProblemCard
                  title="Unable to Receive"
                  description="Keep your phone available and contact support if you need help arranging delivery."
                />
              </div>
            </section>

            {/* =================================================
                SHIPPING FAQ
            ================================================== */}
            <section
              id="shipping-faq"
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <FiHelpCircle size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Shipping FAQs
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Quick answers to common delivery questions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {shippingFaqs.map((faq, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div
                      key={faq.question}
                      className={`overflow-hidden rounded-2xl border transition ${
                        isOpen
                          ? "border-primary/30 shadow-sm"
                          : "border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-4 p-5 text-left"
                      >
                        <span className="flex-1 font-semibold text-gray-900">
                          {faq.question}
                        </span>

                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                            isOpen
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <FiArrowDown
                            className={`transition-transform duration-300 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            size={17}
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="border-t border-gray-100 bg-gray-50 px-5 pb-5 pt-4">
                          <p className="text-sm leading-7 text-gray-600">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                IMPORTANT INFORMATION
            ================================================== */}
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                  <FiInfo size={23} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Important Shipping Information
                  </h2>

                  <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                    <p>
                      Delivery estimates are not guaranteed and may
                      change depending on circumstances outside our
                      control.
                    </p>

                    <p>
                      Orders may take longer to process during holidays,
                      promotional campaigns, high-demand periods or
                      unexpected events.
                    </p>

                    <p>
                      Please make sure your contact information and
                      delivery address are correct before placing an
                      order.
                    </p>

                    <p>
                      If you experience a delivery problem, contact our
                      support team with your order number so we can
                      assist you more efficiently.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5">
              {/* Quick Navigation */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Shipping Information
                </h3>

                <nav className="mt-4 space-y-1">
                  <SidebarLink href="#delivery-zones">
                    Delivery Areas
                  </SidebarLink>

                  <SidebarLink href="#delivery-time">
                    Delivery Time
                  </SidebarLink>

                  <SidebarLink href="#shipping-cost">
                    Shipping Charges
                  </SidebarLink>

                  <SidebarLink href="#shipping-process">
                    Delivery Process
                  </SidebarLink>

                  <SidebarLink href="#tracking">
                    Order Tracking
                  </SidebarLink>

                  <SidebarLink href="#delivery-address">
                    Delivery Address
                  </SidebarLink>

                  <SidebarLink href="#delivery-issues">
                    Delivery Problems
                  </SidebarLink>

                  <SidebarLink href="#shipping-faq">
                    Shipping FAQs
                  </SidebarLink>
                </nav>
              </div>

              {/* Quick Delivery Card */}
              <div className="overflow-hidden rounded-3xl bg-gray-950 p-6 text-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <FiTruck size={24} />
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  Need Your Order Quickly?
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Complete your order with accurate delivery
                  information to help us process your shipment smoothly.
                </p>

                <Link
                  to="/products"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  Start Shopping
                  <FiArrowRight size={17} />
                </Link>
              </div>

              {/* Related Links */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">
                  Useful Links
                </h3>

                <div className="mt-4 space-y-2">
                  <Link
                    to="/returns"
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
                  >
                    <span>Return Policy</span>
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

                  <Link
                    to="/orders"
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-primary"
                  >
                    <span>My Orders</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          CONTACT SUPPORT CTA
      ====================================================== */}
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
                Need Help With Your Delivery?
              </h2>

              <p className="mt-4 leading-7 text-gray-400">
                Our customer support team can help with delivery
                questions, order tracking, shipping problems and more.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href="mailto:ashikurr255@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
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

/* =============================================================
   DELIVERY TIME CARD
============================================================= */

interface DeliveryTimeCardProps {
  title: string;
  time: string;
  description: string;
}

const DeliveryTimeCard: React.FC<DeliveryTimeCardProps> = ({
  title,
  time,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        <FiClock size={20} />
      </div>

      <h3 className="mt-4 font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-lg font-bold text-primary">
        {time}
      </p>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
};

/* =============================================================
   SHIPPING STEP
============================================================= */

const ShippingStep: React.FC<ShippingStepProps> = ({
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
   TRACKING CARD
============================================================= */

interface TrackingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TrackingCard: React.FC<TrackingCardProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
};

/* =============================================================
   ADDRESS TIP
============================================================= */

interface AddressTipProps {
  children: React.ReactNode;
}

const AddressTip: React.FC<AddressTipProps> = ({ children }) => {
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
   DELIVERY PROBLEM CARD
============================================================= */

interface ProblemCardProps {
  title: string;
  description: string;
}

const ProblemCard: React.FC<ProblemCardProps> = ({
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-bold text-gray-900">
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

/* =============================================================
   ARROW DOWN ICON
============================================================= */

interface FiArrowDownProps {
  className?: string;
  size?: number;
}

const FiArrowDown: React.FC<FiArrowDownProps> = ({
  className = "",
  size = 18,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
};

export default ShippingInfoPage;

