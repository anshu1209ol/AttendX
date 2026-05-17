import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { QrCode, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email, 
      password: password 
    });
    
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Visual background elements for Stripe glow */}
      <View style={styles.radialGlow} />

      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <QrCode color="#3B82F6" size={40} />
        </View>
        <Text style={styles.title}>AttendX Portal</Text>
        <Text style={styles.subtitle}>Secure Attendance Management System</Text>
      </View>
      
      {error ? (
        <View style={styles.errorWrapper}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.inputWrapper}>
          <Mail color="#666" size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Institutional Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Lock color="#666" size={18} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Security Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => handleLogin()} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#0B0B0E', position: 'relative' },
  
  // Glowing background gradient simulation
  radialGlow: { position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(59, 130, 246, 0.12)', filter: 'blur(80px)' as any, zIndex: -1 },

  logoContainer: { alignItems: 'center', marginBottom: 35 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 15 },
  subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  
  card: { backgroundColor: '#161622', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#222235' },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B0B0E', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#222235', paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: '#FFF', fontSize: 14 },
  
  button: { backgroundColor: '#3B82F6', height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  
  errorWrapper: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 10, padding: 12, marginBottom: 20 },
  error: { color: '#EF4444', fontSize: 13, textAlign: 'center', fontWeight: '500' }
});
