import QRCode from "qrcode";

/** The Talise symbol's outline, in a 583 × 533 box. */
export const TALISE_MARK_PATH =
  "M375.231 85.2803C375.232 120.604 403.867 149.24 439.191 149.24H582.036V195.141C582.036 275.133 517.696 340.098 437.943 341.108L435.271 341.125C402.04 341.546 375.232 368.614 375.231 401.944V533H345.384C260.606 533 191.88 464.274 191.88 379.496V341.12H0V303.18C8.18875e-05 219.067 67.6907 150.62 151.798 149.686L191.875 149.24V341.119H427.871C396.135 332.728 367.039 316.441 343.293 293.774L191.876 149.24H191.88V63.96C191.88 28.6358 220.516 0 255.84 0H375.231V85.2803Z";

/** The Talise symbol, from web/public/brand/talise-symbol-*.svg. Inherits colour. */
export function TaliseMark({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 583 533" height={size} width={(size * 583) / 533} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={TALISE_MARK_PATH} />
    </svg>
  );
}

/** Paper-plane "send" glyph used between the two ends of a route. */
export function SendGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21.5 2.5 10.6 13.4" />
      <path d="m21.5 2.5-6.9 19-4-8.1-8.1-4z" />
    </svg>
  );
}

/**
 * A real, scannable QR as crisp SVG modules — rendered on the server, no
 * canvas, no image request. Black modules on a white tile with its own quiet
 * zone, so it scans off a dark page.
 */
export function Qr({ value, size, label }: { value: string; size: number; label: string }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const data = qr.modules.data;
  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (data[y * n + x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return (
    <span className="qr">
      <svg
        viewBox={`0 0 ${n} ${n}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
        role="img"
        aria-label={label}
      >
        <path d={d} fill="#000" />
      </svg>
    </span>
  );
}
