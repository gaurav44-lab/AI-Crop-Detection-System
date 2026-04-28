import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MessageSquare } from 'lucide-react';

export default function Community() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="text-muted-foreground mt-1">Connect with other farmers and experts</p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-muted/20">
        <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Community Features Coming Soon</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We are currently building discussion forums and expert QA features. 
          Soon you'll be able to share your public reports and get insights from local agronomists.
        </p>
        <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> Notify Me When Live</Button>
      </Card>
    </div>
  );
}
