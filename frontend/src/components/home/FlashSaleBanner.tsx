import { useState, useEffect, useId } from "react";
import { Link } from "react-router-dom";
import { BsFire } from "react-icons/bs";
import { FiArrowRight, FiClock } from "react-icons/fi";

export default function FlashSaleBanner() {
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

  return (
    <section
      aria-label="Limited time flash sale banner"
      className="relative overflow-hidden py-14 sm:py-18 lg:py-20 bg-gradient-to-br from-[#1E232E] via-[#242A38] to-[#1A1E27] text-white"
    >
      {/* Soft Ambient Background Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(253,167,2,0.12),rgba(255,255,255,0))]"
      />

      {/* Subtle modern geometric background mesh */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-5"
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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Top Pill / Status Indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <BsFire className="text-amber-400 text-sm" />
          <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-amber-300">
            Limited Time Flash Event
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
          UP TO{" "}
          <span className="inline-block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-sm">
            50% OFF
          </span>
          <br />
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-300 mt-1 inline-block">
            Mid-Season Clearance
          </span>
        </h2>

        {/* Real Ticking Countdown Timer */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200/90">
            <FiClock size={14} className="text-amber-300" />
            <span>Offer expires in:</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-xs sm:max-w-sm">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Mins" },
              { value: timeLeft.seconds, label: "Secs" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] py-2.5 sm:py-3.5 px-2 backdrop-blur-md shadow-lg"
              >
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono tabular-nums leading-none">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-200/80 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            to="/products?sale=true"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary via-amber-400 to-amber-500 text-dark font-extrabold px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base tracking-wide uppercase shadow-xl shadow-amber-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-amber-500/35 active:scale-[0.98]"
          >
            <BsFire className="text-dark transition-transform group-hover:scale-125" />
            <span>Shop All Sale Items</span>
            <FiArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
