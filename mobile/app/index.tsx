import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import StudentApp from './student/index';
import TeacherApp from './teacher/index';

export default function RoleDispatcher() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          // Retrieve role from user metadata
          const userRole = session.user.user_metadata?.role || 'student';
          setRole(userRole);
        } else {
          // Fallback to student for safety
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

  // Render the designated portal based strictly on the authenticated user's database role
  return (
    <View style={styles.container}>
      {role === 'teacher' ? <TeacherApp /> : <StudentApp />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0B0E' },
  loadingText: { color: '#9CA3AF', marginTop: 15, fontSize: 14, fontWeight: '500' }
});
