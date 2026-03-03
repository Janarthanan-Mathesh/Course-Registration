import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api';

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
        <ScrollView>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={styles.modalRow} onPress={() => onPick(opt)}>
              <Text style={styles.modalText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      setCourses(data.courses || []);
      if (!selectedCourseId && (data.courses || []).length > 0) {
        setSelectedCourseId(data.courses[0]._id);
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
      await apiPut(`/certificates/${certificateId}/approve`, { verificationNotes: notesById[certificateId] || '' }, token);
      await fetchCertificates();
    } catch (error) {
      Alert.alert('Approval Failed', error.message);
    } finally {
      setActionLoadingId('');
    }
  };

  const handleReject = async (certificateId) => {
    const rejectionReason = reasonById[certificateId] || '';
    if (!rejectionReason.trim()) {
      Alert.alert('Validation', 'Rejection reason is required');
      return;
    }
    setActionLoadingId(certificateId);
    try {
      await apiPut(`/certificates/${certificateId}/reject`, { rejectionReason, verificationNotes: notesById[certificateId] || '' }, token);
      await fetchCertificates();
    } catch (error) {
      Alert.alert('Rejection Failed', error.message);
    } finally {
      setActionLoadingId('');
    }
  };

  const handleCreateSubject = async () => {
    try {
      await apiPost('/academic-courses', {
        courseCode: subjectForm.courseCode,
        courseName: subjectForm.courseName,
        credits: Number(subjectForm.credits || 0),
        faculty: subjectForm.faculty,
        description: subjectForm.description,
        semester: Number(subjectForm.semester || 1),
        year: Number(subjectForm.year || new Date().getFullYear()),
        department: subjectForm.department,
        discourseLink: subjectForm.discourseLink,
      }, token);
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
      await apiPost(`/academic-courses/${selectedCourseId}/chapters`, {
        chapterNo: Number(chapterForm.chapterNo || 0),
        chapterName: chapterForm.chapterName,
        description: chapterForm.description,
        discourseLink: chapterForm.discourseLink,
        pdfs: chapterPdfs,
        externalLinks: chapterLinks,
      }, token);

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

  const selectedCourse = useMemo(() => courses.find((c) => c._id === selectedCourseId) || null, [courses, selectedCourseId]);

  const getStatusStyle = (status) => {
    if (status === 'approved') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={mode === 'certificates' ? certLoading : academicLoading} onRefresh={mode === 'certificates' ? fetchCertificates : fetchAcademicContent} />}
    >
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

      <View style={styles.modeSwitch}>
        <TouchableOpacity style={[styles.modeButton, mode === 'certificates' && styles.modeButtonActive]} onPress={() => setMode('certificates')}>
          <Text style={[styles.modeText, mode === 'certificates' && styles.modeTextActive]}>Certificates</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeButton, mode === 'academic' && styles.modeButtonActive]} onPress={() => setMode('academic')}>
          <Text style={[styles.modeText, mode === 'academic' && styles.modeTextActive]}>Academic Content</Text>
        </TouchableOpacity>
      </View>

      {mode === 'certificates' ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Certificate Verification</Text>
            <Text style={styles.count}>{certificates.length} total</Text>
          </View>
          {certificates.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.courseName}>{item.courseName}</Text>
                <View style={[styles.statusChip, getStatusStyle(item.status || (item.isApproved ? 'approved' : 'pending'))]}>
                  <Text style={styles.statusText}>{item.status || (item.isApproved ? 'approved' : 'pending')}</Text>
                </View>
              </View>
              <Text style={styles.meta}>User: {item.user?.username || '-'} ({item.user?.email || '-'})</Text>
              <Text style={styles.meta}>Type: {item.courseType}</Text>
              <TextInput style={styles.input} placeholder="Verification notes" value={notesById[item._id] || ''} onChangeText={(value) => setNotesById({ ...notesById, [item._id]: value })} />
              <TextInput style={styles.input} placeholder="Rejection reason" value={reasonById[item._id] || ''} onChangeText={(value) => setReasonById({ ...reasonById, [item._id]: value })} />
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item._id)} disabled={actionLoadingId === item._id}><Text style={styles.actionText}>Approve</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item._id)} disabled={actionLoadingId === item._id}><Text style={styles.actionText}>Reject</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {courses.map((course) => (
                <TouchableOpacity key={course._id} style={[styles.pill, selectedCourseId === course._id && styles.pillActive]} onPress={() => setSelectedCourseId(course._id)}>
                  <Text style={[styles.pillText, selectedCourseId === course._id && styles.pillTextActive]}>S{course.semester} {course.courseCode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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

          {courses.map((course) => (
            <View key={course._id} style={styles.card}>
              <Text style={styles.courseName}>Sem {course.semester} | {course.department || '-'} | {course.courseName}</Text>
              {(course.chapters || []).map((chapter) => (
                <View key={chapter._id} style={styles.chapterRow}>
                  <Text style={styles.meta}>#{chapter.chapterNo} {chapter.chapterName}</Text>
                  <TouchableOpacity onPress={() => handleDeleteChapter(course._id, chapter._id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
      <View style={{ height: 10 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 8 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#E9EFF6', borderRadius: 8, padding: 4, marginBottom: 8 },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
  modeButtonActive: { backgroundColor: '#4A90E2' },
  modeText: { color: '#5D788E', fontWeight: '700', fontSize: 12 },
  modeTextActive: { color: '#FFFFFF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2C3E50', marginBottom: 6 },
  count: { fontSize: 12, color: '#6E7D8A' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  courseName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#243447', marginRight: 6 },
  statusChip: { borderRadius: 16, paddingHorizontal: 8, paddingVertical: 3 },
  statusPending: { backgroundColor: '#FFF7D6' },
  statusApproved: { backgroundColor: '#DDF7E6' },
  statusRejected: { backgroundColor: '#FFE2DE' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize', color: '#2C3E50' },
  meta: { fontSize: 12, color: '#5E6B78', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#D4DEE8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6, fontSize: 13, backgroundColor: '#FAFCFE' },
  dropdownInput: { borderWidth: 1, borderColor: '#D4DEE8', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 6, backgroundColor: '#FAFCFE' },
  dropdownText: { color: '#2E465A', fontSize: 13 },
  actionsRow: { flexDirection: 'row', marginTop: 6 },
  actionButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 9, flex: 1 },
  approveButton: { backgroundColor: '#2EA86B', marginRight: 4 },
  rejectButton: { backgroundColor: '#D65345', marginLeft: 4 },
  actionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  smallButton: { backgroundColor: '#365978', borderRadius: 8, paddingVertical: 7, alignItems: 'center', marginBottom: 6 },
  smallButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  empty: { color: '#7A8998', textAlign: 'center', marginTop: 20 },
  pill: { backgroundColor: '#EFF2F7', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6, marginBottom: 8 },
  pillActive: { backgroundColor: '#35516E' },
  pillText: { color: '#5A6E81', fontWeight: '600', fontSize: 11 },
  pillTextActive: { color: '#FFFFFF' },
  chapterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEF3F7', paddingTop: 6, marginTop: 6 },
  deleteText: { color: '#D65345', fontWeight: '700', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 10, maxHeight: '70%' },
  modalRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  modalText: { color: '#2E475E' },
});

export default AdminCertificatesScreen;
