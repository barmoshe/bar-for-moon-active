import { ImageResponse } from 'next/og';

// Dynamic share card for the bar-for-moon-active application page, matching
// the page's look — Moon Active's real brand, read live off moonactive.com
// (2026-07-07): a black #000000 canvas, white uppercase display, a chunky
// gold #FFAD00 game-button, and a crescent moon. Rendered by next/og
// (Satori): flexbox-only CSS, plain hex colours, Latin text.

export const alt =
  'Bar Moshe for Moon Active — I build internal tools with AI baked in, idea to production, on Node.js and React. The centerpiece is a game built to prove it.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px 48px',
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* crescent moon, top-right */}
        <div
          style={{
            position: 'absolute',
            top: -70,
            right: -40,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: '#ffe6a6',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -30,
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: '#000000',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>
            <span style={{ display: 'flex', opacity: 0.7, fontWeight: 500, marginRight: 8 }}>BAR FOR</span>
            <span style={{ display: 'flex' }}>MOON</span>
            <span style={{ display: 'flex', color: '#e42313' }}>ACTIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -1,
              textTransform: 'uppercase',
              maxWidth: 820,
            }}
          >
            I build the tools that <span style={{ display: 'flex', color: '#ffad00', marginLeft: 16 }}>ship the fun</span>
          </div>
          <div style={{ display: 'flex', fontSize: 29, color: 'rgba(255,255,255,0.72)', maxWidth: 820 }}>
            Internal tools with AI baked in, idea to production, on Node.js and React.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#ffad00',
              color: '#090821',
              borderRadius: 12,
              padding: '16px 38px',
              fontSize: 27,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Play the build ›
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#ffffff' }}>Bar Moshe</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
