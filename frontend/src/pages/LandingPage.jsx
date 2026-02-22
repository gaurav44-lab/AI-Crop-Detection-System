import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🔬', title: 'AI-Powered Diagnosis', desc: 'Upload crop images and get instant disease detection with confidence scores powered by advanced computer vision.' },
  { icon: '📋', title: 'Expert Advisories', desc: 'Receive detailed treatment plans, organic alternatives, and preventive measures tailored to your crop and disease.' },
  { icon: '🌐', title: 'Community Reports', desc: 'Learn from other farmers in your region. Stay ahead of disease outbreaks with real-time community insights.' },
  { icon: '📊', title: 'Farm Analytics', desc: 'Track disease patterns, monitor crop health over time, and make data-driven decisions for your farm.' },
];

const stats = [
  { value: '50+', label: 'Diseases Detected' },
  { value: '95%', label: 'Accuracy Rate' },
  { value: '12+', label: 'Crop Types' },
  { value: '< 2min', label: 'Analysis Time' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060e08] font-body overflow-x-hidden">
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-forest-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-forest-900/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-display font-bold text-white text-xl">CropGuard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-forest-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
          <Link to="/register" className="bg-forest-600 hover:bg-forest-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-forest-900/50 border border-forest-700/50 rounded-full px-4 py-2 text-forest-300 text-sm mb-8">
          <span className="w-2 h-2 bg-forest-400 rounded-full animate-pulse" />
          AI-Powered Crop Disease Detection
        </div>
        <h1 className="font-display font-bold text-white text-5xl md:text-7xl leading-tight mb-6 max-w-4xl mx-auto">
          Detect. Diagnose.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-400 to-earth-400">
            Save Your Harvest.
          </span>
        </h1>
        <p className="text-forest-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Upload a photo of your diseased crop and get an AI-powered diagnosis in under 2 minutes — complete with treatment plans and expert advisories.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-400 hover:to-forest-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-forest-900/50 hover:shadow-forest-800/50 hover:-translate-y-0.5">
            Start Free Analysis →
          </Link>
          <Link to="/login"
            className="w-full sm:w-auto border border-forest-700 text-forest-300 hover:border-forest-500 hover:text-white font-medium px-8 py-4 rounded-xl transition-all duration-300">
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-forest-900/50 bg-forest-950/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-forest-900/50">
          {stats.map(stat => (
            <div key={stat.label} className="px-8 py-6 text-center">
              <div className="font-display font-bold text-3xl text-forest-300">{stat.value}</div>
              <div className="text-forest-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <h2 className="font-display font-bold text-white text-3xl md:text-4xl text-center mb-4">
          Everything you need to protect your crops
        </h2>
        <p className="text-forest-400 text-center mb-16 max-w-xl mx-auto">From instant diagnosis to long-term management strategies, CropGuard has you covered.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title}
              className="bg-forest-950/50 border border-forest-800/50 rounded-2xl p-6 hover:border-forest-600/50 transition-all duration-300 hover:-translate-y-1 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="text-forest-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-forest-900/80 to-forest-950/80 border border-forest-700/50 rounded-3xl p-12">
          <h2 className="font-display font-bold text-white text-3xl md:text-4xl mb-4">Ready to protect your harvest?</h2>
          <p className="text-forest-300 mb-8">Join thousands of farmers using AI to fight crop diseases.</p>
          <Link to="/register"
            className="inline-block bg-gradient-to-r from-earth-500 to-earth-600 hover:from-earth-400 hover:to-earth-500 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 border-t border-forest-900/50 text-forest-600 text-sm">
        © 2024 CropGuard AI. Built for farmers, by technology.
      </footer>
    </div>
  );
}
