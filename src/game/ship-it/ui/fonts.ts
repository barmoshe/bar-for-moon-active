/**
 * fonts.ts — the two font stacks (art-direction §10). The DISPLAY face is a rounded friendly
 * display for big numbers and the SHIPPED! banner (Baloo 2 / Fredoka when the host page provides
 * it); BODY is the site font (Poppins) with graceful system fallbacks so standalone dev and any
 * host that has not loaded the webfont still render cleanly.
 *
 * The game does NOT fetch webfonts itself (self-contained, no network). At embed time the site
 * already serves Poppins; standalone dev falls back to the rounded system stack.
 */

export const DISPLAY_FONT =
  '"Baloo 2", "Fredoka", "Poppins", "Segoe UI Rounded", "SF Pro Rounded", system-ui, sans-serif';

export const BODY_FONT = '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
