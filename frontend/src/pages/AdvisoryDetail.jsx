import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { advisoryAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdvisoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ helpful: null, rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    advisoryAPI.getOne(id)
      .then(data => setAdvisory(data.advisory))
      .catch(() => toast.error('Advisory not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      await advisoryAPI.submitFeedback(id, feedback);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await advisoryAPI.resolve(id);
      toast.success('Report marked as resolved! 🎉');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!advisory) return null;

  const { diseaseInfo, treatment, management, estimatedYieldLoss, economicImpact } = advisory;

  return (
    <div className="animate-slide-up max-w-4xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>

      <button onClick={() => navigate(-1)} className="text-forest-400 hover:text-white transition-colors mb-6 block">← Back to Advisories</button>

      {/* Header */}
      <div className="bg-gradient-to-br from-forest-900/50 to-forest-950/50 border border-forest-700/50 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-forest-400 text-xs uppercase tracking-wider mb-2">Disease Advisory</p>
            <h1 className="font-display font-bold text-white text-3xl mb-1">{diseaseInfo?.name}</h1>
            <p className="text-forest-400 italic text-sm mb-3">{diseaseInfo?.scientificName}</p>
            <span className="inline-block px-3 py-1 bg-forest-800/50 border border-forest-700/50 rounded-full text-forest-300 text-xs capitalize">
              {diseaseInfo?.category} · {advisory.generatedBy} generated
            </span>
          </div>
          <div className="text-5xl">🔬</div>
        </div>
        {diseaseInfo?.description && (
          <p className="text-forest-300 text-sm leading-relaxed mt-4 pt-4 border-t border-forest-800/50">
            {diseaseInfo.description}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Immediate Treatment */}
        {treatment?.immediate?.length > 0 && (
          <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-5 lg:col-span-2">
            <h2 className="font-display font-bold text-white text-lg mb-4">⚡ Immediate Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {treatment.immediate.map((t, i) => (
                <div key={i} className="bg-red-900/20 border border-red-800/20 rounded-xl p-4">
                  <p className="text-red-200 font-semibold mb-2">{t.action}</p>
                  {t.product && <p className="text-red-300 text-sm">Product: <span className="text-white">{t.product}</span></p>}
                  {t.dosage && <p className="text-red-300 text-sm">Dosage: <span className="text-white">{t.dosage}</span></p>}
                  {t.frequency && <p className="text-red-300 text-sm">Frequency: <span className="text-white">{t.frequency}</span></p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organic Solutions */}
        {treatment?.organic?.length > 0 && (
          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
            <h2 className="font-display font-bold text-white text-lg mb-4">🌿 Organic Solutions</h2>
            <ul className="flex flex-col gap-2">
              {treatment.organic.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-forest-300 text-sm">
                  <span className="text-forest-500 flex-shrink-0 mt-0.5">◉</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preventive Measures */}
        {treatment?.preventive?.length > 0 && (
          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
            <h2 className="font-display font-bold text-white text-lg mb-4">🛡️ Preventive Measures</h2>
            <ul className="flex flex-col gap-2">
              {treatment.preventive.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-forest-300 text-sm">
                  <span className="text-forest-500 flex-shrink-0 mt-0.5">◈</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chemical Treatments */}
        {treatment?.chemical?.length > 0 && (
          <div className="bg-earth-950/30 border border-earth-800/30 rounded-2xl p-5 lg:col-span-2">
            <h2 className="font-display font-bold text-white text-lg mb-4">⚗️ Chemical Treatments</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {treatment.chemical.map((c, i) => (
                <div key={i} className="bg-earth-900/20 border border-earth-800/20 rounded-xl p-4">
                  <p className="text-earth-200 font-semibold mb-1">{c.name}</p>
                  {c.activeIngredient && <p className="text-earth-400 text-xs mb-2">Active: {c.activeIngredient}</p>}
                  {c.applicationRate && <p className="text-earth-300 text-sm">Rate: {c.applicationRate}</p>}
                  {c.safetyPrecautions && (
                    <p className="text-yellow-400 text-xs mt-2">⚠️ {c.safetyPrecautions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management */}
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
          <h2 className="font-display font-bold text-white text-lg mb-4">📅 Short-term Management</h2>
          <ul className="flex flex-col gap-2">
            {management?.shortTerm?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-forest-300 text-sm">
                <span className="text-forest-500 flex-shrink-0 mt-0.5">→</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
          <h2 className="font-display font-bold text-white text-lg mb-4">🔭 Long-term Strategy</h2>
          <ul className="flex flex-col gap-2">
            {management?.longTerm?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-forest-300 text-sm">
                <span className="text-forest-500 flex-shrink-0 mt-0.5">→</span> {s}
              </li>
            ))}
          </ul>
          {management?.cropRotation && (
            <p className="text-earth-300 text-sm mt-3 pt-3 border-t border-forest-800/50">
              🔄 {management.cropRotation}
            </p>
          )}
        </div>

        {/* Economic Impact */}
        <div className="lg:col-span-2 bg-earth-950/20 border border-earth-800/30 rounded-2xl p-5">
          <h2 className="font-display font-bold text-white text-lg mb-3">📉 Economic Impact</h2>
          <div className="flex items-center gap-8 mb-3">
            <div>
              <p className="text-earth-400 text-xs">Estimated Yield Loss</p>
              <p className="text-earth-200 font-display font-bold text-2xl">
                {estimatedYieldLoss?.min}–{estimatedYieldLoss?.max}%
              </p>
            </div>
          </div>
          {economicImpact && <p className="text-earth-300 text-sm">{economicImpact}</p>}
        </div>
      </div>

      {/* Resolve & Feedback */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <button onClick={handleResolve} disabled={resolving}
          className="w-full bg-gradient-to-r from-forest-700 to-forest-600 hover:from-forest-600 hover:to-forest-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-40">
          {resolving ? 'Marking...' : '✓ Mark as Resolved'}
        </button>
        <a href="https://wa.me/?text=Check+out+CropGuard+AI+for+crop+disease+detection!" target="_blank" rel="noreferrer"
          className="w-full border border-forest-700/50 text-forest-300 hover:border-forest-600 hover:text-white py-3 rounded-xl text-center transition-all duration-200">
          Share Report
        </a>
      </div>

      {/* Feedback */}
      <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
        <h3 className="font-display font-bold text-white mb-4">Was this advisory helpful?</h3>
        <div className="flex gap-3 mb-4">
          {[true, false].map(val => (
            <button key={String(val)} onClick={() => setFeedback(f => ({ ...f, helpful: val }))}
              className={`px-5 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                feedback.helpful === val ? 'bg-forest-700 border-forest-500 text-white' : 'border-forest-700/50 text-forest-400 hover:border-forest-600'
              }`}>
              {val ? '👍 Yes' : '👎 No'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map(r => (
            <button key={r} onClick={() => setFeedback(f => ({ ...f, rating: r }))}
              className={`text-2xl transition-transform hover:scale-110 ${r <= feedback.rating ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
          ))}
        </div>
        <textarea value={feedback.comment} onChange={e => setFeedback(f => ({ ...f, comment: e.target.value }))}
          className="w-full bg-forest-900/50 border border-forest-700/50 rounded-xl px-4 py-3 text-white placeholder-forest-500 focus:outline-none focus:border-forest-500 transition-colors resize-none text-sm mb-3"
          rows={2} placeholder="Additional comments (optional)" />
        <button onClick={submitFeedback} disabled={submittingFeedback || feedback.helpful === null}
          className="bg-forest-700 hover:bg-forest-600 text-white px-6 py-2.5 rounded-xl transition-colors text-sm disabled:opacity-40">
          {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
