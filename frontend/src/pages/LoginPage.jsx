import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060e08] flex items-center justify-center p-4 font-body">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-forest-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌿</span>
            <span className="font-display font-bold text-white text-2xl">CropGuard</span>
          </Link>
          <h2 className="font-display font-bold text-white text-3xl">Welcome back</h2>
          <p className="text-forest-400 mt-2">Sign in to your farm dashboard</p>
        </div>

        <div className="bg-forest-950/80 border border-forest-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                placeholder="farmer@example.com"
              />
            </div>
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-earth-900/30 border border-earth-700/30 rounded-lg text-center">
            <p className="text-earth-400 text-xs">Demo: demo@cropguard.ai / password123</p>
          </div>
        </div>

        <p className="text-center text-forest-400 mt-6">
          New to CropGuard? <Link to="/register" className="text-forest-300 hover:text-white transition-colors font-medium">Create account</Link>
        </p>
      </div>
    </div>
  );
}
