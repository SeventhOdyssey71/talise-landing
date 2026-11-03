import type { Metadata } from "next";

import "./v5.css";
import { AbroadScene } from "./AbroadScene";
import { CardScene } from "./CardScene";
import { HeroBubbles } from "./HeroBubbles";
import { HeroGlobe } from "./HeroGlobe";
import { LandingMotion } from "./LandingMotion";
import { NamesScene } from "./NamesScene";
import { ReceiveScene } from "./ReceiveScene";
import { SendScene } from "./SendScene";
import { Solutions } from "./Solutions";
import { Qr, TaliseMark } from "@/components/site/marks";
import { CountUp, InView } from "@/components/site/motion";
import { SiteFooter, SiteNav } from "@/components/site/SiteChrome";

/**
 * TALISE — the landing. Black-and-white monochrome: light grey and white
 * sections, with black bands set into the page; glass where things float,
 * film grain over everything. Motion is GSAP + ScrollTrigger on Lenis.
 *
 *   hero      light · three.js dot globe + glass message bubbles (sent,
 *             received, requested, claimed) that follow the cursor
 *   names     black · pinned: a 66-char address scrambles into @maya; rows of
 *             names slide with the scroll
 *   send      light · pinned: the transfer pass played by the scroll — name,
 *             amount, $0.00 gas, the plane crosses, "Settled" stamps the stub
 *   receive   black · payments land on a glass phone, the balance climbs
 *   product   light · three cards with live illustrations (globe, accounts,
 *             rails), then ticket cards
 *   card      black · the Talise card turns to face the reader, two payments
 *             float beside it
 *   abroad    light · every country the balance can pay, and how
 *   numbers   black · the live receipt, counting up
 *   close     light · glass card
 *
 * Every scene renders its final state for prefers-reduced-motion, and all
 * real copy is in the HTML (decorative stages are aria-hidden).
 *
 * Claims, checked against the house rules:
 *   · USDsui transfers are gasless ON THE SUI NETWORK. Talise does not pay or
 *     sponsor gas — never "gas is on us".
 *   · Speed is "under a second" / "< 1s", never "in seconds".
 *   · Gasless is not free: ramps, bridge and swap carry fees — nothing here
 *     says the product is free, only that opening an account is.
 */

export const metadata: Metadata = {
  title: "Talise — dollars that move like messages",
  description:
    "Hold dollars, send them to a name, spend them with a card and pay banks in over 15 countries. USDsui transfers are gasless on the Sui Network and settle in under a second.",
};

export const dynamic = "force-dynamic";

const APP = "https://app.talise.io";

const LANDING_NAV = [
  { label: "How it works", href: "#how" },
  { label: "Product", href: "#product" },
  { label: "Card", href: "#card" },
  { label: "Abroad", href: "#abroad" },
  { label: "Numbers", href: "#numbers" },
  { label: "Support", href: "/support" },
];

type Analytics = {
  settled?: { volumeUsd?: number; txCount?: number; activeAccounts?: number };
  community?: { accounts?: number };
};

async function getStats(): Promise<Analytics | null> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.talise.io";
    const r = await fetch(`${base}/api/analytics`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return (await r.json()) as Analytics;
  } catch {
    // Fails to nothing, never to zero — a zero reads as "nobody uses this".
    return null;
  }
}

type Field = { label: string; value: string };

const FEATURES: { kicker: string; title: string; body: string; stub: Field[] | "goal" }[] = [
  {
    kicker: "Earn",
    title: "Idle dollars go to work",
    body: "Earn on what sits still. Paid daily, withdrawable any time.",
    stub: [
      { label: "Paid", value: "Daily" },
      { label: "Lock-up", value: "None" },
      { label: "Withdraw", value: "Any time" },
    ],
  },
  {
    kicker: "Goals",
    title: "Save toward something",
    body: "Name a target, move money toward it, and keep earning on the way.",
    stub: "goal",
  },
  {
    kicker: "Cheques",
    title: "Send money as a link",
    body: "Write a cheque, share the link, and whoever holds it can claim the dollars.",
    stub: [
      { label: "Cheque", value: "$50.00" },
      { label: "Claim with", value: "A link" },
    ],
  },
  {
    kicker: "Talise Copilot",
    title: "Ask, then confirm",
    body: "Say it in plain words — “send $20 to @maya” — check what it prepared, and confirm.",
    stub: [
      { label: "You", value: "Send $20 to @maya" },
      { label: "Copilot", value: "Ready to confirm" },
    ],
  },
  {
    kicker: "Naira in and out",
    title: "Your bank, both ways",
    body: "Add money by bank transfer in naira, and cash out to any Nigerian bank account.",
    stub: [
      { label: "Add money", value: "Bank transfer" },
      { label: "Cash out", value: "Any Nigerian bank" },
    ],
  },
  {
    kicker: "Scan to pay",
    title: "Pay a bank QR with dollars",
    body: "Scan a Nigerian bank QR and pay it from your dollar balance. They get naira.",
    stub: [
      { label: "Scan", value: "Bank QR" },
      { label: "They get", value: "Naira" },
    ],
  },
];

