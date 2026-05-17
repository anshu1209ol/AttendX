'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Users, Calendar, Clock, ArrowUpRight, TrendingUp, CheckCircle, AlertCircle, 
  MapPin, ShieldAlert, Sparkles, Plus, Award, Activity, Play, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  type: 'check_in' | 'warning' | 'system' | 'award';
  title: string;
  desc: string;
  time: string;
  badge?: string;
  badgeColor?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'classes'>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([
    { 
      id: 'act-1', 
      type: 'check_in', 
      title: 'Geofenced Check-In Verified', 
      desc: 'Java Programming (JP) in Room E-408. GPS verified inside 50m radius.', 
      time: '2 mins ago',
      badge: 'SUCCESS',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    { 
      id: 'act-2', 
      type: 'system', 
      title: 'Timetable AI Schema Synced', 
      desc: 'Parsed IV-A Semester Schedule. Added 24 classes successfully.', 
      time: '1 hour ago',
      badge: 'AI PARSED',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    { 
      id: 'act-3', 
      type: 'warning', 
      title: 'Attendance Advisory Alert', 
      desc: 'Discrete Mathematics is at 62% attendance. Minimum target is 75%.', 
      time: 'Yesterday',
      badge: 'ATTENTION',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20'
    },
    { 
      id: 'act-4', 
      type: 'award', 
      title: 'Perfect Week Achieved', 
      desc: 'Completed all 5 scheduled days without missing a single block.', 
      time: '3 days ago',
      badge: 'STREAK',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  ]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (!user) return null;

  const role = user.user_metadata?.role || 'student';
  const name = user.user_metadata?.full_name?.split(' ')[0] || 'User';

  const stats = [
    { 
      label: 'Schedules Tracked', 
      value: role === 'admin' ? '124 Courses' : '5 Subjects', 
      subtext: 'Synchronized weekly',
      icon: Calendar, 
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
    },
    { 
      label: role === 'student' ? 'Attendance Level' : 'Total Students', 
      value: role === 'student' ? '88.4%' : '850 Active', 
      subtext: role === 'student' ? '+2.4% this semester' : 'Across 12 departments',
      icon: TrendingUp, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      label: 'Active QR Sessions', 
      value: '3 Sessions', 
      subtext: 'Within geofences',
      icon: Clock, 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
    },
  ];

  // Simulated live event trigger for superior UX demonstration
  const handleSimulateCheckIn = () => {
    const subjects = ['Operating Systems', 'Formal Languages', 'Cybersecurity', 'French IV'];
    const randomSub = subjects[Math.floor(Math.random() * subjects.length)];
    const newAct: ActivityItem = {
      id: `sim-${Date.now()}`,
      type: 'check_in',
      title: `Simulated check-in for ${randomSub}`,
      desc: `Check-in generated at ${new Date().toLocaleTimeString()} within verified department geofence bounds.`,
      time: 'Just now',
      badge: 'LIVE SIM',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    };

    setActivities(prev => [newAct, ...prev]);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden p-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-[90px] pointer-events-none -z-10" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Attendance Dashboard v2.0</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">{name}</span>
          </h1>
          <p className="text-muted-foreground text-md max-w-xl">
            Geo-fencing tracking is active. You are registered under the{' '}
            <span className="text-foreground font-semibold uppercase font-mono">{role}</span> profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateCheckIn}
            className="bg-secondary hover:bg-secondary/80 text-foreground border border-border px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            Simulate Check-In
          </button>
          
          {role === 'teacher' ? (
            <Link 
              href="/dashboard/session" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              <QrCode className="w-4 h-4" />
              Generate QR
            </Link>
          ) : (
            <Link 
              href="/dashboard/scan" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
            >
              <QrCode className="w-4 h-4" />
              Scan QR Check-In
            </Link>
          )}
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{stat.subtext}</p>
                </div>
                <div className={`p-4 rounded-xl border ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout (Analytics & Realtime Stream) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Visual Analytics Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Attendance Analytics & Insights</CardTitle>
                <CardDescription>Visual metrics based on your active timetable sessions.</CardDescription>
              </div>
              <Award className="w-6 h-6 text-amber-400" />
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Circular SVG progress wheel */}
              <div className="flex flex-col sm:flex-row items-center justify-around p-6 bg-secondary/25 border border-border/40 rounded-2xl gap-6">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="72" cy="72" r="60" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="10" 
                      fill="none" 
                    />
                    <motion.circle 
                      cx="72" cy="72" r="60" 
                      stroke="var(--color-primary)" 
                      strokeWidth="10" 
                      fill="none" 
                      strokeDasharray="377" 
                      initial={{ strokeDashoffset: 377 }}
                      animate={{ strokeDashoffset: 377 - (377 * 88.4) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black block tracking-tighter">88.4%</span>
                    <span className="text-[10px] font-bold text-emerald-400">EXCELLENT</span>
                  </div>
                </div>

                <div className="space-y-4 max-w-sm">
                  <h4 className="text-sm font-bold text-foreground">Semester Attendance Rating</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You have maintained a perfect standing of 88.4% across all registered timetable courses. Keep this above 75% to avoid syllabus restriction notices.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>4 Subjects Safe</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>1 Subject Warning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress level bars by Subject */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject Standings</h4>
                
                {[
                  { name: 'Java Programming (JP)', rate: 94, sessions: '12/13 held', status: 'Safe', color: 'bg-emerald-500' },
                  { name: 'Operating Systems (OS)', rate: 89, sessions: '10/11 held', status: 'Safe', color: 'bg-emerald-500' },
                  { name: 'Formal Languages & Automata', rate: 78, sessions: '8/10 held', status: 'Safe', color: 'bg-primary' },
                  { name: 'Discrete Mathematics', rate: 62, sessions: '7/11 held', status: 'Advisory Warning', color: 'bg-red-500' }
                ].map((subject, index) => (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">{subject.name}</span>
                      <span className="text-muted-foreground font-mono">{subject.rate}% ({subject.sessions})</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex items-center justify-start">
                      <motion.div 
                        className={`h-full rounded-full ${subject.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.rate}%` }}
                        transition={{ duration: 1.2, delay: index * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Realtime Stream / Activity Feed (1 col) */}
        <div className="space-y-6">
          <Card className="glass border-border/50 h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Activity Logs
                  </CardTitle>
                  <CardDescription>Live geofenced actions stream.</CardDescription>
                </div>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </CardHeader>
              
              <CardContent className="space-y-4 overflow-y-auto max-h-[420px] pr-2">
                <AnimatePresence initial={false}>
                  {activities.map((act) => (
                    <motion.div 
                      key={act.id} 
                      initial={{ opacity: 0, x: -10, y: -10 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3 bg-secondary/35 border border-border/30 rounded-xl space-y-2 relative"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${act.badgeColor}`}>
                          {act.badge}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono font-semibold">{act.time}</span>
                      </div>
                      <h5 className="text-xs font-bold text-foreground">{act.title}</h5>
                      <p className="text-[11px] text-muted-foreground leading-normal">{act.desc}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </div>

            <div className="p-6 border-t border-border/40">
              <Link 
                href="/dashboard/classes" 
                className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-xl text-xs font-bold transition-all border border-border/50 flex items-center justify-center gap-1.5"
              >
                View Complete Timetable
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
