import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasCollegeEmail = String(user?.email || '').toLowerCase().endsWith('@bitsathy.ac.in');

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGet('/users/dashboard', token);
      setDashboard(data.dashboard || null);
    } catch (_) {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [token])
  );

  const total = dashboard?.totalEnrolled ?? 0;
  const completed = dashboard?.completed ?? 0;
  const certificates = dashboard?.certificatesUploaded ?? 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
    >
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.userName}>{user?.username || 'User'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={26} color="#4A90E2" />
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={26} color="#27AE60" />
          <Text style={styles.statNumber}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="ribbon-outline" size={26} color="#F39C12" />
          <Text style={styles.statNumber}>{certificates}</Text>
          <Text style={styles.statLabel}>Certificates</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {hasCollegeEmail && (
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Academic')}>
              <Ionicons name="school-outline" size={24} color="#4A90E2" />
              <Text style={styles.actionText}>Academic Courses</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Universal')}>
            <Ionicons name="globe-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionText}>Universal Courses</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Access Rules</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>College email users can access Academic + Universal courses.</Text>
          <Text style={styles.infoText}>Other email users can access Universal courses only.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  welcomeContainer: { backgroundColor: '#4A90E2', padding: 20 },
  welcomeText: { fontSize: 16, color: '#FFFFFF' },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, marginTop: -18 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#25374A', marginTop: 6 },
  statLabel: { fontSize: 12, color: '#72879A', marginTop: 2 },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#25374A', marginBottom: 10 },
  quickActions: { flexDirection: 'row' },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  actionText: { marginTop: 8, fontSize: 13, color: '#2E3F50', textAlign: 'center' },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14 },
  infoText: { color: '#5F7487', marginBottom: 6 },
});

export default HomeScreen;
