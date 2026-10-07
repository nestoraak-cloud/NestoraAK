import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLenisScroll } from '../lib/LenisContext';

// One continuous pinned scene: hero -> 3D skyline.
//
// A single 3D canvas (procedural skyline, see SkylineScene) sits behind a black
// layer with a "NESTORA"-shaped hole, so at rest the wordmark is filled with the
// live city. Scrolling first grows a circular hole from the "T" until the black
// is gone (the camera is already moving, so there's no seam), then the SAME
// camera keeps flying from aerial to street level while three captions swap in.
//
// The reveal is a plain <circle> added to the mask (not a zoom into the
// letterforms): a circle is radially symmetric at every radius, so the black
// can't look like it's sliding toward a corner. Overlay opacity never changes;
// only the growing circle clears it, finishing at REVEAL_END.
//
// "T"'s center is read via the SVG text API and re-read once document.fonts.ready
// resolves (the custom font can still be loading on first paint). `dims` comes
// from a ResizeObserver on the pinned box, not window.innerHeight, because on
// mobile vh and innerHeight disagree while the address bar animates.

const Scene = lazy(() => import('./SkylineScene'));

const NESTORA = 'NESTORA';
const T_INDEX = NESTORA.indexOf('T');

const SCREENS = 6.2; // pinned scroll length, in viewport heights
const TAIL = 0.45; // extra held scroll where the scene dissolves into the next section
const HOLD_END = 0.06; // wordmark sits still through this point
const REVEAL_END = 0.32; // circle has covered the screen by here
const CAPTION_FADE_END = HOLD_END;
// progress thresholds at which the three skyline captions take over
const STOP_AT = [0.34, 0.58, 0.8];
const STOPS = [
  { n: '01', title: 'Delhi NCR, from above', body: 'Gurugram, Noida, Delhi — every neighbourhood we list, in one skyline.' },
  { n: '02', title: 'Closer to what matters', body: 'Metro lines, markets and parks, mapped before you ever visit.' },
  { n: '03', title: 'Find the one that feels like home.', body: 'Verified listings, transparent pricing, zero guesswork.', cta: true },
];

export default function EnterNestoraSection() {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const svgRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const welcomeRef = useRef(null);
  const captionRef = useRef(null);
  const barRef = useRef(null);
  const tCenterRef = useRef({ x: 0, y: 0 });
  const progress = useRef(0);

  const [dims, setDims] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [stop, setStop] = useState(-1);
  const [inView, setInView] = useState(true);

  const webgl = useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  // stop rendering the canvas once the whole scene is scrolled away
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '25% 0px' });
    io.observe(wrapperRef.current);
    return () => io.disconnect();
  }, []);

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

  // Locate the "T" glyph's real center so the reveal circle starts exactly there.
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
    const scrollable = rect.height - dims.height * (1 + TAIL);
    const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    progress.current = p; // drives the 3D camera for the whole scroll

    const revealT = Math.min(1, Math.max(0, (p - HOLD_END) / (REVEAL_END - HOLD_END)));
    if (circleRef.current) {
      // Eased in — starts slow, accelerates, like a camera diving through. Max
      // radius is the exact distance from "T" to the farthest corner, so full
      // coverage is guaranteed on any aspect ratio.
      const { x: cx, y: cy } = tCenterRef.current;
      const maxRadius = Math.max(
        Math.hypot(cx, cy),
        Math.hypot(dims.width - cx, cy),
        Math.hypot(cx, dims.height - cy),
        Math.hypot(dims.width - cx, dims.height - cy)
      );
      circleRef.current.setAttribute('r', revealT * revealT * maxRadius);
    }
    // once fully revealed the overlay has nothing left to draw
    if (svgRef.current) svgRef.current.style.visibility = revealT >= 1 ? 'hidden' : 'visible';

    const captionT = Math.min(1, Math.max(0, p / CAPTION_FADE_END));
    if (captionRef.current) captionRef.current.style.opacity = 1 - captionT;
    if (welcomeRef.current) welcomeRef.current.style.opacity = 1 - captionT;
    if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;

    setStop(p < STOP_AT[0] ? -1 : p < STOP_AT[1] ? 0 : p < STOP_AT[2] ? 1 : 2);
  };

  useLenisScroll(handleScroll);
  useLayoutEffect(() => {
    handleScroll();
  });

  const fontSize = dims.width * 0.18;

  return (
    <section ref={wrapperRef} className="relative bg-[#07060a]" style={{ height: dims.height * (SCREENS + TAIL) }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-dvh overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #07060a 0%, #1c110a 40%, #34200f 62%, #2b1a0e 100%)' }}
      >
        {/* The live 3D city, behind everything */}
        {webgl && (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <Scene progress={progress} active={inView} />
            </Suspense>
          </div>
        )}

        {/* Black layer with a NESTORA-shaped hole (the at-rest wordmark) plus a
            circular hole that grows from the "T" to drive the reveal. */}
        <svg
          ref={svgRef}
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

        {/* Skyline captions, once the black has cleared */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-700 ${
            stop >= 0 ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 md:px-16 pb-14 md:pb-24">
          <div className="relative h-44 md:h-52 max-w-3xl">
            {STOPS.map((s, i) => (
              <div
                key={s.n}
                className={`absolute bottom-0 left-0 transition-all duration-700 ease-out ${
                  stop === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#d97f2e]">{s.n} / 03</p>
                <h2 className="font-display text-4xl md:text-6xl text-[#faf3e7]">{s.title}</h2>
                <p className="mt-4 max-w-md text-base md:text-lg text-[#faf3e7]/70">{s.body}</p>
                {s.cta && (
                  <Link
                    to="/listings"
                    className={`mt-6 inline-block rounded-full bg-[#d97f2e] px-7 py-3 text-sm tracking-wide text-[#1b1610] font-semibold hover:bg-[#b8631a] transition-colors ${
                      stop === i ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                  >
                    Explore Listings
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-4 md:right-8 top-1/2 h-32 w-px -translate-y-1/2 bg-white/15">
          <div ref={barRef} className="h-full origin-top bg-[#d97f2e]" style={{ transform: 'scaleY(0)' }} />
        </div>
      </div>
      {/* Held tail: the final frame stays pinned while this strip rises over it and dissolves the scene into the cream section below. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent to-[#faf3e7]"
        style={{ height: dims.height * TAIL }}
      />
    </section>
  );
}
