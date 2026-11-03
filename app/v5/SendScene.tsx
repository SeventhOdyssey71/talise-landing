"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SendGlyph, TaliseMark } from "@/components/site/marks";

/**
 * A send, scrubbed by the scroll. The pass is pinned while one continuous
 * timeline plays under your thumb:
 *
 *   the name types in → the amount counts up → "Draft" becomes "Ready" →
 *   the gas fee lights ($0.00: USDsui transfers are gasless on Sui) →
 *   the plane crosses the route → "< 1s", a check, and a stamp lands.
 *
 * Scrubbing backwards runs it backwards. Reduced motion: no pin, the pass
 * renders settled. The pass is one labelled image; captions are real text.
 */

const HANDLE = "@tunde";
const AMOUNT = 500;

const STEPS = [
  { title: "Type a name", body: "Send to @tunde, not to a 66-character address." },
  { title: "Pay no gas", body: "USDsui transfers are gasless on the Sui Network, so the gas fee on this send is $0.00." },
  { title: "It lands in under a second", body: "Sui finalizes the transfer in under a second. Tunde can spend it, or cash it out to their bank." },
];

const money = (n: number) => `$${n.toFixed(2)}`;

export function SendScene({ qr }: { qr: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const to = q(".ss-to")[0] as HTMLElement;
    const amt = q(".ss-amt")[0] as HTMLElement;
    const chip = q(".ss-chip")[0] as HTMLElement;
    const caps = q(".ss-step") as HTMLElement[];
    const bars = q(".ss-bar") as HTMLElement[];
    const settle = q(".ss-settle")[0] as HTMLElement;

    let lastStep = -1;
    const setStep = (s: number) => {
      if (s === lastStep) return;
      lastStep = s;
      chip.textContent = ["Draft", "Ready", "Settled"][s];
      chip.dataset.state = String(s);
      caps.forEach((c, i) => c.toggleAttribute("data-on", i === s));
      bars.forEach((b, i) => b.toggleAttribute("data-on", i <= s));
      root.dataset.step = String(s);
    };

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const state = { typed: 0, amount: 0 };
      to.textContent = "";
      amt.textContent = money(0);
      setStep(0);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=240%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => setStep(self.progress < 0.36 ? 0 : self.progress < 0.68 ? 1 : 2),
        },
      });

      tl.to(state, {
        typed: HANDLE.length,
        duration: 0.14,
        onUpdate: () => {
          to.textContent = HANDLE.slice(0, Math.round(state.typed));
        },
      }, 0.02)
        .to(state, {
          amount: AMOUNT,
          duration: 0.16,
          ease: "power2.out",
          onUpdate: () => {
            amt.textContent = money(state.amount);
          },
        }, 0.16)
        .fromTo(q(".ss-fee"), { opacity: 0.32 }, { opacity: 1, duration: 0.08 }, 0.38)
        .fromTo(q(".ss-zero"), { scale: 0.86 }, { scale: 1, duration: 0.12, ease: "back.out(2.4)" }, 0.38)
        .fromTo(q(".ss-glow"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.4)
        .to(q(".ss-glow"), { opacity: 0, duration: 0.1 }, 0.6)
        .fromTo(q(".ss-line"), { scaleX: 0 }, { scaleX: 1, duration: 0.22 }, 0.68)
        .fromTo(
          q(".ss-plane"),
          { x: 0 },
          { x: () => (q(".ss-path")[0] as HTMLElement).offsetWidth - 24, duration: 0.22 },
          0.68,
        )
        .fromTo(settle, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.86)
        .fromTo(q(".ss-dash"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.06 }, 0.86)
        .fromTo(
          q(".ss-stamp"),
          { autoAlpha: 0, scale: 1.8, rotate: -24 },
          { autoAlpha: 1, scale: 1, rotate: -12, duration: 0.1, ease: "back.out(1.6)" },
          0.9,
        );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      setStep(2);
      gsap.set(q(".ss-stamp, .ss-settle"), { autoAlpha: 1 });
      gsap.set(q(".ss-dash"), { autoAlpha: 0 });
      gsap.set(q(".ss-line"), { scaleX: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="send" id="how" aria-labelledby="send-title" data-step="0">
      <div className="wrap send-inner">
        <div className="send-head">
          <p className="kicker">How a send works</p>
          <h2 id="send-title" className="lead d-lg">
            Three steps. Under a&nbsp;second.
          </h2>
        </div>

        <figure
          className="tpass ss-pass"
          role="img"
          aria-label="A transfer pass to @tunde for $500.00: gas fee $0.00, settled in under a second."
        >
          <div className="tpass-card" aria-hidden="true">
            <div className="tpass-main">
              <div className="tpass-top">
                <span className="tpass-brand">
                  <TaliseMark size={17} />
                  talise
                </span>
                <span className="chip ss-chip" data-state="2">
                  Settled
                </span>
              </div>

              <div className="tpass-route">
                <span className="tpass-code">USD</span>
                <span className="ss-path">
                  <span className="ss-track" />
                  <span className="ss-line" />
                  <span className="ss-plane">
                    <SendGlyph />
                  </span>
                </span>
                <span className="tpass-code tpass-end">NGN</span>
                <span className="tpass-place">United States</span>
                <span />
                <span className="tpass-place tpass-end">Nigeria</span>
              </div>

              <div className="tpass-fields">
                <div>
                  <div className="label">To</div>
                  <div className="value ss-to">{HANDLE}</div>
                </div>
                <div>
                  <div className="label">Settles</div>
                  <div className="value num ss-settles">
                    <span className="ss-dash">—</span>
                    <span className="ss-settle">&lt; 1s</span>
                  </div>
                </div>
                <div className="tpass-end">
                  <div className="label">Amount</div>
                  <div className="value num ss-amt">{money(AMOUNT)}</div>
                </div>
              </div>
            </div>

            <div className="tpass-stub theme-dark">
              <span className="ss-glow" />
              <div className="tpass-fee ss-fee">
                <div className="label">Gas fee</div>
                <div className="tpass-zero num ss-zero">$0.00</div>
              </div>
              {qr}
              <div className="tpass-url">app.talise.io</div>
              <span className="ss-stamp">
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                  <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Settled
              </span>
            </div>
          </div>
        </figure>

        <div className="send-captions">
          <div className="send-bars" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.title} className="ss-bar" data-on={i === 0 ? "" : undefined} />
            ))}
          </div>
          <ol className="send-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="ss-step" data-on={i === 0 ? "" : undefined}>
                <h3 className="lead d-sm">{s.title}</h3>
                <p className="sub">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
