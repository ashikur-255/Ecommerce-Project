import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import bdfLogo from "../../assets/BDFs.png";
import { useAppSelector } from "../../hooks/redux";

const socialLinks = [
  {
    icon: FiFacebook,
    url: "https://www.facebook.com/Ashikur.1428",
    label: "Facebook",
  },
  {
    icon: FiLinkedin,
    url: "https://www.linkedin.com/in/ashikur-rahman-134300159/",
    label: "LinkedIn",
  },
  {
    icon: FiInstagram,
    url: "https://www.instagram.com/ashikur.1428/",
    label: "Instagram",
  },
  {
    icon: FiYoutube,
    url: "https://www.youtube.com/@your-channel-name",
    label: "YouTube",
  },
  {
    icon: FiTwitter,
    url: "https://x.com/Ashikur96e",
    label: "Twitter (X)",
  },
];

const shopLinks = [
  { label: "All Products", to: "/products" },
  { label: "New Arrivals", to: "/#new" },
  { label: "Featured Products", to: "/#product" },
  { label: "Hot Sale", to: "/products?sale=true", badge: "50% OFF" },
  { label: "Customer Reviews", to: "/#reviews" },
];

const supportLinks = [
  { label: "Help Center", to: "/help" },
  { label: "Shipping Info", to: "/shipping" },
  { label: "Return Policy", to: "/returns" },
  { label: "FAQ", to: "/faq" },
];

const paymentMethods = [
  { name: "Visa", dotColor: "bg-blue-600" },
  { name: "MasterCard", dotColor: "bg-red-500" },
  { name: "bKash", dotColor: "bg-pink-600" },
  { name: "Nagad", dotColor: "bg-orange-600" },
  { name: "Rocket", dotColor: "bg-purple-600" },
  { name: "COD", dotColor: "bg-emerald-600" },
];

export default function Footer() {
  const { user } = useAppSelector((s) => s.auth);
  const { itemCount } = useAppSelector((s) => s.cart);
  const wishlistCount = useAppSelector((s) => s.wishlist.count);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-20 overflow-hidden bg-[#FDA702] bg-gradient-to-br from-[#FFB92E] via-[#FDA702] to-[#E69300] text-dark">
      {/* Subtle decorative ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-dark/10 blur-3xl"
      />

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              onClick={handleScrollToTop}
              className="group inline-flex items-center gap-3.5 mb-5"
            >
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-lg ring-2 ring-white/80 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={bdfLogo}
                  alt="BDFashions Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-dark leading-none">
                  BDFashions
                </h2>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-dark/70">
                  Performance Meets Style
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-dark/80 mb-6 max-w-sm">
              Discover premium sportswear, footwear, and lifestyle fashion
              engineered for comfort, crafted for performance, and designed for
              everyday confidence.
            </p>

            {/* Interactive Contact Details */}
            <div className="space-y-2.5 text-sm">
              <a
                href="https://maps.google.com/?q=Dhaka,Bangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-dark/85 transition-colors hover:text-dark"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-dark/10 text-dark transition-colors group-hover:bg-dark group-hover:text-[#FDA702]">
                  <FiMapPin size={15} />
                </span>
                <span className="font-medium">Dhaka, Bangladesh</span>
              </a>

              <a
                href="tel:+8801708588330"
                className="group flex items-center gap-3 text-dark/85 transition-colors hover:text-dark"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-dark/10 text-dark transition-colors group-hover:bg-dark group-hover:text-[#FDA702]">
                  <FiPhone size={15} />
                </span>
                <span className="font-medium">+880 1708-588330</span>
              </a>

              <a
                href="mailto:ashikurr255@gmail.com"
                className="group flex items-center gap-3 text-dark/85 transition-colors hover:text-dark"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-dark/10 text-dark transition-colors group-hover:bg-dark group-hover:text-[#FDA702]">
                  <FiMail size={15} />
                </span>
                <span className="font-medium break-all">
                  ashikurr255@gmail.com
                </span>
              </a>

              <div className="flex items-center gap-3 text-dark/80">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-dark/10 text-dark">
                  <FiClock size={15} />
                </span>
                <span className="font-medium">
                  Sat – Thu: 9:00 AM – 10:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark mb-5">
              Shop
            </h3>

            <ul className="space-y-3 text-sm">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                  >
                    <FiArrowRight
                      size={13}
                      className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                    />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-md bg-dark px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#FDA702]">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark mb-5">
              My Account
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/cart"
                  className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                >
                  <FiArrowRight
                    size={13}
                    className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                  />
                  <span>Shopping Cart</span>
                  {itemCount > 0 && (
                    <span className="rounded-full bg-dark px-2 py-0.5 text-[10px] font-bold text-[#FDA702]">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                >
                  <FiArrowRight
                    size={13}
                    className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                  />
                  <span>My Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="rounded-full bg-dark px-2 py-0.5 text-[10px] font-bold text-[#FDA702]">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  to="/orders"
                  className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                >
                  <FiArrowRight
                    size={13}
                    className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                  />
                  <span>Track Orders</span>
                </Link>
              </li>

              {user ? (
                <li>
                  <Link
                    to="/profile"
                    className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                  >
                    <FiArrowRight
                      size={13}
                      className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                    />
                    <span>My Profile</span>
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                    >
                      <FiArrowRight
                        size={13}
                        className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                      />
                      <span>Sign In</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                    >
                      <FiArrowRight
                        size={13}
                        className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                      />
                      <span>Create Account</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark mb-5">
              Customer Care
            </h3>

            <ul className="space-y-3 text-sm">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-2 font-medium text-dark/80 transition-colors hover:text-dark"
                  >
                    <FiArrowRight
                      size={13}
                      className="opacity-0 -ml-4 transition-all duration-200 group-hover:opacity-100 group-hover:ml-0"
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure Payments */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark mb-5">
              Secure Payments
            </h3>

            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dark/10 bg-white/95 px-2.5 py-1.5 text-xs font-bold text-dark shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${method.dotColor}`}
                    aria-hidden="true"
                  />
                  {method.name}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-dark/10 bg-dark/[0.06] p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-dark">
                <FiShield size={15} className="flex-shrink-0 text-dark" />
                <span>SSL Secured Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-dark">
                <FiCheckCircle size={15} className="flex-shrink-0 text-dark" />
                <span>100% Authentic & Safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Social Bar */}
      <div className="relative border-t border-dark/15 bg-dark/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:pr-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm font-medium text-dark/80 text-center md:text-left">
              © {new Date().getFullYear()}{" "}
              <span className="font-bold text-dark">BDFashions Store</span>. All
              rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark/15 bg-white/35 text-dark backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-dark hover:bg-dark hover:text-[#FDA702] hover:shadow-md"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
