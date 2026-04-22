import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reportsAPI } from '../utils/api';
import toast from 'react-hot-toast';

const URGENCY_STYLES = {
  monitor: { color: '#4ade80', label: 'Monitor Closely' },
  treat_soon: { color: '#fbbf24', label: 'Treat Soon' },
  treat_immediately: { color: '#ef4444', label: '⚠️ Treat Immediately' },
  consult_expert: { color: '#f97316', label: 'Consult Expert' },
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    reportsAPI.getOne(id)
      .then(data => { setReport(data.report); setAdvisory(data.advisory); })
      .catch(() => toast.error('Report not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-refresh if analyzing
  useEffect(() => {
    if (report?.status === 'analyzing' || report?.status === 'pending') {
      const timer = setInterval(async () => {
        try {
          const data = await reportsAPI.getOne(id);
          setReport(data.report);
          setAdvisory(data.advisory);
          if (data.report.status !== 'analyzing' && data.report.status !== 'pending') {
            clearInterval(timer);
            toast.success('Analysis complete!');
          }
        } catch {}
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [report?.status, id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await reportsAPI.delete(id);
      toast.success('Report deleted');
      navigate('/reports');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!report) return <div className="text-forest-400 text-center py-16">Report not found.</div>;

  const urgency = report.aiAnalysis?.urgency;
  const urgencyStyle = urgency ? URGENCY_STYLES[urgency] : null;

  return (
    <div className="animate-slide-up max-w-4xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-forest-400 hover:text-white transition-colors">← Back</button>
          <span className="text-forest-700">/</span>
          <h1 className="font-display font-bold text-white text-2xl capitalize">{report.cropType} Report</h1>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="text-red-400 hover:text-red-300 border border-red-800/50 hover:bg-red-900/20 px-4 py-2 rounded-xl transition-all duration-200 text-sm disabled:opacity-40">
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Images */}
          {report.images?.length > 0 && (
            <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl overflow-hidden">
              <img src={`http://localhost:5000${report.images[selectedImg]?.path}`} alt="Crop"
                className="w-full aspect-square object-cover" />
              {report.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {report.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImg ? 'border-forest-400' : 'border-transparent'}`}>
                      <img src={`http://localhost:5000${img.path}`} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report Info */}
          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
            <h3 className="font-display font-bold text-white mb-4">Report Details</h3>
            {[
              ['Crop Type', report.cropType, 'capitalize'],
              ['Crop Stage', report.cropStage, 'capitalize'],
              ['Severity', report.severity, 'capitalize'],
              ['Location', report.location?.address || 'Not specified', ''],
              ['Affected Area', report.affectedArea?.value ? `${report.affectedArea.value} ${report.affectedArea.unit}` : 'Not specified', ''],
              ['Submitted', new Date(report.createdAt).toLocaleString(), ''],
            ].map(([label, val, cls]) => (
              <div key={label} className="flex justify-between py-2 border-b border-forest-800/30 last:border-0">
                <span className="text-forest-400 text-sm">{label}</span>
                <span className={`text-forest-200 text-sm font-medium ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Status Banner */}
          {(report.status === 'analyzing' || report.status === 'pending') ? (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" style={{borderWidth: '3px'}} />
              <div>
                <p className="text-blue-200 font-semibold">AI Analysis in Progress</p>
                <p className="text-blue-400 text-sm">This usually takes 1-2 minutes. This page will update automatically.</p>
              </div>
            </div>
          ) : report.aiAnalysis?.detectedDisease ? (
            <div className="bg-forest-900/30 border border-forest-600/30 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-forest-400 text-xs uppercase tracking-wide mb-1">AI Diagnosis</p>
                  <h2 className="font-display font-bold text-white text-2xl">{report.aiAnalysis.detectedDisease}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-bold text-forest-300">{report.aiAnalysis.confidence}%</div>
                  <div className="text-forest-500 text-xs">confidence</div>
                </div>
              </div>
              <div className="w-full bg-forest-900 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-forest-600 to-forest-400 h-2 rounded-full"
                  style={{ width: `${report.aiAnalysis.confidence}%` }} />
              </div>
              {urgencyStyle && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: urgencyStyle.color + '15', color: urgencyStyle.color, border: `1px solid ${urgencyStyle.color}40` }}>
                  {urgencyStyle.label}
                </div>
              )}
            </div>
          ) : null}

          {/* Possible Diseases */}
          {report.aiAnalysis?.possibleDiseases?.length > 0 && (
            <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
              <h3 className="font-display font-bold text-white mb-3">Possible Diseases</h3>
              <div className="flex flex-col gap-2">
                {report.aiAnalysis.possibleDiseases.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-forest-300 text-sm">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-forest-900 rounded-full h-1.5">
                        <div className="bg-forest-500 h-1.5 rounded-full" style={{ width: `${d.confidence}%` }} />
                      </div>
                      <span className="text-forest-400 text-xs w-8 text-right">{d.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms */}
          <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
            <h3 className="font-display font-bold text-white mb-3">Reported Symptoms</h3>
            <p className="text-forest-300 text-sm leading-relaxed">{report.symptoms}</p>
          </div>

          {/* AI Recommendations */}
          {report.aiAnalysis?.recommendations?.length > 0 && (
            <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
              <h3 className="font-display font-bold text-white mb-3">Quick Recommendations</h3>
              <ul className="flex flex-col gap-2">
                {report.aiAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-forest-300 text-sm">
                    <span className="text-forest-500 flex-shrink-0 mt-0.5">◉</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View Advisory CTA */}
          {advisory && (
            <Link to={`/advisories/${advisory.id}`}
              className="block bg-gradient-to-r from-earth-800/50 to-earth-900/50 border border-earth-700/50 rounded-2xl p-5 hover:border-earth-600/60 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-earth-300 text-xs uppercase tracking-wide mb-1">Full Advisory Available</p>
                  <h3 className="font-display font-bold text-white">View Treatment Plan →</h3>
                  <p className="text-earth-400 text-sm mt-1">Detailed recommendations, treatment options & management strategies</p>
                </div>
                <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
