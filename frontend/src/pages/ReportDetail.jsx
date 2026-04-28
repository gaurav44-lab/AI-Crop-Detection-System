import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportsAPI, advisoryAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Loader2, Trash2, CheckCircle2, AlertTriangle, Info, Sprout, Beaker } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pollInterval;

    const loadData = async () => {
      try {
        const data = await reportsAPI.getOne(id);
        setReport(data.report);
        setAdvisory(data.advisory);
        
        // Start polling if analyzing
        if (data.report.status === 'analyzing' || data.report.status === 'pending') {
          if (!pollInterval) pollInterval = setInterval(loadData, 5000);
        } else if (pollInterval) {
          clearInterval(pollInterval);
          toast.success('Analysis complete!');
        }
      } catch (err) {
        toast.error(err.message);
        navigate('/reports');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => clearInterval(pollInterval);
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportsAPI.delete(id);
      toast.success('Report deleted');
      navigate('/reports');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResolve = async () => {
    try {
      await advisoryAPI.resolve(advisory.id);
      toast.success('Marked as resolved!');
      setReport(prev => ({ ...prev, status: 'resolved' }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!report) return null;

  const isAnalyzing = report.status === 'analyzing' || report.status === 'pending';

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/reports')} className="gap-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Details & Images */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Crop</span>
                <span className="font-medium capitalize">{report.cropType}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Severity</span>
                <Badge variant="outline" className="capitalize">{report.severity}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={report.status === 'analyzed' ? 'default' : 'secondary'} className="capitalize">{report.status.replace('_',' ')}</Badge>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {report.images && report.images.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {report.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden border">
                    <img src={img.path || img} alt="Crop" className="w-full h-full object-cover" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: AI & Advisory */}
        <div className="lg:col-span-2 space-y-6">
          
          {isAnalyzing && (
            <Card className="border-blue-500/50 bg-blue-500/10">
              <CardContent className="p-6 flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-500">AI Analysis in Progress</h3>
                  <p className="text-sm text-blue-500/80">Our models are processing your report. This usually takes 1-2 minutes.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {report.aiAnalysis?.detectedDisease && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">AI Diagnosis</p>
                    <h2 className="text-2xl font-bold">{report.aiAnalysis.detectedDisease}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{report.aiAnalysis.confidence}%</div>
                    <div className="text-xs text-muted-foreground">confidence</div>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${report.aiAnalysis.confidence}%` }}></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3"><CardTitle>Reported Symptoms</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{report.symptoms}</p>
            </CardContent>
          </Card>

          {advisory && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary"/> Treatment Plan</h2>
              
              {advisory.treatment?.immediate?.length > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-destructive flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4"/> Immediate Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    {advisory.treatment.immediate.map((i, idx) => (
                      <div key={idx} className="bg-background rounded-lg p-3 border border-destructive/20">
                        <p className="font-semibold text-sm mb-1">{i.action}</p>
                        {i.product && <p className="text-xs text-muted-foreground">Product: <span className="text-foreground">{i.product}</span></p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {advisory.treatment?.organic?.length > 0 && (
                <Card className="border-primary/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-primary flex items-center gap-2 text-base"><Sprout className="h-4 w-4"/> Organic Solutions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {advisory.treatment.organic.map((o, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span> {o}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {advisory.treatment?.chemical?.length > 0 && (
                <Card className="border-orange-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-orange-500 flex items-center gap-2 text-base"><Beaker className="h-4 w-4"/> Chemical Treatments</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-3">
                    {advisory.treatment.chemical.map((c, idx) => (
                      <div key={idx} className="bg-background rounded-lg p-3 border border-orange-500/20">
                        <p className="font-semibold text-sm mb-1">{c.name}</p>
                        {c.activeIngredient && <p className="text-xs text-muted-foreground">Active: {c.activeIngredient}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {report.status !== 'resolved' && (
                <Button onClick={handleResolve} className="w-full sm:w-auto mt-4 gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Mark as Resolved
                </Button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
