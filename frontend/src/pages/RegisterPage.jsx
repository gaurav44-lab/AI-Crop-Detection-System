import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CROPS = ['wheat', 'rice', 'maize', 'cotton', 'soybean', 'tomato', 'potato', 'onion', 'groundnut', 'sunflower'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'farmer',
    farmDetails: { location: '', farmSize: '', primaryCrops: [] }
  });

  const toggleCrop = (crop) => {
    setForm(f => ({
      ...f,
      farmDetails: {
        ...f.farmDetails,
        primaryCrops: f.farmDetails.primaryCrops.includes(crop)
          ? f.farmDetails.primaryCrops.filter(c => c !== crop)
          : [...f.farmDetails.primaryCrops, crop]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to CropGuard 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setFarm = (field, val) => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, [field]: val } }));

  return (
    <div className="min-h-screen bg-[#060e08] flex items-center justify-center p-4 font-body">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-earth-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🌿</span>
            <span className="font-display font-bold text-white text-2xl">CropGuard</span>
          </Link>
          <h2 className="font-display font-bold text-white text-3xl">Create your account</h2>
          <p className="text-forest-400 mt-2">Start protecting your crops with AI</p>
        </div>

        <div className="bg-forest-950/80 border border-forest-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-forest-300 text-sm font-medium mb-2">Full Name</label>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                  placeholder="John Farmer" />
              </div>
              <div className="col-span-2">
                <label className="block text-forest-300 text-sm font-medium mb-2">Email</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                  placeholder="john@example.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-forest-300 text-sm font-medium mb-2">Password</label>
                <input type="password" required value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                  placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-forest-300 text-sm font-medium mb-2">Role</label>
                <select value={form.role} onChange={e => set('role', e.target.value)}
                  className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forest-500 transition-colors">
                  <option value="farmer">Farmer</option>
                  <option value="agronomist">Agronomist</option>
                </select>
              </div>
              <div>
                <label className="block text-forest-300 text-sm font-medium mb-2">Farm Location</label>
                <input value={form.farmDetails.location} onChange={e => setFarm('location', e.target.value)}
                  className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                  placeholder="Punjab, India" />
              </div>
              <div className="col-span-2">
                <label className="block text-forest-300 text-sm font-medium mb-2">Primary Crops (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {CROPS.map(crop => (
                    <button key={crop} type="button" onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                        form.farmDetails.primaryCrops.includes(crop)
                          ? 'bg-forest-600 text-white border border-forest-500'
                          : 'bg-forest-900/50 text-forest-400 border border-forest-700/50 hover:border-forest-600'
                      }`}>
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 mt-2">
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-forest-400 mt-6">
          Already have an account? <Link to="/login" className="text-forest-300 hover:text-white transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
