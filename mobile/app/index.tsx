import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react-native';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    Alert.alert("QR Code Scanned", `Data: ${data}`, [
      { text: "OK", onPress: () => setScanned(false) }
    ]);
    // TODO: Send data to backend to mark attendance
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  if (hasPermission === null) return <View style={styles.container}><Text style={styles.text}>Requesting camera permission...</Text></View>;
  if (hasPermission === false) return <View style={styles.container}><Text style={styles.text}>No access to camera</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <TouchableOpacity style={styles.scanAgain} onPress={() => setScanned(false)}>
            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
        {/* Viewfinder Frame */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0E' },
  text: { color: '#FFF', textAlign: 'center', marginTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#1A1A24' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  logoutBtn: { padding: 10, backgroundColor: '#EF4444', borderRadius: 8 },
  cameraContainer: { flex: 1, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 250, height: 250, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 20 },
  scanAgain: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: '#3B82F6', padding: 15, borderRadius: 10, zIndex: 10 },
  scanAgainText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
