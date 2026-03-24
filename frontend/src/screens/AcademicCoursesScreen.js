import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';
import ds from '../utils/designSystem';
import typography from '../utils/typography';

const SEMESTERS = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
const DEPARTMENTS = [
  'All',
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

const Selector = ({ label, value, options, visible, onOpen, onClose, onSelect }) => (
  <>
    <TouchableOpacity style={styles.selector} onPress={onOpen}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.selectorValue}>{value}</Text>
      <Ionicons name="chevron-down" size={16} color="#5E7386" />
    </TouchableOpacity>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.optionRow} onPress={() => onSelect(item)}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  </>
);

const AcademicCoursesScreen = () => {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [semesterOpen, setSemesterOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasGoogleCollegeLogin =
    String(user?.email || '').toLowerCase().endsWith('@bitsathy.ac.in') && user?.authProvider === 'google';

  const loadCourses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGet('/academic-courses', token);
      setCourses(data.courses || []);
    } catch (error) {
      if (error.message.includes('only available for college email users')) {
        setCourses([]);
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [token])
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const semOk = selectedSemester === 'All' || String(c.semester) === selectedSemester;
      const deptOk = selectedDepartment === 'All' || c.department === selectedDepartment;
      return semOk && deptOk;
    });
  }, [courses, selectedSemester, selectedDepartment]);

  const handleRegister = async (courseId) => {
    try {
      await apiPost('/enrollments', { courseId, courseType: 'academic' }, token);
      await loadCourses();
      Alert.alert('Success', 'Subject registered successfully');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const openLink = async (url) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Invalid Link', 'Unable to open this URL');
      return;
    }
    await Linking.openURL(url);
  };

  const renderCourse = ({ item: course }) => {
    const isRegistered = Boolean(course.isEnrolled);
    return (
      <View style={styles.courseCard}>
        <Text style={styles.courseCode}>{course.courseCode}</Text>
        <Text style={styles.courseName}>{course.courseName}</Text>
        <Text style={styles.meta}>Sem {course.semester} | {course.department || '-'}</Text>
        <Text style={styles.meta}>Faculty: {course.faculty || '-'}</Text>

        <View style={styles.rowBtns}>
          <TouchableOpacity
            style={[styles.registerButton, isRegistered && styles.registeredButton]}
            onPress={() => handleRegister(course._id)}
            disabled={isRegistered}
          >
            <Text style={[styles.registerText, isRegistered && styles.registeredText]}>
              {isRegistered ? 'Registered' : 'Register'}
            </Text>
          </TouchableOpacity>
          {!!course.discourseLink && (
            <TouchableOpacity
              style={[styles.discourseButton, !hasGoogleCollegeLogin && styles.disabled]}
              onPress={() => openLink(course.discourseLink)}
              disabled={!hasGoogleCollegeLogin}
            >
              <Text style={styles.discourseText}>Discourse</Text>
            </TouchableOpacity>
          )}
        </View>

        {(course.chapters || []).map((chapter) => (
          <View key={chapter._id} style={styles.chapterCard}>
            <Text style={styles.chapterName}>Chapter {chapter.chapterNo}: {chapter.chapterName}</Text>
            {!!chapter.description && <Text style={styles.chapterDesc}>{chapter.description}</Text>}

            {(chapter.pdfs || []).map((pdf, idx) => (
              <View key={`${chapter._id}-pdf-${idx}`} style={styles.pdfRow}>
                <Text style={styles.pdfTitle}>{pdf.title}</Text>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => openLink(pdf.url)}>
                  <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.downloadText}>Download</Text>
                </TouchableOpacity>
              </View>
            ))}

            {(chapter.externalLinks || []).map((lnk, idx) => (
              <TouchableOpacity key={`${chapter._id}-ext-${idx}`} style={styles.itemLink} onPress={() => openLink(lnk.url)}>
                <Ionicons name="link-outline" size={14} color="#1E6FD9" />
                <Text style={styles.itemLinkText}>{lnk.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={16} color="#4A90E2" />
        <Text style={styles.infoText}>Choose semester and department to view subjects and chapter PDFs.</Text>
      </View>

      <View style={styles.filtersRow}>
        <Selector
          label="Semester"
          value={selectedSemester === 'All' ? 'All Semesters' : `Semester ${selectedSemester}`}
          options={SEMESTERS.map((s) => (s === 'All' ? 'All Semesters' : `Semester ${s}`))}
          visible={semesterOpen}
          onOpen={() => setSemesterOpen(true)}
          onClose={() => setSemesterOpen(false)}
          onSelect={(label) => {
            setSelectedSemester(label === 'All Semesters' ? 'All' : label.replace('Semester ', ''));
            setSemesterOpen(false);
          }}
        />
        <Selector
          label="Department"
          value={selectedDepartment}
          options={DEPARTMENTS}
          visible={deptOpen}
          onOpen={() => setDeptOpen(true)}
          onClose={() => setDeptOpen(false)}
          onSelect={(value) => {
            setSelectedDepartment(value);
            setDeptOpen(false);
          }}
        />
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 90 }}
        data={filteredCourses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCourses} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}><Text style={styles.emptyText}>No subjects found.</Text></View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.colors.background },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#DBEAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  infoText: { marginLeft: 6, color: '#1E3A8A', ...typography.caption, flex: 1 },
  filtersRow: { padding: 8, gap: 8 },
  selector: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.pill,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorLabel: { ...typography.caption, color: ds.colors.textSecondary, fontWeight: '700' },
  selectorValue: { flex: 1, ...typography.bodySm, color: ds.colors.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: ds.colors.surface, borderRadius: ds.radius.lg, maxHeight: '70%', ...ds.shadows.card },
  optionRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  optionText: { ...typography.body, color: ds.colors.textPrimary },
  list: { flex: 1, paddingHorizontal: 8 },
  courseCard: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  courseCode: { color: ds.colors.primaryBlue, ...typography.label, fontWeight: '700', marginBottom: 5 },
  courseName: { ...typography.title, fontWeight: '700', color: ds.colors.textPrimary, marginBottom: 5 },
  meta: { color: ds.colors.textSecondary, ...typography.caption, marginBottom: 5 },
  rowBtns: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  registerButton: { backgroundColor: '#EEF2FF', borderRadius: ds.radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  registeredButton: { backgroundColor: ds.status.approved.bg },
  registerText: { color: ds.colors.primaryIndigo, ...typography.label, fontWeight: '700' },
  registeredText: { color: ds.status.approved.text },
  discourseButton: { backgroundColor: ds.colors.primaryBlue, borderRadius: ds.radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  discourseText: { color: '#FFFFFF', ...typography.label, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  chapterCard: { backgroundColor: '#F8FAFC', borderRadius: ds.radius.md, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  chapterName: { ...typography.bodySm, fontWeight: '700', color: ds.colors.textPrimary, marginBottom: 5 },
  chapterDesc: { color: ds.colors.textSecondary, ...typography.caption, marginBottom: 6 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  pdfTitle: { flex: 1, color: ds.colors.textPrimary, ...typography.caption },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ds.colors.primaryBlue, borderRadius: ds.radius.pill, paddingHorizontal: 9, paddingVertical: 5 },
  downloadText: { color: '#FFFFFF', ...typography.caption, fontWeight: '700' },
  itemLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  itemLinkText: { marginLeft: 5, color: ds.colors.primaryBlue, ...typography.caption, fontWeight: '700' },
  empty: { backgroundColor: ds.colors.surface, borderRadius: ds.radius.lg, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: ds.colors.border },
  emptyText: { color: ds.colors.textSecondary, ...typography.bodySm },
});

export default AcademicCoursesScreen;
