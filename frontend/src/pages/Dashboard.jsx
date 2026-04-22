import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../utils/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const SEVERITY_COLORS = { low: '#4ade80', medium: '#fbbf24', high: '#f97316', critical: '#ef4444' };
const STATUS_ICONS = {
  pending: '⏳', analyzing: '🔬', analyzed: '✅', advisory_sent: '📋', resolved: '✓', escalated: '⚠️'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-forest-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Reports', value: data?.stats.totalReports ?? 0, icon: '◈', color: 'from-forest-800 to-forest-900', accent: 'text-forest-300' },
    { label: 'Active Issues', value: data?.stats.activeReports ?? 0, icon: '◉', color: 'from-earth-800 to-earth-900', accent: 'text-earth-300' },
    { label: 'Resolved', value: data?.stats.resolvedReports ?? 0, icon: '✓', color: 'from-forest-700 to-forest-800', accent: 'text-forest-200' },
    { label: 'Unread Advisories', value: data?.stats.unreadAdvisories ?? 0, icon: '◎', color: 'from-sky-900 to-sky-950', accent: 'text-sky-300' },
  ];

  const barData = {
    labels: data?.monthlyActivity?.map(m => m.id) ?? [],
    datasets: [{
      label: 'Reports',
      data: data?.monthlyActivity?.map(m => m.count) ?? [],
      backgroundColor: 'rgba(74, 222, 128, 0.3)',
      borderColor: '#4ade80',
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: data?.cropBreakdown?.map(c => c.id) ?? [],
    datasets: [{
      data: data?.cropBreakdown?.map(c => c.count) ?? [],
      backgroundColor: ['#166534','#15803d','#16a34a','#22c55e','#4ade80','#86efac'],
      borderColor: '#0a1a0e',
      borderWidth: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: '#86efac', font: { family: 'DM Sans' } } } },
    scales: {
      x: { ticks: { color: '#4ade80' }, grid: { color: '#14532d33' } },
      y: { ticks: { color: '#4ade80' }, grid: { color: '#14532d33' } }
    }
  };

  return (
    <div className="animate-slide-up">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-white text-3xl">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 🌿
          </h1>
          <p className="text-forest-400 mt-1">Here's what's happening on your farm</p>
        </div>
        <Link to="/reports/new"
          className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-forest-600 to-forest-500 hover:from-forest-500 hover:to-forest-400 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5">
          <span>＋</span> New Report
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label}
            className={`bg-gradient-to-br ${card.color} border border-forest-800/50 rounded-2xl p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-forest-400 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                <p className={`font-display font-bold text-3xl mt-1 ${card.accent}`}>{card.value}</p>
              </div>
              <span className="text-2xl opacity-70">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Resolution Rate */}
      <div className="mb-8 bg-forest-950/50 border border-forest-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-forest-300 text-sm font-medium">Resolution Rate</span>
          <span className="text-forest-200 font-bold">{data?.stats.resolutionRate ?? 0}%</span>
        </div>
        <div className="w-full bg-forest-900 rounded-full h-2">
          <div className="bg-gradient-to-r from-forest-500 to-forest-400 h-2 rounded-full transition-all duration-700"
            style={{ width: `${data?.stats.resolutionRate ?? 0}%` }} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h3 className="font-display font-bold text-white mb-4">Monthly Activity</h3>
          {barData.labels.length > 0
            ? <Bar data={barData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
            : <div className="h-40 flex items-center justify-center text-forest-500">No data yet</div>
          }
        </div>
        <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
          <h3 className="font-display font-bold text-white mb-4">Crops Reported</h3>
          {doughnutData.labels.length > 0
            ? <Doughnut data={doughnutData} options={{ plugins: { legend: { labels: { color: '#86efac', font: { family: 'DM Sans' } } } } }} />
            : <div className="h-40 flex items-center justify-center text-forest-500">No data yet</div>
          }
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white">Recent Reports</h3>
          <Link to="/reports" className="text-forest-400 hover:text-forest-200 text-sm transition-colors">View all →</Link>
        </div>
        {data?.recentReports?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-forest-500 mb-4">No reports yet.</p>
            <Link to="/reports/new" className="text-forest-400 hover:text-white transition-colors text-sm">Create your first report →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data?.recentReports?.map(report => (
              <Link key={report.id} to={`/reports/${report.id}`}
                className="flex items-center justify-between p-4 bg-forest-900/30 rounded-xl hover:bg-forest-900/60 transition-all duration-200 border border-transparent hover:border-forest-700/50 group">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{STATUS_ICONS[report.status]}</span>
                  <div>
                    <p className="text-white font-medium capitalize">{report.cropType}</p>
                    <p className="text-forest-400 text-xs">{report.aiAnalysis?.detectedDisease || 'Pending analysis...'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border`}
                    style={{
                      color: SEVERITY_COLORS[report.severity],
                      borderColor: SEVERITY_COLORS[report.severity] + '50',
                      backgroundColor: SEVERITY_COLORS[report.severity] + '10'
                    }}>
                    {report.severity}
                  </span>
                  <span className="text-forest-600 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                  <span className="text-forest-600 group-hover:text-forest-300 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
