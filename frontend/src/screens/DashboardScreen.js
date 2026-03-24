import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  Platform,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost, getConfiguredApiOrigin } from '../services/api';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const DashboardScreen = () => {
  const COURSE_TYPES = ['academic', 'universal'];
  const COURSE_PROVIDERS = ['Cisco', 'Coursera', 'AWS', 'Udemy', 'NPTEL', 'Infosys Springboard', 'Other'];
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    courseName: '',
    courseProvider: '',
    skillsLearned: '',
    durationHours: '',
    courseType: 'universal',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);

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

  const pickCertificate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      setSelectedFile(result.assets[0]);
    } catch (error) {
      Alert.alert('Picker Error', error.message);
    }
  };

  const handleCertificateSubmit = async () => {
    setSubmitStatus('');
    if (
      !uploadForm.courseName.trim()
      || !uploadForm.courseProvider.trim()
      || !uploadForm.skillsLearned.trim()
      || !uploadForm.durationHours
      || !selectedFile
    ) {
      setSubmitStatus('Course name, provider, skills learned, duration and certificate file are required');
      Alert.alert('Validation', 'Course name, provider, skills learned, duration and certificate file are required');
      return;
    }

    const normalizedType = String(uploadForm.courseType || '').toLowerCase();
    if (!['academic', 'universal'].includes(normalizedType)) {
      setSubmitStatus('Course type must be academic or universal');
      Alert.alert('Validation', 'Course type must be academic or universal');
      return;
    }
    const parsedDuration = Number(uploadForm.durationHours);
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setSubmitStatus('Duration must be a valid number of hours');
      Alert.alert('Validation', 'Duration must be a valid number of hours');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('courseName', uploadForm.courseName.trim());
      formData.append('courseProvider', uploadForm.courseProvider.trim());
      formData.append('skillsLearned', uploadForm.skillsLearned.trim());
      formData.append('durationHours', String(parsedDuration));
      formData.append('courseType', normalizedType);
      if (Platform.OS === 'web') {
        if (selectedFile.file) {
          formData.append('certificate', selectedFile.file, selectedFile.name || selectedFile.file.name);
        } else if (selectedFile.uri) {
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          const inferredType = selectedFile.mimeType || blob.type || 'application/octet-stream';
          let inferredName = selectedFile.name || `certificate-${Date.now()}`;
          const hasExtension = /\.[A-Za-z0-9]+$/.test(inferredName);
          if (!hasExtension) {
            if (inferredType.includes('pdf')) inferredName += '.pdf';
            else if (inferredType.includes('png')) inferredName += '.png';
            else if (inferredType.includes('jpeg') || inferredType.includes('jpg')) inferredName += '.jpg';
          }
          formData.append('certificate', blob, inferredName);
          // Keep mime metadata for debugging/fallback on backend if needed.
          formData.append('certificateMimeType', inferredType);
        } else {
          throw new Error('Selected file is invalid. Please choose the file again.');
        }
      } else {
        formData.append('certificate', {
          uri: selectedFile.uri,
          name: selectedFile.name || `certificate-${Date.now()}`,
          type: selectedFile.mimeType || 'application/octet-stream',
        });
      }

      await apiPost('/certificates', formData, token);
      setUploadForm({
        courseName: '',
        courseProvider: '',
        skillsLearned: '',
        durationHours: '',
        courseType: 'universal',
      });
      setSelectedFile(null);
      if (parsedDuration < 6) {
        setSubmitStatus('Submitted and auto-rejected: Certificate duration must be greater than 6 hours.');
        Alert.alert('Submitted', 'Certificate submitted and auto-rejected: duration must be greater than 6 hours.');
      } else {
        setSubmitStatus('Certificate submitted for verifier review (admin/mentor).');
        Alert.alert('Submitted', 'Certificate submitted for verifier review (admin/mentor).');
      }
      await loadData();
    } catch (error) {
      setSubmitStatus(error.message || 'Submission failed');
      Alert.alert('Submission Failed', error.message);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  const resolveCertificateUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

    const apiOrigin = getConfiguredApiOrigin();
    if (apiOrigin) {
      return `${apiOrigin}${fileUrl}`;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:5000${fileUrl}`;
    }
    return fileUrl;
  };

  const isPdf = (value) => /\.pdf(\?|$)/i.test(value || '');

  const openCertificatePreview = (certificate) => {
    setPreviewCertificate(certificate);
    setPreviewModalOpen(true);
  };

  const openCertificateFile = async (certificate) => {
    const url = resolveCertificateUrl(certificate?.fileUrl || '');
    if (!url) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Cannot Open', 'Unable to open certificate file.');
      return;
    }
    await Linking.openURL(url);
  };

  const summary = useMemo(
    () => ({
      totalEnrolled: dashboard?.totalEnrolled ?? 0,
      ongoing: dashboard?.ongoing ?? 0,
      completed: dashboard?.completed ?? 0,
    }),
    [dashboard]
  );

  const renderCertificate = ({ item: certificate }) => {
    const status = certificate.status || (certificate.isApproved ? 'approved' : 'pending');
    return (
      <TouchableOpacity style={styles.certificateCard} onPress={() => openCertificatePreview(certificate)}>
        <View style={styles.certificateHeader}>
          <Text style={styles.certificateTitle}>{certificate.courseName}</Text>
          <View style={[styles.statusChip, getStatusStyle(status)]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        <Text style={styles.certificateMeta}>Type: {certificate.courseType}</Text>
        {!!certificate.courseProvider && (
          <Text style={styles.certificateMeta}>Provider: {certificate.courseProvider}</Text>
        )}
        {!!certificate.skillsLearned && (
          <Text style={styles.certificateMeta}>Skills: {certificate.skillsLearned}</Text>
        )}
        {certificate.durationHours != null && (
          <Text style={styles.certificateMeta}>Duration: {certificate.durationHours} hours</Text>
        )}
        {!!certificate.fileName && <Text style={styles.certificateMeta}>File: {certificate.fileName}</Text>}
        {!!certificate.verificationNotes && (
          <Text style={styles.certificateMeta}>Notes: {certificate.verificationNotes}</Text>
        )}
        {!!certificate.rejectionReason && (
          <Text style={styles.certificateMeta}>Rejection: {certificate.rejectionReason}</Text>
        )}
        <Text style={styles.previewHint}>Tap to view certificate</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={certificates}
      keyExtractor={(item) => item._id}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      ListHeaderComponent={
        <>
          <Modal visible={providerModalOpen} transparent animationType="fade" onRequestClose={() => setProviderModalOpen(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProviderModalOpen(false)}>
              <View style={styles.modalCard}>
                <FlatList
                  data={COURSE_PROVIDERS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalRow}
                      onPress={() => {
                        setUploadForm((prev) => ({ ...prev, courseProvider: item }));
                        setProviderModalOpen(false);
                      }}
                    >
                      <Text style={styles.modalText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          <Modal visible={typeModalOpen} transparent animationType="fade" onRequestClose={() => setTypeModalOpen(false)}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setTypeModalOpen(false)}>
              <View style={styles.modalCard}>
                <FlatList
                  data={COURSE_TYPES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalRow}
                      onPress={() => {
                        setUploadForm((prev) => ({ ...prev, courseType: item }));
                        setTypeModalOpen(false);
                      }}
                    >
                      <Text style={styles.modalText}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Ionicons name="book" size={30} color="#4A90E2" />
              <Text style={styles.summaryNumber}>{summary.totalEnrolled}</Text>
              <Text style={styles.summaryLabel}>Total Enrolled</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="time" size={30} color="#F39C12" />
              <Text style={styles.summaryNumber}>{summary.ongoing}</Text>
              <Text style={styles.summaryLabel}>In Progress</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="trophy" size={30} color="#27AE60" />
              <Text style={styles.summaryNumber}>{summary.completed}</Text>
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
              <TouchableOpacity style={styles.selector} onPress={() => setProviderModalOpen(true)}>
                <Text style={styles.selectorLabel}>Course Provider</Text>
                <Text style={styles.selectorValue}>
                  {uploadForm.courseProvider || 'Select provider (Cisco/Coursera/AWS/...)'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Skills Learned (e.g., Python, Networking)"
                value={uploadForm.skillsLearned}
                onChangeText={(value) => setUploadForm({ ...uploadForm, skillsLearned: value })}
              />
              <TextInput
                style={styles.input}
                placeholder="Duration in hours (minimum 6 hours recommended)"
                value={uploadForm.durationHours}
                onChangeText={(value) => setUploadForm({ ...uploadForm, durationHours: value })}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.selector} onPress={() => setTypeModalOpen(true)}>
                <Text style={styles.selectorLabel}>Course Type</Text>
                <Text style={styles.selectorValue}>
                  {uploadForm.courseType.charAt(0).toUpperCase() + uploadForm.courseType.slice(1)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filePickerButton} onPress={pickCertificate}>
                <Ionicons name="document-attach-outline" size={18} color="#FFFFFF" />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : 'Choose PDF/Image'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCertificateSubmit}>
                <Text style={styles.submitButtonText}>Submit for Verification</Text>
              </TouchableOpacity>
              {!!submitStatus && <Text style={styles.submitStatus}>{submitStatus}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Certificates</Text>
          </View>
          <Modal
            visible={previewModalOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setPreviewModalOpen(false)}
          >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setPreviewModalOpen(false)}>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>{previewCertificate?.courseName || 'Certificate'}</Text>
                <Text style={styles.previewMeta}>
                  {previewCertificate?.status ? `Status: ${previewCertificate.status}` : ''}
                </Text>
                {previewCertificate?.fileUrl ? (
                  isPdf(previewCertificate.fileUrl) ? (
                    <TouchableOpacity
                      style={styles.openPdfBtn}
                      onPress={() => openCertificateFile(previewCertificate)}
                    >
                      <Text style={styles.openPdfText}>Open PDF</Text>
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={{ uri: resolveCertificateUrl(previewCertificate.fileUrl) }}
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                  )
                ) : (
                  <Text style={styles.previewMeta}>No certificate file found.</Text>
                )}
                <TouchableOpacity style={styles.closeBtn} onPress={() => setPreviewModalOpen(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={48} color="#B6C1CC" />
            <Text style={styles.emptyStateText}>No certificates submitted yet</Text>
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
      renderItem={renderCertificate}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ds.colors.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.card,
  },
  summaryNumber: {
    ...typography.heading1,
    color: ds.colors.textPrimary,
    marginTop: 10,
  },
  summaryLabel: {
    ...typography.caption,
    color: ds.colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    ...typography.heading2,
    color: ds.colors.textPrimary,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.card,
  },
  input: {
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    color: ds.colors.textPrimary,
    backgroundColor: '#FCFCFD',
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  filePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: ds.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  filePickerText: {
    ...typography.title,
    color: ds.colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: ds.colors.emerald,
    borderRadius: ds.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  submitStatus: {
    marginTop: 10,
    color: ds.colors.textSecondary,
    ...typography.bodySm,
  },
  selector: {
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#FCFCFD',
  },
  selectorLabel: {
    color: ds.colors.textSecondary,
    ...typography.caption,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectorValue: {
    color: ds.colors.textPrimary,
    ...typography.bodySm,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: ds.colors.surface, borderRadius: ds.radius.lg, maxHeight: '70%', ...ds.shadows.card },
  modalRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  modalText: { ...typography.body, color: ds.colors.textPrimary },
  certificateCard: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  previewHint: {
    marginTop: 8,
    color: ds.colors.primaryBlue,
    ...typography.label,
    fontWeight: '700',
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  certificateTitle: {
    flex: 1,
    ...typography.title,
    fontWeight: '700',
    color: ds.colors.textPrimary,
    marginRight: 8,
  },
  certificateMeta: {
    color: ds.colors.textSecondary,
    ...typography.bodySm,
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: ds.status.pending.bg,
  },
  statusApproved: {
    backgroundColor: ds.status.approved.bg,
  },
  statusRejected: {
    backgroundColor: ds.status.rejected.bg,
  },
  statusText: {
    ...typography.label,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: ds.colors.textPrimary,
  },
  emptyState: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  emptyStateText: {
    marginTop: 8,
    color: ds.colors.textSecondary,
    ...typography.bodySm,
  },
  previewCard: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 14,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  previewTitle: {
    ...typography.title,
    fontWeight: '700',
    color: ds.colors.textPrimary,
    marginBottom: 6,
  },
  previewMeta: {
    ...typography.bodySm,
    color: ds.colors.textSecondary,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#F4F7FA',
    borderRadius: 10,
  },
  openPdfBtn: {
    backgroundColor: ds.colors.primaryIndigo,
    borderRadius: ds.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  openPdfText: {
    color: '#FFFFFF',
    ...typography.button,
  },
  closeBtn: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: ds.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: ds.colors.primaryIndigo,
    ...typography.button,
  },
});

export default DashboardScreen;
