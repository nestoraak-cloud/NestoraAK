import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/listings', label: 'Listings' },
  { to: '/map', label: 'Map' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <div className="pointer-events-auto max-w-3xl w-full">
        <nav className="flex items-center justify-between gap-6 px-6 py-3 rounded-full bg-[#faf3e7]/70 backdrop-blur-xl border border-[#261f17]/10 shadow-[0_8px_30px_rgba(31,77,54,0.12)]">
          <Link to="/" className="font-display text-lg tracking-tight text-[#261f17]" onClick={() => setOpen(false)}>
            Nestora<span className="text-[#d97f2e]">.</span>
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-xs font-medium tracking-widest uppercase">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-[#d97f2e] ${isActive ? 'text-[#d97f2e]' : 'text-[#261f17]/70'}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="md:hidden relative w-5 h-4 flex flex-col justify-between shrink-0"
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
              className="block h-0.5 w-full bg-[#261f17] rounded-full origin-center"
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1 }}
              className="block h-0.5 w-full bg-[#261f17] rounded-full"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
              className="block h-0.5 w-full bg-[#261f17] rounded-full origin-center"
            />
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden mt-2 rounded-3xl bg-[#faf3e7]/90 backdrop-blur-xl border border-[#261f17]/10 shadow-[0_8px_30px_rgba(31,77,54,0.12)] overflow-hidden"
            >
              <ul className="flex flex-col py-2 text-sm font-medium tracking-wide uppercase">
                {links.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block px-6 py-3 transition-colors ${isActive ? 'text-[#d97f2e]' : 'text-[#261f17]/70'}`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
