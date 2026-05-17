'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { QrCode, Users, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) return null;

  const role = user.user_metadata?.role || 'student';

  const stats = [
    { label: 'Total Classes', value: role === 'admin' ? '124' : '5', icon: Calendar, color: 'text-blue-500' },
    { label: role === 'student' ? 'Attendance Rate' : 'Total Students', value: role === 'student' ? '92%' : '850', icon: Users, color: 'text-emerald-500' },
    { label: 'Active Sessions', value: '3', icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}</h1>
          <p className="text-muted-foreground mt-1">Here is what's happening today.</p>
        </div>
        {role === 'teacher' && (
          <Link href="/dashboard/session" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <QrCode className="w-4 h-4" />
            Generate Session QR
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass border-border/50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-4 rounded-xl bg-background/50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Role specific content below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="glass border-border/50 col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 border border-dashed border-border/50 rounded-lg text-muted-foreground bg-background/30">
              No recent activity to display.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
