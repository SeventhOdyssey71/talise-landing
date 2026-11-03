"use client";

import { useEffect, useRef } from "react";

/**
 * The hero globe: white dots on black, with transfers pulsing between cities.
 *
 * Land is real — dots are kept where /v5/land-mask.png (Natural Earth 110m,
 * public domain) is land; the ocean gets a sparse, faint grid so the sphere
 * still reads as a sphere. Each route is a lifted great-circle arc with a
 * comet-like pulse and a bright "packet" riding its head: a send, landing.
 *
 * Costs: three.js is imported on the client only, after mount. The loop stops
 * while the hero is off screen or the tab is hidden, the pixel ratio is capped
 * at 2, and `prefers-reduced-motion` renders one still frame and stops.
 * Decorative — the canvas is aria-hidden and never takes pointer events.
 */

const CITIES = {
  newYork: [40.71, -74.0],
  lagos: [6.52, 3.38],
  london: [51.51, -0.13],
  nairobi: [-1.29, 36.82],
  accra: [5.6, -0.19],
  toronto: [43.65, -79.38],
  saoPaulo: [-23.55, -46.63],
  johannesburg: [-26.2, 28.05],
  dubai: [25.2, 55.27],
  mumbai: [19.08, 72.88],
  sanFrancisco: [37.77, -122.42],
  paris: [48.86, 2.35],
} as const;

type CityKey = keyof typeof CITIES;

const ROUTES: [CityKey, CityKey][] = [
  ["newYork", "lagos"],
  ["london", "lagos"],
  ["toronto", "accra"],
  ["lagos", "nairobi"],
  ["dubai", "mumbai"],
  ["saoPaulo", "johannesburg"],
  ["sanFrancisco", "london"],
  ["paris", "nairobi"],
  ["london", "dubai"],
];

