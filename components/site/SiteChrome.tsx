import type { ReactNode } from "react";

import { TaliseMark } from "./marks";

/**
 * The site's chrome: floating glass nav pill, footer, and the page shell that
 * wraps every non-landing page. Server components; no client JS.
 *
 * `current` marks the matching nav link with aria-current="page".
 */

const APP = "https://app.talise.io";

const NAV: { label: string; href: string }[] = [
  { label: "How it works", href: "/#how" },
  { label: "Product", href: "/#features" },
  { label: "Numbers", href: "/analytics" },
  { label: "Support", href: "/support" },
];

const FOOTER: { label: string; href: string }[] = [
  { label: "Support", href: "/support" },
  { label: "Blog", href: "/blog" },
  { label: "Analytics", href: "/analytics" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/** This folder is the landing only: every other page lives on talise.io. */
const SITE = "https://talise.io";
const abs = (href: string) => (href.startsWith("/") && href !== "/" && !href.startsWith("/#") ? SITE + href : href);

export function SiteNav({ current, links = NAV }: { current?: string; links?: { label: string; href: string }[] }) {
  return (
    <header className="nav">
      <nav className="nav-pill" aria-label="Main">
        <a href="/" className="nav-brand" aria-label="Talise home">
          <TaliseMark size={19} />
          <span>talise</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={abs(l.href)} aria-current={current === l.href ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a href={APP} className="nav-login">
            Log in
          </a>
          <a href={APP} className="btn btn-solid btn-sm">
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <a href="/" className="nav-brand" aria-label="Talise home">
          <TaliseMark size={16} />
          <span>talise</span>
        </a>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER.map((l) => (
            <a key={l.href} href={abs(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <span className="label">71Labs</span>
      </div>
    </footer>
  );
}

/**
 * Every non-landing page: skip link, nav pill, a <main> that clears the
 * fixed nav, and the footer. Put a <PageHeader> and the page's own content
 * inside. `bare` drops nav + footer (for focused flows like a pay link).
 */
export function SitePage({
  children,
  current,
  bare = false,
  className = "",
}: {
  children: ReactNode;
  current?: string;
  bare?: boolean;
  className?: string;
}) {
  return (
    <div className={`talise-ui ${className}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {!bare && <SiteNav current={current} />}
      <main id="main" className="page-main">
        {children}
      </main>
      {!bare && <SiteFooter />}
    </div>
  );
}

/** Kicker, title, optional lede and meta line. Left-aligned unless `center`. */
export function PageHeader({
  kicker,
  title,
  lede,
  meta,
  center = false,
  size = "xl",
}: {
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  meta?: ReactNode;
  center?: boolean;
  size?: "xl" | "lg";
}) {
  return (
    <header className={`page-head${center ? " center" : ""}`}>
      {kicker && <p className="kicker">{kicker}</p>}
      <h1 className={`lead ${size === "xl" ? "d-xl" : "d-lg"}`}>{title}</h1>
      {lede && <p className="sub-lg">{lede}</p>}
      {meta && <p className="page-meta">{meta}</p>}
    </header>
  );
}
