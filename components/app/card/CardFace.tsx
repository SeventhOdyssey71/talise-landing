import { HugeiconsIcon } from "@hugeicons/react";
import { SnowIcon } from "@hugeicons/core-free-icons";
import { TALISE_MARK_PATH, TaliseMark } from "@/components/site/marks";

/**
 * The Talise card: the same object on web, iOS and Android
 * (./DESIGN.md). It stays dark in both appearances, like a real
 * card would, and carries only the mark, the last four and the network; name,
 * expiry and CVV live behind Details.
 *
 * Its signature is the Talise mark, oversized and faint, bleeding off the
 * bottom-right corner. `pending` dims the content while the card isn't
 * spendable yet; `frozen` softens it and says "Frozen" in words.
 */
export function CardFace({
  last4,
  network,
  state = "live",
}: {
  last4?: string | null;
  network?: "visa" | "mastercard" | null;
  state?: "live" | "pending" | "frozen";
}) {
  const label = ["Talise card", network === "visa" ? "Visa" : network === "mastercard" ? "Mastercard" : null, last4 ? `ending ${last4}` : null, state === "frozen" ? "frozen" : null]
    .filter(Boolean)
    .join(", ");
  return (
    <div
      className="relative mx-auto aspect-[1.586] w-full max-w-[360px] select-none overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#2e2e2e,#0a0a0a)] text-white shadow-[0_14px_24px_rgb(0_0_0/0.2)]"
      role="img"
      aria-label={label}
    >
      {/* One soft light just above the top-left corner. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-10%,rgb(255_255_255/0.14),transparent_85%)]"
      />
      {/* The watermark: the mark at 125% of the card's height, centred at
          (82%, 70%), so it runs off the bottom-right corner. */}
      <svg
        aria-hidden
        viewBox="0 0 583 533"
        className="pointer-events-none absolute left-[82%] top-[70%] h-[125%] w-auto -translate-x-1/2 -translate-y-1/2 text-white/[0.06]"
      >
        <path fill="currentColor" d={TALISE_MARK_PATH} />
      </svg>

      <div
        className={`relative flex h-full flex-col justify-between p-6 ${state === "pending" ? "opacity-50" : ""} ${state === "frozen" ? "blur-[5px]" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2">
            <TaliseMark size={18} />
            <span className="font-display text-[20px] leading-none tracking-[-0.4px]">talise</span>
          </span>
          <span className="text-[12px] leading-none text-white/60">Virtual</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <span className="font-display text-[19px] leading-none tabular-nums tracking-[1.2px]">•• {last4 ?? "••••"}</span>
          <NetworkMark network={network} />
        </div>
      </div>

      {state === "frozen" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-[18px] py-2.5 text-[15px] font-medium text-[#0a0a0a] shadow-[0_6px_14px_rgb(0_0_0/0.18)]">
            <HugeiconsIcon icon={SnowIcon} size={16} strokeWidth={2} aria-hidden />
            Frozen
          </span>
        </span>
      )}

      {/* The edge, drawn inside so it stays visible on a black page. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/12" />
    </div>
  );
}

/** The network's own mark: the white Visa wordmark, or Mastercard's two circles
 *  in their brand colours (the only colour on the card). Unknown: nothing. */
function NetworkMark({ network }: { network?: "visa" | "mastercard" | null }) {
  if (network === "visa") {
    // eslint-disable-next-line @next/next/no-img-element -- a tiny static mark
    return <img src="/brand/visa-white.png" alt="" aria-hidden width={68} height={22} className="h-[22px] w-auto" />;
  }
  if (network === "mastercard") {
    return (
      <span aria-hidden className="flex h-7 items-center">
        <span className="size-7 rounded-full bg-[#eb001b]" />
        <span className="-ml-[11px] size-7 rounded-full bg-[#f79e1b]/90" />
      </span>
    );
  }
  return null;
}
