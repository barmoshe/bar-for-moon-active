import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

// Root layout. The page-level metadata (rich OG card, fonts, copy) lives in
// app/page.tsx; this just establishes the document shell. English, LTR.
export const metadata: Metadata = {
  metadataBase: new URL("https://bar-for-moon-active.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
    <Script
      src="https://bar-for-companies.vercel.app/track.js"
      data-bar-for-id="moon-active"
      strategy="afterInteractive"
    />
{children}</body>
    </html>
  );
}
