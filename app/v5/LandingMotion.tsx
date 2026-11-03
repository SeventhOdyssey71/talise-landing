"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Landing-only motion runtime: Lenis momentum scrolling driven by GSAP's
 * ticker, so every ScrollTrigger scrub reads the smoothed position. Nothing
 * runs for people who asked for reduced motion — native scrolling, and each
 * scene renders its final state.
 */
export function LandingMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Fonts and the globe change layout after first paint; re-measure triggers.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
