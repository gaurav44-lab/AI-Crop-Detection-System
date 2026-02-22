import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CROPS = ['wheat','rice','maize','cotton','soybean','tomato','potato','onion','groundnut','sunflower','barley'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    farmDetails: {
      location: user?.farmDetails?.location || '',
      farmSize: user?.farmDetails?.farmSize || '',
      primaryCrops: user?.farmDetails?.primaryCrops || []
    }
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [tab, setTab] = useState('profile');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await authAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPw(false);
    }
  };

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

  const inputCls = "w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors";

  return (
    <div className="animate-slide-up max-w-2xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>
      
      {/* Profile Header */}
      <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-forest-400 to-earth-500 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-2xl">{user?.name}</h1>
          <p className="text-forest-400 capitalize">{user?.role} · {user?.email}</p>
          <p className="text-forest-500 text-xs mt-1">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
              tab === t ? 'bg-forest-700 text-white' : 'text-forest-400 hover:text-forest-200 hover:bg-forest-900/50'
            }`}>
            {t === 'profile' ? '👤 Profile' : '🔒 Security'}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white text-lg mb-5">Personal Information</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-forest-300 text-sm font-medium mb-2">Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputCls} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-forest-300 text-sm font-medium mb-2">Email Address</label>
                <input value={user?.email} disabled
                  className={inputCls + ' opacity-50 cursor-not-allowed'} />
                <p className="text-forest-600 text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
            <h2 className="font-display font-bold text-white text-lg mb-5">Farm Details</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-forest-300 text-sm font-medium mb-2">Location</label>
                  <input value={form.farmDetails.location}
                    onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, location: e.target.value } }))}
                    className={inputCls} placeholder="District, State" />
                </div>
                <div>
                  <label className="block text-forest-300 text-sm font-medium mb-2">Farm Size (acres)</label>
                  <input type="number" min="0" step="0.1" value={form.farmDetails.farmSize}
                    onChange={e => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, farmSize: e.target.value } }))}
                    className={inputCls} placeholder="0.0" />
                </div>
              </div>
              <div>
                <label className="block text-forest-300 text-sm font-medium mb-2">Primary Crops</label>
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
          </div>

          <button type="submit" disabled={savingProfile}
            className="bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60">
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <form onSubmit={changePassword} className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-5">Change Password</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Current Password</label>
              <input type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                className={inputCls} placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">New Password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className={inputCls} placeholder="Min. 6 characters" required />
            </div>
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={inputCls} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={savingPw}
              className="bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 mt-2">
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
