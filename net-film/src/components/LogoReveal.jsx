import React, { useEffect, useState } from 'react';
import { Img, staticFile, useCurrentFrame, interpolate, delayRender, continueRender } from 'remotion';
import { clamp, lerp, easeInOut } from './fx';

export const LOGO_SRC = staticFile('assets/net-logo.png');
// Source PNG is 1254×1254 with transparent padding. Visible artwork bbox: x 37–1228, y 151–1117.
export const LOGO_NATIVE = 1254;

// Make sure the PNG is decoded before any frame renders (also primes the cache used by CSS masks).
const useLogoReady = () => {
  const [handle] = useState(() => delayRender('Loading NET logo'));
  useEffect(() => {
    const img = new Image();
    img.src = LOGO_SRC;
    img.decode().then(() => continueRender(handle)).catch((e) => {
      console.error('NET logo failed to load — check public/assets/net-logo.png', e);
      continueRender(handle);
    });
  }, [handle]);
};

/**
 * The official logo is never redrawn: it is the untouched PNG. Temporary filters (blur/brightness)
 * exist only during the reveal transition; at rest the logo renders with no filter at all.
 * The metallic shine is a separate light layer clipped to the logo's own alpha (mask), so it
 * adds light on top without modifying the artwork.
 */
export const LogoReveal = ({ revealAt = 54, size = 1440, left, top, shines = [8, 50], reflection, settleTo = 0.985, endAt = 150 }) => {
  useLogoReady();
  const f = useCurrentFrame() - revealAt;
  const visible = f >= -2;

  const scale = f < 40 ? lerp(f, [0, 40], [1.1, 1.0]) : lerp(f, [40, endAt - revealAt], [1.0, settleTo], easeInOut);
  const blur = lerp(f, [0, 20], [22, 0]);
  const bright = lerp(f, [0, 30], [1.7, 1]);
  const wipe = lerp(f, [-2, 24], [-20, 125], easeInOut);
  const transitioning = f < 31;

  const shine = (s0) => {
    const p = interpolate(f, [s0, s0 + 24], [-0.4, 1.4], clamp);
    return { pos: `${p * 100}% 0`, o: interpolate(f, [s0, s0 + 4, s0 + 20, s0 + 24], [0, 1, 1, 0], clamp) };
  };

  const maskStyle = {
    WebkitMaskImage: `url(${LOGO_SRC})`, maskImage: `url(${LOGO_SRC})`,
    WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
  };

  const logoImg = (extra = {}) => (
    <Img src={LOGO_SRC} style={{ width: size, height: size, display: 'block', ...extra }} />
  );

  if (!visible) return null;
  return (
    <>
      {/* reflection on the glossy floor (mirror line given by parent) */}
      {reflection && (
        <div style={{ position: 'absolute', left, top: reflection.mirrorY * 2 - top - size, width: size, height: size,
          transform: `scaleY(-1) scale(${scale})`, transformOrigin: '50% 50%',
          opacity: reflection.opacity * interpolate(f, [4, 26], [0, 1], clamp), filter: 'blur(4px) brightness(1.35)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0) 55%)',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.25) 36%, rgba(0,0,0,0) 55%)' }}>
          {logoImg()}
        </div>
      )}
      <div style={{ position: 'absolute', left, top, width: size, height: size, transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
        <div style={{
          filter: transitioning ? `blur(${blur}px) brightness(${bright})` : 'none',
          WebkitMaskImage: transitioning ? `linear-gradient(100deg, #000 ${wipe - 18}%, rgba(0,0,0,0) ${wipe}%)` : 'none',
          maskImage: transitioning ? `linear-gradient(100deg, #000 ${wipe - 18}%, rgba(0,0,0,0) ${wipe}%)` : 'none',
        }}>
          {logoImg()}
        </div>
        {/* specular metallic sweeps, clipped to the logo alpha */}
        {shines.map((s0, i) => {
          const { pos, o } = shine(s0);
          if (o <= 0) return null;
          return (
            <div key={i} style={{ position: 'absolute', inset: 0, ...maskStyle, mixBlendMode: 'screen', opacity: o * (i === 0 ? 0.9 : 0.75),
              background: 'linear-gradient(110deg, rgba(255,255,255,0) 38%, rgba(255,236,196,0.55) 46%, rgba(255,255,255,0.95) 50%, rgba(255,236,196,0.55) 54%, rgba(255,255,255,0) 62%)',
              backgroundSize: '250% 100%', backgroundPosition: pos }} />
          );
        })}
        {/* the reveal edge: a moving bright seam that "machines" the metal into existence */}
        {transitioning && (
          <div style={{ position: 'absolute', inset: 0, ...maskStyle, mixBlendMode: 'screen',
            background: `linear-gradient(100deg, rgba(0,0,0,0) ${wipe - 8}%, rgba(255,246,224,1) ${wipe - 2}%, rgba(95,225,255,0.8) ${wipe}%, rgba(0,0,0,0) ${wipe + 3}%)`,
            filter: 'blur(3px)' }} />
        )}
      </div>
    </>
  );
};
