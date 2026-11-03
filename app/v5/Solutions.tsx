"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/**
 * Three white cards, each with a small working illustration:
 *   1. a dotted globe turning under two currency pins (canvas 2D, real land)
 *   2. a stack of accounts — Earn, Save, Send — with a $250 chip on an arc
 *   3. every rail into one balance and back out (a packet hops the routes)
 * Illustrations are decorative; each card's heading and copy carry it.
 */

const CARDS = [
  {
    title: "Send across borders",
    body: "Dollars to anyone, anywhere, by name. USDsui transfers are gasless on Sui and land in under a second.",
    art: "globe" as const,
  },
  {
    title: "Earn, save, send",
    body: "One account for your dollars: earn on what sits still, save toward a goal, send the rest.",
    art: "stack" as const,
  },
  {
    title: "Every rail, one balance",
    body: "Add money by card, bank or another chain. Cash out to a Nigerian or US bank when you need it.",
    art: "rails" as const,
  },
];

export function Solutions() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(root.querySelectorAll(".sol-card"), {
        y: 60,
        autoAlpha: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: root, start: "top 80%" },
      });

      // Accounts: the chip rides the arc, back and forth.
      const chip = root.querySelector(".acc-chip");
      const arc = root.querySelector<SVGPathElement>(".acc-arc");
      if (chip && arc) {
        gsap.to(chip, {
          motionPath: { path: arc, align: arc, alignOrigin: [0.5, 0.5] },
          duration: 2.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.fromTo(root.querySelectorAll(".acc-card"), { y: (i: number) => i * 14 }, {
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.querySelector(".acc"), start: "top 85%" },
        });
      }

      // Rails: one packet hops route to route, in → hub → out.
      const packet = root.querySelector(".cr-packet");
      if (packet) {
        const ins = gsap.utils.toArray<SVGPathElement>(".cr-in", root);
        const outs = gsap.utils.toArray<SVGPathElement>(".cr-out", root);
        const tl = gsap.timeline({ repeat: -1 });
        for (let i = 0; i < 3; i++) {
          tl.to(packet, { motionPath: { path: ins[i], align: ins[i], alignOrigin: [0.5, 0.5] }, duration: 0.9, ease: "power1.inOut" })
            .to(root.querySelector(".cr-hub"), { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: "50% 50%" })
            .to(packet, { motionPath: { path: outs[i], align: outs[i], alignOrigin: [0.5, 0.5] }, duration: 0.9, ease: "power1.inOut" });
        }
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={ref} className="sol-grid">
      {CARDS.map((c) => (
        <article key={c.title} className="sol-card">
          <div className="sol-copy">
            <h3 className="lead d-sm">{c.title}</h3>
            <p className="sub">{c.body}</p>
          </div>
          <div className="sol-art" aria-hidden="true">
            {c.art === "globe" && <MiniGlobe />}
            {c.art === "stack" && <AccountStack />}
            {c.art === "rails" && <CompactRails />}
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── 1. A dotted globe on canvas ─────────────────────────────────────────── */

const PINS = [
  { label: "USD", lat: 40.71, lng: -74.0 },
  { label: "NGN", lat: 6.52, lng: 3.38 },
];

function MiniGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = false;
    let pts: { lat: number; lng: number; land: boolean }[] = [];
    // Sway over the Atlantic (lng ≈ -35° faces the viewer at rot ≈ 0.6) so the
    // USD → NGN pins stay in view, instead of spinning them round the back.
    let rot = 0.6;
    let t0 = 0;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--color-fg").trim() || "#0a0a0a";
    const onInk = css.getPropertyValue("--color-on-accent").trim() || "#ffffff";
    const lead = css.getPropertyValue("--font-display").trim() || "system-ui";

    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const m = c.getContext("2d");
      if (!m) return;
      m.drawImage(img, 0, 0);
      const data = m.getImageData(0, 0, c.width, c.height);
      const N = 9000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - ((i + 0.5) / N) * 2;
        const a = golden * i;
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lng = ((((a * 180) / Math.PI) % 360) + 540) % 360 - 180;
        const px = Math.min(c.width - 1, Math.floor(((lng + 180) / 360) * c.width));
        const py = Math.min(c.height - 1, Math.floor(((90 - lat) / 180) * c.height));
        const land = data.data[(py * c.width + px) * 4] > 127;
        if (land || i % 5 === 0) pts.push({ lat, lng, land });
      }
      draw();
      if (!reduce) io.observe(canvas);
    };
    img.src = "/v5/land-mask.png";

    const project = (lat: number, lng: number, R: number, cx: number, cy: number) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lng * Math.PI) / 180 + rot;
      const x = Math.cos(la) * Math.sin(lo);
      const y = Math.sin(la);
      const z = Math.cos(la) * Math.cos(lo);
      const t = 0.32; // tilt toward the viewer
      const y2 = y * Math.cos(t) - z * Math.sin(t);
      const z2 = y * Math.sin(t) + z * Math.cos(t);
      return { x: cx + x * R, y: cy - y2 * R, z: z2 };
    };

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(h * 0.8, w * 0.6);
      const cx = w * 0.5;
      const cy = h * 0.86;
      ctx.fillStyle = ink;
      for (const p of pts) {
        const s = project(p.lat, p.lng, R, cx, cy);
        if (s.z <= 0) continue;
        ctx.globalAlpha = p.land ? 0.12 + 0.55 * s.z : 0.06 * s.z;
        ctx.fillRect(s.x, s.y, p.land ? 1.7 : 1.2, p.land ? 1.7 : 1.2);
      }
      ctx.globalAlpha = 1;
      // the route between the pins, and the pins themselves
      const [a, b] = PINS.map((p) => project(p.lat, p.lng, R, cx, cy));
      if (a.z > 0 && b.z > 0) {
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 46, b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      PINS.forEach((p, i) => {
        const s = i === 0 ? a : b;
        if (s.z <= 0) return;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `12px ${lead}`;
        const tw = ctx.measureText(p.label).width + 18;
        const bx = s.x - tw / 2;
        const by = s.y - 34;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw, 22, 7);
        ctx.fill();
        ctx.fillStyle = onInk;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.label, s.x, by + 11.5);
      });
    };

    const tick = (now: number) => {
      if (!t0) t0 = now;
      rot = 0.6 + 0.32 * Math.sin((now - t0) / 4200);
      draw();
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(tick);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      pts = [];
    };
  }, []);
  return <canvas ref={canvasRef} className="mini-globe" />;
}

