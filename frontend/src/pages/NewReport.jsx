import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { reportsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';

const CROPS = ['wheat','rice','maize','cotton','soybean','sugarcane','tomato','potato','onion','groundnut','sunflower','barley','other'];
const STAGES = ['seedling','vegetative','flowering','fruiting','maturity','harvest'];
const SEVERITIES = [
  { value: 'low', label: 'Low', desc: 'Minor discoloration or spots', variant: 'outline', className: 'hover:border-primary hover:bg-primary/10' },
  { value: 'medium', label: 'Medium', desc: 'Noticeable damage', variant: 'outline', className: 'hover:border-yellow-500 hover:bg-yellow-500/10' },
  { value: 'high', label: 'High', desc: 'Significant crop damage', variant: 'outline', className: 'hover:border-orange-500 hover:bg-orange-500/10' },
  { value: 'critical', label: 'Critical', desc: 'Widespread infection', variant: 'outline', className: 'hover:border-destructive hover:bg-destructive/10' },
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
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crop Analysis</h1>
        <p className="text-muted-foreground mt-1">Upload crop images and describe symptoms for AI-powered diagnosis</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Images</CardTitle>
            <CardDescription>Upload up to 5 clear images of the affected crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}>
              <input {...getInputProps()} />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{isDragActive ? 'Drop images here!' : 'Drag & drop images here'}</h3>
              <p className="text-sm text-muted-foreground">or click to browse • Max 5 images • JPEG, PNG, WebP</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crop Info */}
        <Card>
          <CardHeader>
            <CardTitle>Crop Information</CardTitle>
            <CardDescription>Select the type and growth stage of your crop</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Type *</label>
              <select required value={form.cropType} onChange={e => set('cropType', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 capitalize">
                <option value="">Select crop...</option>
                {CROPS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Crop Stage</label>
              <select value={form.cropStage} onChange={e => set('cropStage', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 capitalize">
                {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Symptoms & Observations</CardTitle>
            <CardDescription>Describe the issues you're seeing</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              required value={form.symptoms} onChange={e => set('symptoms', e.target.value)}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              placeholder="Describe what you observe: leaf color changes, spots, wilting, unusual growth patterns, when it started..."
            />
            <p className="text-muted-foreground text-xs mt-2 text-right">{form.symptoms.length}/2000 characters</p>
          </CardContent>
        </Card>

        {/* Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Level</CardTitle>
            <CardDescription>How badly is the crop affected?</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-4 gap-4">
            {SEVERITIES.map(sev => (
              <div key={sev.value} onClick={() => set('severity', sev.value)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${sev.className} ${
                  form.severity === sev.value ? 'border-primary bg-primary/10' : 'border-border opacity-70'
                }`}>
                <div className="font-semibold text-sm">{sev.label}</div>
                <div className="text-muted-foreground text-xs mt-1">{sev.desc}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Scale</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Farm Location</label>
              <Input value={form.location.address}
                onChange={e => set('location', { ...form.location, address: e.target.value })}
                placeholder="Village, District, State" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Affected Area</label>
              <Input type="number" min="0" step="0.01" value={form.affectedArea.value}
                onChange={e => set('affectedArea', { ...form.affectedArea, value: e.target.value })}
                placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <select value={form.affectedArea.unit}
                onChange={e => set('affectedArea', { ...form.affectedArea, unit: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sqm">Sq. Meters</option>
              </select>
            </div>

            <label className="flex items-center gap-3 mt-4 cursor-pointer sm:col-span-2">
              <input type="checkbox" checked={form.isPublic} onChange={e => set('isPublic', e.target.checked)}
                className="w-4 h-4 rounded border-input" />
              <span className="text-sm text-muted-foreground">Share this report with the community (helps other farmers)</span>
            </label>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 max-w-[200px]">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for AI Analysis'}
          </Button>
        </div>
      </form>
    </div>
  );
}