export default async function LandingV5() {
  const stats = await getStats();
  const volume = stats?.settled?.volumeUsd;
  const txs = stats?.settled?.txCount;
  const accounts = stats?.community?.accounts;

  return (
    <div className="talise-ui landing">
      <LandingMotion />
      <div className="grain-layer" aria-hidden="true" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteNav links={LANDING_NAV} />

      <main id="main">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="hero">
          <span className="hero-wash" aria-hidden="true" />
          <HeroGlobe tone="light" />
          <div className="wrap hero-copy">
            <h1 className="lead d-hero rise">Dollars that move like&nbsp;messages.</h1>
            <p className="sub-lg rise" style={{ animationDelay: "80ms" }}>
              Hold dollars, send them to a name, spend them with a card, and pay banks in over 15 countries.
              USDsui transfers are gasless on the Sui Network and settle in under a&nbsp;second.
            </p>
            <div className="hero-actions rise" style={{ animationDelay: "160ms" }}>
              <a href={APP} className="btn btn-solid">
                Get started
              </a>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
          </div>
          <HeroBubbles />
        </section>

        <NamesScene />

        <SendScene qr={<Qr value="https://app.talise.io" size={82} label="QR code that opens app.talise.io" />} />

        <ReceiveScene qr={<Qr value="https://talise.io" size={64} label="QR code that opens talise.io" />} />

        {/* ── Product: three live cards, then the rest ────────────────────── */}
        <section id="product" className="section">
          <div className="wrap">
            <InView className="section-head">
              <p className="kicker">What you can do</p>
              <h2 className="lead d-lg">One account. Every way money&nbsp;moves.</h2>
            </InView>
            <Solutions />

            <div className="fgrid feat-grid">
              {FEATURES.map((f, i) => (
                <InView key={f.title} as="article" className="fcard" index={i % 2}>
                  <div className="fcard-body">
                    <p className="kicker">{f.kicker}</p>
                    <h3 className="lead d-card">{f.title}</h3>
                    <p className="sub">{f.body}</p>
                  </div>
                  <div className="fcard-stub">
                    <Stub stub={f.stub} />
                  </div>
                </InView>
              ))}
            </div>
          </div>
        </section>

        <CardScene />

        <AbroadScene />

        {/* ── Numbers, as a receipt ───────────────────────────────────────── */}
        <section id="numbers" className="numbers band theme-dark">
          <div className="wrap">
            <InView className="section-head center">
              <p className="kicker">Live, from production</p>
              <h2 className="lead d-lg">Already moving real money</h2>
            </InView>
            <InView className="receipt">
              <div className="receipt-head">
                <span className="tpass-brand">
                  <TaliseMark size={16} />
                  talise
                </span>
                <span className="label">Refreshed every 5 minutes</span>
              </div>
              <dl className="receipt-fields">
                <Stat label="Settlement">&lt; 1s</Stat>
                {volume != null && (
                  <Stat label="Settled on chain">
                    <CountUp value={volume} format="money" />
                  </Stat>
                )}
                {txs != null && (
                  <Stat label="Transactions">
                    <CountUp value={txs} format="count" />
                  </Stat>
                )}
                {accounts != null && (
                  <Stat label="Accounts">
                    <CountUp value={accounts} format="count" />
                  </Stat>
                )}
              </dl>
            </InView>
          </div>
        </section>

        {/* ── Close ───────────────────────────────────────────────────────── */}
        <section className="section close">
          <span className="close-orb close-orb-a" aria-hidden="true" />
          <span className="close-orb close-orb-b" aria-hidden="true" />
          <InView className="wrap">
            <div className="close-card">
              <h2 className="lead d-xl">Open an account in about twenty&nbsp;seconds</h2>
              <p className="sub-lg">Sign in with Google or Apple. No seed phrase, no address to copy.</p>
              <div className="hero-actions">
                <a href={APP} className="btn btn-solid">
                  Get started
                </a>
              </div>
            </div>
          </InView>
        </section>
      </main>

      <div className="theme-dark footer-band">
        <SiteFooter />
      </div>
    </div>
  );
}

function Stub({ stub }: { stub: Field[] | "goal" }) {
  if (stub === "goal") {
    return (
      <div className="goal">
        <div className="goal-row">
          <span className="label">Lagos trip</span>
          <span className="value num">
            $640 <span className="dim">of $1,000</span>
          </span>
        </div>
        <div className="goal-bar" role="presentation">
          <span style={{ width: "64%" }} />
        </div>
      </div>
    );
  }
  return (
    <dl className="fields">
      {stub.map((s) => (
        <div key={s.label}>
          <dt className="label">{s.label}</dt>
          <dd className="value num">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="stat num">{children}</dd>
    </div>
  );
}
