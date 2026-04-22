import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { reportsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CROPS = ['wheat','rice','maize','cotton','soybean','sugarcane','tomato','potato','onion','groundnut','sunflower','barley','other'];
const STAGES = ['seedling','vegetative','flowering','fruiting','maturity','harvest'];
const SEVERITIES = [
  { value: 'low', label: 'Low', desc: 'Minor discoloration or spots', color: '#4ade80' },
  { value: 'medium', label: 'Medium', desc: 'Noticeable damage', color: '#fbbf24' },
  { value: 'high', label: 'High', desc: 'Significant crop damage', color: '#f97316' },
  { value: 'critical', label: 'Critical', desc: 'Widespread infection', color: '#ef4444' },
];

export default function NewReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    cropType: '', cropStage: 'vegetative', symptoms: '',
    severity: 'medium', location: { address: '' },
    affectedArea: { value: '', unit: 'acres' }, isPublic: false
  });

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) toast.error('Some files were rejected. Use JPEG/PNG/WebP, max 10MB each.');
    if (images.length + accepted.length > 5) return toast.error('Maximum 5 images allowed.');
    setImages(prev => [...prev, ...accepted.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }))]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024, maxFiles: 5
  });

  const removeImage = (idx) => setImages(prev => {
    URL.revokeObjectURL(prev[idx].preview);
    return prev.filter((_, i) => i !== idx);
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cropType) return toast.error('Please select a crop type.');
    if (!form.symptoms.trim()) return toast.error('Please describe the symptoms.');

    setLoading(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img));
      formData.append('cropType', form.cropType);
      formData.append('cropStage', form.cropStage);
      formData.append('symptoms', form.symptoms);
      formData.append('severity', form.severity);
      formData.append('location', JSON.stringify(form.location));
      formData.append('affectedArea', JSON.stringify(form.affectedArea));
      formData.append('isPublic', form.isPublic);

      const data = await reportsAPI.create(formData);
      toast.success('Report submitted! AI analysis starting...');
      navigate(`/reports/${data.report.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up max-w-3xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl mb-2">New Disease Report</h1>
        <p className="text-forest-400">Upload crop images and describe symptoms for AI-powered diagnosis</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Image Upload */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-4">📸 Crop Images</h2>
          <div {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-forest-400 bg-forest-900/50' : 'border-forest-700/50 hover:border-forest-600 hover:bg-forest-900/20'
            }`}>
            <input {...getInputProps()} />
            <div className="text-4xl mb-3">{isDragActive ? '⬇️' : '🖼️'}</div>
            <p className="text-forest-300 font-medium">{isDragActive ? 'Drop images here!' : 'Drag & drop images here'}</p>
            <p className="text-forest-500 text-sm mt-1">or click to browse • Max 5 images • JPEG, PNG, WebP</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeImage(idx)}
                      className="text-white bg-red-500 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-400">✕</button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    {(img.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crop Info */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-4">🌾 Crop Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-forest-300 text-sm font-medium mb-2">Crop Type *</label>
              <select required value={form.cropType} onChange={e => set('cropType', e.target.value)}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forest-500 transition-colors capitalize">
                <option value="">Select crop...</option>
                {CROPS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-forest-300 text-sm font-medium mb-2">Crop Stage</label>
              <select value={form.cropStage} onChange={e => set('cropStage', e.target.value)}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forest-500 transition-colors capitalize">
                {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-4">🔍 Symptoms & Observations</h2>
          <textarea
            required value={form.symptoms} onChange={e => set('symptoms', e.target.value)}
            rows={5}
            className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors resize-none"
            placeholder="Describe what you observe: leaf color changes, spots, wilting, unusual growth patterns, when it started, how quickly it's spreading..."
          />
          <p className="text-forest-600 text-xs mt-2">{form.symptoms.length}/2000 characters</p>
        </div>

        {/* Severity */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-4">⚠️ Severity Level</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SEVERITIES.map(sev => (
              <button key={sev.value} type="button" onClick={() => set('severity', sev.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  form.severity === sev.value ? 'border-opacity-100' : 'border-forest-700/30 hover:border-forest-600/50 opacity-70'
                }`}
                style={{
                  borderColor: form.severity === sev.value ? sev.color : undefined,
                  backgroundColor: form.severity === sev.value ? sev.color + '10' : undefined
                }}>
                <div className="font-semibold text-white text-sm">{sev.label}</div>
                <div className="text-forest-400 text-xs mt-1">{sev.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location & Area */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h2 className="font-display font-bold text-white text-lg mb-4">📍 Location & Scale</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-forest-300 text-sm font-medium mb-2">Farm Location</label>
              <input value={form.location.address}
                onChange={e => set('location', { ...form.location, address: e.target.value })}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                placeholder="Village, District, State" />
            </div>
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Affected Area</label>
              <input type="number" min="0" step="0.01" value={form.affectedArea.value}
                onChange={e => set('affectedArea', { ...form.affectedArea, value: e.target.value })}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-forest-300 text-sm font-medium mb-2">Unit</label>
              <select value={form.affectedArea.unit}
                onChange={e => set('affectedArea', { ...form.affectedArea, unit: e.target.value })}
                className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-forest-500 transition-colors">
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sqm">Sq. Meters</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)}
              className="w-4 h-4 rounded border-forest-600 bg-forest-900 text-forest-500 focus:ring-forest-500 focus:ring-offset-0" />
            <span className="text-forest-300 text-sm">Share this report with the community (helps other farmers)</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-3 border border-forest-700/50 text-forest-400 rounded-xl hover:border-forest-600 hover:text-forest-200 transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-forest-900/50">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : '🔬 Submit for AI Analysis'}
          </button>
        </div>
      </form>
    </div>
  );
}
