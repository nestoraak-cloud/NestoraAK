import { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import api from '../lib/api';

export default function MapPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium mb-2">
        Delhi NCR
      </p>
      <h1 className="font-display text-3xl text-[#261f17] mb-8">Properties on the Map</h1>
      {loading ? <Loader /> : <MapView properties={properties} height="65vh" />}
    </div>
  );
}
