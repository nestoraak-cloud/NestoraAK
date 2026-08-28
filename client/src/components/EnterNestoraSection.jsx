import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask). As
// the user scrolls, that hole scales up around the screen's center, widening
// the window onto the untouched photo beneath. The photo itself never
// scales, so it never blurs.
//
// The zoom is done by shrinking the SVG's `viewBox` rather than a CSS
// `transform: scale()`. Two reasons: a CSS transform on an SVG element gets
// composited by rasterizing it once and stretching that texture, which
// blurs vector content like a bitmap at high zoom. It also builds a
// composited layer sized at (viewport * scale) — at MAX_SCALE on a mobile
// viewport that's several thousand pixels per side, past what mobile GPUs
// can texture, and the layer fails to composite correctly (shows up as the
// layout going haywire on phones). Shrinking viewBox instead makes the
// browser genuinely re-render the mask and text at the new zoom level every
// frame, at their real size — crisp, and no oversized layer.
//
// Zoom origin is the screen's exact center — the formula below keeps that
// point fixed on screen at every scale, so centering on it produces zero
// drift. Since "NESTORA" itself is centered on screen, this still reads as
// zooming into the middle of the word.

const SECTION_HEIGHT_VH = 300;
const MAX_SCALE = 16;
// The black/text mask fades out over this tail of the zoom, guaranteeing a
// clean "fully revealed photo" end state regardless of exact mask geometry.
const OVERLAY_FADE_START = 0.85;
const CAPTION_FADE_END = 0.12;

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const captionRef = useRef(null);

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  useLayoutEffect(() => {
    function onResize() {
      setDims({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (svgRef.current) {
      const scale = 1 + progress * (MAX_SCALE - 1);

      // Origin is the screen center, so this always resolves to a
      // perfectly centered viewBox at every scale — no drift.
      const originX = dims.width / 2;
      const originY = dims.height / 2;
      const visibleW = dims.width / scale;
      const visibleH = dims.height / scale;
      const minX = originX * (1 - 1 / scale);
      const minY = originY * (1 - 1 / scale);
      svgRef.current.setAttribute('viewBox', `${minX} ${minY} ${visibleW} ${visibleH}`);

      const fadeT = Math.min(1, Math.max(0, (progress - OVERLAY_FADE_START) / (1 - OVERLAY_FADE_START)));
      svgRef.current.style.opacity = 1 - fadeT;
    }
    if (captionRef.current) {
      const captionT = Math.min(1, Math.max(0, progress / CAPTION_FADE_END));
      captionRef.current.style.opacity = 1 - captionT;
    }
  };

  useLenisScroll(handleScroll);
  useLayoutEffect(() => {
    handleScroll();
  });

  const fontSize = dims.width * 0.18;

  return (
    <section ref={wrapperRef} className="relative bg-black" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {/* Fixed background photo — never transformed, so it never blurs */}
        <img
          src="/hero/scene-0.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Black layer with a NESTORA-shaped hole, cut via SVG mask. Zoom is
            done via viewBox (not a CSS transform) so the vector content is
            genuinely re-rendered crisp at every zoom level, with no
            oversized composited layer. */}
        <svg
          ref={svgRef}
          width={dims.width}
          height={dims.height}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="absolute inset-0"
          style={{ willChange: 'opacity' }}
        >
          <mask id="nestora-cutout" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={dims.width} height={dims.height} fill="white" />
            <text
              x={dims.width / 2}
              y={dims.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Manrope', system-ui, sans-serif"
              fontWeight="800"
              fontSize={fontSize}
              letterSpacing={-fontSize * 0.03}
              fill="black"
            >
              NESTORA
            </text>
          </mask>
          <rect x="0" y="0" width={dims.width} height={dims.height} fill="black" mask="url(#nestora-cutout)" />
        </svg>

        <p
          ref={captionRef}
          className="absolute left-0 right-0 text-center text-sm md:text-base tracking-[0.3em] uppercase text-[#faf3e7]/70"
          style={{ top: `calc(50% + ${fontSize * 0.42}px)` }}
        >
          by Akash Khatri
        </p>
      </div>
    </section>
  );
}
