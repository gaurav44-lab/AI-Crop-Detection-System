import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Leaf, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-3xl tracking-tight">CropAI</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground mt-1">Sign in to your dashboard</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="farmer@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <Input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-3 bg-secondary/50 rounded-lg text-center border border-border">
              <p className="text-muted-foreground text-xs">Demo: demo@cropguard.ai / password123</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-muted-foreground">
              New to CropAI? <Link to="/register" className="text-primary hover:underline font-medium">Create account</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
