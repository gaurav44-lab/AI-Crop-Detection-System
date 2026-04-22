import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../utils/api';

const CROP_EMOJIS = { wheat: '🌾', rice: '🍚', maize: '🌽', cotton: '🌸', tomato: '🍅', potato: '🥔', other: '🌿' };

export default function Community() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');

  useEffect(() => {
    const params = { limit: 20 };
    if (cropFilter) params.cropType = cropFilter;
    reportsAPI.getCommunity(params)
      .then(data => setReports(data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cropFilter]);

  return (
    <div className="animate-slide-up">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl mb-2">Community Reports</h1>
        <p className="text-forest-400">Learn from other farmers — stay ahead of disease outbreaks in your region</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[['', 'All Crops'], ['wheat','Wheat'], ['rice','Rice'], ['maize','Maize'], ['tomato','Tomato'], ['cotton','Cotton']].map(([val, label]) => (
          <button key={val} onClick={() => setCropFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              cropFilter === val ? 'bg-forest-700 text-white' : 'text-forest-400 hover:text-forest-200 hover:bg-forest-900/50 border border-forest-800/50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-forest-950/30 rounded-2xl border border-forest-800/30">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="font-display text-white text-xl mb-2">No community reports yet</h3>
          <p className="text-forest-400">Be the first to share your report with the community</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => (
            <div key={report.id} className="bg-forest-950/50 border border-forest-800/30 rounded-2xl p-5 hover:border-forest-700/50 transition-all duration-200">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{CROP_EMOJIS[report.cropType] || '🌿'}</span>
                <div>
                  <h3 className="text-white font-semibold capitalize">{report.cropType}</h3>
                  <p className="text-forest-400 text-xs">{report.user?.name} · {report.user?.farmDetails?.location}</p>
                </div>
              </div>
              {report.aiAnalysis?.detectedDisease && (
                <div className="bg-forest-900/50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-forest-300 text-xs font-medium">🔬 {report.aiAnalysis.detectedDisease}</p>
                  <p className="text-forest-500 text-xs">{report.aiAnalysis.confidence}% confidence</p>
                </div>
              )}
              <p className="text-forest-400 text-sm line-clamp-3 mb-3">{report.symptoms}</p>
              <div className="flex items-center justify-between">
                <span className="text-forest-600 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-forest-900/50 border border-forest-700/30 text-forest-300 capitalize">{report.severity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
