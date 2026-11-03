/**
 * Avatar gradients: one curated set shared by the wallet (each account gets
 * one, picked from the account so it never changes) and the landing's sample
 * people (each name has a fixed colour across every scene).
 *
 * Identity colour, not theme colour, which is why it lives here rather than in
 * the design tokens. A soft light from the top-left gives every avatar the
 * same glossy, raised look.
 */

export const AVATAR_GRADIENTS: readonly [string, string][] = [
  ["#f472d0", "#b5179e"], // 0 magenta
  ["#a78bfa", "#6d28d9"], // 1 violet
  ["#60a5fa", "#1d4ed8"], // 2 blue
  ["#2dd4bf", "#0f766e"], // 3 teal
  ["#fdba74", "#ea580c"], // 4 orange
  ["#fb7185", "#be123c"], // 5 rose
];

/** The gradient at a fixed index (wraps). */
export function avatarGradientAt(i: number): string {
  const [from, to] = AVATAR_GRADIENTS[((i % AVATAR_GRADIENTS.length) + AVATAR_GRADIENTS.length) % AVATAR_GRADIENTS.length];
  return `radial-gradient(120% 120% at 28% 18%, rgb(255 255 255 / 0.38), transparent 46%), linear-gradient(150deg, ${from}, ${to})`;
}

/** A stable gradient for any seed (email, id, handle). */
export function avatarGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return avatarGradientAt(Math.abs(h));
}
