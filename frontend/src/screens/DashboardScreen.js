import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';

const DashboardScreen = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    courseName: '',
    courseType: 'universal',
    fileUrl: '',
    fileName: '',
  });

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashboardData, certificateData] = await Promise.all([
        apiGet('/users/dashboard', token),
        apiGet('/certificates', token),
      ]);
      setDashboard(dashboardData.dashboard || null);
      setCertificates(certificateData.certificates || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [token])
  );

  const handleCertificateSubmit = async () => {
    if (!uploadForm.courseName || !uploadForm.fileUrl) {
      Alert.alert('Validation', 'Course name and certificate URL are required');
      return;
    }
    const normalizedType = String(uploadForm.courseType || '').toLowerCase();
    if (!['academic', 'universal'].includes(normalizedType)) {
      Alert.alert('Validation', 'Course type must be academic or universal');
      return;
    }

    try {
      await apiPost('/certificates', { ...uploadForm, courseType: normalizedType }, token);
      setUploadForm({ courseName: '', courseType: 'universal', fileUrl: '', fileName: '' });
      Alert.alert('Submitted', 'Certificate submitted for admin verification.');
      await loadData();
    } catch (error) {
      Alert.alert('Submission Failed', error.message);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="book" size={30} color="#4A90E2" />
          <Text style={styles.summaryNumber}>{dashboard?.totalEnrolled ?? 0}</Text>
          <Text style={styles.summaryLabel}>Total Enrolled</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="time" size={30} color="#F39C12" />
          <Text style={styles.summaryNumber}>{dashboard?.ongoing ?? 0}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="trophy" size={30} color="#27AE60" />
          <Text style={styles.summaryNumber}>{dashboard?.completed ?? 0}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submit Certificate</Text>
        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Course Name"
            value={uploadForm.courseName}
            onChangeText={(value) => setUploadForm({ ...uploadForm, courseName: value })}
          />
          <TextInput
            style={styles.input}
            placeholder="Course Type (academic/universal)"
            value={uploadForm.courseType}
            onChangeText={(value) => setUploadForm({ ...uploadForm, courseType: value })}
          />
          <TextInput
            style={styles.input}
            placeholder="Certificate URL"
            value={uploadForm.fileUrl}
            onChangeText={(value) => setUploadForm({ ...uploadForm, fileUrl: value })}
          />
          <TextInput
            style={styles.input}
            placeholder="File Name (optional)"
            value={uploadForm.fileName}
            onChangeText={(value) => setUploadForm({ ...uploadForm, fileName: value })}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleCertificateSubmit}>
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Certificates</Text>
        {certificates.map((certificate) => (
          <View key={certificate._id} style={styles.certificateCard}>
            <View style={styles.certificateHeader}>
              <Text style={styles.certificateTitle}>{certificate.courseName}</Text>
              <View style={[styles.statusChip, getStatusStyle(certificate.status || (certificate.isApproved ? 'approved' : 'pending'))]}>
                <Text style={styles.statusText}>{certificate.status || (certificate.isApproved ? 'approved' : 'pending')}</Text>
              </View>
            </View>
            <Text style={styles.certificateMeta}>Type: {certificate.courseType}</Text>
            {!!certificate.verificationNotes && (
              <Text style={styles.certificateMeta}>Notes: {certificate.verificationNotes}</Text>
            )}
            {!!certificate.rejectionReason && (
              <Text style={styles.certificateMeta}>Rejection: {certificate.rejectionReason}</Text>
            )}
          </View>
        ))}

        {certificates.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={48} color="#B6C1CC" />
            <Text style={styles.emptyStateText}>No certificates submitted yet</Text>
          </View>
        )}
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE5EE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  certificateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  certificateTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 15,
    color: '#2C3E50',
    marginRight: 8,
  },
  certificateMeta: {
    color: '#5E6B78',
    fontSize: 13,
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: '#FFF7D6',
  },
  statusApproved: {
    backgroundColor: '#DDF7E6',
  },
  statusRejected: {
    backgroundColor: '#FFE2DE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: '#2C3E50',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 8,
    color: '#788592',
  },
});

export default DashboardScreen;
