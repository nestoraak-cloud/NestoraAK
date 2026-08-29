import { motion } from 'framer-motion';
import { STOP_ICONS } from './graphics/StopIcons';

const features = [
  { num: '01', title: 'Premium Interiors', body: 'Light-filled floors, balconies on every home, and finishes built to last generations.' },
  { num: '02', title: 'Landscaped Grounds', body: 'Courtyards, paved walkways, and greenery around every tower — designed for everyday life, not just the lobby.' },
  { num: '03', title: 'Prime Locations', body: 'Walk to metro, markets, and parks in every neighbourhood we list across the capital.' },
  { num: '04', title: 'Verified & Transparent', body: 'RERA-registered projects, clear legal titles, and transparent pricing — invest with complete peace of mind.' },
];

export default function FeatureHighlights() {
  return (
    <section className="bg-[#faf3e7] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-14">
        {features.map((f, i) => {
          const Icon = STOP_ICONS[f.num];
          return (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 text-[#d97f2e]">
                <Icon />
                <span className="font-display text-sm">{f.num}</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-[#261f17] mt-3">{f.title}</h3>
              <p className="mt-2 text-[#261f17]/60 max-w-sm">{f.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
