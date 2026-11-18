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

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    try {
      const res = await newsletterService.subscribe(trimmed);
      toast.success(
        res.data?.message || "Welcome to BDFashions! You're subscribed."
      );
      setEmail("");
      setSubscribed(true);
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
      className="relative overflow-hidden bg-[#FDA702] bg-gradient-to-br from-[#FFBE3B] via-[#FDA702] to-[#E59200] text-dark"
    >
      {/* Decorative ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 h-80 w-80 rounded-full bg-white/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-dark/10 blur-3xl"
      />

      {/* Trust Highlights Strip */}
      <div className="relative border-b border-dark/10 bg-dark/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustHighlights.map(({ icon: Icon, title, subtitle, to }) => (
              <Link
                key={title}
                to={to}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-white/35 bg-white/20 p-4 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/35 hover:shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-dark text-[#FDA702] shadow-md transition-transform duration-300 group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-dark leading-tight">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-dark/75 truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>
                <FiArrowUpRight
                  size={16}
                  className="flex-shrink-0 text-dark/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dark"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusive Club Newsletter Card */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/25 p-7 sm:p-10 lg:p-12 backdrop-blur-md shadow-[0_20px_50px_-15px_rgba(2,23,29,0.16)]">
          {/* Subtle top inner gloss */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
          />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Copy */}
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-dark px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FDA702] shadow-sm">
                <FiStar size={12} />
                Exclusive Club
              </span>

              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-dark leading-tight">
                Get Early Access to Drops & Exclusive Offers
              </h2>

              <p className="mt-2.5 text-sm sm:text-base text-dark/80 leading-relaxed">
                Subscribe to our newsletter for new arrivals, seasonal
                discounts, and curated style updates straight to your inbox.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                {clubPerks.map((perk) => (
                  <span
                    key={perk}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-dark/80"
                  >
                    <FiCheckCircle size={13} className="text-dark" />
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-dark/10 bg-white p-2 shadow-xl shadow-dark/10 transition focus-within:border-dark/30 focus-within:ring-4 focus-within:ring-dark/10">
                <div className="relative flex-1">
                  <FiMail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/45"
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
                    className="w-full rounded-xl bg-transparent py-3.5 pl-11 pr-3 text-sm font-medium text-dark placeholder:text-gray-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={subscribing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[#082c36] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 flex-shrink-0"
                >
                  <FiSend size={15} />
                  <span>{subscribing ? "Subscribing..." : "Subscribe"}</span>
                </button>
              </div>

              {subscribed && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-dark">
                  <FiCheckCircle className="text-emerald-900" size={15} />
                  Thanks for joining the Exclusive Club! Watch your inbox for our
                  next drop.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
