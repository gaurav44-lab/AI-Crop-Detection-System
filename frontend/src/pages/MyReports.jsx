import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../utils/api';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-700/30', icon: '⏳' },
  analyzing: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-700/30', icon: '🔬' },
  analyzed: { bg: 'bg-forest-900/30', text: 'text-forest-300', border: 'border-forest-700/30', icon: '✅' },
  advisory_sent: { bg: 'bg-forest-900/30', text: 'text-forest-200', border: 'border-forest-600/30', icon: '📋' },
  resolved: { bg: 'bg-gray-900/30', text: 'text-gray-300', border: 'border-gray-700/30', icon: '✓' },
  escalated: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-700/30', icon: '⚠️' },
};
const SEVERITY_COLORS = { low: '#4ade80', medium: '#fbbf24', high: '#f97316', critical: '#ef4444' };

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', cropType: '', severity: '', page: 1 });

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = { limit: 10, page: filters.page };
      if (filters.status) params.status = filters.status;
      if (filters.cropType) params.cropType = filters.cropType;
      if (filters.severity) params.severity = filters.severity;
      const data = await reportsAPI.getAll(params);
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="animate-slide-up">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-white text-3xl mb-1">My Reports</h1>
          <p className="text-forest-400">Track all your crop disease reports</p>
        </div>
        <Link to="/reports/new"
          className="flex items-center gap-2 bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-300">
          <span>＋</span> New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: 'status', label: 'All Status', opts: ['pending','analyzing','analyzed','advisory_sent','resolved','escalated'] },
          { key: 'cropType', label: 'All Crops', opts: ['wheat','rice','maize','cotton','tomato','potato','other'] },
          { key: 'severity', label: 'All Severity', opts: ['low','medium','high','critical'] },
        ].map(f => (
          <select key={f.key} value={filters[f.key]} onChange={e => setFilter(f.key, e.target.value)}
            className="bg-forest-950/80 border border-forest-800/50 rounded-xl px-4 py-2 text-forest-300 text-sm focus:outline-none focus:border-forest-600 capitalize">
            <option value="">{f.label}</option>
            {f.opts.map(o => <option key={o} value={o} className="capitalize">{o.replace('_', ' ')}</option>)}
          </select>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-forest-950/30 rounded-2xl border border-forest-800/30">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="font-display text-white text-xl mb-2">No reports found</h3>
          <p className="text-forest-400 mb-6">Start by submitting your first crop disease report</p>
          <Link to="/reports/new" className="bg-forest-600 hover:bg-forest-500 text-white px-6 py-2.5 rounded-xl transition-colors">
            Create Report →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map(report => {
            const s = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
            return (
              <Link key={report.id} to={`/reports/${report.id}`}
                className="block bg-forest-950/50 border border-forest-800/30 rounded-2xl p-5 hover:border-forest-700/60 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Image thumbnail */}
                    {report.images?.[0] ? (
                      <img src={`http://localhost:5000${report.images[0].path}`} alt=""
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-forest-700/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-forest-900/50 border border-forest-800/30 flex items-center justify-center text-2xl flex-shrink-0">
                        🌾
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold capitalize">{report.cropType}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border} capitalize`}>
                          {s.icon} {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-forest-400 text-sm mt-1 line-clamp-2">{report.symptoms}</p>
                      {report.aiAnalysis?.detectedDisease && (
                        <p className="text-forest-300 text-xs mt-1.5">🔬 {report.aiAnalysis.detectedDisease} ({report.aiAnalysis.confidence}%)</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        color: SEVERITY_COLORS[report.severity],
                        backgroundColor: SEVERITY_COLORS[report.severity] + '15',
                        border: `1px solid ${SEVERITY_COLORS[report.severity]}40`
                      }}>
                      {report.severity}
                    </span>
                    <span className="text-forest-600 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                    <span className="text-forest-600 group-hover:text-forest-300 transition-colors text-sm">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={filters.page === 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="px-4 py-2 border border-forest-700/50 text-forest-300 rounded-xl disabled:opacity-40 hover:border-forest-600 transition-colors text-sm">
            ← Prev
          </button>
          <span className="text-forest-400 text-sm">Page {filters.page} of {pagination.pages}</span>
          <button disabled={filters.page === pagination.pages}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="px-4 py-2 border border-forest-700/50 text-forest-300 rounded-xl disabled:opacity-40 hover:border-forest-600 transition-colors text-sm">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
