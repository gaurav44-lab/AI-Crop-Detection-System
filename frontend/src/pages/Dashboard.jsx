import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Leaf, AlertCircle, Target, Upload, Camera, FileText, Share2, Download, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { reportsAPI, dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const mockChartData = [
  { name: 'Mon', healthy: 4000, issues: 2400 },
  { name: 'Tue', healthy: 3000, issues: 1398 },
  { name: 'Wed', healthy: 2000, issues: 9800 },
  { name: 'Thu', healthy: 2780, issues: 3908 },
  { name: 'Fri', healthy: 1890, issues: 4800 },
  { name: 'Sat', healthy: 2390, issues: 3800 },
  { name: 'Sun', healthy: 3490, issues: 4300 },
];

const mockRecentFeed = [
  { id: 1, crop: 'Wheat Field A', status: 'Healthy', confidence: 98, time: '2m ago', image: '🌾' },
  { id: 2, crop: 'Tomato Sector 4', status: 'Critical', confidence: 92, time: '15m ago', image: '🍅' },
  { id: 3, crop: 'Corn Block B', status: 'Warning', confidence: 85, time: '1h ago', image: '🌽' },
  { id: 4, crop: 'Rice Paddy East', status: 'Healthy', confidence: 99, time: '3h ago', image: '🍚' },
  { id: 5, crop: 'Potato Field 1', status: 'Warning', confidence: 78, time: '5h ago', image: '🥔' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.getStats().then(data => {
      setStats(data.stats);
    }).catch(console.error);
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    // Redirect to new report page and we would pass the file if we used global state,
    // but for now, we just redirect so they can upload it properly
    navigate('/reports/new');
    toast.success('Please upload your image here to begin analysis');
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'image/*': []}, maxFiles: 1 });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor your crops in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Crops Analyzed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReports || '12,847'}</div>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-primary">↑ +14%</span> from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Healthy Crops</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-primary">↑ +2.1%</span> from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues Detected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeReports || '743'}</div>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-destructive">↓ -4%</span> from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Detection Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground mt-1"><span className="text-primary">↑ +0.3%</span> from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Detection Panel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Detection Panel</CardTitle>
            <CardDescription>Upload a crop image for instant AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Drop crop image here or click to upload</h3>
              <p className="text-sm text-muted-foreground mb-6">Supports JPG, PNG up to 10MB</p>
              <div className="flex justify-center gap-4" onClick={e => e.stopPropagation()}>
                <Button variant="outline" className="gap-2" onClick={() => navigate('/reports/new')}><Upload className="h-4 w-4"/> Upload File</Button>
                <Button className="gap-2" onClick={() => navigate('/reports/new')}><Camera className="h-4 w-4"/> Use Camera</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequent tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="h-auto py-4 px-4 justify-start text-left font-normal hover:bg-secondary">
              <Layers className="h-5 w-5 mr-4 text-primary" />
              <div>
                <div className="font-medium">Batch Analysis</div>
                <div className="text-xs text-muted-foreground">Upload multiple images</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 px-4 justify-start text-left font-normal hover:bg-secondary">
              <FileText className="h-5 w-5 mr-4 text-primary" />
              <div>
                <div className="font-medium">Generate Report</div>
                <div className="text-xs text-muted-foreground">Weekly health summary</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 px-4 justify-start text-left font-normal hover:bg-secondary">
              <Download className="h-5 w-5 mr-4 text-primary" />
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-xs text-muted-foreground">Download as CSV/PDF</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 px-4 justify-start text-left font-normal hover:bg-secondary">
              <Share2 className="h-5 w-5 mr-4 text-primary" />
              <div>
                <div className="font-medium">Share Results</div>
                <div className="text-xs text-muted-foreground">Send to agronomist</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Crop Health Trends</CardTitle>
            <CardDescription>Past 7 days analysis breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="issues" stroke="#64748b" fillOpacity={1} fill="url(#colorIssues)" />
                <Area type="monotone" dataKey="healthy" stroke="#22c55e" fillOpacity={1} fill="url(#colorHealthy)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Analysis Feed</CardTitle>
            <CardDescription>Latest crop scans across your fields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentFeed.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl">
                    {item.image}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.crop}</p>
                    <p className="text-sm text-muted-foreground">{item.confidence}% confidence</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={item.status === 'Healthy' ? 'outline' : item.status === 'Warning' ? 'secondary' : 'destructive'} 
                           className={item.status === 'Healthy' ? 'border-primary text-primary' : ''}>
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">View All History →</Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
