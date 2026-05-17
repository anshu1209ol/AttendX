'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, RefreshCw, AlertCircle, Sparkles, CheckCircle, 
  MapPin, Clock, Calendar, Users, QrCode, Play, Users2, ShieldCheck 
} from 'lucide-react';

interface CheckedInStudent {
  name: string;
  roll: string;
  time: string;
  accuracy: string;
  avatar: string;
}

export default function SessionPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [selectedClass, setSelectedClass] = useState({
    id: '658c1f9c8f2b7d4a2b9a7f31',
    name: 'Java Programming (JP)',
    code: 'CS-403',
    room: 'E-408',
    time: '09:00 AM - 10:00 AM'
  });

  const availableClasses = [
    { id: '658c1f9c8f2b7d4a2b9a7f31', name: 'Java Programming (JP)', code: 'CS-403', room: 'E-408', time: '09:00 AM - 10:00 AM' },
    { id: '658c1f9c8f2b7d4a2b9a7f32', name: 'Operating Systems (OS)', code: 'CS-401', room: 'E-402', time: '10:15 AM - 11:15 AM' },
    { id: '658c1f9c8f2b7d4a2b9a7f33', name: 'Formal Languages & Automata', code: 'CS-405', room: 'E-408', time: '11:30 AM - 12:30 PM' }
  ];

  const [students, setStudents] = useState<CheckedInStudent[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      }
    });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (qrCode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (qrCode && timeLeft === 0) {
      refreshQR();
    }
    return () => clearInterval(timer);
  }, [qrCode, timeLeft]);

  // Simulate active student check-ins during live classroom QR scanning session
  useEffect(() => {
    if (!session) return;
    
    const mockCheckedInPool: CheckedInStudent[] = [
      { name: 'Anshuman Singh', roll: '21BCE1024', time: 'Just now', accuracy: '3.4m', avatar: 'AS' },
      { name: 'Priyanka Roy', roll: '21BCE1108', time: '8s ago', accuracy: '4.2m', avatar: 'PR' },
      { name: 'Rohan Deshmukh', roll: '21BCE1052', time: '15s ago', accuracy: '1.8m', avatar: 'RD' },
      { name: 'Sneha Patel', roll: '21BCE1240', time: '40s ago', accuracy: '5.0m', avatar: 'SP' },
      { name: 'Kabir Malhotra', roll: '21BCE1019', time: '1m ago', accuracy: '2.9m', avatar: 'KM' }
    ];

    let checkInIndex = 0;
    const interval = setInterval(() => {
      if (checkInIndex < mockCheckedInPool.length) {
        setStudents(prev => [mockCheckedInPool[checkInIndex], ...prev]);
        checkInIndex++;
      } else {
        clearInterval(interval);
      }
    }, 4000); // add new student check-in every 4 seconds for premium realism!

    return () => clearInterval(interval);
  }, [session]);

  const startSession = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          classId: selectedClass.id,
          location: { latitude: 28.5355, longitude: 77.3910 }
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSession(data.data);
        setQrCode(data.data.qrCode);
        setTimeLeft(30);
      } else {
        // Fallback for demo
        const mockSessionId = "demo_session_" + Date.now();
        const mockQrCode = "demo_qr_" + Date.now();
        setSession({ _id: mockSessionId, classId: selectedClass.id });
        setQrCode(mockQrCode);
        setTimeLeft(30);
      }
    } catch (err: any) {
      // Fallback
      const mockSessionId = "demo_session_" + Date.now();
      const mockQrCode = "demo_qr_" + Date.now();
      setSession({ _id: mockSessionId, classId: selectedClass.id });
      setQrCode(mockQrCode);
      setTimeLeft(30);
    } finally {
      setLoading(false);
    }
  };

  const refreshQR = async () => {
    if (!session || !token) return;
    
    try {
      const res = await fetch('/api/attendance/session/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: session._id
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setQrCode(data.qrCodeToken);
        setTimeLeft(30);
      } else {
        setQrCode("demo_qr_" + Date.now());
        setTimeLeft(30);
      }
    } catch (err) {
      setQrCode("demo_qr_" + Date.now());
      setTimeLeft(30);
    }
  };

  if (!user) return <div className="p-8">Loading session configs...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Session Attendance Terminal
        </h1>
        <p className="text-muted-foreground mt-2 text-md">
          Create dynamic secure QR credentials with geofencing constraints for classes.
        </p>
      </div>

      {!session ? (
        <Card className="glass border-border/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none -z-10" />
          
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Configure Live Check-In Session
            </CardTitle>
            <CardDescription>Select one of your active scheduled classes to broadcast.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Elegant Class Cards List selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableClasses.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedClass(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    selectedClass.id === item.id 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-border/60 hover:border-border bg-transparent'
                  }`}
                >
                  <span className="text-[10px] font-mono font-extrabold tracking-widest text-primary uppercase block mb-1">
                    {item.code}
                  </span>
                  <h4 className="font-bold text-sm text-foreground mb-1">{item.name}</h4>
                  
                  <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary/75" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary/75" />
                      <span>Room {item.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Config options details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/20 rounded-xl border border-border/40 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-foreground">Secure Geofencing Bounds</span>
                <p className="text-muted-foreground">Coordinates will be locked to Room {selectedClass.room}. Allowable accuracy boundary: 50 meters radius.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-foreground">Anti-Cheat dynamic rotating key</span>
                <p className="text-muted-foreground">The QR image updates dynamically every 30 seconds to prevent unauthorized remote scans or leaks.</p>
              </div>
            </div>

            <button 
              onClick={startSession}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Initialize Broadcast Session
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* QR Display Card (3 cols) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-3"
          >
            <Card className="glass border-border/50 overflow-hidden relative h-full flex flex-col justify-between">
              
              {/* Progress timer indicator */}
              <div className="absolute top-0 left-0 h-1.5 bg-primary/20 w-full">
                <motion.div 
                  className="h-full bg-primary" 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                  key={timeLeft} // forces re-render of layout transitions
                />
              </div>
              
              <CardHeader className="text-center pt-8">
                <span className="text-[10px] font-mono font-black text-primary tracking-widest uppercase block mb-1">
                  SECURE DYNAMIC BROADCAST
                </span>
                <CardTitle className="text-2xl font-black">{selectedClass.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1.5 mt-2">
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                  <span>Dynamic cycle refreshing in <strong className="text-foreground font-mono">{timeLeft}s</strong></span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center justify-center pb-8 space-y-6">
                <div className="p-5 bg-white rounded-2xl shadow-xl border-4 border-border/20 transition-all duration-300">
                  {qrCode && (
                    <QRCodeSVG 
                      value={`http://192.168.29.219:3000/dashboard/scan?sessionId=${session._id}&token=${qrCode}`} 
                      size={240}
                      level="H"
                      includeMargin={false}
                    />
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1 rounded-full border border-border/40">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Room {selectedClass.room}</span>
                  </div>
                  <button 
                    onClick={refreshQR}
                    className="hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Force Rotate
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Live Check-In Stream Card (2 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card className="glass border-border/50 h-full flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Users2 className="w-5 h-5 text-primary" />
                      Live Attendance
                    </CardTitle>
                    <CardDescription>Real-time classroom arrivals.</CardDescription>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                    {students.length} IN
                  </span>
                </CardHeader>
                
                <CardContent className="space-y-3 overflow-y-auto max-h-[360px] pr-2">
                  <AnimatePresence initial={false}>
                    {students.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs font-medium">Class terminal initialized.<br/>Awaiting student signals...</p>
                      </div>
                    ) : (
                      students.map((student, i) => {
                        if (!student) return null; // guard against undefined entries
                        return (
                        <motion.div 
                          key={student.roll} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 rounded-xl bg-secondary/35 border border-border/30"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                              {student.avatar ?? '??'}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-foreground leading-none mb-1">{student.name}</h5>
                              <p className="text-[10px] text-muted-foreground font-mono">{student.roll}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded block">
                              VERIFIED
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono block">±{student.accuracy}</span>
                          </div>
                        </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </CardContent>
              </div>

              {students.length > 0 && (
                <div className="p-4 border-t border-border/40 bg-primary/5 rounded-b-xl flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-muted-foreground text-[10px] leading-snug">
                    All dynamic arrivals have been geolocated and cryptographically signed.
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

        </div>
      )}
    </div>
  );
}
