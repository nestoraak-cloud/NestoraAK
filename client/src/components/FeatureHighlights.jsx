import { motion } from 'framer-motion';
import { STOP_ICONS } from './graphics/StopIcons';
import Tilt from './Tilt';

const features = [
  { num: '01', title: 'Premium Interiors', body: 'Light-filled floors, balconies on every home, and finishes built to last generations.' },
  { num: '02', title: 'Landscaped Grounds', body: 'Courtyards, paved walkways, and greenery around every tower — designed for everyday life, not just the lobby.' },
  { num: '03', title: 'Prime Locations', body: 'Walk to metro, markets, and parks in every neighbourhood we list across the capital.' },
  { num: '04', title: 'Verified & Transparent', body: 'RERA-registered projects, clear legal titles, and transparent pricing — invest with complete peace of mind.' },
];

export default function FeatureHighlights() {
  return (
    <section className="bg-[#faf3e7] py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
        {features.map((f, i) => {
          const Icon = STOP_ICONS[f.num];
          return (
            // Cards swing up out of the page on scroll (rotateX reveal), then tilt toward the cursor.
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 80, rotateX: -32 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: (i % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 900 }}
            >
              <Tilt
                className="h-full"
                innerClassName="h-full rounded-2xl border border-[#261f17]/10 bg-white/60 p-7 md:p-9 shadow-[0_24px_60px_-28px_rgba(38,31,23,0.35)] backdrop-blur"
              >
                <div className="flex items-center gap-3 text-[#d97f2e] [transform:translateZ(36px)]">
                  <Icon />
                  <span className="font-display text-sm">{f.num}</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-[#261f17] mt-4 [transform:translateZ(54px)]">{f.title}</h3>
                <p className="mt-3 text-[#261f17]/60 max-w-sm [transform:translateZ(24px)]">{f.body}</p>
              </Tilt>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
