import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advisoryAPI } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Bell, ChevronRight, Loader2 } from 'lucide-react';

export default function Advisories() {
  const navigate = useNavigate();
  const [data, setData] = useState({ advisories: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    advisoryAPI.getAll({ limit: 50 }).then(res => {
      setData(res);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold tracking-tight">Alerts & Advisories</h1>
          {data.unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full px-2.5 py-0.5">{data.unreadCount} New</Badge>
          )}
        </div>
        <p className="text-muted-foreground">AI-generated treatment plans and alerts</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : data.advisories.length === 0 ? (
        <Card className="py-20 text-center border-dashed">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No advisories yet</h3>
          <p className="text-muted-foreground">Submit a disease report to receive AI advisories</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {data.advisories.map(a => (
            <Card key={a.id} className={`cursor-pointer transition-colors hover:border-primary/50 ${!a.isRead ? 'bg-muted/30 border-primary/30' : ''}`} 
                  onClick={() => navigate(`/reports/${a.report?.id}`)}>
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{a.diseaseInfo?.name || 'Unknown Disease'}</h3>
                    {!a.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{a.diseaseInfo?.description || 'No description available'}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    Crop: <span className="capitalize text-foreground mr-2">{a.report?.cropType}</span> 
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
