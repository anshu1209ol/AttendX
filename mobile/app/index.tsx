import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import StudentApp from './student/index';
import TeacherApp from './teacher/index';
import { QrCode, Shield, Users } from 'lucide-react-native';

export default function RoleDispatcher() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [demoOverride, setDemoOverride] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Retrieve role from user metadata
          const userRole = session.user.user_metadata?.role || 'student';
          setRole(userRole);
        } else {
          // Fallback to student for demo safety
          setRole('student');
        }
      } catch (err) {
        setRole('student');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing AttendX Portals...</Text>
      </View>
    );
  }

  // Render the selected view (use demoOverride if present, else database role)
  const currentRole = demoOverride || role || 'student';

  return (
    <View style={styles.container}>
      {/* FLOATING DEVELOPER DEMO ROLE SWITCHER (Stripe Inspired UX) */}
      <View style={styles.demoBanner}>
        <Text style={styles.demoText}>Demo Control: </Text>
        <TouchableOpacity 
          style={[styles.demoBtn, currentRole === 'student' ? styles.demoBtnActive : styles.demoBtnInactive]}
          onPress={() => setDemoOverride('student')}
        >
          <Users size={12} color={currentRole === 'student' ? '#FFF' : '#666'} style={{ marginRight: 4 }} />
          <Text style={[styles.demoBtnText, currentRole === 'student' ? styles.textActive : styles.textInactive]}>
            Student View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.demoBtn, currentRole === 'teacher' ? styles.demoBtnActive : styles.demoBtnInactive]}
          onPress={() => setDemoOverride('teacher')}
        >
          <Shield size={12} color={currentRole === 'teacher' ? '#FFF' : '#666'} style={{ marginRight: 4 }} />
          <Text style={[styles.demoBtnText, currentRole === 'teacher' ? styles.textActive : styles.textInactive]}>
            Teacher View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Subsystem App */}
      {currentRole === 'teacher' ? <TeacherApp /> : <StudentApp />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0B0E' },
  loadingText: { color: '#9CA3AF', marginTop: 15, fontSize: 14, fontWeight: '500' },
  
  // Demo switch styles
  demoBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#161622', 
    paddingVertical: 8, 
    borderBottomWidth: 1, 
    borderColor: '#222235',
    paddingTop: 45, // clear notch bounds
    zIndex: 1000
  },
  demoText: { color: '#666', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  demoBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, marginHorizontal: 5, borderWidth: 1 },
  demoBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  demoBtnInactive: { backgroundColor: '#1E1E2D', borderColor: '#2A2A3A' },
  demoBtnText: { fontSize: 11, fontWeight: 'bold' },
  textActive: { color: '#FFF' },
  textInactive: { color: '#666' }
});
