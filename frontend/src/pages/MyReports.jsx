import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const STATUS_ICONS = { pending: '⏳', analyzing: '🔬', analyzed: '✅', advisory_sent: '📋', resolved: '✓', escalated: '⚠️' };

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCrop, setFilterCrop] = useState('');

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterCrop]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterStatus) params.status = filterStatus;
      if (filterCrop) params.cropType = filterCrop;
      const data = await reportsAPI.getAll(params);
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Track all your crop disease analysis reports</p>
        </div>
        <Button onClick={() => navigate('/reports/new')} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Report
        </Button>
      </div>

      <Card className="bg-muted/10">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-8 bg-background" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="analyzing">Analyzing</option>
            <option value="analyzed">Analyzed</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={filterCrop} onChange={e => setFilterCrop(e.target.value)}
            className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none capitalize">
            <option value="">All Crops</option>
            <option value="wheat">Wheat</option>
            <option value="rice">Rice</option>
            <option value="tomato">Tomato</option>
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : reports.length === 0 ? (
        <Card className="py-20 text-center border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No reports found</h3>
          <p className="text-muted-foreground mb-6">Start by submitting your first crop disease report</p>
          <Button onClick={() => navigate('/reports/new')}>Create Report</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map(r => (
            <Card key={r.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/reports/${r.id}`)}>
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-2xl">
                  🌾
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize text-lg">{r.cropType}</h3>
                    <Badge variant={r.status === 'analyzed' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {STATUS_ICONS[r.status] || ''} {r.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{r.symptoms}</p>
                  {r.aiAnalysis?.detectedDisease && (
                    <p className="text-xs font-medium text-primary mt-1">🔬 {r.aiAnalysis.detectedDisease} ({r.aiAnalysis.confidence}%)</p>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-center">
                  <Badge variant="outline" className={`capitalize ${
                    r.severity === 'critical' ? 'text-destructive border-destructive/50' : 
                    r.severity === 'high' ? 'text-orange-500 border-orange-500/50' : 
                    'text-muted-foreground'
                  }`}>{r.severity}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