export function HeroGlobe({ tone = "light" }: { tone?: "light" | "dark" }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Ink: white light on black, or graphite on the light grey ground. On light,
      // additive blending would vanish, so everything blends normally.
      const light = tone === "light";
      const INK = light ? "vec3(0.04)" : "vec3(1.0)";
      const BLEND = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      const LAND_A = light ? "0.62" : "0.9";
      const SEA_A = light ? "0.09" : "0.13";

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the hero stands on its copy alone
      }
      const pr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pr);
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      // tilt (pointer) > spin (auto) > content
      const tilt = new THREE.Group();
      const spin = new THREE.Group();
      tilt.add(spin);
      scene.add(tilt);

      const toXYZ = (lat: number, lng: number, r = 1) => {
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = ((lng + 180) * Math.PI) / 180;
        return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      };

      // ── land mask ───────────────────────────────────────────────────────
      const mask = await new Promise<ImageData | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, c.width, c.height));
        };
        img.onerror = () => resolve(null);
        img.src = "/v5/land-mask.png";
      });
      if (disposed) {
        renderer.dispose();
        renderer.domElement.remove();
        return;
      }
      const isLand = (lat: number, lng: number) => {
        if (!mask) return Math.random() < 0.3;
        const x = Math.min(mask.width - 1, Math.floor(((lng + 180) / 360) * mask.width));
        const y = Math.min(mask.height - 1, Math.floor(((90 - lat) / 180) * mask.height));
        return mask.data[(y * mask.width + x) * 4] > 127;
      };

      // ── dots: a Fibonacci sphere filtered by the mask ───────────────────
      const N = 64000;
      const pos: number[] = [];
      const land: number[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - ((i + 0.5) / N) * 2;
        const r = Math.sqrt(1 - y * y);
        const a = golden * i;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lng = (Math.atan2(z, -x) * 180) / Math.PI - 180;
        const L = isLand(lat, ((lng + 540) % 360) - 180);
        if (L || i % 7 === 0) {
          pos.push(x, y, z);
          land.push(L ? 1 : 0);
        }
      }
      const dotGeo = new THREE.BufferGeometry();
      dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      dotGeo.setAttribute("aLand", new THREE.Float32BufferAttribute(land, 1));
      const dotMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        uniforms: { uSize: { value: 3.1 }, uPR: { value: pr } },
        vertexShader: /* glsl */ `
          attribute float aLand;
          uniform float uSize;
          uniform float uPR;
          varying float vAlpha;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * position);
            float facing = dot(n, normalize(-mv.xyz));
            vAlpha = smoothstep(0.02, 0.5, facing) * mix(${SEA_A}, ${LAND_A}, aLand);
            gl_PointSize = uSize * uPR * mix(0.7, 1.0, aLand) * (3.4 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.28, d) * vAlpha;
            if (a < 0.01) discard;
            gl_FragColor = vec4(${INK}, a);
          }`,
      });
      spin.add(new THREE.Points(dotGeo, dotMat));

      // depth-only sphere: hides the far half of every arc
      const occluder = new THREE.Mesh(
        new THREE.SphereGeometry(0.985, 64, 48),
        new THREE.MeshBasicMaterial({ colorWrite: false }),
      );
      occluder.renderOrder = -1;
      spin.add(occluder);

      // soft atmosphere at the limb
      const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.14, 64, 48),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false,
          blending: BLEND,
          vertexShader: /* glsl */ `
            varying vec3 vN;
            varying vec3 vV;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vN = normalize(normalMatrix * normal);
              vV = normalize(-mv.xyz);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            varying vec3 vN;
            varying vec3 vV;
            void main() {
              float rim = pow(clamp(0.72 + dot(vN, vV), 0.0, 1.0), 3.0);
              gl_FragColor = vec4(${INK}, rim * ${light ? "0.07" : "0.16"});
            }`,
        }),
      );
      tilt.add(atmo);

      // ── routes ──────────────────────────────────────────────────────────
      const arcMats: import("three").ShaderMaterial[] = [];
      const curves: import("three").CatmullRomCurve3[] = [];
      const packetPos = new Float32Array(ROUTES.length * 3);
      const packetAlpha = new Float32Array(ROUTES.length);
      const offsets = ROUTES.map((_, i) => (i * 0.37) % 1);
      const disposables: { dispose(): void }[] = [dotGeo, dotMat, occluder.geometry, occluder.material as import("three").Material, atmo.geometry, atmo.material as import("three").Material];

      for (const [a, b] of ROUTES) {
        const A = toXYZ(CITIES[a][0], CITIES[a][1]);
        const B = toXYZ(CITIES[b][0], CITIES[b][1]);
        const angle = A.angleTo(B);
        const lift = 0.1 + 0.32 * (angle / Math.PI);
        const pts: import("three").Vector3[] = [];
        for (let i = 0; i <= 48; i++) {
          const t = i / 48;
          const v = new THREE.Vector3().copy(A).lerp(B, t).normalize(); // slerp-ish on the unit sphere
          pts.push(v.multiplyScalar(1.005 + lift * Math.sin(Math.PI * t)));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        curves.push(curve);
        const geo = new THREE.TubeGeometry(curve, 160, 0.0042, 6, false);
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uHead: { value: 0 } },
          vertexShader: /* glsl */ `
            varying float vU;
            void main() {
              vU = uv.x;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            uniform float uHead;
            varying float vU;
            void main() {
              float d = uHead - vU;
              float tail = smoothstep(-0.004, 0.012, d) * (1.0 - smoothstep(0.0, 0.34, d));
              float a = ${light ? "0.12" : "0.14"} + ${light ? "0.88" : "0.86"} * tail;
              gl_FragColor = vec4(${INK}, a);
            }`,
        });
        arcMats.push(mat);
        spin.add(new THREE.Mesh(geo, mat));
        disposables.push(geo, mat);
      }

      // the packet riding each pulse
      const packetGeo = new THREE.BufferGeometry();
      packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPos, 3));
      packetGeo.setAttribute("aAlpha", new THREE.BufferAttribute(packetAlpha, 1));
      const packetMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: BLEND,
        uniforms: { uPR: { value: pr } },
        vertexShader: /* glsl */ `
          attribute float aAlpha;
          uniform float uPR;
          varying float vA;
          void main() {
            vA = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 22.0 * uPR * (3.4 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float core = smoothstep(0.16, 0.0, d);
            float glow = smoothstep(0.5, 0.0, d) * 0.35;
            float a = (core + glow) * vA;
            if (a < 0.01) discard;
            gl_FragColor = vec4(${INK}, a);
          }`,
      });
      spin.add(new THREE.Points(packetGeo, packetMat));
      disposables.push(packetGeo, packetMat);

      // city markers: a dot inside a breathing ring
      const cityKeys = Object.keys(CITIES) as CityKey[];
      const cityPos = new Float32Array(cityKeys.length * 3);
      cityKeys.forEach((k, i) => toXYZ(CITIES[k][0], CITIES[k][1], 1.006).toArray(cityPos, i * 3));
      const cityGeo = new THREE.BufferGeometry();
      cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
      const cityMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uPR: { value: pr }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uPR;
          varying float vFacing;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vFacing = smoothstep(0.05, 0.4, dot(normalize(normalMatrix * position), normalize(-mv.xyz)));
            gl_PointSize = 30.0 * uPR * (3.4 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying float vFacing;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float r = 0.18 + 0.24 * fract(uTime * 0.45);
            float ring = (smoothstep(r + 0.03, r, d) - smoothstep(r, r - 0.03, d)) * (1.0 - fract(uTime * 0.45));
            float dot_ = smoothstep(0.075, 0.045, d);
            float a = (dot_ + ring * 0.7) * vFacing;
            if (a < 0.01) discard;
            gl_FragColor = vec4(${INK}, a);
          }`,
      });
      spin.add(new THREE.Points(cityGeo, cityMat));
      disposables.push(cityGeo, cityMat);

      // ── framing ─────────────────────────────────────────────────────────
      // The globe rises from the bottom of the hero like a horizon: centred,
      // big, with its upper half in view.
      const frame = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Put the globe's top edge at ~64% of the hero (desktop) / ~70% (phone),
        // so it rises under the buttons instead of behind the copy.
        const narrow = w < 720;
        const dist = narrow ? 6.2 : 4.2;
        const halfH = dist * Math.tan(((camera.fov / 2) * Math.PI) / 180);
        const topAt = narrow ? 0.7 : 0.64;
        camera.position.set(0, 0, dist);
        tilt.position.y = halfH - 1 - 2 * halfH * topAt;
        camera.updateProjectionMatrix();
      };
      frame();
      const ro = new ResizeObserver(frame);
      ro.observe(host);

      // Open on Europe and West Africa (lng ≈ -20°, so a = -90° - lng), then
      // drift west across the Atlantic. Tilting the pole AWAY from the camera
      // brings the 20–50°N band up to the horizon, where the routes live.
      spin.rotation.y = (-70 * Math.PI) / 180;
      const baseTiltX = -0.55;
      tilt.rotation.x = baseTiltX;

      let targetX = 0;
      let targetY = 0;
      const onPointer = (e: PointerEvent) => {
        targetX = (e.clientY / window.innerHeight - 0.5) * 0.12;
        targetY = (e.clientX / window.innerWidth - 0.5) * 0.28;
      };
      if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      const PERIOD = 4.2; // seconds per route cycle
      const setPulses = (t: number) => {
        ROUTES.forEach((_, i) => {
          const c = ((t / PERIOD + offsets[i]) % 1) * 1.45 - 0.05; // head runs past the end, then rests
          arcMats[i].uniforms.uHead.value = c;
          const k = Math.min(Math.max(c, 0), 1);
          curves[i].getPointAt(k).toArray(packetPos, i * 3);
          packetAlpha[i] = c > 0 && c < 1 ? Math.sin(Math.PI * k) * 0.95 + 0.05 : 0;
        });
        packetGeo.attributes.position.needsUpdate = true;
        packetGeo.attributes.aAlpha.needsUpdate = true;
      };

      let raf = 0;
      let running = false;
      let last = performance.now();
      let clock = 0;
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        clock += dt;
        spin.rotation.y += dt * 0.045;
        tilt.rotation.x += (baseTiltX + targetX - tilt.rotation.x) * 0.04;
        tilt.rotation.y += (targetY - tilt.rotation.y) * 0.04;
        cityMat.uniforms.uTime.value = clock;
        setPulses(clock);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      const start = () => {
        if (running || reduce) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };

      if (reduce) {
        setPulses(PERIOD * 0.35);
        renderer.render(scene, camera);
        ro.disconnect();
        const still = new ResizeObserver(() => {
          frame();
          renderer.render(scene, camera);
        });
        still.observe(host);
        cleanup = () => still.disconnect();
      }

      const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
      io.observe(host);
      const onVis = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVis);

      requestAnimationFrame(() => host.setAttribute("data-ready", "1"));

      const prev = cleanup;
      cleanup = () => {
        prev();
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointermove", onPointer);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [tone]);

  return <div ref={hostRef} className="globe" aria-hidden="true" />;
}
