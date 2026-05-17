'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function MarkAttendanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const sessionId = searchParams.get('sessionId');
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth_required'>('loading');
  const [message, setMessage] = useState('Verifying attendance...');

  useEffect(() => {
    if (!sessionId || !token) {
      setStatus('error');
      setMessage('Invalid QR Code. Missing session or token information.');
      return;
    }

    const markAttendance = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If not logged in, they need to log in first.
          // Save the current URL so we can redirect back after login.
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
          }
          setStatus('auth_required');
          setMessage('You must be logged in to mark attendance.');
          return;
        }

        const res = await fetch('/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            sessionId,
            qrCodeToken: token,
            deviceInfo: navigator.userAgent
          })
        });

        const data = await res.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Attendance marked successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to mark attendance. The QR code might have expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred.');
      }
    };

    markAttendance();
  }, [sessionId, token, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />
      
      <Card className="glass border-border/50 w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Mark Attendance</CardTitle>
          <CardDescription>Scanning from Web / Google Lens</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-lg font-medium animate-pulse">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <p className="text-lg font-medium text-emerald-600 text-center">{message}</p>
              <Link href="/dashboard" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors text-center mt-4 block">
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              <p className="text-lg font-medium text-destructive text-center">{message}</p>
              <Link href="/dashboard" className="w-full border border-border bg-background py-2 rounded-md font-medium hover:bg-muted transition-colors text-center mt-4 block">
                Return Home
              </Link>
            </>
          )}

          {status === 'auth_required' && (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-amber-500" />
              </div>
              <p className="text-lg font-medium text-amber-600 text-center">{message}</p>
              <Link href="/login" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors text-center mt-4 block">
                Log In
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarkAttendancePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <MarkAttendanceContent />
    </Suspense>
  );
}
