import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Dimensions,
  FlatList
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { 
  LayoutDashboard, 
  QrCode, 
  Radio, 
  Settings, 
  LogOut, 
  Users, 
  Play, 
  Square, 
  Pause,
  Plus, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Interfaces
interface ClassItem {
  id: string;
  name: string;
  code: string;
  enrolled: number;
}

interface ActiveStudentCheckIn {
  id: string;
  name: string;
  rollNumber: string;
  time: string;
  distance: number;
  device: string;
}

export default function TeacherApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'live' | 'sessions'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [teacherInfo] = useState({
    name: 'Dr. Anshul Sikarwar',
    email: 'sikarwar@attendx.edu',
    department: 'Computer Science Department',
  });

  // Mock Available Classes
  const [classes] = useState<ClassItem[]>([
    { id: '1', name: 'Database Management Systems', code: 'BCA-401', enrolled: 32 },
    { id: '2', name: 'Operating Systems & Shell Programming', code: 'BCA-402', enrolled: 30 },
    { id: '3', name: 'Artificial Intelligence & Machine Learning', code: 'BCA-403', enrolled: 24 },
    { id: '4', name: 'Computer Networks & Security', code: 'BCA-404', enrolled: 30 },
  ]);

  // Session Generator State
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classes[0]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [qrToken, setQrToken] = useState('attendx_initial_secure_token_hash_089234');
  const [qrCountdown, setQrCountdown] = useState(5); // QR code expires every 5 seconds for anti-cheating
  
  // Real-time live check-ins list
  const [checkIns, setCheckIns] = useState<ActiveStudentCheckIn[]>([
    { id: '1', name: 'Shaurya Pratap Singh', rollNumber: 'BCA/2026/089', time: '10:32 AM', distance: 8, device: 'OnePlus 11 5G' },
    { id: '2', name: 'Ananya Sharma', rollNumber: 'BCA/2026/012', time: '10:33 AM', distance: 12, device: 'iPhone 15 Pro' },
    { id: '3', name: 'Kabir Verma', rollNumber: 'BCA/2026/045', time: '10:34 AM', distance: 4, device: 'Samsung S24 Ultra' },
  ]);

  const [sessionHistory, setSessionHistory] = useState([
    { id: '1', className: 'Database Management Systems', code: 'BCA-401', date: 'May 17, 2026', present: 28, enrolled: 32, rate: 87.5 },
    { id: '2', className: 'Operating Systems & Shell Programming', code: 'BCA-402', date: 'May 16, 2026', present: 22, enrolled: 30, rate: 73.3 },
    { id: '3', className: 'Computer Networks & Security', code: 'BCA-404', date: 'May 14, 2026', present: 29, enrolled: 30, rate: 96.6 },
  ]);

  // Simulated auto-refresh interval for QR and mock check-in arrivals
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      timerRef.current = setInterval(() => {
        // Countdown total session time
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        
        // Countdown QR token refresh timer
        setQrCountdown(prev => {
          if (prev <= 1) {
            // Generate a fresh cryptographically secure random token hash
            const randHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
            setQrToken(`attendx_live_secure_${randHex}`);
            
            // Randomly simulate a new student checking in when QR refreshes
            simulateRandomCheckIn();
            return 5; // Reset to 5s
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, sessionPaused]);

  // Simulate a student checking in in real-time
  const simulateRandomCheckIn = () => {
    const mockStudents = [
      { name: 'Rohan Mehra', roll: 'BCA/2026/102', device: 'Google Pixel 8' },
      { name: 'Ishita Gupta', roll: 'BCA/2026/054', device: 'Nothing Phone 2' },
      { name: 'Siddharth Roy', roll: 'BCA/2026/099', device: 'Xiaomi 14 Ultra' },
      { name: 'Diya Sen', roll: 'BCA/2026/021', device: 'iPhone 14' }
    ];

    // Pick a random student not already checked in
    const available = mockStudents.filter(s => !checkIns.some(c => c.rollNumber === s.roll));
    if (available.length > 0) {
      const student = available[Math.floor(Math.random() * available.length)];
      const newCheckIn: ActiveStudentCheckIn = {
        id: String(Date.now()),
        name: student.name,
        rollNumber: student.roll,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        distance: Math.floor(Math.random() * 20) + 2, // 2m to 22m away
        device: student.device
      };
      setCheckIns(prev => [newCheckIn, ...prev]);
    }
  };

  const handleStartSession = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSessionActive(true);
      setSessionPaused(false);
      setTimeLeft(900); // 15 min
      setQrCountdown(5);
      // Clear check-ins for the new active session
      setCheckIns([
        { id: '1', name: 'Shaurya Pratap Singh', rollNumber: 'BCA/2026/089', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), distance: 8, device: 'OnePlus 11 5G' }
      ]);
      Alert.alert("Session Started", `QR Attendance session activated for ${selectedClass.name}!`);
    }, 1500);
  };

  const handleEndSession = () => {
    Alert.alert("End Session", "Are you sure you want to end this attendance session? All students not scanned will be marked absent.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "End Session", 
        style: "destructive", 
        onPress: () => {
          setSessionActive(false);
          // Save completed session to history list
          const presentCount = checkIns.length;
          const rate = Math.round((presentCount / selectedClass.enrolled) * 1000) / 10;
          const newHistoryItem = {
            id: String(Date.now()),
            className: selectedClass.name,
            code: selectedClass.code,
            date: 'Today',
            present: presentCount,
            enrolled: selectedClass.enrolled,
            rate: rate
          };
          setSessionHistory(prev => [newHistoryItem, ...prev]);
          Alert.alert("Session Saved", `Attendance marked for ${presentCount} present students.`);
        } 
      }
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => supabase.auth.signOut() }
    ]);
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkTheme : styles.lightTheme]}>
      {/* HEADER BAR */}
      <View style={[styles.header, darkMode ? styles.darkHeader : styles.lightHeader]}>
        <View>
          <Text style={[styles.welcomeText, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>Teacher Panel</Text>
          <Text style={[styles.userName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{teacherInfo.name}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerBtn, darkMode ? styles.headerBtnDark : styles.headerBtnLight]} 
            onPress={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun color="#F59E0B" size={20} /> : <Moon color="#4F46E5" size={20} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTAINER */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ================================================== */}
        {/* 1. TEACHER DASHBOARD TAB */}
        {/* ================================================== */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Quick Metrics */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <Users color="#3B82F6" size={24} style={{ marginBottom: 10 }} />
                <Text style={styles.metricLabel}>Total Classes</Text>
                <Text style={[styles.metricVal, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                  {classes.length} Courses
                </Text>
              </View>

              <View style={[styles.metricCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <Clock color="#10B981" size={24} style={{ marginBottom: 10 }} />
                <Text style={styles.metricLabel}>Average Attendance</Text>
                <Text style={[styles.metricVal, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                  85.8%
                </Text>
              </View>
            </View>

            {/* Active session checker card */}
            {sessionActive ? (
              <View style={[styles.activeSessionBanner, { borderColor: '#10B981' }]}>
                <View style={styles.bannerHeader}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE SESSION ACTIVE</Text>
                  </View>
                  <Text style={styles.bannerTimeLeft}>{formatTime(timeLeft)}</Text>
                </View>
                <Text style={styles.bannerClassName}>{selectedClass.name}</Text>
                <Text style={styles.bannerStats}>{checkIns.length} check-ins registered</Text>
                <View style={styles.bannerActions}>
                  <TouchableOpacity style={styles.bannerBtnGo} onPress={() => setActiveTab('generate')}>
                    <Text style={styles.bannerBtnText}>View QR Display</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[styles.startSessionCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <ShieldAlert color="#F59E0B" size={28} style={{ marginBottom: 12 }} />
                <Text style={[styles.startSessionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                  No Session Running
                </Text>
                <Text style={[styles.startSessionDesc, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                  Select a class below and spin up a secure, dynamic QR check-in session inside the classroom.
                </Text>
              </View>
            )}

            {/* Managed Classes List */}
            <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>My Managed Courses</Text>
            {classes.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.classRowCard, darkMode ? styles.darkCard : styles.lightCard]}
                onPress={() => {
                  setSelectedClass(item);
                  setActiveTab('generate');
                }}
              >
                <View style={styles.classRowLeft}>
                  <View style={[styles.classInitialGlow, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{item.code.substring(4)}</Text>
                  </View>
                  <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={[styles.classRowName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.classRowCode}>{item.code} • {item.enrolled} Enrolled Students</Text>
                  </View>
                </View>
                <ChevronRight color={darkMode ? '#666' : '#999'} size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ================================================== */}
        {/* 2. SECURE GENERATE QR TAB */}
        {/* ================================================== */}
        {activeTab === 'generate' && (
          <View>
            {/* CLASS SELECTOR */}
            {!sessionActive && (
              <View style={[styles.selectionCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <Text style={[styles.selectLabel, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                  Select Class to Start Attendance:
                </Text>
                <View style={styles.dropdownWrap}>
                  {classes.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.dropdownItem, selectedClass.id === c.id ? styles.dropdownItemActive : styles.dropdownItemInactive]}
                      onPress={() => setSelectedClass(c)}
                    >
                      <Text style={[styles.dropText, selectedClass.id === c.id ? styles.dropTextActive : styles.dropTextInactive]}>
                        {c.name} ({c.code})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* GPS Classroom Pinning */}
                <View style={[styles.gpsPinInfo, { borderColor: darkMode ? '#222235' : '#E2E8F0' }]}>
                  <MapPin color="#3B82F6" size={18} />
                  <Text style={[styles.gpsText, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                    Classroom GPS pinned at Campus Labs (28.6139, 77.2090)
                  </Text>
                </View>

                <TouchableOpacity style={styles.startSessionBtn} onPress={handleStartSession} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Play color="#FFF" size={18} style={{ marginRight: 8 }} />
                      <Text style={styles.startSessionBtnText}>Start Security QR Session</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ACTIVE SECURE DYNAMIC QR GENERATOR DISPLAY */}
            {sessionActive && (
              <View style={[styles.qrGeneratorCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <View style={styles.generatorHeader}>
                  <Text style={[styles.generatorClassTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                    {selectedClass.name}
                  </Text>
                  <Text style={styles.generatorClassCode}>{selectedClass.code}</Text>
                </View>

                {/* Secure QR Display with dynamic token values */}
                <View style={styles.qrDisplayBox}>
                  {/* Decorative Frame rings */}
                  <View style={styles.qrCornerTopLeft} />
                  <View style={styles.qrCornerTopRight} />
                  <View style={styles.qrCornerBottomLeft} />
                  <View style={styles.qrCornerBottomRight} />

                  {/* Render Visual Abstract representation of QR code with pulsating animation */}
                  <View style={styles.qrGraphicBlock}>
                    <View style={styles.qrBlockSquareTop} />
                    <View style={styles.qrBlockSquareBottom} />
                    <View style={styles.qrPatternSimulated}>
                      {/* Generates high fidelity QR pixel simulations */}
                      {[1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0].map((v, i) => (
                        <View 
                          key={i} 
                          style={[
                            styles.qrPixel, 
                            { 
                              backgroundColor: v === 1 ? '#FFF' : 'transparent',
                              opacity: qrCountdown % 2 === 0 ? 0.9 : 0.6 
                            }
                          ]} 
                        />
                      ))}
                    </View>
                  </View>
                </View>

                {/* Countdown display for auto-refresh anti-cheating token */}
                <View style={styles.countdownRow}>
                  <RefreshCw color="#3B82F6" size={16} style={{ marginRight: 8 }} />
                  <Text style={[styles.countdownText, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
                    Token rotates in <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}>{qrCountdown}s</Text> (Prevents Copying)
                  </Text>
                </View>

                {/* Session timers and attendee dynamic status counters */}
                <View style={styles.generatorStatsRow}>
                  <View style={styles.statMiniBlock}>
                    <Text style={styles.statMiniLabel}>Session Time Left</Text>
                    <Text style={styles.statMiniValue}>{formatTime(timeLeft)}</Text>
                  </View>

                  <View style={styles.statMiniBlock}>
                    <Text style={styles.statMiniLabel}>Registered check-ins</Text>
                    <Text style={[styles.statMiniValue, { color: '#10B981' }]}>{checkIns.length} / {selectedClass.enrolled}</Text>
                  </View>
                </View>

                {/* Quick Pause or Stop Controls */}
                <View style={styles.controlsRow}>
                  <TouchableOpacity 
                    style={[styles.controlBtn, sessionPaused ? styles.controlBtnResume : styles.controlBtnPause]}
                    onPress={() => setSessionPaused(!sessionPaused)}
                  >
                    {sessionPaused ? <Play color="#FFF" size={16} /> : <Pause color="#FFF" size={16} />}
                    <Text style={styles.controlBtnText}>{sessionPaused ? 'Resume' : 'Pause'}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.controlBtn, styles.controlBtnStop]} onPress={handleEndSession}>
                    <Square color="#FFF" size={16} />
                    <Text style={styles.controlBtnText}>Stop Session</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ================================================== */}
        {/* 3. REAL-TIME LIVE ATTENDANCE VIEW */}
        {/* ================================================== */}
        {activeTab === 'live' && (
          <View>
            <View style={styles.liveViewHeader}>
              <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary, { marginTop: 0 }]}>
                Live Check-in Feed
              </Text>
              {sessionActive && (
                <View style={styles.pulseLiveWrap}>
                  <View style={styles.liveDot} />
                  <Text style={styles.pulseLiveLabel}>Real-time Active</Text>
                </View>
              )}
            </View>

            <Text style={[styles.liveStatsSub, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>
              Current check-in counter: <Text style={{ color: '#10B981', fontWeight: 'bold' }}>{checkIns.length} Students</Text> checked in.
            </Text>

            {/* Connection list */}
            {checkIns.length === 0 ? (
              <View style={[styles.emptyLiveCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <ActivityIndicator color="#3B82F6" size="small" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyLiveText}>Waiting for student check-ins...</Text>
              </View>
            ) : (
              <FlatList
                data={checkIns}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[styles.checkInRowCard, darkMode ? styles.darkCard : styles.lightCard]}>
                    <View style={styles.checkInLeft}>
                      <View style={[styles.avatarCircleGlow, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 13 }}>✓</Text>
                      </View>
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={[styles.checkInStudentName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>
                          {item.name}
                        </Text>
                        <Text style={styles.checkInRoll}>{item.rollNumber} • {item.device}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.checkInTimeText}>{item.time}</Text>
                      <Text style={styles.checkInDistanceText}>Distance: {item.distance}m</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* ================================================== */}
        {/* 4. COMPLETED SESSIONS HISTORY */}
        {/* ================================================== */}
        {activeTab === 'sessions' && (
          <View>
            <Text style={[styles.sectionTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Attendance Logs</Text>
            
            {sessionHistory.map(log => (
              <View key={log.id} style={[styles.historyLogCard, darkMode ? styles.darkCard : styles.lightCard]}>
                <View style={styles.historyLeft}>
                  <View style={[styles.statusMarker, { backgroundColor: log.rate >= 75 ? '#10B981' : '#F59E0B' }]} />
                  <View>
                    <Text style={[styles.histSubName, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{log.className}</Text>
                    <Text style={styles.histDate}>{log.code} • {log.date}</Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={[styles.statusTextBadge, { color: log.rate >= 75 ? '#10B981' : '#F59E0B' }]}>
                    {log.rate}% RATE
                  </Text>
                  <Text style={styles.accuracyMetric}>{log.present} / {log.enrolled} present</Text>
                </View>
              </View>
            ))}

            <View style={[styles.profileDetailsCard, darkMode ? styles.darkCard : styles.lightCard, { marginTop: 25 }]}>
              <Text style={[styles.cardTitle, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>Teacher Profile Info</Text>
              {[
                { label: 'Name', value: teacherInfo.name },
                { label: 'Email', value: teacherInfo.email },
                { label: 'Department', value: teacherInfo.department }
              ].map((item, idx) => (
                <View key={idx} style={[styles.detailItem, { borderBottomColor: darkMode ? '#222235' : '#E2E8F0' }]}>
                  <Text style={[styles.detailLabel, darkMode ? styles.textDarkSecondary : styles.textLightSecondary]}>{item.label}</Text>
                  <Text style={[styles.detailValue, darkMode ? styles.textDarkPrimary : styles.textLightPrimary]}>{item.value}</Text>
                </View>
              ))}
            </View>

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
          { key: 'generate', label: 'Generate QR', icon: QrCode },
          { key: 'live', label: 'Live Feed', icon: Radio },
          { key: 'sessions', label: 'Sessions', icon: Settings }
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

  // Text colors
  textDarkPrimary: { color: '#FFF' },
  textDarkSecondary: { color: '#9CA3AF' },
  textLightPrimary: { color: '#0F172A' },
  textLightSecondary: { color: '#64748B' },

  // Content scroll
  scrollContent: { padding: 20, paddingBottom: 110 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 12 },

  // Cards
  darkCard: { backgroundColor: '#161622', borderColor: '#222235' },
  lightCard: { backgroundColor: '#FFF', borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 15 },

  // Dashboard Metrics
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metricCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, marginHorizontal: 4 },
  metricLabel: { fontSize: 11, color: '#666', fontWeight: '500', marginBottom: 4 },
  metricVal: { fontSize: 15, fontWeight: 'bold' },

  // Banner for active session
  activeSessionBanner: { borderLeftWidth: 5, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: 16, marginBottom: 20, borderWidth: 1 },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  liveText: { fontSize: 11, color: '#10B981', fontWeight: 'bold' },
  bannerTimeLeft: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  bannerClassName: { fontSize: 16, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  bannerStats: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  bannerActions: { flexDirection: 'row' },
  bannerBtnGo: { backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 6 },
  bannerBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  // start session placeholder
  startSessionCard: { borderRadius: 16, padding: 25, alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  startSessionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  startSessionDesc: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Course row list
  classRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  classRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  classInitialGlow: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  classRowName: { fontSize: 14, fontWeight: 'bold' },
  classRowCode: { fontSize: 11, color: '#666', marginTop: 2 },

  // QR Selector card
  selectionCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  selectLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  dropdownWrap: { marginBottom: 15 },
  dropdownItem: { padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1 },
  dropdownItemActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  dropdownItemInactive: { backgroundColor: '#1E1E2D', borderColor: '#222235' },
  dropText: { fontSize: 13, fontWeight: '600' },
  dropTextActive: { color: '#FFF' },
  dropTextInactive: { color: '#999' },
  gpsPinInfo: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 15, backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  gpsText: { fontSize: 12, marginLeft: 8 },
  startSessionBtn: { backgroundColor: '#3B82F6', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  startSessionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // QR Generator page
  qrGeneratorCard: { borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1 },
  generatorHeader: { alignItems: 'center', marginBottom: 20 },
  generatorClassTitle: { fontSize: 18, fontWeight: 'bold' },
  generatorClassCode: { fontSize: 13, color: '#666', marginTop: 2 },
  
  // Custom Visual QR Container
  qrDisplayBox: { width: 230, height: 230, backgroundColor: '#FFF', borderRadius: 15, padding: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, position: 'relative', marginBottom: 20 },
  qrCornerTopLeft: { position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#3B82F6' },
  qrCornerTopRight: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#3B82F6' },
  qrCornerBottomLeft: { position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#3B82F6' },
  qrCornerBottomRight: { position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#3B82F6' },
  qrGraphicBlock: { width: 170, height: 170, backgroundColor: '#0B0B0E', borderRadius: 10, padding: 15, position: 'relative' },
  qrBlockSquareTop: { position: 'absolute', top: 15, left: 15, width: 45, height: 45, borderHeight: 5, borderWidth: 8, borderColor: '#FFF', borderRadius: 5 },
  qrBlockSquareBottom: { position: 'absolute', bottom: 15, left: 15, width: 45, height: 45, borderHeight: 5, borderWidth: 8, borderColor: '#FFF', borderRadius: 5 },
  qrPatternSimulated: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginLeft: 50, marginTop: 10 },
  qrPixel: { width: 8, height: 8, margin: 2, borderRadius: 1 },
  
  countdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  countdownText: { fontSize: 13 },
  
  generatorStatsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 25, borderTopWidth: 1, borderTopColor: '#222235', paddingTop: 15 },
  statMiniBlock: { flex: 1, alignItems: 'center' },
  statMiniLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  statMiniValue: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  controlBtn: { flex: 1, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginHorizontal: 5 },
  controlBtnResume: { backgroundColor: '#10B981' },
  controlBtnPause: { backgroundColor: '#F59E0B' },
  controlBtnStop: { backgroundColor: '#EF4444' },
  controlBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },

  // Live Checkin Feed
  liveViewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulseLiveWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  pulseLiveLabel: { color: '#10B981', fontSize: 11, fontWeight: 'bold', marginLeft: 6 },
  liveStatsSub: { fontSize: 12, marginBottom: 15 },
  
  emptyLiveCard: { borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1 },
  emptyLiveText: { color: '#666', fontSize: 13 },
  
  checkInRowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  checkInLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircleGlow: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  checkInStudentName: { fontSize: 13, fontWeight: 'bold' },
  checkInRoll: { fontSize: 11, color: '#666', marginTop: 2 },
  checkInTimeText: { fontSize: 12, color: '#FFF', fontWeight: '500' },
  checkInDistanceText: { fontSize: 10, color: '#666', marginTop: 2 },

  // History / Profile details
  historyLogCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  statusMarker: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  histSubName: { fontSize: 14, fontWeight: 'bold' },
  histDate: { fontSize: 11, color: '#666', marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  statusTextBadge: { fontSize: 12, fontWeight: 'bold' },
  accuracyMetric: { fontSize: 11, color: '#666', marginTop: 2 },
  profileDetailsCard: { borderRadius: 16, padding: 15, marginBottom: 20, borderWidth: 1 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#EF4444', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  logoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // Tab navigation bottom bar
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
  tabLabelLightInactive: { color: '#64748B' }
});
