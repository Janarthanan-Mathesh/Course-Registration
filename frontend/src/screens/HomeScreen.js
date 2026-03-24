import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../services/api';
import ds from '../utils/designSystem';
import typography from '../utils/typography';

const HomeScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasCollegeEmail = String(user?.email || '').toLowerCase().endsWith('@bitsathy.ac.in');
  const canAccessAcademic = hasCollegeEmail || user?.role === 'mentor';

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
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} />}
    >
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.userName}>{user?.username || 'User'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Ionicons name="book-outline" size={26} color="#4A90E2" />
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Ionicons name="checkmark-circle-outline" size={26} color="#27AE60" />
          <Text style={styles.statNumber}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPurple]}>
          <Ionicons name="ribbon-outline" size={26} color="#F39C12" />
          <Text style={styles.statNumber}>{certificates}</Text>
          <Text style={styles.statLabel}>Certificates</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {canAccessAcademic && (
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
          <Text style={styles.infoText}>Students: college email gives Academic + Universal access.</Text>
          <Text style={styles.infoText}>Mentors can access Academic + Universal by role.</Text>
          <Text style={styles.infoText}>Admins use certificate/content management workflows.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.colors.background },
  contentContainer: { paddingBottom: 90 },
  welcomeContainer: {
    backgroundColor: ds.colors.primaryIndigo,
    padding: 20,
    borderBottomLeftRadius: ds.radius.xl,
    borderBottomRightRadius: ds.radius.xl,
  },
  welcomeText: { ...typography.title, color: '#E0E7FF' },
  userName: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  statsContainer: { flexDirection: 'row', padding: 16, marginTop: -18 },
  statCard: {
    flex: 1,
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.card,
  },
  statCardBlue: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  statCardGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statCardPurple: {
    backgroundColor: '#F3E8FF',
    borderColor: '#DDD6FE',
  },
  statNumber: { ...typography.heading1, color: ds.colors.textPrimary, marginTop: 6 },
  statLabel: { ...typography.caption, color: ds.colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 16, paddingBottom: 16 },
  sectionTitle: { ...typography.heading2, color: ds.colors.textPrimary, marginBottom: 10 },
  quickActions: { flexDirection: 'row' },
  actionButton: {
    flex: 1,
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  actionText: { marginTop: 8, ...typography.bodySm, color: ds.colors.textPrimary, textAlign: 'center' },
  infoCard: {
    backgroundColor: ds.colors.warningSoft,
    borderRadius: ds.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: { ...typography.bodySm, color: '#92400E', marginBottom: 6 },
});

export default HomeScreen;
