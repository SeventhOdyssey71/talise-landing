import { InView } from "@/components/site/motion";

/**
 * Sending abroad: where the dollar balance can pay, country by country, and
 * how each one is paid. Every rail listed is live in the apps (the corridor
 * list in lib/nuvion/corridors.ts); the counts are the countries it covers
 * (the UK, the 20 euro countries listed, and 15 more), with SWIFT for the rest.
 */

type Place = { flag: string | null; name: string; how: string };

const PLACES: Place[] = [
  { flag: "gb", name: "United Kingdom", how: "Bank transfer" },
  { flag: "eu", name: "Europe", how: "SEPA transfer" },
  { flag: "us", name: "United States", how: "ACH, wire, Zelle" },
  { flag: "ca", name: "Canada", how: "Interac, bank" },
  { flag: "ng", name: "Nigeria", how: "Bank transfer" },
  { flag: "ke", name: "Kenya", how: "M-Pesa, Airtel, bank" },
  { flag: "gh", name: "Ghana", how: "Mobile money, bank" },
  { flag: "tz", name: "Tanzania", how: "Mobile money, bank" },
  { flag: "ug", name: "Uganda", how: "Bank transfer" },
  { flag: "za", name: "South Africa", how: "Bank transfer" },
  { flag: "ae", name: "UAE", how: "Bank transfer" },
  { flag: "au", name: "Australia", how: "Bank transfer" },
  { flag: "sg", name: "Singapore", how: "FAST transfer" },
  { flag: "ph", name: "Philippines", how: "InstaPay, PESONet" },
  { flag: "hk", name: "Hong Kong", how: "Bank transfer" },
  { flag: "cn", name: "China", how: "Bank transfer" },
  { flag: "mx", name: "Mexico", how: "CLABE transfer" },
  { flag: null, name: "Everywhere else", how: "SWIFT, in dollars" },
];

export function AbroadScene() {
  return (
    <section id="abroad" className="section abroad" aria-labelledby="abroad-title">
      <div className="wrap">
        <InView className="section-head">
          <p className="kicker">Send abroad</p>
          <h2 id="abroad-title" className="lead d-lg">
            Pay a bank or mobile wallet in over 30&nbsp;countries.
          </h2>
          <p className="sub-lg ab-sub">
            Pick a country, add who you&rsquo;re paying, and send from your dollar balance. They get it in their own
            currency.
          </p>
        </InView>
        <ul className="ab-grid">
          {PLACES.map((p, i) => (
            <InView key={p.name} as="li" className="ab-place" index={i % 6}>
              {p.flag ? (
                <img className="ab-flag" src={`/flags/${p.flag}.svg`} alt="" width={36} height={36} />
              ) : (
                <span className="ab-flag ab-globe" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
                  </svg>
                </span>
              )}
              <span className="ab-text">
                <span className="ab-name">{p.name}</span>
                <span className="ab-how">{p.how}</span>
              </span>
            </InView>
          ))}
        </ul>
      </div>
    </section>
  );
}
