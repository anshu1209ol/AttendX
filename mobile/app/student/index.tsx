import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Image,
  Dimensions,
  Switch
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  QrCode, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  Bell,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Interface Types
interface Subject {
  id: string;
  name: string;
  code: string;
  attended: number;
  total: number;
  teacher: string;
}

interface AttendanceLog {
  id: string;
  subjectName: string;
  subjectCode: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'late';
  distance?: number;
}

export default function StudentApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scan' | 'history' | 'profile'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    name: 'Shaurya Pratap Singh',
    email: 'shaurya@attendx.edu',
    rollNumber: 'BCA/2026/089',
    course: 'Bachelor of Computer Applications',
    semester: 'IV Semester',
    phone: '+91 98765 43210',
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(studentInfo.name);
  const [editPhone, setEditPhone] = useState(studentInfo.phone);

  // Notifications State
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to AttendX! Enable notifications for real-time alerts.',
    'System: Maintain above 75% attendance to avoid debarment warnings.',
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock Attendance Data
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Database Management Systems', code: 'BCA-401', attended: 28, total: 32, teacher: 'Dr. A. Sikarwar' },
    { id: '2', name: 'Operating Systems & Shell Programming', code: 'BCA-402', attended: 22, total: 30, teacher: 'Prof. R. Sharma' },
    { id: '3', name: 'Artificial Intelligence & Machine Learning', code: 'BCA-403', attended: 14, total: 24, teacher: 'Dr. K. Raghav' },
    { id: '4', name: 'Computer Networks & Security', code: 'BCA-404', attended: 29, total: 30, teacher: 'Prof. M. Verma' },
  ]);

  const [history, setHistory] = useState<AttendanceLog[]>([
    { id: '1', subjectName: 'Database Management Systems', subjectCode: 'BCA-401', date: 'May 17, 2026', time: '10:30 AM', status: 'present', distance: 8 },
    { id: '2', subjectName: 'Operating Systems & Shell Programming', subjectCode: 'BCA-402', date: 'May 16, 2026', time: '11:45 AM', status: 'present', distance: 12 },
    { id: '3', subjectName: 'Artificial Intelligence & Machine Learning', code: 'BCA-403', subjectCode: 'BCA-403', date: 'May 15, 2026', time: '02:00 PM', status: 'absent' },
    { id: '4', subjectName: 'Computer Networks & Security', subjectCode: 'BCA-404', date: 'May 14, 2026', time: '09:00 AM', status: 'present', distance: 3 },
    { id: '5', subjectName: 'Database Management Systems', subjectCode: 'BCA-401', date: 'May 13, 2026', time: '10:30 AM', status: 'present', distance: 15 },
  ]);

  // History Page State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');

  // Camera Scanner State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; distance?: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'inside' | 'outside'>('inside');

  // Initialize camera permissions
  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermissions();
  }, []);

  // Attendance Calculator Variables
  const totalAttended = subjects.reduce((sum, sub) => sum + sub.attended, 0);
  const totalClasses = subjects.reduce((sum, sub) => sum + sub.total, 0);
  const overallPercentage = Math.round((totalAttended / totalClasses) * 100);

  // Status color helpers
  const getPercentageColor = (pct: number) => {
    if (pct >= 75) return '#10B981'; // Green
    if (pct >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getPercentageText = (pct: number) => {
    if (pct >= 75) return 'Safe (Good Standing)';
    if (pct >= 60) return 'Warning (Borderline)';
    return 'Critical (Debarment Threat)';
  };

  // QR Scanning Simulation Handler
  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    setLoading(true);

    // Simulate GPS calculation & geofence checks
    setTimeout(() => {
      setLoading(false);
      
      let lat = 28.6139;
      let lng = 77.2090;
      let targetLat = 28.61395;
      let targetLng = 77.20905;
      let simulatedDistance = locationMode === 'inside' ? 8 : 124; // inside or outside radius

      if (locationMode === 'outside') {
        setScanResult({
          success: false,
          message: `GPS check failed: You are ${simulatedDistance}m from the classroom. Authorized check-in range is 50m.`,
          distance: simulatedDistance
        });
        
        // Push alert notification
        setNotifications(prev => [
          `Failed check-in: Geo-location blocked. (${new Date().toLocaleTimeString()})`,
          ...prev
        ]);
      } else {
        // Success
        const matchedSubject = subjects[0]; // mock match
        
        // Add to history
        const newLog: AttendanceLog = {
          id: String(Date.now()),
          subjectName: matchedSubject.name,
          subjectCode: matchedSubject.code,
          date: 'Today',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'present',
          distance: simulatedDistance
        };
        
        setHistory(prev => [newLog, ...prev]);
        
        // Increment subject count
        setSubjects(prev => prev.map(sub => 
          sub.id === matchedSubject.id ? { ...sub, attended: sub.attended + 1, total: sub.total + 1 } : sub
        ));

        setScanResult({
          success: true,
          message: `Attendance marked successfully for ${matchedSubject.name}!`,
          distance: simulatedDistance
        });

        // Push success notification
        setNotifications(prev => [
          `Checked in: DBMS class marked present. (${new Date().toLocaleTimeString()})`,
          ...prev
        ]);
      }
    }, 2000);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => supabase.auth.signOut() }
    ]);
  };

  const saveProfile = () => {
    setStudentInfo(prev => ({
      ...prev,
      name: editName,
      phone: editPhone
    }));
    setEditingProfile(false);
    Alert.alert("Success", "Profile updated successfully.");
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkTheme : styles.lightTheme]}>
      {/* HEADER BAR */}
      <View style={[styles.header, darkMode ? styles.darkHeader : styles.lightHeader]}>
        <View>
          <Text style={[styles.welcomeText, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>Student Panel</Text>
          <Text style={[styles.userName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{studentInfo.name.split(' ')[0]}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerBtn, darkMode ? styles.headerBtnDark : styles.headerBtnLight]} 
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Bell color={darkMode ? '#FFF' : '#0B0B0E'} size={20} />
            {notifications.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerBtn, darkMode ? styles.headerBtnDark : styles.headerBtnLight]} 
            onPress={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun color="#F59E0B" size={20} /> : <Moon color="#4F46E5" size={20} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* NOTIFICATIONS DROPDOWN */}
      {showNotifications && (
        <View style={[styles.notificationsDropdown, darkMode ? styles.darkCard : styles.lightCard]}>
          <Text style={[styles.notiTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Recent Notifications</Text>
          {notifications.map((noti, idx) => (
            <View key={idx} style={[styles.notiItem, { borderBottomColor: darkMode ? '#222235' : '#E2E8F0' }]}>
              <AlertCircle color="#3B82F6" size={16} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[styles.notiText, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>{noti}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.closeNoti} onPress={() => setShowNotifications(false)}>
            <Text style={styles.closeNotiText}>Dismiss All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MAIN CONTAINER */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ================================================== */}
        {/* 1. DASHBOARD TAB */}
        {/* ================================================== */}
        {activeTab === 'dashboard' && (
          <View>
            {/* OVERALL ATTENDANCE PROGRESS RING CARD */}
            <View style={[styles.glassCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <Text style={[styles.cardTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Overall Attendance</Text>
              
              <View style={styles.radialStatsContainer}>
                {/* Visual Progress Ring representation */}
                <View style={[styles.progressRingWrapper, { borderColor: getPercentageColor(overallPercentage) }]}>
                  <Text style={[styles.progressRingText, { color: getPercentageColor(overallPercentage) }]}>{overallPercentage}%</Text>
                  <Text style={[styles.progressRingLabel, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>Rate</Text>
                </View>

                <View style={styles.statsSplit}>
                  <View style={styles.splitBlock}>
                    <Text style={styles.splitLabel}>Attended</Text>
                    <Text style={[styles.splitValue, { color: '#10B981' }]}>{totalAttended} hrs</Text>
                  </View>
                  <View style={styles.splitBlock}>
                    <Text style={styles.splitLabel}>Classes Missed</Text>
                    <Text style={[styles.splitValue, { color: '#EF4444' }]}>{totalClasses - totalAttended} hrs</Text>
                  </View>
                  <View style={styles.splitBlock}>
                    <Text style={styles.splitLabel}>Current Status</Text>
                    <Text style={[styles.splitStatus, { color: getPercentageColor(overallPercentage) }]}>
                      {getPercentageText(overallPercentage)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar visual indicator */}
              <View style={[styles.progressBarBg, darkMode ? { backgroundColor: '#222235' } : { backgroundColor: '#E2E8F0' }]}>
                <View style={[styles.progressBarFill, { width: `${overallPercentage}%`, backgroundColor: getPercentageColor(overallPercentage) }]} />
              </View>
            </View>

            {/* SUBJECT-WISE GRID */}
            <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Subject-wise Analytics</Text>
            {subjects.map(sub => {
              const pct = Math.round((sub.attended / sub.total) * 100);
              return (
                <View key={sub.id} style={[styles.subjectCard, darkMode ? styles.darkCard : styles.lightCard]}>
                  <View style={styles.subCardHeader}>
                    <View>
                      <Text style={[styles.subName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{sub.name}</Text>
                      <Text style={styles.subCode}>{sub.code} • {sub.teacher}</Text>
                    </View>
                    <Text style={[styles.subPercent, { color: getPercentageColor(pct) }]}>{pct}%</Text>
                  </View>

                  <View style={[styles.progressBarBg, darkMode ? { backgroundColor: '#222235' } : { backgroundColor: '#E2E8F0' }]}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: getPercentageColor(pct) }]} />
                  </View>

                  <View style={styles.subCardFooter}>
                    <Text style={[styles.subStats, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                      Attended: {sub.attended} / {sub.total} classes
                    </Text>
                    <Text style={[styles.subStatusBadge, { color: getPercentageColor(pct), borderColor: getPercentageColor(pct) }]}>
                      {pct >= 75 ? 'Safe' : pct >= 60 ? 'Warning' : 'Debarred'}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* ATTENDANCE WEEKLY CHART */}
            <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Weekly Attendance Trend</Text>
            <View style={[styles.chartCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <View style={styles.chartBarWrapper}>
                {[80, 100, 60, 90, 100, 40, 75].map((val, idx) => (
                  <View key={idx} style={styles.chartCol}>
                    <View style={styles.barContainer}>
                      <View style={[styles.barFill, { height: `${val}%`, backgroundColor: getPercentageColor(val) }]} />
                    </View>
                    <Text style={[styles.barLabel, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                      {['M', 'T', 'W', 'Th', 'F', 'S', 'Su'][idx]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* 2. DIRECT QR SCANNER TAB */}
        {/* ================================================== */}
        {activeTab === 'scan' && (
          <View style={styles.scannerWrapper}>
            {/* GPS GEOFENCE CONFIGURATOR */}
            <View style={[styles.geofenceConfigCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <View style={styles.geoHeader}>
                <MapPin color="#3B82F6" size={20} />
                <Text style={[styles.geoTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>GPS Geofence Simulator</Text>
              </View>
              <Text style={[styles.geoDesc, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                Simulate checking check-in coordinates inside vs outside of the classroom range.
              </Text>
              <View style={styles.locationSelector}>
                <TouchableOpacity 
                  style={[styles.locationBtn, locationMode === 'inside' ? styles.locBtnActive : styles.locBtnInactive]}
                  onPress={() => setLocationMode('inside')}
                >
                  <Text style={locationMode === 'inside' ? styles.locBtnTextActive : styles.locBtnTextInactive}>Inside Classroom (Radius &lt; 50m)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.locationBtn, locationMode === 'outside' ? styles.locBtnActiveRed : styles.locBtnInactive]}
                  onPress={() => setLocationMode('outside')}
                >
                  <Text style={locationMode === 'outside' ? styles.locBtnTextActive : styles.locBtnTextInactive}>Outside Campus (Radius &gt; 100m)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SCANNER CONTAINER */}
            <View style={[styles.cameraViewFrame, { borderColor: darkMode ? '#222235' : '#E2E8F0' }]}>
              {scanResult ? (
                <View style={[styles.scanFeedbackFrame, darkMode ? styles.darkCard : styles.lightCard]}>
                  {scanResult.success ? (
                    <CheckCircle2 color="#10B981" size={72} style={{ marginBottom: 20 }} />
                  ) : (
                    <XCircle color="#EF4444" size={72} style={{ marginBottom: 20 }} />
                  )}
                  <Text style={[styles.feedbackTitle, { color: scanResult.success ? '#10B981' : '#EF4444' }]}>
                    {scanResult.success ? 'Location Verified!' : 'Verification Failed'}
                  </Text>
                  <Text style={[styles.feedbackDesc, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                    {scanResult.message}
                  </Text>
                  <Text style={styles.distanceMetric}>
                    Classroom Distance: {scanResult.distance} meters
                  </Text>
                  <TouchableOpacity style={styles.actionBtn} onPress={resetScanner}>
                    <Text style={styles.actionBtnText}>Mark Another Class</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flex: 1, position: 'relative' }}>
                  {hasPermission === null && <ActivityIndicator color="#3B82F6" size="large" style={{ marginTop: 100 }} />}
                  {hasPermission === false && <Text style={styles.errorText}>Camera permission denied.</Text>}
                  {hasPermission === true && (
                    <CameraView
                      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                  
                  {loading && (
                    <View style={styles.scannerOverlayLoading}>
                      <ActivityIndicator color="#FFF" size="large" />
                      <Text style={styles.scannerOverlayLoadingText}>Checking Location Verification...</Text>
                    </View>
                  )}

                  {!scanned && !loading && (
                    <View style={styles.viewfinderContainer}>
                      <View style={styles.viewfinderSquare} />
                      <Text style={styles.viewfinderHelper}>Place the dynamic Teacher QR inside the square</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* 3. ATTENDANCE HISTORY TAB */}
        {/* ================================================== */}
        {activeTab === 'history' && (
          <View>
            <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Attendance Logs</Text>
            
            {/* Search and Filters */}
            <View style={[styles.searchFilterCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <View style={[styles.searchInputWrapper, { borderColor: darkMode ? '#222235' : '#E2E8F0' }]}>
                <Search color="#666" size={18} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.searchInput, { color: darkMode ? '#FFF' : '#0B0B0E' }]}
                  placeholder="Search subject code..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.filtersWrapper}>
                {(['all', 'present', 'absent'] as const).map(f => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterBtn, statusFilter === f ? styles.filterBtnActive : styles.filterBtnInactive]}
                    onPress={() => setStatusFilter(f)}
                  >
                    <Text style={[styles.filterBtnText, statusFilter === f ? styles.filterBtnTextActive : styles.filterBtnTextInactive]}>
                      {f.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logs List */}
            {history
              .filter(log => {
                const matchesSearch = log.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || log.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = statusFilter === 'all' ? true : log.status === statusFilter;
                return matchesSearch && matchesFilter;
              })
              .map(log => (
                <View key={log.id} style={[styles.historyLogCard, darkMode ? styles.darkCard : styles.lightCard]}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.statusMarker, { backgroundColor: log.status === 'present' ? '#10B981' : '#EF4444' }]} />
                    <View>
                      <Text style={[styles.histSubName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{log.subjectName}</Text>
                      <Text style={styles.histDate}>{log.date} • {log.time}</Text>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.statusTextBadge, { color: log.status === 'present' ? '#10B981' : '#EF4444' }]}>
                      {log.status === 'present' ? 'PRESENT' : 'ABSENT'}
                    </Text>
                    {log.distance && (
                      <Text style={styles.accuracyMetric}>Inside: {log.distance}m</Text>
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* ================================================== */}
        {/* 4. PROFILE TAB */}
        {/* ================================================== */}
        {activeTab === 'profile' && (
          <View>
            {/* Profile Avatar Card */}
            <View style={[styles.profileAvatarCard, darkMode ? styles.darkCard : styles.lightCard]}>
              <Image source={{ uri: studentInfo.profileImage }} style={styles.avatarImg} />
              {editingProfile ? (
                <View style={styles.profileEditInputs}>
                  <TextInput
                    style={[styles.editInput, { color: darkMode ? '#FFF' : '#0B0B0E', borderColor: darkMode ? '#222235' : '#E2E8F0' }]}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                  />
                  <TextInput
                    style={[styles.editInput, { color: darkMode ? '#FFF' : '#0B0B0E', borderColor: darkMode ? '#222235' : '#E2E8F0' }]}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="Phone"
                    placeholderTextColor="#666"
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingProfile(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.profileNameText, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{studentInfo.name}</Text>
                  <Text style={styles.profileRollText}>{studentInfo.rollNumber}</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={() => setEditingProfile(true)}>
                    <Edit2 color="#3B82F6" size={14} style={{ marginRight: 6 }} />
                    <Text style={styles.editBtnText}>Edit Info</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Profile Details List */}
            <View style={[styles.profileDetailsCard, darkMode ? styles.darkCard : styles.lightCard]}>
              {[
                { label: 'Course', value: studentInfo.course },
                { label: 'Semester/Year', value: studentInfo.semester },
                { label: 'Email Address', value: studentInfo.email },
                { label: 'Phone Number', value: studentInfo.phone },
                { label: 'Current Attendance', value: `${overallPercentage}%` }
              ].map((item, idx) => (
                <View key={idx} style={[styles.detailItem, { borderBottomColor: darkMode ? '#222235' : '#E2E8F0' }]}>
                  <Text style={[styles.detailLabel, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>{item.label}</Text>
                  <Text style={[styles.detailValue, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{item.value}</Text>
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut color="#FFF" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Sign Out from AttendX</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM TAB BAR */}
      <View style={[styles.tabBar, darkMode ? styles.darkTabBar : styles.lightTabBar]}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { key: 'scan', label: 'Scan QR', icon: QrCode },
          { key: 'history', label: 'Logs', icon: HistoryIcon },
          { key: 'profile', label: 'Profile', icon: UserIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Icon 
                color={isActive ? '#3B82F6' : (darkMode ? '#666' : '#999')} 
                size={22} 
                style={{ marginBottom: 4 }}
              />
              <Text style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : (darkMode ? styles.tabLabelDarkInactive : styles.tabLabelLightInactive)
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkTheme: { backgroundColor: '#0B0B0E' },
  lightTheme: { backgroundColor: '#F8FAFC' },

  // Header styles
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 15,
    borderBottomWidth: 1
  },
  darkHeader: { backgroundColor: '#0B0B0E', borderBottomColor: '#222235' },
  lightHeader: { backgroundColor: '#FFF', borderBottomColor: '#E2E8F0' },
  welcomeText: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  headerBtnDark: { backgroundColor: '#161622' },
  headerBtnLight: { backgroundColor: '#F1F5F9' },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },

  // Text colors
  textDarkPrimary: { color: '#FFF' },
  textDarkSecondary: { color: '#9CA3AF' },
  textLightPrimary: { color: '#0F172A' },
  textLightSecondary: { color: '#64748B' },

  // Notifications dropdown
  notificationsDropdown: { position: 'absolute', top: 110, left: 20, right: 20, zIndex: 100, borderRadius: 12, padding: 15, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  notiTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  notiItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1 },
  notiText: { fontSize: 13, flex: 1 },
  closeNoti: { marginTop: 12, alignItems: 'center' },
  closeNotiText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 13 },

  // Content scroll
  scrollContent: { padding: 20, paddingBottom: 110 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 12 },

  // Cards & layouts
  glassCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1 },
  darkCard: { backgroundColor: '#161622', borderColor: '#222235' },
  lightCard: { backgroundColor: '#FFF', borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 15 },
  
  radialStatsContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  progressRingWrapper: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  progressRingText: { fontSize: 22, fontWeight: 'bold' },
  progressRingLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  
  statsSplit: { flex: 1, paddingLeft: 20 },
  splitBlock: { marginBottom: 8 },
  splitLabel: { fontSize: 11, color: '#666', fontWeight: '500' },
  splitValue: { fontSize: 16, fontWeight: 'bold' },
  splitStatus: { fontSize: 12, fontWeight: '600' },
  
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 5 },
  progressBarFill: { height: '100%', borderRadius: 3 },

  // Subject list card
  subjectCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subName: { fontSize: 15, fontWeight: 'bold', flex: 1, paddingRight: 10 },
  subCode: { fontSize: 12, color: '#666', marginTop: 2 },
  subPercent: { fontSize: 18, fontWeight: 'bold' },
  subCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  subStats: { fontSize: 12 },
  subStatusBadge: { fontSize: 11, fontWeight: 'bold', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },

  // Trend Chart styles
  chartCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  chartBarWrapper: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
  chartCol: { alignItems: 'center' },
  barContainer: { height: 90, width: 14, backgroundColor: '#222235', borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 7 },
  barLabel: { fontSize: 11, marginTop: 8 },

  // Tab Navigation Bar
  tabBar: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    height: 70, 
    borderRadius: 35, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    borderWidth: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 5 
  },
  darkTabBar: { backgroundColor: '#161622', borderColor: '#222235' },
  lightTabBar: { backgroundColor: '#FFF', borderColor: '#E2E8F0' },
  tabItem: { alignItems: 'center', flex: 1 },
  tabLabel: { fontSize: 11, fontWeight: '600' },
  tabLabelActive: { color: '#3B82F6' },
  tabLabelDarkInactive: { color: '#666' },
  tabLabelLightInactive: { color: '#64748B' },

  // Scanner View styles
  scannerWrapper: { flex: 1 },
  geofenceConfigCard: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  geoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  geoTitle: { fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
  geoDesc: { fontSize: 12, marginBottom: 12 },
  locationSelector: { flexDirection: 'row', justifyContent: 'space-between' },
  locationBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1 },
  locBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  locBtnActiveRed: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  locBtnInactive: { backgroundColor: '#222235', borderColor: '#333' },
  locBtnTextActive: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  locBtnTextInactive: { color: '#999', fontSize: 11, fontWeight: '500' },
  
  cameraViewFrame: { height: 350, borderRadius: 20, overflow: 'hidden', borderWidth: 1, position: 'relative' },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  viewfinderSquare: { width: 220, height: 220, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 20 },
  viewfinderHelper: { color: '#FFF', fontSize: 12, marginTop: 15, fontWeight: '500' },
  
  scannerOverlayLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  scannerOverlayLoadingText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 100 },
  
  scanFeedbackFrame: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
  feedbackTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  feedbackDesc: { fontSize: 14, textAlign: 'center', marginBottom: 15 },
  distanceMetric: { fontSize: 13, color: '#666', marginBottom: 25 },
  actionBtn: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // History Tab styles
  searchFilterCard: { borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1 },
  searchInputWrapper: { flexDirection: 'row', alignItems: 'center', borderHeight: 45, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, height: 45, fontSize: 14 },
  filtersWrapper: { flexDirection: 'row', justifyContent: 'space-between' },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  filterBtnActive: { backgroundColor: '#3B82F6' },
  filterBtnInactive: { backgroundColor: '#222235' },
  filterBtnText: { fontSize: 11, fontWeight: 'bold' },
  filterBtnTextActive: { color: '#FFF' },
  filterBtnTextInactive: { color: '#666' },

  historyLogCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  statusMarker: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  histSubName: { fontSize: 14, fontWeight: 'bold' },
  histDate: { fontSize: 11, color: '#666', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  statusTextBadge: { fontSize: 12, fontWeight: 'bold' },
  accuracyMetric: { fontSize: 11, color: '#666', marginTop: 2 },

  // Profile Tab styles
  profileAvatarCard: { borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 20, borderWidth: 1 },
  avatarImg: { width: 90, height: 90, borderRadius: 45, marginBottom: 15, borderWidth: 3, borderColor: '#3B82F6' },
  profileNameText: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  profileRollText: { fontSize: 13, color: '#666', marginBottom: 15 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  editBtnText: { color: '#3B82F6', fontSize: 12, fontWeight: 'bold' },
  
  profileEditInputs: { width: '100%', alignItems: 'center' },
  editInput: { width: '100%', height: 45, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, marginBottom: 10, fontSize: 14 },
  editActions: { flexDirection: 'row', marginTop: 8 },
  saveBtn: { backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  cancelBtnText: { color: '#FFF', fontWeight: 'bold' },

  profileDetailsCard: { borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: 'bold' },
  
  logoutBtn: { flexDirection: 'row', backgroundColor: '#EF4444', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  logoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
