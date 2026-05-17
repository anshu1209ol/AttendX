'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { LogOut, Home, Users, QrCode, Settings, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Interactive3DBackground from '@/components/Interactive3DBackground';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
          className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  if (!user) return null;

  const role = user.user_metadata?.role || 'student';

  const isActive = (href: string) => pathname === href;

  const getLinkStyle = (href: string) => {
    const active = isActive(href);
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5 border-l-2 border-primary pl-2.5' 
        : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground hover:translate-x-0.5'
    }`;
  };

  return (
    <div className="min-h-screen bg-transparent flex text-foreground relative overflow-hidden">
      <Interactive3DBackground />
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border/50 flex flex-col relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <QrCode className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">AttendX</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className={getLinkStyle('/dashboard')}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          
          {role === 'admin' && (
            <Link href="/dashboard/users" className={getLinkStyle('/dashboard/users')}>
              <Users className="w-5 h-5" />
              Manage Users
            </Link>
          )}
          
          {role === 'teacher' && (
            <>
              <Link href="/dashboard/classes" className={getLinkStyle('/dashboard/classes')}>
                <Home className="w-5 h-5" />
                My Classes
              </Link>
              <Link href="/dashboard/session" className={getLinkStyle('/dashboard/session')}>
                <QrCode className="w-5 h-5" />
                Session QR
              </Link>
            </>
          )}
          
          {role === 'student' && (
            <>
              <Link href="/dashboard/classes" className={getLinkStyle('/dashboard/classes')}>
                <Home className="w-5 h-5" />
                My Classes
              </Link>
              <Link href="/dashboard/scan" className={getLinkStyle('/dashboard/scan')}>
                <QrCode className="w-5 h-5" />
                Scan QR
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">
              {user.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</span>
              <span className="text-xs text-muted-foreground capitalize mt-1">{role}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-border/50"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />
        <div className="flex-1 overflow-y-auto p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
