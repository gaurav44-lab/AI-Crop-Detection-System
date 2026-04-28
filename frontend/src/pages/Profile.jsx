import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Save } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farmDetails: { location: '', farmSize: '', primaryCrops: [] }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        farmDetails: {
          location: user.farmDetails?.location || '',
          farmSize: user.farmDetails?.farmSize || '',
          primaryCrops: user.farmDetails?.primaryCrops || []
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      // Update local storage and context
      const currentToken = localStorage.getItem('token');
      login(res.user, currentToken);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and farm details</p>
      </div>

      <div className="flex items-center gap-6 p-6 border rounded-xl bg-card">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Farm Details</CardTitle>
            <CardDescription>Help us provide better local insights</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="District, State" value={formData.farmDetails.location} onChange={e => setFormData(f => ({ ...f, farmDetails: { ...f.farmDetails, location: e.target.value } }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Farm Size (acres)</label>
              <Input type="number" step="0.1" value={formData.farmDetails.farmSize} onChange={e => setFormData(f => ({ ...f, farmDetails: { ...f.farmDetails, farmSize: e.target.value } }))} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
