import { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BsFire, BsLightningChargeFill } from "react-icons/bs";
import {
  FiArrowRight,
  FiClock,
  FiCopy,
  FiCheck,
  FiTag,
  FiShield,
  FiTruck,
} from "react-icons/fi";

const dealHighlights = [
  { label: "Sportswear", discount: "Up to 50% OFF", tag: "Hot" },
  { label: "Footwear & Shoes", discount: "Up to 45% OFF", tag: "Popular" },
  { label: "Hoodies & Jackets", discount: "Up to 40% OFF", tag: "Trending" },
  { label: "Accessories", discount: "Up to 30% OFF", tag: "Limited" },
];

export default function FlashSaleBanner() {
  const [copied, setCopied] = useState(false);
  const couponCode = "BDF50";

  // Persistent live countdown timer to the end of the current 3-day sale cycle
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 36,
    seconds: 48,
  });

  const gradientId = useId();

  useEffect(() => {
    // Target 48 hours from a consistent anchor
    const saleEndTime = new Date();
    saleEndTime.setHours(23, 59, 59, 999);
    saleEndTime.setDate(saleEndTime.getDate() + 2);

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = saleEndTime.getTime() - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success(
        `Code ${couponCode} copied! Apply at checkout for extra savings.`,
        {
          duration: 3000,
          icon: "🔥",
        }
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy automatically. Code is: " + couponCode);
    }
  };

  return (
    <section
      aria-label="Limited time flash sale banner"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#800F17] via-[#9B1C1C] to-[#B43403] text-white"
    >
      {/* Background Ambience & Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(253,167,2,0.25),rgba(255,255,255,0))]"
      />

      {/* Subtle modern geometric background mesh */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
      >
        <defs>
          <pattern
            id={gradientId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 40L40 0H20L0 20M40 40V20L20 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Urgency, Offer & Action */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Top Pill / Status Indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <BsFire className="text-amber-400 text-sm" />
              <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-amber-200">
                Limited Time Flash Event
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              UP TO{" "}
              <span className="inline-block bg-gradient-to-r from-yellow-300 via-amber-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                50% OFF
              </span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-red-100">
                Mid-Season Clearance
              </span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-red-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Upgrade your athletic wardrobe with premium sportswear, sneakers,
              and lifestyle gear at our biggest markdown of the season.
            </p>

            {/* Real Ticking Countdown Timer */}
            <div className="mt-7 flex flex-col items-center lg:items-start gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                <FiClock size={14} className="text-amber-300" />
                <span>Offer expires in:</span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs sm:max-w-sm w-full">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Mins" },
                  { value: timeLeft.seconds, label: "Secs" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/35 py-2.5 sm:py-3 px-2 backdrop-blur-md shadow-md"
                  >
                    <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono tabular-nums leading-none">
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 mt-1">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons & Promo Code */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/products?sale=true"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-base font-black text-red-700 shadow-xl shadow-red-950/40 transition-all duration-300 hover:bg-amber-300 hover:text-dark hover:-translate-y-1 hover:shadow-2xl active:translate-y-0"
              >
                <BsFire className="text-red-600 transition-transform group-hover:scale-125" />
                <span>Shop All Sale Items</span>
                <FiArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/* Coupon Code 1-Click Copy */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Click to copy coupon code"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/30 bg-black/25 px-5 py-4 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-black/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <FiTag className="text-amber-300" size={16} />
                <span>Code:</span>
                <span className="rounded-lg bg-white/20 px-2 py-0.5 font-mono font-black tracking-wider text-amber-200">
                  {couponCode}
                </span>
                {copied ? (
                  <span className="flex items-center gap-1 text-emerald-300 text-xs">
                    <FiCheck size={14} />
                    Copied
                  </span>
                ) : (
                  <FiCopy
                    size={14}
                    className="text-white/70 hover:text-white"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Category Deals Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/25 bg-black/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              {/* Inner ambient top shimmer */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
              />

              <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <BsLightningChargeFill size={13} />
                    Category Highlights
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    Trending Markdowns
                  </h3>
                </div>

                <span className="rounded-full bg-red-600/80 border border-red-400/40 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  Live Deals
                </span>
              </div>

              {/* Deals List */}
              <div className="space-y-3">
                {dealHighlights.map((deal) => (
                  <Link
                    key={deal.label}
                    to="/products?sale=true"
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3.5 transition-all duration-300 hover:border-amber-400/50 hover:bg-white/20 hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-dark font-black text-sm shadow-md">
                        %
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white leading-tight">
                          {deal.label}
                        </p>
                        <p className="text-xs font-bold text-amber-300 mt-0.5">
                          {deal.discount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-bold text-red-200">
                        {deal.tag}
                      </span>
                      <FiArrowRight
                        size={15}
                        className="text-white/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom Guarantee Perks */}
              <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-white/90">
                  <FiTruck className="text-amber-300 flex-shrink-0" size={15} />
                  <span>Free shipping on ৳2500+</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <FiShield
                    className="text-amber-300 flex-shrink-0"
                    size={15}
                  />
                  <span>100% Genuine Gear</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
