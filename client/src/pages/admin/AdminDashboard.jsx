import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import PropertyForm from './PropertyForm';
import { formatINR } from '../../lib/currency';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`);
    load();
  }

  function handleSaved() {
    setEditing(null);
    setCreating(false);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-[#261f17]">Admin Dashboard</h1>
        <button onClick={logout} className="text-sm text-[#261f17]/60 hover:text-[#261f17]">
          Log out
        </button>
      </div>

      {creating ? (
        <div className="mb-10">
          <PropertyForm onSaved={handleSaved} onCancel={() => setCreating(false)} />
        </div>
      ) : editing ? (
        <div className="mb-10">
          <PropertyForm initial={editing} onSaved={handleSaved} onCancel={() => setEditing(null)} />
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mb-8 px-5 py-2 bg-[#261f17] text-[#faf3e7] rounded-full text-sm"
        >
          + Add Property
        </button>
      )}

      {loading ? (
        <Loader />
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[#261f17]/10 text-[#261f17]/50">
              <th className="py-2">Title</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-[#261f17]/5">
                <td className="py-3">{p.title}</td>
                <td className="py-3">{formatINR(p.price)}</td>
                <td className="py-3 capitalize">{p.status}</td>
                <td className="py-3 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="text-[#d97f2e]">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
