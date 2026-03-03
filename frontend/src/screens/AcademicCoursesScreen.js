import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
          <ScrollView>
            {options.map((opt) => (
              <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => onSelect(opt)}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCourses} />}
      >
        {filteredCourses.map((course) => {
          const isRegistered = Boolean(course.isEnrolled);
          return (
            <View key={course._id} style={styles.courseCard}>
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
        })}

        {!loading && filteredCourses.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>No subjects found.</Text></View>
        )}
        <View style={{ height: 10 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#EAF4FF' },
  infoText: { marginLeft: 6, color: '#2D4B66', fontSize: 12, flex: 1 },
  filtersRow: { padding: 8, gap: 8 },
  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7E0EA',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorLabel: { fontSize: 12, color: '#6C8094', fontWeight: '700' },
  selectorValue: { flex: 1, fontSize: 13, color: '#1F354A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 10, maxHeight: '70%' },
  optionRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF2F6' },
  optionText: { color: '#2E475E' },
  list: { flex: 1, paddingHorizontal: 8 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, marginBottom: 8 },
  courseCode: { color: '#4A90E2', fontWeight: '700', marginBottom: 5 },
  courseName: { fontSize: 15, fontWeight: '700', color: '#233547', marginBottom: 5 },
  meta: { color: '#627789', fontSize: 12, marginBottom: 5 },
  rowBtns: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  registerButton: { backgroundColor: '#EAF4FF', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  registeredButton: { backgroundColor: '#E2F7EA' },
  registerText: { color: '#4A90E2', fontWeight: '700', fontSize: 12 },
  registeredText: { color: '#27AE60' },
  discourseButton: { backgroundColor: '#324F6B', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  discourseText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12 },
  disabled: { opacity: 0.4 },
  chapterCard: { backgroundColor: '#F7FAFD', borderRadius: 8, padding: 8, marginTop: 8 },
  chapterName: { fontWeight: '700', color: '#22394E', marginBottom: 5, fontSize: 12 },
  chapterDesc: { color: '#5F7487', marginBottom: 6, fontSize: 12 },
  pdfRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  pdfTitle: { flex: 1, color: '#22425F', fontSize: 12 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E6FD9', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 5 },
  downloadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  itemLink: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  itemLinkText: { marginLeft: 5, color: '#1E6FD9', fontWeight: '600', fontSize: 12 },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  emptyText: { color: '#7A8B9A' },
});

export default AcademicCoursesScreen;
