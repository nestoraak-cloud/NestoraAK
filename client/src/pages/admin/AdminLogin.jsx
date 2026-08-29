import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-2xl font-semibold mb-8">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-[#261f17] text-[#faf3e7] rounded-full text-sm hover:bg-[#1b1610] transition-colors"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