/* ── 2. Accounts: Earn, Save, Send ───────────────────────────────────────── */

function AccountStack() {
  return (
    <div className="acc">
      <div className="acc-card acc-back-2">
        <span className="acc-label">Earn</span>
      </div>
      <div className="acc-card acc-back-1">
        <span className="acc-label">Save</span>
      </div>
      <div className="acc-card acc-front">
        <span className="acc-label">Send</span>
        <svg viewBox="0 0 300 150" className="acc-svg">
          <path className="acc-arc" d="M 40 120 C 80 30, 220 30, 260 120" fill="none" />
          <circle cx="40" cy="120" r="4" className="acc-start" />
          <line x1="40" y1="138" x2="260" y2="138" className="acc-base" />
          <line x1="40" y1="132" x2="40" y2="144" className="acc-tick" />
          <line x1="260" y1="132" x2="260" y2="144" className="acc-tick" />
        </svg>
        <span className="acc-chip">$250</span>
      </div>
    </div>
  );
}

/* ── 3. Every rail into one balance ──────────────────────────────────────── */

const LEFT = ["Card", "Bank", "Chain"];
const RIGHT = ["@tunde", "NGN", "USD"];

function CompactRails() {
  const ys = [44, 120, 196];
  return (
    <svg viewBox="0 0 360 240" className="cr">
      {ys.map((y, i) => (
        <path key={`i${i}`} className="cr-track cr-in" d={`M 74 ${y} C 120 ${y}, 120 120, 150 120`} />
      ))}
      {ys.map((y, i) => (
        <path key={`o${i}`} className="cr-track cr-out" d={`M 210 120 C 240 120, 240 ${y}, 286 ${y}`} />
      ))}
      {LEFT.map((l, i) => (
        <g key={l} transform={`translate(8 ${ys[i] - 15})`}>
          <rect width="66" height="30" rx="9" className="cr-node" />
          <text x="33" y="19.5" textAnchor="middle" className="cr-label">
            {l}
          </text>
        </g>
      ))}
      {RIGHT.map((l, i) => (
        <g key={l} transform={`translate(286 ${ys[i] - 15})`}>
          <rect width="66" height="30" rx="9" className="cr-node" />
          <text x="33" y="19.5" textAnchor="middle" className="cr-label">
            {l}
          </text>
        </g>
      ))}
      <g className="cr-hub">
        <rect x="150" y="104" width="60" height="32" rx="10" className="cr-hub-rect" />
        <text x="180" y="124.5" textAnchor="middle" className="cr-hub-label">
          USDsui
        </text>
      </g>
      <circle r="4" cx="74" cy="44" className="cr-packet" />
    </svg>
  );
}
