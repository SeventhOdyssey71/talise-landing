"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { avatarGradientAt } from "@/lib/avatar-gradient";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Getting paid, played by the scroll: payments land one by one on a glass
 * phone and the balance climbs with each. Beside it, the three ways in —
 * a name, a link, a QR (with a scan line sweeping it).
 *
 * Reduced motion: everything rendered, nothing moves.
 */

const START = 1084.5;
const INCOMING = [
  { hue: 2, title: "@tunde", meta: "Sent you money", amount: 120 },
  { hue: 3, title: "Cheque claimed", meta: "From @kofi", amount: 40 },
  { hue: 4, title: "@ada", meta: "Paid your link", amount: 25 },
  { hue: 1, title: "Scan to pay", meta: "@zara · in store", amount: 58.5 },
];

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function ReceiveScene({ qr }: { qr: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const bal = q(".rc-balance")[0] as HTMLElement;
    const rows = q(".rc-row") as HTMLElement[];
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const state = { v: START };
      bal.textContent = usd(START);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q(".rc-phone")[0], start: "top 78%", end: "bottom 40%", scrub: 0.6 },
      });
      let running = START;
      rows.forEach((row, i) => {
        running += INCOMING[i].amount;
        const target = running;
        tl.fromTo(
          row,
          { autoAlpha: 0, y: -26, scale: 0.94, filter: "blur(6px)" },
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1, ease: "power3.out" },
          i * 1.1,
        ).to(
          state,
          { v: target, duration: 0.8, ease: "power2.out", onUpdate: () => (bal.textContent = usd(state.v)) },
          i * 1.1 + 0.2,
        );
      });
      gsap.from(q(".rc-way"), {
        autoAlpha: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: q(".rc-ways")[0], start: "top 80%" },
      });
    });

    return () => mm.revert();
  }, []);

  const final = START + INCOMING.reduce((s, r) => s + r.amount, 0);

  return (
    <section ref={ref} className="receive band theme-dark" aria-labelledby="receive-title">
      <span className="rc-blob rc-blob-a" aria-hidden="true" />
      <span className="rc-blob rc-blob-b" aria-hidden="true" />
      <div className="wrap receive-grid">
        <div className="receive-copy">
          <p className="kicker">Receive</p>
          <h2 id="receive-title" className="lead d-lg">
            Get paid by name, link or&nbsp;QR.
          </h2>
          <p className="sub-lg">Share whichever is easiest. It all lands in the same balance, the moment it&rsquo;s sent.</p>
          <ul className="rc-ways">
            <li className="rc-way">
              <span className="label">Your name</span>
              <span className="value">@maya</span>
            </li>
            <li className="rc-way">
              <span className="label">A link</span>
              <span className="value">talise.io/pay/maya</span>
            </li>
            <li className="rc-way rc-way-qr">
              <span>
                <span className="label">A QR</span>
                <span className="value">Scan to pay</span>
              </span>
              <span className="rc-qr">
                {qr}
                <span className="rc-scan" aria-hidden="true" />
              </span>
            </li>
          </ul>
        </div>

        <div className="rc-phone" role="img" aria-label={`A Talise balance receiving four payments, rising to ${usd(final)}.`}>
          <div className="rc-screen" aria-hidden="true">
            <div className="rc-head">
              <span className="label">Balance</span>
              <span className="rc-balance num">{usd(final)}</span>
              <span className="rc-sub">USDsui</span>
            </div>
            <ul className="rc-list">
              {INCOMING.map((r) => (
                <li key={r.title} className="rc-row">
                  <span className="rc-avatar" aria-hidden="true" style={{ background: avatarGradientAt(r.hue) }} />
                  <span className="rc-text">
                    <span className="rc-title">{r.title}</span>
                    <span className="rc-meta">{r.meta}</span>
                  </span>
                  <span className="rc-amt num">+{usd(r.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
