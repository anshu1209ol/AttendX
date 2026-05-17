'use client';

import { motion } from 'framer-motion';
import { ArrowRight, QrCode, MapPin, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid relative overflow-hidden">
      {/* Abstract Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AttendX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-sm font-medium text-primary mb-8 border border-primary/20">
            <Zap className="w-4 h-4" />
            <span>Next-Gen Attendance System</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Smart Attendance, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Zero Friction.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Revolutionize your institution with geo-fenced QR attendance, real-time analytics, and role-based dashboards built for modern educators and students.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
              Start for free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-lg font-medium text-lg border border-border glass hover:bg-secondary/10 transition-all">
              View demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-32 grid md:grid-cols-3 gap-6"
          id="features"
        >
          {[
            {
              icon: <QrCode className="w-6 h-6 text-primary" />,
              title: "Dynamic QR Codes",
              desc: "Time-based, expiring QR codes prevent buddy punching and ensure physical presence."
            },
            {
              icon: <MapPin className="w-6 h-6 text-accent" />,
              title: "GPS Geofencing",
              desc: "Verify attendance only when students are within the designated classroom radius."
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
              title: "Real-time Analytics",
              desc: "Beautiful dashboards and exportable reports for deep insights into attendance trends."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
              title: "Role-Based Access",
              desc: "Dedicated portals for Admins, Teachers, and Students with tailored functionality."
            },
            {
              icon: <Zap className="w-6 h-6 text-orange-500" />,
              title: "Instant Sync",
              desc: "Real-time WebSocket updates ensure attendance is immediately reflected across all devices."
            },
            {
              icon: <div className="font-bold text-xl text-purple-500">API</div>,
              title: "Developer First",
              desc: "Built on a robust Node.js backend with standard REST patterns for easy integration."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glass p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
