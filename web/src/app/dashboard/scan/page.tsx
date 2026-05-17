'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, CheckCircle2, XCircle, Camera, AlertCircle } from 'lucide-react';

export default function StudentScannerPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
      }
    });
  }, []);

  const handleScan = async (text: string) => {
    if (status === 'processing' || status === 'success') return;
    
    try {
      setStatus('processing');
      setMessage('Verifying attendance...');
      setIsCameraActive(false);

      // Parse the URL to get sessionId and token
      let sessionId = '';
      let qrToken = '';

      try {
        const url = new URL(text);
        sessionId = url.searchParams.get('sessionId') || '';
        qrToken = url.searchParams.get('token') || '';
      } catch (e) {
        // Fallback if the QR text is not a URL but some other format
        throw new Error("Invalid QR Code format.");
      }

      if (!sessionId || !qrToken) {
        throw new Error("Missing session information in QR Code.");
      }

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          qrCodeToken: qrToken,
          deviceInfo: navigator.userAgent
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Attendance marked successfully!');
      } else {
        throw new Error(data.message || 'Failed to mark attendance. The QR code might have expired.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setMessage('');
    setIsCameraActive(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Attendance Scanner</h1>
        <p className="text-muted-foreground mt-1">Scan your teacher's session QR code to mark your attendance.</p>
      </div>

      <Card className="glass border-border/50 overflow-hidden relative">
        <CardHeader className="text-center">
          <CardTitle>Scan Code</CardTitle>
          <CardDescription>Align the QR code within the frame</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6 min-h-[400px]">
          
          {(status === 'idle' || status === 'scanning') && (
            <div className="w-full max-w-sm aspect-square relative bg-black/5 rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 flex items-center justify-center">
              {!isCameraActive ? (
                <button 
                  onClick={() => setIsCameraActive(true)}
                  className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <Camera className="w-12 h-12 mb-2" />
                  <span className="font-medium">Tap to open camera</span>
                </button>
              ) : (
                <div className="w-full h-full relative">
                  <Scanner 
                    onScan={(result) => handleScan(result[0].rawValue)}
                    formats={['qr_code']}
                    components={{
                      audio: false,
                      finder: true,
                    }}
                    styles={{
                      container: { width: '100%', height: '100%' },
                    }}
                  />
                  <button 
                    onClick={() => setIsCameraActive(false)}
                    className="absolute top-4 right-4 bg-background/80 backdrop-blur text-foreground px-3 py-1 rounded-full text-xs font-medium border border-border z-50"
                  >
                    Close Camera
                  </button>
                </div>
              )}
            </div>
          )}

          {status === 'processing' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-lg font-medium animate-pulse">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-emerald-600 text-center">{message}</p>
              <button onClick={resetScanner} className="mt-4 bg-primary text-primary-foreground py-2 px-6 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Scan Another Class
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
                <XCircle className="w-14 h-14 text-destructive" />
              </div>
              <p className="text-lg font-medium text-destructive text-center max-w-md">{message}</p>
              <button onClick={resetScanner} className="mt-4 border border-border bg-background py-2 px-6 rounded-md font-medium hover:bg-muted transition-colors">
                Try Again
              </button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
