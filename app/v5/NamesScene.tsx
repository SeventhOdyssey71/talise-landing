"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

/**
 * Names, not addresses. Pinned while you scroll: a 66-character Sui address
 * scrambles down into "@maya", then the handle takes over in the lead face.
 * Two rows of names slide past in opposite directions, tied to the scroll.
 *
 * The heading + paragraph are real, visible text (the stage is decorative and
 * aria-hidden). Reduced motion: no pin, the handle shows, rows sit still.
 */

const ADDRESS = "0x7a3fe2c91b84d06e5f2a9c13b7d48e60f1c2a95b3d7e08c4f6a1b29d3e5c7f80";
const HANDLE = "@maya";
const ROW_A = ["@maya", "@tunde", "@ada", "@kofi", "@lina", "@chidi", "@zara", "@sam", "@nia", "@leo"];
const ROW_B = ["@amara", "@ife", "@jide", "@noor", "@ola", "@ken", "@tola", "@yaw", "@efe", "@musa"];

export function NamesScene() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const addr = root.querySelector<HTMLElement>(".names-addr")!;
      const handle = root.querySelector<HTMLElement>(".names-handle")!;
      gsap.set(handle, { autoAlpha: 0, scale: 0.86, filter: "blur(12px)" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root, start: "top top", end: "+=160%", pin: true, scrub: 0.6 },
      });
      tl.to(addr, { duration: 0.5, scrambleText: { text: HANDLE, chars: "0123456789abcdef", speed: 0.6 } }, 0)
        .to(addr, { duration: 0.18, autoAlpha: 0, scale: 1.08, filter: "blur(6px)" }, 0.5)
        .to(handle, { duration: 0.22, autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "power2.out" }, 0.52)
        .from(root.querySelectorAll(".names-copy > *"), { duration: 0.18, y: 24, autoAlpha: 0, stagger: 0.05 }, 0.66)
        .fromTo(root.querySelector(".names-row-a"), { xPercent: 0 }, { xPercent: -28, duration: 1 }, 0)
        .fromTo(root.querySelector(".names-row-b"), { xPercent: -28 }, { xPercent: 0, duration: 1 }, 0);
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(root.querySelector(".names-addr"), { autoAlpha: 0 });
    });

    return () => mm.revert();
  }, []);

  const chips = (names: string[]) =>
    [...names, ...names].map((n, i) => (
      <span key={i} className={`names-chip${i % 4 === 1 ? " is-solid" : ""}`}>
        {n}
      </span>
    ));

  return (
    <section ref={ref} className="names band theme-dark" aria-labelledby="names-title">
      <div className="wrap names-inner">
        <p className="kicker">Names, not addresses</p>
        <div className="names-stage" aria-hidden="true">
          <p className="names-addr">{ADDRESS}</p>
          <p className="names-handle">{HANDLE}</p>
        </div>
        <div className="names-copy">
          <h2 id="names-title" className="lead d-lg">
            Send to a name. Not a 66-character&nbsp;address.
          </h2>
          <p className="sub-lg">
            Every Talise account has a handle. @maya is maya.talise.sui on the Sui Network — type it, and the
            money goes there.
          </p>
        </div>
      </div>
      <div className="names-rows" aria-hidden="true">
        <div className="names-row names-row-a">{chips(ROW_A)}</div>
        <div className="names-row names-row-b">{chips(ROW_B)}</div>
      </div>
    </section>
  );
}
