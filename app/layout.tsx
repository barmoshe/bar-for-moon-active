import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
