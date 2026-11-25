import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import {
  FiTruck,
  FiRefreshCw,
  FiLock,
  FiHeadphones,
  FiMail,
  FiSend,
  FiCheckCircle,
  FiArrowUpRight,
  FiStar,
} from "react-icons/fi";
import { newsletterService } from "../../services/api";

const trustHighlights = [
  {
    icon: FiTruck,
    title: "Fast Delivery",
    subtitle: "Nationwide shipping",
    to: "/shipping",
  },
  {
    icon: FiRefreshCw,
    title: "Easy Returns",
    subtitle: "7-day return policy",
    to: "/returns",
  },
  {
    icon: FiLock,
    title: "Secure Checkout",
    subtitle: "256-bit SSL protected",
    to: "/faq",
  },
  {
    icon: FiHeadphones,
    title: "Dedicated Support",
    subtitle: "Quick customer care",
    to: "/help",
  },
];

const clubPerks = [
  "Early drop access",
  "Member-only discounts",
  "Unsubscribe anytime",
];

export default function ExclusiveClubSection() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    try {
      await newsletterService.subscribe(cleanEmail);
      setSubscribed(true);
      setEmail("");
      toast.success(
        "Welcome to the BDFashions Exclusive Club! Check your inbox soon.",
        { duration: 4000 }
      );
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 409) {
        toast("You're already part of the Exclusive Club!", { icon: "✨" });
      } else {
        const msg =
          axiosErr.response?.data?.message ||
          "Could not subscribe right now. Please try again.";
        toast.error(msg);
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section
      aria-label="Store highlights and newsletter signup"
      className="relative overflow-hidden bg-[#02171D] bg-gradient-to-b from-[#011115] via-[#02171D] to-[#011115] border-y border-white/10 text-white"
    >
      {/* Ambient background glows matching StatsSection & FlashSaleBanner */}
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

      {/* Trust Highlights Strip */}
      <div className="relative border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustHighlights.map(({ icon: Icon, title, subtitle, to }) => (
              <Link
                key={title}
                to={to}
                className="group relative flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-white/[0.07] hover:shadow-amber-500/10"
              >
                {/* Top card glossy highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/25 to-yellow-600/10 text-[#FDA702] shadow-inner transition-transform duration-300 group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white leading-tight">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <FiArrowUpRight
                  size={16}
                  className="flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-amber-400"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusive Club Newsletter Card */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 sm:p-10 lg:p-12 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
          {/* Subtle top inner gloss */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Copy */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300 shadow-sm">
                <FiStar size={12} />
                Exclusive Club
              </span>

              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Get Early Access to Drops &{" "}
                <span className="bg-gradient-to-r from-white via-[#FFD278] to-[#FDA702] bg-clip-text text-transparent font-black">
                  Exclusive Offers
                </span>
              </h2>

              <p className="mt-2.5 text-sm sm:text-base text-gray-300 leading-relaxed">
                Subscribe to our newsletter for new arrivals, seasonal
                discounts, and curated style updates straight to your inbox.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {clubPerks.map((perk) => (
                  <span
                    key={perk}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300"
                  >
                    <FiCheckCircle size={13} className="text-[#FDA702]" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <form
              onSubmit={handleNewsletterSubmit}
              className="w-full lg:w-auto lg:min-w-[430px]"
              noValidate
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] p-2 shadow-2xl backdrop-blur-md transition focus-within:border-amber-400/50 focus-within:ring-2 focus-within:ring-amber-400/20">
                <div className="relative flex-1">
                  <FiMail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subscribed) setSubscribed(false);
                    }}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter"
                    className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-3 text-sm font-medium text-white placeholder:text-gray-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={subscribing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FDA702] via-amber-400 to-[#E59200] px-6 py-3.5 text-sm font-extrabold text-[#02171D] shadow-lg shadow-[#FDA702]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FDA702]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 flex-shrink-0"
                >
                  <FiSend size={15} />
                  <span>{subscribing ? "Subscribing..." : "Subscribe"}</span>
                </button>
              </div>

              {subscribed && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <FiCheckCircle className="text-amber-400" size={15} />
                  Thanks for joining the Exclusive Club! Watch your inbox for our
                  next drop.
                </p>
              )}
            </form>
          </div>
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
