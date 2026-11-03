"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Entrance on first view. Server HTML is fully visible; only after mount, and
 * only for elements still below the fold, is the element armed (hidden) and
 * then released when it scrolls in. No JS, or reduced motion: nothing hides.
 */
export function InView({
  children,
  className = "",
  index = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) {
      el.setAttribute("data-in", "1");
      return;
    }
    el.setAttribute("data-armed", "1");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.setAttribute("data-in", "1");
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ "--i": index } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/**
 * A heading whose words light up as it scrolls through the viewport. The
 * server renders every word lit; dimming starts only after mount.
 */
export function RevealWords({ lines, className = "" }: { lines: { text: string; dim?: boolean }[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>(".w"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the heading's top meets 85% of the viewport, 1 when its bottom reaches 45%
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.4), 0), 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => (i < lit ? w.setAttribute("data-on", "1") : w.removeAttribute("data-on")));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.setAttribute("data-armed", "1");
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <h2 ref={ref} className={`reveal-words ${className}`}>
      {lines.map((line, li) => (
        <span key={li} className={line.dim ? "rw-line dim" : "rw-line"}>
          {line.text.split(" ").map((word, wi) => (
            <span key={wi} className="w" data-on="1">
              {word}{" "}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}

const FORMATS = {
  money: (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
  count: (n: number) => n.toLocaleString("en-US"),
};

/**
 * Counts up to a live figure the first time it is seen. The server renders the
 * real value; a figure that is already on screen at mount is left alone.
 */
export function CountUp({ value, format }: { value: number; format: keyof typeof FORMATS }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced()) return;
    const fmt = FORMATS[format];
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return;
    // Held invisible (not zeroed) until it runs, so a stalled observer can
    // never leave a false "0" on the page.
    el.style.opacity = "0";
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.style.opacity = "";
        const t0 = performance.now();
        const D = 1400;
        const step = (now: number) => {
          const k = Math.min((now - t0) / D, 1);
          const eased = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(Math.round(value * eased));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, format]);
  return <span ref={ref}>{FORMATS[format](value)}</span>;
}
