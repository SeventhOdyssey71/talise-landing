import type { Metadata } from "next";

import LandingV5, { metadata as v5Metadata } from "./v5/page";

/**
 * Production landing = v5: black, monochrome, built from the X header's
 * transfer pass (SF Pro Rounded + Neue Montreal). The composition lives in
 * app/v5; `/` renders it unchanged. Earlier landings stay at /v2, /v3, /v4.
 */
export const metadata: Metadata = v5Metadata;

export const dynamic = "force-dynamic";

export default LandingV5;
