"use client";

import { useEffect, useRef } from "react";
import { avatarGradientAt } from "@/lib/avatar-gradient";
import gsap from "gsap";

/**
 * Messages that are money. Glass bubbles drift over the globe and pop in one
 * after another like a conversation: received, sent, requested, claimed. Each
 * follows the cursor at its own depth.
 *
 * Decorative (the hero copy carries the message), so the group is
 * aria-hidden. Reduced motion: they simply sit there, still.
 */

type Bubble = {
  kind: "in" | "out";
  /** Avatar colour (lib/avatar-gradient): fixed per person across the page. */
  hue: number;
  title: string;
  meta: string;
  pos: string; // css class for placement
  depth: number;
  action?: string;
};

const BUBBLES: Bubble[] = [
  { kind: "in", hue: 0, title: "@maya sent you $50.00", meta: "Just now · gas fee $0.00", pos: "b-1", depth: 18 },
  { kind: "out", hue: 2, title: "You sent @tunde $120.00", meta: "Settled in under a second", pos: "b-2", depth: 28 },
  { kind: "in", hue: 4, title: "@ada requested $25.00", meta: "Dinner on Friday", pos: "b-3", depth: 12, action: "Pay" },
  { kind: "in", hue: 3, title: "Cheque claimed", meta: "$40.00 · by @kofi", pos: "b-4", depth: 22 },
];

function Check() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroBubbles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Three layers per bubble so motions never fight: .bubble = cursor
    // parallax, .bubble-in = entrance, .bubble-float = idle bob.
    const bubbles = gsap.utils.toArray<HTMLElement>(".bubble", root);
    const ins = gsap.utils.toArray<HTMLElement>(".bubble-in", root);
    if (reduce) {
      gsap.set(ins, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Conversation: in one by one, hold, then all drift gently.
      const tl = gsap.timeline({ delay: 0.9 });
      tl.fromTo(
        ins,
        { autoAlpha: 0, y: 26, scale: 0.92, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out", stagger: 0.55 },
      );
      bubbles.forEach((b, i) => {
        gsap.to(b.querySelector(".bubble-float"), {
          y: i % 2 ? 9 : -9,
          duration: 3.2 + i * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.6 + i * 0.3,
        });
      });

      // The "sent" bubble's check lands after it appears.
      tl.from(root.querySelector(".bubble-check"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 1.4);

      // Parallax: each bubble leans toward the cursor by its depth.
      const movers = bubbles.map((b) => ({
        x: gsap.quickTo(b, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(b, "y", { duration: 0.9, ease: "power3.out" }),
        depth: Number(b.dataset.depth || 10),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.depth);
          m.y(ny * m.depth * 0.6);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="bubbles" aria-hidden="true">
      {BUBBLES.map((b) => (
        <div key={b.title} className={`bubble ${b.pos} bubble-${b.kind}`} data-depth={b.depth}>
          <div className="bubble-in">
          <div className="bubble-float">
            <span className="bubble-avatar" style={{ background: avatarGradientAt(b.hue) }} />
            <span className="bubble-text">
              <span className="bubble-title">{b.title}</span>
              <span className="bubble-meta">
                {b.kind === "out" && (
                  <span className="bubble-check">
                    <Check />
                  </span>
                )}
                {b.meta}
              </span>
            </span>
            {b.action && <span className="bubble-action">{b.action}</span>}
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}
