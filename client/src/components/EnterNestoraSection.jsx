import { useLayoutEffect, useRef, useState } from 'react';
import { useLenisScroll } from '../lib/LenisContext';

// Recreates lenis.dev's "Enter Lenis" intro, adapted so the "text" is filled
// with the building photo: a fixed, never-transformed photo sits behind a
// black layer with a "NESTORA" -shaped hole cut out of it (an SVG mask), so
// at rest it reads as the wordmark filled with the photo.
//
// The reveal itself is NOT done by zooming the letterforms. An earlier
// version shrank the SVG's viewBox to make the "T" hole grow to fill the
// screen — but letters have straight edges and corners, so as that zoom
// passed through the glyph's actual ink boundary, the remaining black
// consolidated into lopsided, blocky shapes (following the letter's
// geometry) rather than shrinking symmetrically. No amount of retuning the
// zoom origin or the fade timing fixes that: it's inherent to zooming into
// a non-radially-symmetric shape.
//
// Instead, a plain <circle> is added to the SAME mask, centered on the "T",
// with its radius driven by scroll progress from 0 up to past the screen's
// diagonal. A circle is radially symmetric at every radius by construction
// — there is no orientation for it to look like it's drifting toward. It
// reads as the camera moving through the T: the aperture starts at that
// point and expands outward, consuming the surrounding black uniformly in
// every direction, until it exceeds the screen and the reveal is complete.
// The overlay's opacity never changes — it stays fully opaque the entire
// time; only the growing circular hole ever reveals anything, and the
// black only fully clears once the circle has geometrically covered the
// whole screen, timed to happen right as the scroll gesture completes.
//
// "T"'s position is measured once per size change via the SVG text API
// (getStartPositionOfChar/getEndPositionOfChar — exact glyph metrics), then
// re-measured once document.fonts.ready resolves (the custom "Manrope" font
// can still be loading over the network on a fresh page load when this
// first runs, which would otherwise measure fallback-font metrics).
//
// `dims` is measured from the pinned container itself via ResizeObserver,
// not window.innerWidth/innerHeight — on mobile, CSS vh units and
// window.innerHeight can briefly disagree while the browser's address bar
// animates during a scroll gesture.
//
// Progress through the pinned section runs in two phases: a HOLD where the
// wordmark just sits there readable (the text "comes in straight," no
// reveal yet), then the circular reveal growing all the way to the end of
// the pinned section's scroll range — so the black overlay is present for
// the entire gesture and the reveal finishes exactly as the section
// releases into the next one, with no dead tail either side.

const NESTORA = 'NESTORA';
const T_INDEX = NESTORA.indexOf('T');

const SECTION_HEIGHT_VH = 220;
const HOLD_END = 0.15; // wordmark stays fully still through this point
const CAPTION_FADE_END = HOLD_END; // caption fades out just as the hold ends

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const welcomeRef = useRef(null);
  const captionRef = useRef(null);
  const tCenterRef = useRef({ x: 0, y: 0 });

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

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

  // Locate the "T" glyph's real center so the reveal circle starts exactly
  // there. Re-measured once fonts.ready resolves in case the first pass ran
  // before the custom font had actually loaded.
  useLayoutEffect(() => {
    const t = textRef.current;
    if (!t) return;
    function measure() {
      try {
        const start = t.getStartPositionOfChar(T_INDEX);
        const end = t.getEndPositionOfChar(T_INDEX);
        tCenterRef.current = { x: (start.x + end.x) / 2, y: dims.height / 2 };
      } catch {
        tCenterRef.current = { x: dims.width / 2, y: dims.height / 2 };
      }
      if (circleRef.current) {
        circleRef.current.setAttribute('cx', tCenterRef.current.x);
        circleRef.current.setAttribute('cy', tCenterRef.current.y);
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

    if (circleRef.current) {
      const revealT = Math.min(1, Math.max(0, (progress - HOLD_END) / (1 - HOLD_END)));
      // Eased in — starts slow, accelerates, like a camera picking up speed
      // as it dives through. Max radius is the exact distance from "T" to
      // the farthest screen corner, so full coverage is guaranteed on any
      // aspect ratio or off-center T position, not just a comfortable guess.
      const eased = revealT * revealT;
      const { x: cx, y: cy } = tCenterRef.current;
      const maxRadius = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(dims.width - cx, cy),
        Math.hypot(cx, dims.height - cy),
        Math.hypot(dims.width - cx, dims.height - cy)
      );
      circleRef.current.setAttribute('r', eased * maxRadius);
    }
    const captionT = Math.min(1, Math.max(0, progress / CAPTION_FADE_END));
    if (captionRef.current) captionRef.current.style.opacity = 1 - captionT;
    if (welcomeRef.current) welcomeRef.current.style.opacity = 1 - captionT;
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

        {/* Black layer with a NESTORA-shaped hole (the at-rest wordmark) plus
            a circular hole that grows from the "T" to drive the reveal. The
            overlay's own opacity never changes — only the growing circle
            geometry ever reveals anything, which is what keeps the reveal
            perfectly symmetric at every step. */}
        <svg
          width={dims.width}
          height={dims.height}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="absolute inset-0"
        >
          <mask id="nestora-cutout" maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={dims.width} height={dims.height} fill="white" />
            <text
              ref={textRef}
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
              {NESTORA}
            </text>
            <circle ref={circleRef} cx={dims.width / 2} cy={dims.height / 2} r="0" fill="black" />
          </mask>
          <rect x="0" y="0" width={dims.width} height={dims.height} fill="black" mask="url(#nestora-cutout)" />
        </svg>

        <p
          ref={welcomeRef}
          className="absolute left-0 right-0 text-center text-sm md:text-base tracking-[0.3em] uppercase text-[#faf3e7]/70"
          style={{ top: `calc(50% - ${fontSize * 0.42}px)`, transform: 'translateY(-100%)' }}
        >
          Welcome to
        </p>

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
