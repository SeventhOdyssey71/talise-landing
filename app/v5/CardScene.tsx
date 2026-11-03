"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { CardFace } from "@/components/app/card/CardFace";

/**
 * The Talise card, in a black band: the card itself (the wallet's own card
 * face) settles flat as the scroll brings it in, two payments float beside
 * it, and the four things it does sit in the copy.
 *
 * Claims: a virtual card for online payments, topped up from the balance.
 * Top-ups carry Talise's fee, so nothing here says the card is free.
 * Reduced motion: everything rendered flat and still.
 */

const DOES = [
  { label: "Top up", value: "From your balance" },
  { label: "Spend", value: "Anywhere cards work online" },
  { label: "Freeze", value: "In one tap" },
  { label: "Track", value: "Every payment, as it happens" },
];

export function CardScene() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The card turns to face the reader as the band scrolls in.
      gsap.fromTo(
        q(".cd-card"),
        { rotateX: 18, rotateY: -22, rotateZ: 4, y: 40 },
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: q(".cd-stage")[0], start: "top 85%", end: "center 55%", scrub: 0.8 },
        },
      );
      // The payments land beside it, then drift.
      gsap.fromTo(
        q(".cd-chip"),
        { autoAlpha: 0, y: 24, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.18,
          scrollTrigger: { trigger: q(".cd-stage")[0], start: "top 70%" },
        },
      );
      gsap.to(q(".cd-chip"), { y: (i: number) => (i ? 8 : -8), duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
      gsap.from(q(".cd-does li"), {
        autoAlpha: 0,
        y: 18,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: q(".cd-does")[0], start: "top 85%" },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} id="card" className="cardsc band theme-dark" aria-labelledby="card-title">
      <span className="rc-blob rc-blob-a" aria-hidden="true" />
      <div className="wrap cd-grid">
        <div className="cd-copy">
          <p className="kicker">Talise card</p>
          <h2 id="card-title" className="lead d-lg">
            A dollar card for the whole&nbsp;internet.
          </h2>
          <p className="sub-lg">
            A virtual card that spends your dollars anywhere cards are accepted online. Top it up from your
            balance and it&rsquo;s ready to use.
          </p>
          <ul className="rc-ways cd-does">
            {DOES.map((d) => (
              <li key={d.label} className="rc-way">
                <span className="label">{d.label}</span>
                <span className="value">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cd-stage">
          <div className="cd-card">
            <CardFace last4="2048" network="mastercard" />
          </div>
          <div className="cd-chip cd-chip-a" aria-hidden="true">
            <span className="cd-chip-title">Spotify</span>
            <span className="cd-chip-amt num">&minus;$10.99</span>
          </div>
          <div className="cd-chip cd-chip-b" aria-hidden="true">
            <span className="cd-chip-title">Card topped up</span>
            <span className="cd-chip-amt num">+$50.00</span>
          </div>
        </div>
      </div>
    </section>
  );
}
