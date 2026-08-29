import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import MapView from '../components/MapView';
import api from '../lib/api';
import { formatINR } from '../lib/currency';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, whatsappLink } from '../lib/contact';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!property) return <p className="text-center py-24">Property not found.</p>;

  const images = property.images?.length ? property.images : [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="rounded-xl overflow-hidden bg-[#261f17]/5 aspect-video mb-3">
        {images[activeImage] ? (
          <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#261f17]/30">No image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mb-10 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-20 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                i === activeImage ? 'border-[#d97f2e]' : 'border-transparent'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <p className="text-[#d97f2e] text-xl font-semibold">{formatINR(property.price)}</p>
          <h1 className="font-display text-3xl text-[#261f17] mt-1">{property.title}</h1>
          <p className="text-[#261f17]/60 mt-1">{property.address}</p>

          <div className="flex gap-6 mt-6 text-sm text-[#261f17]/70">
            <span>{property.bedrooms} bedrooms</span>
            <span>{property.bathrooms} bathrooms</span>
            <span>{property.areaSqft} sqft</span>
          </div>

          <p className="mt-6 leading-relaxed text-[#261f17]/80 whitespace-pre-line">
            {property.description}
          </p>

          {property.lat && property.lng && (
            <div className="mt-10">
              <MapView
                properties={[property]}
                center={[property.lat, property.lng]}
                zoom={14}
                height="320px"
              />
            </div>
          )}
        </div>

        <aside className="border border-[#261f17]/10 rounded-xl p-6 h-fit bg-white">
          <h3 className="font-medium mb-2 text-[#261f17]">Interested in this property?</h3>
          <p className="text-sm text-[#261f17]/60 mb-4">
            Call or message us directly to get more details or schedule a viewing.
          </p>
          <div className="space-y-3">
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#261f17] text-[#faf3e7] rounded-full text-sm hover:bg-[#1b1610] transition-colors"
            >
              Call {CONTACT_PHONE_DISPLAY}
            </a>
            <a
              href={whatsappLink(`Hi, I'm interested in "${property.title}" (${property.address}). Could you share more details?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full text-sm hover:bg-[#1ebe5a] transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
