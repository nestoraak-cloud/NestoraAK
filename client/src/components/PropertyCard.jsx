import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatINR } from '../lib/currency';

export default function PropertyCard({ property }) {
  const image = property.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to={`/listings/${property.id}`}
        className="block group rounded-xl overflow-hidden border border-[#261f17]/10 bg-white hover:shadow-xl transition-shadow"
      >
        <div className="aspect-[4/3] overflow-hidden bg-[#261f17]/5">
          {image ? (
            <img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#261f17]/30 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-[#d97f2e] font-semibold">{formatINR(property.price)}</p>
          <h3 className="font-medium mt-1 text-[#261f17]">{property.title}</h3>
          <p className="text-sm text-[#261f17]/60 mt-1">{property.address}</p>
          <div className="flex gap-4 text-xs text-[#261f17]/50 mt-3">
            <span>{property.bedrooms} bd</span>
            <span>{property.bathrooms} ba</span>
            <span>{property.areaSqft} sqft</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
