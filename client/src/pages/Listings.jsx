import { useEffect, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import api from '../lib/api';

export default function Listings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', bedrooms: '' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;

    api
      .get('/properties', { params })
      .then(({ data }) => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium mb-2">
        Delhi NCR
      </p>
      <h1 className="font-display text-3xl text-[#261f17] mb-8">All Listings</h1>

      <div className="flex flex-wrap gap-4 mb-10">
        <input
          type="number"
          placeholder="Min price (₹)"
          value={filters.minPrice}
          onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          className="border border-[#261f17]/15 rounded-full px-4 py-2 text-sm w-40"
        />
        <input
          type="number"
          placeholder="Max price (₹)"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          className="border border-[#261f17]/15 rounded-full px-4 py-2 text-sm w-40"
        />
        <select
          value={filters.bedrooms}
          onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))}
          className="border border-[#261f17]/15 rounded-full px-4 py-2 text-sm"
        >
          <option value="">Any bedrooms</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+ bd
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : properties.length === 0 ? (
        <p className="text-[#261f17]/50">No properties match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
