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
      className="relative overflow-hidden bg-[#02171D] bg-gradient-to-b from-[#011115] via-[#02171D] to-[#011115] py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 text-white"
    >
      {/* Ambient background glows matching StatsSection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-full max-w-4xl rounded-full bg-[#FDA702]/15 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-orange-500/10 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-amber-500/10 blur-[90px]"
      />

      {/* Decorative top metallic hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FDA702]/60 to-transparent"
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

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Top Pill / Status Indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-4 py-1.5 backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <BsFire className="text-amber-400 text-sm" />
          <span className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-amber-300">
            Limited Time Flash Event
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
          UP TO{" "}
          <span className="inline-block bg-gradient-to-r from-white via-[#FFD278] to-[#FDA702] bg-clip-text text-transparent drop-shadow-sm font-black">
            50% OFF
          </span>
          <br />
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-200 mt-1 inline-block">
            Mid-Season Clearance
          </span>
        </h2>

        {/* Real Ticking Countdown Timer */}
        <div className="mt-7 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200/90">
            <FiClock size={14} className="text-amber-400" />
            <span>Offer expires in:</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-xs sm:max-w-sm">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Mins" },
              { value: timeLeft.seconds, label: "Secs" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] py-3 sm:py-4 px-2 backdrop-blur-xl shadow-lg hover:border-amber-500/40 hover:bg-white/[0.07] transition-all duration-300"
              >
                {/* Top card glossy highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />

                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono tabular-nums leading-none">
                  {String(value).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mt-1.5">
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
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FDA702] via-amber-400 to-[#E59200] text-[#02171D] font-extrabold px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base tracking-wide uppercase shadow-xl shadow-[#FDA702]/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#FDA702]/40 active:scale-[0.98]"
          >
            <BsFire className="text-[#02171D] transition-transform group-hover:scale-125" />
            <span>Shop All Sale Items</span>
            <FiArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* Decorative bottom metallic hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FDA702]/40 to-transparent"
      />
    </section>
  );
}
