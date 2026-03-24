import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api';
import ds from '../utils/designSystem';
import typography from '../utils/typography';

const DEPARTMENTS = [
  'Biomedical Engineering',
  'Civil Engineering',
  'Computer Science & Design',
  'Computer Science & Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Electronics & Instrumentation Engineering',
  'Information Science & Engineering',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Agricultural Engineering',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence and Machine Learning',
  'Biotechnology',
  'Computer Science & Business Systems',
  'Computer Technology',
  'Food Technology',
  'Fashion Technology',
  'Information Technology',
  'Textile Technology',
];

const initialSubjectForm = {
  courseCode: '',
  courseName: '',
  credits: '3',
  faculty: '',
  description: '',
  semester: '1',
  year: String(new Date().getFullYear()),
  department: DEPARTMENTS[0],
  discourseLink: '',
};

const initialChapterForm = {
  chapterNo: '1',
  chapterName: '',
  description: '',
  discourseLink: '',
  pdfTitle: '',
  pdfUrl: '',
  externalLabel: '',
  externalUrl: '',
};

const SelectorModal = ({ visible, onClose, options, onPick }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalCard}>
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modalRow} onPress={() => onPick(item)}>
              <Text style={styles.modalText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const AdminCertificatesScreen = () => {
  const { token } = useAuth();
  const [mode, setMode] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [notesById, setNotesById] = useState({});
  const [reasonById, setReasonById] = useState({});

  const [courses, setCourses] = useState([]);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);
  const [chapterForm, setChapterForm] = useState(initialChapterForm);
  const [subjectDeptOpen, setSubjectDeptOpen] = useState(false);
  const [subjectSemesterOpen, setSubjectSemesterOpen] = useState(false);
  const [chapterPdfs, setChapterPdfs] = useState([]);
  const [chapterLinks, setChapterLinks] = useState([]);

  const fetchCertificates = async () => {
    if (!token) return;
    setCertLoading(true);
    try {
      const data = await apiGet('/certificates/all', token);
      setCertificates(data.certificates || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCertLoading(false);
    }
  };

  const fetchAcademicContent = async () => {
    if (!token) return;
    setAcademicLoading(true);
    try {
      const data = await apiGet('/academic-courses', token);
      const fetchedCourses = data.courses || [];
      setCourses(fetchedCourses);
      if (!selectedCourseId && fetchedCourses.length > 0) {
        setSelectedCourseId(fetchedCourses[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setAcademicLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (mode === 'certificates') fetchCertificates();
      else fetchAcademicContent();
    }, [token, mode])
  );

  const handleApprove = async (certificateId) => {
    setActionLoadingId(certificateId);
    try {
      await apiPut(
        `/certificates/${certificateId}/approve`,
        { verificationNotes: notesById[certificateId] || '' },
        token
      );
      await fetchCertificates();
    } catch (error) {
      Alert.alert('Approval Failed', error.message);
    } finally {
      setActionLoadingId('');
    }
  };

  const handleReject = async (certificateId) => {
    const certificate = certificates.find((c) => c._id === certificateId);
    const autoReason =
      Number(certificate?.durationHours || 0) < 6
        ? 'Certificate duration must be greater than 6 hours.'
        : '';
    const rejectionReason = (reasonById[certificateId] || '').trim() || autoReason;
    if (!rejectionReason) {
      Alert.alert('Validation', 'Rejection reason is required');
      return;
    }
    setActionLoadingId(certificateId);
    try {
      await apiPut(
        `/certificates/${certificateId}/reject`,
        { rejectionReason, verificationNotes: notesById[certificateId] || '' },
        token
      );
      await fetchCertificates();
    } catch (error) {
      Alert.alert('Rejection Failed', error.message);
    } finally {
      setActionLoadingId('');
    }
  };

  const handleCreateSubject = async () => {
    try {
      await apiPost(
        '/academic-courses',
        {
          courseCode: subjectForm.courseCode,
          courseName: subjectForm.courseName,
          credits: Number(subjectForm.credits || 0),
          faculty: subjectForm.faculty,
          description: subjectForm.description,
          semester: Number(subjectForm.semester || 1),
          year: Number(subjectForm.year || new Date().getFullYear()),
          department: subjectForm.department,
          discourseLink: subjectForm.discourseLink,
        },
        token
      );
      setSubjectForm(initialSubjectForm);
      await fetchAcademicContent();
      Alert.alert('Success', 'Subject created');
    } catch (error) {
      Alert.alert('Create Failed', error.message);
    }
  };

  const addPdfToChapter = () => {
    if (!chapterForm.pdfTitle.trim() || !chapterForm.pdfUrl.trim()) return;
    setChapterPdfs((prev) => [...prev, { title: chapterForm.pdfTitle.trim(), url: chapterForm.pdfUrl.trim() }]);
    setChapterForm((prev) => ({ ...prev, pdfTitle: '', pdfUrl: '' }));
  };

  const addLinkToChapter = () => {
    if (!chapterForm.externalLabel.trim() || !chapterForm.externalUrl.trim()) return;
    setChapterLinks((prev) => [...prev, { label: chapterForm.externalLabel.trim(), url: chapterForm.externalUrl.trim() }]);
    setChapterForm((prev) => ({ ...prev, externalLabel: '', externalUrl: '' }));
  };

  const handleAddChapter = async () => {
    if (!selectedCourseId) {
      Alert.alert('Select Subject', 'Please select a subject first');
      return;
    }

    try {
      await apiPost(
        `/academic-courses/${selectedCourseId}/chapters`,
        {
          chapterNo: Number(chapterForm.chapterNo || 0),
          chapterName: chapterForm.chapterName,
          description: chapterForm.description,
          discourseLink: chapterForm.discourseLink,
          pdfs: chapterPdfs,
          externalLinks: chapterLinks,
        },
        token
      );

      setChapterForm(initialChapterForm);
      setChapterPdfs([]);
      setChapterLinks([]);
      await fetchAcademicContent();
      Alert.alert('Success', 'Chapter added');
    } catch (error) {
      Alert.alert('Add Chapter Failed', error.message);
    }
  };

  const handleDeleteChapter = async (courseId, chapterId) => {
    try {
      await apiDelete(`/academic-courses/${courseId}/chapters/${chapterId}`, token);
      await fetchAcademicContent();
    } catch (error) {
      Alert.alert('Delete Failed', error.message);
    }
  };

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const getStatusStyle = (status) => {
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  const renderCertificate = ({ item }) => {
    const status = item.status || (item.isApproved ? 'approved' : 'pending');
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <View style={[styles.statusChip, getStatusStyle(status)]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        <Text style={styles.meta}>User: {item.user?.username || '-'} ({item.user?.email || '-'})</Text>
        <Text style={styles.meta}>Type: {item.courseType}</Text>
        {!!item.courseProvider && <Text style={styles.meta}>Provider: {item.courseProvider}</Text>}
        {!!item.skillsLearned && <Text style={styles.meta}>Skills: {item.skillsLearned}</Text>}
        {item.durationHours != null && <Text style={styles.meta}>Duration: {item.durationHours} hours</Text>}
        <TextInput
          style={styles.input}
          placeholder="Verification notes"
          value={notesById[item._id] || ''}
          onChangeText={(value) => setNotesById({ ...notesById, [item._id]: value })}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          textAlignVertical="top"
          placeholder={
            Number(item.durationHours || 0) < 6
              ? 'Rejection reason (auto default: Certificate duration must be greater than 6 hours.)'
              : 'Rejection reason'
          }
          value={reasonById[item._id] || ''}
          onChangeText={(value) => setReasonById({ ...reasonById, [item._id]: value })}
        />
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item._id)}
            disabled={actionLoadingId === item._id}
          >
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item._id)}
            disabled={actionLoadingId === item._id}
          >
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCourse = ({ item: course }) => (
    <View style={styles.card}>
      <Text style={styles.courseName}>Sem {course.semester} | {course.department || '-'} | {course.courseName}</Text>
      {(course.chapters || []).map((chapter) => (
        <View key={chapter._id} style={styles.chapterRow}>
          <Text style={styles.meta}>#{chapter.chapterNo} {chapter.chapterName}</Text>
          <TouchableOpacity onPress={() => handleDeleteChapter(course._id, chapter._id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  if (mode === 'certificates') {
    return (
      <FlatList
        style={styles.container}
        data={certificates}
        keyExtractor={(item) => item._id}
        renderItem={renderCertificate}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={certLoading} onRefresh={fetchCertificates} />}
        ListHeaderComponent={
          <>
            <View style={styles.modeSwitch}>
              <TouchableOpacity style={[styles.modeButton, styles.modeButtonActive]} onPress={() => setMode('certificates')}>
                <Text style={[styles.modeText, styles.modeTextActive]}>Certificates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modeButton} onPress={() => setMode('academic')}>
                <Text style={styles.modeText}>Academic Content</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Certificate Verification</Text>
              <Text style={styles.count}>{certificates.length} total</Text>
            </View>
          </>
        }
        ListEmptyComponent={!certLoading ? <Text style={styles.empty}>No certificates found.</Text> : null}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.listContent}
      />
    );
  }

  return (
    <View style={styles.container}>
      <SelectorModal
        visible={subjectDeptOpen}
        onClose={() => setSubjectDeptOpen(false)}
        options={DEPARTMENTS}
        onPick={(dept) => {
          setSubjectForm((prev) => ({ ...prev, department: dept }));
          setSubjectDeptOpen(false);
        }}
      />
      <SelectorModal
        visible={subjectSemesterOpen}
        onClose={() => setSubjectSemesterOpen(false)}
        options={['1', '2', '3', '4', '5', '6', '7', '8']}
        onPick={(sem) => {
          setSubjectForm((prev) => ({ ...prev, semester: sem }));
          setSubjectSemesterOpen(false);
        }}
      />
      <FlatList
        style={styles.container}
        data={courses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={academicLoading} onRefresh={fetchAcademicContent} />}
        ListHeaderComponent={
          <>
            <View style={styles.modeSwitch}>
              <TouchableOpacity style={styles.modeButton} onPress={() => setMode('certificates')}>
                <Text style={styles.modeText}>Certificates</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeButton, styles.modeButtonActive]} onPress={() => setMode('academic')}>
                <Text style={[styles.modeText, styles.modeTextActive]}>Academic Content</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Academic Content Manager</Text>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Create Subject</Text>
              <TextInput style={styles.input} placeholder="Course Code" value={subjectForm.courseCode} onChangeText={(v) => setSubjectForm({ ...subjectForm, courseCode: v })} />
              <TextInput style={styles.input} placeholder="Subject Name" value={subjectForm.courseName} onChangeText={(v) => setSubjectForm({ ...subjectForm, courseName: v })} />
              <TextInput style={styles.input} placeholder="Faculty" value={subjectForm.faculty} onChangeText={(v) => setSubjectForm({ ...subjectForm, faculty: v })} />
              <TouchableOpacity style={styles.dropdownInput} onPress={() => setSubjectDeptOpen(true)}>
                <Text style={styles.dropdownText}>Department: {subjectForm.department}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownInput} onPress={() => setSubjectSemesterOpen(true)}>
                <Text style={styles.dropdownText}>Semester: {subjectForm.semester}</Text>
              </TouchableOpacity>
              <TextInput style={styles.input} placeholder="Credits" value={subjectForm.credits} onChangeText={(v) => setSubjectForm({ ...subjectForm, credits: v })} keyboardType="number-pad" />
              <TextInput style={styles.input} placeholder="Year" value={subjectForm.year} onChangeText={(v) => setSubjectForm({ ...subjectForm, year: v })} keyboardType="number-pad" />
              <TextInput style={styles.input} placeholder="Subject Description" value={subjectForm.description} onChangeText={(v) => setSubjectForm({ ...subjectForm, description: v })} />
              <TextInput style={styles.input} placeholder="Subject Discourse Link" value={subjectForm.discourseLink} onChangeText={(v) => setSubjectForm({ ...subjectForm, discourseLink: v })} />
              <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={handleCreateSubject}><Text style={styles.actionText}>Create Subject</Text></TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Add Chapter + PDFs</Text>
              <FlatList
                horizontal
                data={courses}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pill, selectedCourseId === item._id && styles.pillActive]}
                    onPress={() => setSelectedCourseId(item._id)}
                  >
                    <Text style={[styles.pillText, selectedCourseId === item._id && styles.pillTextActive]}>
                      S{item.semester} {item.courseCode}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              {selectedCourse && <Text style={styles.meta}>Selected: {selectedCourse.courseName}</Text>}
              <TextInput style={styles.input} placeholder="Chapter S.No" value={chapterForm.chapterNo} onChangeText={(v) => setChapterForm({ ...chapterForm, chapterNo: v })} keyboardType="number-pad" />
              <TextInput style={styles.input} placeholder="Chapter Name" value={chapterForm.chapterName} onChangeText={(v) => setChapterForm({ ...chapterForm, chapterName: v })} />
              <TextInput style={styles.input} placeholder="Chapter Description" value={chapterForm.description} onChangeText={(v) => setChapterForm({ ...chapterForm, description: v })} />
              <TextInput style={styles.input} placeholder="Chapter Discourse Link" value={chapterForm.discourseLink} onChangeText={(v) => setChapterForm({ ...chapterForm, discourseLink: v })} />
              <TextInput style={styles.input} placeholder="PDF Title" value={chapterForm.pdfTitle} onChangeText={(v) => setChapterForm({ ...chapterForm, pdfTitle: v })} />
              <TextInput style={styles.input} placeholder="PDF URL" value={chapterForm.pdfUrl} onChangeText={(v) => setChapterForm({ ...chapterForm, pdfUrl: v })} />
              <TouchableOpacity style={styles.smallButton} onPress={addPdfToChapter}><Text style={styles.smallButtonText}>Add PDF</Text></TouchableOpacity>
              {chapterPdfs.map((p, i) => <Text key={`p-${i}`} style={styles.meta}>PDF {i + 1}: {p.title}</Text>)}
              <TextInput style={styles.input} placeholder="External Link Label" value={chapterForm.externalLabel} onChangeText={(v) => setChapterForm({ ...chapterForm, externalLabel: v })} />
              <TextInput style={styles.input} placeholder="External Link URL" value={chapterForm.externalUrl} onChangeText={(v) => setChapterForm({ ...chapterForm, externalUrl: v })} />
              <TouchableOpacity style={styles.smallButton} onPress={addLinkToChapter}><Text style={styles.smallButtonText}>Add External Link</Text></TouchableOpacity>
              {chapterLinks.map((l, i) => <Text key={`l-${i}`} style={styles.meta}>Link {i + 1}: {l.label}</Text>)}
              <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={handleAddChapter}><Text style={styles.actionText}>Upload Chapter</Text></TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={!academicLoading ? <Text style={styles.empty}>No academic courses found.</Text> : null}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.colors.background },
  listContent: { padding: 8, paddingBottom: 90 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: ds.radius.md, padding: 4, marginBottom: 8, borderWidth: 1, borderColor: ds.colors.border },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: ds.radius.sm },
  modeButtonActive: { backgroundColor: ds.colors.primaryIndigo },
  modeText: { color: ds.colors.textSecondary, ...typography.caption, fontWeight: '700' },
  modeTextActive: { color: '#FFFFFF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { ...typography.heading2, fontWeight: '700', color: ds.colors.textPrimary, marginBottom: 6 },
  sectionTitle: { ...typography.title, fontWeight: '700', color: ds.colors.textPrimary, marginBottom: 6 },
  count: { ...typography.caption, color: ds.colors.textSecondary },
  card: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseName: { flex: 1, ...typography.title, fontWeight: '700', color: ds.colors.textPrimary, marginRight: 6 },
  statusChip: { borderRadius: ds.radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  statusPending: { backgroundColor: ds.status.pending.bg },
  statusApproved: { backgroundColor: ds.status.approved.bg },
  statusRejected: { backgroundColor: ds.status.rejected.bg },
  statusText: { ...typography.caption, fontWeight: '700', textTransform: 'capitalize', color: ds.colors.textPrimary },
  meta: { ...typography.caption, color: ds.colors.textSecondary, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
    ...typography.bodySm,
    color: ds.colors.textPrimary,
    backgroundColor: '#FCFCFD',
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  textarea: { minHeight: 70 },
  dropdownInput: { borderWidth: 1, borderColor: ds.colors.border, borderRadius: ds.radius.md, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6, backgroundColor: '#FCFCFD', outlineStyle: 'none', outlineWidth: 0 },
  dropdownText: { color: ds.colors.textPrimary, ...typography.bodySm },
  actionsRow: { flexDirection: 'row', marginTop: 6 },
  actionButton: { alignItems: 'center', justifyContent: 'center', borderRadius: ds.radius.md, paddingVertical: 9, flex: 1 },
  approveButton: { backgroundColor: ds.colors.emerald, marginRight: 4 },
  rejectButton: { backgroundColor: ds.colors.rose, marginLeft: 4 },
  actionText: { color: '#FFFFFF', ...typography.bodySm, fontWeight: '700' },
  smallButton: { backgroundColor: ds.colors.primaryBlue, borderRadius: ds.radius.md, paddingVertical: 7, alignItems: 'center', marginBottom: 6 },
  smallButtonText: { color: '#FFFFFF', ...typography.caption, fontWeight: '700' },
  empty: { color: ds.colors.textSecondary, textAlign: 'center', marginTop: 20, ...typography.bodySm },
  pill: { backgroundColor: '#EEF2FF', borderRadius: ds.radius.pill, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginBottom: 8 },
  pillActive: { backgroundColor: ds.colors.primaryIndigo },
  pillText: { color: ds.colors.textSecondary, fontWeight: '600', ...typography.caption },
  pillTextActive: { color: '#FFFFFF' },
  chapterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEF3F7', paddingTop: 6, marginTop: 6 },
  deleteText: { color: ds.colors.rose, fontWeight: '700', ...typography.caption },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: ds.colors.surface, borderRadius: ds.radius.lg, maxHeight: '70%', ...ds.shadows.card },
  modalRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  modalText: { color: ds.colors.textPrimary, ...typography.body },
});

export default AdminCertificatesScreen;
