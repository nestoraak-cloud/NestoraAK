import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLenisScroll } from '../lib/LenisContext';

// Pinned scroll section: a procedural 3D skyline whose camera flies from an
// aerial view down to street level at the foot of the hero tower, driven by
// scroll progress (same pinned-section pattern as EnterNestoraSection).
// three.js loads lazily the first time the section is near the viewport and
// stops rendering once it's scrolled away.

const Scene = lazy(() => import('./SkylineScene'));

const SECTION_HEIGHT_VH = 400;
const STOPS = [
  { n: '01', title: 'Delhi NCR, from above', body: 'Gurugram, Noida, Delhi — every neighbourhood we list, in one skyline.' },
  { n: '02', title: 'Closer to what matters', body: 'Metro lines, markets and parks, mapped before you ever visit.' },
  { n: '03', title: 'Find the one that feels like home.', body: 'Verified listings, transparent pricing, zero guesswork.', cta: true },
];

export default function SkylineSection() {
  const wrapRef = useRef(null);
  const stickyRef = useRef(null);
  const barRef = useRef(null);
  const progress = useRef(0);
  const [stop, setStop] = useState(0);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);

  const webgl = useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { rootMargin: '50% 0px' }
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  const handleScroll = () => {
    const wrap = wrapRef.current;
    const sticky = stickyRef.current;
    if (!wrap || !sticky) return;
    const scrollable = wrap.getBoundingClientRect().height - sticky.getBoundingClientRect().height;
    const p = scrollable > 0 ? Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / scrollable)) : 0;
    progress.current = p;
    if (barRef.current) barRef.current.style.transform = `scaleY(${p})`;
    setStop(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
  };

  useLenisScroll(handleScroll);
  useEffect(handleScroll, []);

  return (
    <section ref={wrapRef} className="relative bg-[#07060a]" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-dvh overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #07060a 0%, #1c110a 40%, #34200f 62%, #2b1a0e 100%)' }}
      >
        {webgl && mounted && (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <Scene progress={progress} active={inView} />
            </Suspense>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

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
    </section>
  );
}
