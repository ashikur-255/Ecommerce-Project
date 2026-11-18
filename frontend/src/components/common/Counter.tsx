import { useEffect, useRef, useState } from "react";

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function Counter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: CounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let animId: number;

    const startCounting = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      const startTime = performance.now();

      const updateCount = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth ease-out exponential deceleration
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(easeOut * end);

        setCount(currentVal);

        if (progress < 1) {
          animId = requestAnimationFrame(updateCount);
        } else {
          setCount(end);
        }
      };

      animId = requestAnimationFrame(updateCount);
    };

    // If IntersectionObserver is not supported, start immediately
    if (typeof IntersectionObserver === "undefined") {
      startCounting();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounting();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [end, duration]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
