import {
  FiUsers,
  FiShoppingBag,
  FiAward,
  FiHeadphones,
  FiArrowUpRight,
} from "react-icons/fi";
import Counter from "../common/Counter";

interface StatItem {
  number: number;
  suffix: string;
  badge: string;
  label: string;
  description: string;
  icon: typeof FiUsers;
  accent: {
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    numberGradient: string;
    glow: string;
  };
}

const stats: StatItem[] = [
  {
    number: 10,
    suffix: "K+",
    badge: "Community Loved",
    label: "Happy Customers",
    description: "Across Bangladesh & Beyond",
    icon: FiUsers,
    accent: {
      badgeBg: "bg-amber-500/15 border-amber-500/30",
      badgeText: "text-amber-300",
      iconBg: "bg-gradient-to-br from-amber-500/25 to-yellow-600/10",
      iconColor: "text-[#FDA702]",
      numberGradient: "from-white via-[#FFD278] to-[#FDA702]",
      glow: "group-hover:border-amber-500/50 group-hover:shadow-[0_16px_40px_-12px_rgba(253,167,2,0.35)]",
    },
  },
  {
    number: 500,
    suffix: "+",
    badge: "Curated Catalog",
    label: "Premium Products",
    description: "Footwear, Apparel & Gear",
    icon: FiShoppingBag,
    accent: {
      badgeBg: "bg-orange-500/15 border-orange-500/30",
      badgeText: "text-orange-300",
      iconBg: "bg-gradient-to-br from-orange-500/25 to-amber-600/10",
      iconColor: "text-orange-400",
      numberGradient: "from-white via-[#FFAA5B] to-[#FF7A00]",
      glow: "group-hover:border-orange-500/50 group-hover:shadow-[0_16px_40px_-12px_rgba(255,122,0,0.3)]",
    },
  },
  {
    number: 50,
    suffix: "+",
    badge: "100% Authentic",
    label: "Global Brands",
    description: "Certified Partner Sourcing",
    icon: FiAward,
    accent: {
      badgeBg: "bg-yellow-500/15 border-yellow-500/30",
      badgeText: "text-yellow-300",
      iconBg: "bg-gradient-to-br from-yellow-500/25 to-amber-600/10",
      iconColor: "text-yellow-400",
      numberGradient: "from-white via-[#FFE175] to-[#E6B800]",
      glow: "group-hover:border-yellow-500/50 group-hover:shadow-[0_16px_40px_-12px_rgba(230,184,0,0.3)]",
    },
  },
  {
    number: 24,
    suffix: "/7",
    badge: "Always Online",
    label: "Dedicated Support",
    description: "Fast Help via Call & Chat",
    icon: FiHeadphones,
    accent: {
      badgeBg: "bg-emerald-500/15 border-emerald-500/30",
      badgeText: "text-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-500/25 to-teal-600/10",
      iconColor: "text-emerald-400",
      numberGradient: "from-white via-[#7BE3B5] to-[#10B981]",
      glow: "group-hover:border-emerald-500/50 group-hover:shadow-[0_16px_40px_-12px_rgba(16,185,129,0.3)]",
    },
  },
];

export default function StatsSection() {
  return (
    <section
      aria-label="Store performance statistics"
      className="relative overflow-hidden bg-[#02171D] bg-gradient-to-b from-[#011115] via-[#02171D] to-[#011115] py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-full max-w-4xl rounded-full bg-[#FDA702]/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 right-10 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]"
      />

      {/* Decorative top metallic hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FDA702]/60 to-transparent"
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map(
            ({
              number,
              suffix,
              badge,
              label,
              description,
              icon: Icon,
              accent,
            }) => (
              <div
                key={label}
                className={`group relative rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.06] ${accent.glow}`}
              >
                {/* Top card glossy highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />

                {/* Header: Icon + Badge */}
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 shadow-inner transition-transform duration-300 group-hover:scale-110 ${accent.iconBg} ${accent.iconColor}`}
                  >
                    <Icon size={22} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm ${accent.badgeBg} ${accent.badgeText}`}
                  >
                    <span>{badge}</span>
                  </span>
                </div>

                {/* Animated Stat Value */}
                <div className="mt-2 flex items-baseline">
                  <h3 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-none font-poppins">
                    <Counter
                      end={number}
                      suffix={suffix}
                      duration={2200}
                      className={`bg-gradient-to-br ${accent.numberGradient} bg-clip-text text-transparent drop-shadow-sm font-black`}
                    />
                  </h3>
                </div>

                {/* Stat Label */}
                <h4 className="mt-4 text-lg font-black text-white tracking-tight leading-snug">
                  {label}
                </h4>

                {/* Subtitle / Context description */}
                <p className="mt-1.5 text-xs sm:text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                  {description}
                </p>

                {/* Subtle bottom indicator */}
                <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-gray-500 opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:text-[#FDA702]">
                  <span>Verified BDFashions Metric</span>
                  <FiArrowUpRight size={13} />
                </div>
              </div>
            )
          )}
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
