import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask). As
// the user scrolls, that hole scales up around the "T", widening the window
// onto the untouched photo beneath. The photo itself never scales, so it
// never blurs.
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
// The zoom origin is ALWAYS the screen's exact geometric center — that
// formula is provably drift-free at every scale (proven and reverified
// multiple times: the center of the viewBox stays locked to width/2,
// height/2 regardless of scale). Two earlier attempts made the origin the
// "T" glyph's own position instead, so the zoom would visibly glide toward
// it as scale increased — that read as the black overlay "sliding off
// toward a corner," which is exactly what wasn't wanted.
//
// To still have the zoom land on "T" (not just the middle of the whole
// word), the TEXT itself is positioned horizontally so the T glyph's center
// coincides with the screen's center. That position is computed directly
// from glyph metrics via the SVG text API's getSubStringLength — which
// measures advance widths independent of the text element's actual x
// position — so it's an exact, one-shot formula, not an iterative
// measure-then-correct pass (which requires the text to already be
// positioned somewhere to measure, so it only partially converges in one
// pass). Runs once per size change, not per scroll frame. "T" ends up
// sitting exactly where the drift-free zoom already converges to, with no
// need to ever move the zoom's own origin off center.
//
// `dims` is measured from the pinned container itself via ResizeObserver,
// not from window.innerWidth/innerHeight. On mobile, CSS vh units (what
// `h-dvh` resolves from) and window.innerHeight can briefly disagree while
// the browser's address bar animates in or out during a scroll gesture —
// if the SVG's declared width/height/viewBox are sized off
// window.innerHeight while its actual rendered box is sized off vh, the two
// drift out of sync and the zoom appears to shift. Measuring the real
// rendered box directly removes that mismatch entirely, regardless of what
// the address bar is doing.
//
// Progress through the pinned section runs in three phases: a HOLD where
// the wordmark just sits there readable (the text "comes in straight," no
// zoom yet), a ZOOM into the T with the overlay fading out near the end of
// it, and a short tail where the fully-revealed photo is visible on its own
// before the next section takes over — kept brief so it reads as a quick
// reveal, not extra scrolling with nothing happening.

const NESTORA = 'NESTORA';
const T_INDEX = NESTORA.indexOf('T');

const SECTION_HEIGHT_VH = 220;
const MAX_SCALE = 16;
const HOLD_END = 0.15; // wordmark stays fully still through this point
const SCALE_END = 0.82; // scale finishes ramping here
const OVERLAY_FADE_START = 0.68; // overlay fade runs inside the back part of the zoom
const OVERLAY_FADE_END = 0.82; // ...and finishes exactly as the zoom does
const CAPTION_FADE_END = HOLD_END; // caption fades out just as the hold ends

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const captionRef = useRef(null);

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [textX, setTextX] = useState(() => window.innerWidth / 2);

  useLayoutEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    function measure() {
      const rect = el.getBoundingClientRect();
      setDims({ width: rect.width, height: rect.height });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute the text's x position so the "T" glyph's center lands exactly
  // on the screen's center. getSubStringLength measures advance widths from
  // glyph metrics alone — independent of the text element's current x — so
  // this is an exact, one-shot formula: no render-measure-correct loop.
  //
  // Measured twice: once immediately (using whatever font is available at
  // that instant) and again once document.fonts.ready resolves. On a fresh
  // page load the custom "Manrope" font is often still loading over the
  // network when this first runs, so that first pass can measure fallback-
  // font metrics — correct once the real font is actually in.
  useLayoutEffect(() => {
    const t = textRef.current;
    if (!t) return;
    function measure() {
      try {
        const totalWidth = t.getSubStringLength(0, NESTORA.length);
        const prefixWidth = t.getSubStringLength(0, T_INDEX);
        const tWidth = t.getSubStringLength(T_INDEX, 1);
        setTextX(dims.width / 2 + totalWidth / 2 - prefixWidth - tWidth / 2);
      } catch {
        setTextX(dims.width / 2);
      }
    }
    measure();
    document.fonts.ready.then(measure);
  }, [dims]);

  const handleScroll = () => {
    const el = wrapperRef.current;
    if (!el || !dims.height) return;
    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - dims.height;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    if (svgRef.current) {
      const zoomT = Math.min(1, Math.max(0, (progress - HOLD_END) / (SCALE_END - HOLD_END)));
      const scale = 1 + zoomT * (MAX_SCALE - 1);

      // Origin is always the screen center — provably zero drift at every
      // scale. The text itself (see above) is shifted so "T" sits there.
      const originX = dims.width / 2;
      const originY = dims.height / 2;
      const visibleW = dims.width / scale;
      const visibleH = dims.height / scale;
      const minX = originX * (1 - 1 / scale);
      const minY = originY * (1 - 1 / scale);
      svgRef.current.setAttribute('viewBox', `${minX} ${minY} ${visibleW} ${visibleH}`);

      const fadeT = Math.min(
        1,
        Math.max(0, (progress - OVERLAY_FADE_START) / (OVERLAY_FADE_END - OVERLAY_FADE_START))
      );
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
      <div ref={stickyRef} className="sticky top-0 h-dvh overflow-hidden bg-black">
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
              ref={textRef}
              x={textX}
              y={dims.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Manrope', system-ui, sans-serif"
              fontWeight="800"
              fontSize={fontSize}
              letterSpacing={-fontSize * 0.03}
              fill="black"
            >
              {NESTORA}
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
