import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LiveDetection() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Detection</h1>
        <p className="text-muted-foreground mt-1">Real-time crop analysis using your device camera</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-muted/20">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Camera className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We are currently building real-time video stream analysis. For now, please use the Crop Analysis tool to upload photos.
        </p>
        <Button onClick={() => window.location.href = '/reports/new'}>Go to Crop Analysis</Button>
      </Card>
    </div>
  );
}
