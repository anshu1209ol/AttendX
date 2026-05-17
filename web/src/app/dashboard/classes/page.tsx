'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, BookOpen, Upload, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClassData {
  _id: string;
  name: string;
  code: string;
  day?: string;
  time?: string;
  room?: string;
  students?: any[];
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchClasses = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/classes/me', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.success) {
        setClasses(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch classes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('timetable', file);

      const res = await fetch('/api/classes/upload-timetable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Successfully parsed and added ${data.data?.length || 0} classes!`);
        fetchClasses(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to parse timetable');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes & Timetable</h1>
          <p className="text-muted-foreground mt-1">Manage your classes and view your weekly schedule.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Processing AI...' : 'Upload AI Timetable'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-md">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="glass border-dashed p-12 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-1">No classes found</h3>
          <p>Upload a timetable image to automatically generate your schedule.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {days.map((day, idx) => {
            const dayClasses = classes.filter(c => c.day === day);
            
            if (dayClasses.length === 0) return null;

            return (
              <motion.div 
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-primary">{day}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayClasses.map((cls) => (
                    <Card key={cls._id} className="glass border-border/50 hover:border-primary/50 transition-colors group">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold uppercase">
                            {cls.code.split('-')[0]}
                          </div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
                            {cls.students?.length || 0} Enrolled
                          </span>
                        </div>
                        <CardTitle className="text-lg mt-4 leading-tight">{cls.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pb-6">
                        <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <Clock className="w-4 h-4 mr-2 text-primary/70" />
                          {cls.time || 'Time TBA'}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                          {cls.room || 'Room TBA'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
