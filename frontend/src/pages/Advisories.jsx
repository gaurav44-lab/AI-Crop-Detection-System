import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { advisoryAPI } from '../utils/api';

const CATEGORY_ICONS = { fungal: '🍄', bacterial: '🦠', viral: '🧬', pest: '🐛', nutritional: '🌿', environmental: '☀️', unknown: '❓' };

export default function Advisories() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all | unread | read

  useEffect(() => {
    const params = {};
    if (filter === 'unread') params.isRead = false;
    if (filter === 'read') params.isRead = true;

    advisoryAPI.getAll(params)
      .then(data => {
        setAdvisories(data.advisories);
        setUnreadCount(data.unreadCount);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="animate-slide-up">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display font-bold text-white text-3xl">Advisories</h1>
          {unreadCount > 0 && (
            <span className="bg-earth-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{unreadCount} new</span>
          )}
        </div>
        <p className="text-forest-400">AI-generated treatment plans and recommendations</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
              filter === f ? 'bg-forest-700 text-white' : 'text-forest-400 hover:text-forest-200 hover:bg-forest-900/50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : advisories.length === 0 ? (
        <div className="text-center py-20 bg-forest-950/30 rounded-2xl border border-forest-800/30">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-display text-white text-xl mb-2">No advisories yet</h3>
          <p className="text-forest-400 mb-6">Submit a disease report to receive AI-powered advisories</p>
          <Link to="/reports/new" className="bg-forest-600 hover:bg-forest-500 text-white px-6 py-2.5 rounded-xl transition-colors">
            Create Report →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {advisories.map(advisory => (
            <Link key={advisory.id} to={`/advisories/${advisory.id}`}
              className={`block rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5 group ${
                !advisory.isRead
                  ? 'bg-forest-900/40 border-forest-700/50 hover:border-forest-600/70'
                  : 'bg-forest-950/50 border-forest-800/30 hover:border-forest-700/50'
              }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{CATEGORY_ICONS[advisory.diseaseInfo?.category] || '📋'}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{advisory.diseaseInfo?.name}</h3>
                      {!advisory.isRead && <span className="w-2 h-2 bg-earth-400 rounded-full" />}
                    </div>
                    <p className="text-forest-400 text-xs capitalize mb-2">
                      {advisory.diseaseInfo?.category} disease · {advisory.diseaseInfo?.scientificName}
                    </p>
                    <p className="text-forest-400 text-sm line-clamp-2">{advisory.diseaseInfo?.description}</p>
                    <p className="text-forest-500 text-xs mt-2">
                      Crop: <span className="text-forest-300 capitalize">{advisory.report?.cropType}</span>
                      {' '}&middot; {new Date(advisory.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full bg-forest-900/50 border border-forest-700/30 text-forest-300 capitalize">
                    {advisory.generatedBy} generated
                  </span>
                  <span className="text-forest-600 group-hover:text-forest-300 transition-colors">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
