import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import MoonApp from "@/src/marketing/moon/MoonApp";

// Moon Active's real marketing face (read live off moonactive.com,
// 2026-07-07) sets its display type in a bold, wide-tracked geometric sans
// (their commercial filson-pro). Poppins is a free geometric substitute that
// carries the same friendly, playful uppercase register for both the big
// headlines and the body.
const sans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ma-sans",
  display: "swap",
});

// Personalized application page for Bar Moshe's application to Moon Active
// for the Full Stack Developer (R&D) role (Tel Aviv; internal tools with AI
// baked in, on Node.js + React). Built as a faithful replica of Moon
// Active's own visual language, read live off moonactive.com (2026-07-07):
// a black #000000 hero canvas, deep-navy #041852 game sections, chunky gold
// #FFAD00 game-buttons, cyan #01AFE8 section headers, and bold uppercase
// display. The centerpiece is "Ship It!", an embedded Coin Master-style
// mini-game (built separately, mounted where the placeholder now stands).
// Every shape is drawn fresh as original SVG/CSS; no Moon Active asset is
// used. Noindex, a shareable link sent with the application.
const ogTitle = "Bar Moshe — for Moon Active";
const ogDescription =
  "I build internal tools with AI baked in, idea to production, on Node.js and React. That is the R&D role, and this whole page (game included) is the proof.";

export const metadata: Metadata = {
  title: ogTitle,
  description: ogDescription,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Bar Moshe",
    title: ogTitle,
    description: ogDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@barmoshe1",
    creator: "@barmoshe1",
    title: ogTitle,
    description: ogDescription,
  },
};

export default function MoonActivePage() {
  return (
    <div className={sans.variable}>
      <MoonApp />
    </div>
  );
}
