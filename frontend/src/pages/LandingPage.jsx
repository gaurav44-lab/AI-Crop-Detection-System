import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Leaf, Activity, Beaker, Users, ArrowRight } from 'lucide-react';

const features = [
  { icon: <Activity className="h-8 w-8 text-primary" />, title: 'AI-Powered Diagnosis', desc: 'Upload crop images and get instant disease detection with confidence scores powered by advanced computer vision.' },
  { icon: <Beaker className="h-8 w-8 text-primary" />, title: 'Expert Advisories', desc: 'Receive detailed treatment plans, organic alternatives, and preventive measures tailored to your crop and disease.' },
  { icon: <Users className="h-8 w-8 text-primary" />, title: 'Community Reports', desc: 'Learn from other farmers in your region. Stay ahead of disease outbreaks with real-time community insights.' },
  { icon: <Leaf className="h-8 w-8 text-primary" />, title: 'Farm Analytics', desc: 'Track disease patterns, monitor crop health over time, and make data-driven decisions for your farm.' },
];

const stats = [
  { value: '50+', label: 'Diseases Detected' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '12+', label: 'Crop Types' },
  { value: '< 2min', label: 'Analysis Time' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">CropAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-32 pb-20">
        <div className="inline-flex items-center gap-2 bg-secondary/50 border rounded-full px-4 py-1.5 text-sm mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          AI-Powered Crop Disease Detection
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6 max-w-4xl mx-auto">
          Detect. Diagnose.
          <br />
          <span className="text-primary">
            Save Your Harvest.
          </span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload a photo of your diseased crop and get an AI-powered diagnosis in under 2 minutes — complete with treatment plans and expert advisories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
            <Link to="/register">Start Free Analysis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x">
          {stats.map(stat => (
            <div key={stat.label} className="px-8 py-8 text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
          Everything you need to protect your crops
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">From instant diagnosis to long-term management strategies, CropAI has you covered.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <Card key={f.title} className="hover:border-primary/50 transition-colors group">
              <CardContent className="p-6">
                <div className="mb-6 bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center bg-primary/10 border border-primary/20 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to protect your harvest?</h2>
          <p className="text-muted-foreground mb-8 text-lg">Join thousands of farmers using AI to fight crop diseases.</p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/register">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 border-t text-muted-foreground text-sm">
        © 2024 CropAI. Built for farmers, by technology.
      </footer>
    </div>
  );
}
