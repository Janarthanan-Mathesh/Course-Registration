import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';
import ds from '../utils/designSystem';
import typography from '../utils/typography';

const UniversalCoursesScreen = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const loadCourses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGet('/universal-courses', token);
      setCourses(data.courses || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [token])
  );

  const providers = useMemo(() => ['All', ...new Set(courses.map((c) => c.provider).filter(Boolean))], [courses]);
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesSearch =
        !q ||
        String(course.courseName || '').toLowerCase().includes(q) ||
        String(course.description || '').toLowerCase().includes(q);
      const matchesProvider = selectedProvider === 'All' || course.provider === selectedProvider;
      const matchesLevel = selectedLevel === 'All' || course.skillLevel === selectedLevel;
      return matchesSearch && matchesProvider && matchesLevel;
    });
  }, [courses, searchQuery, selectedProvider, selectedLevel]);

  const handleRegister = async (courseId) => {
    try {
      await apiPost('/enrollments', { courseId, courseType: 'universal' }, token);
      await loadCourses();
      Alert.alert('Success', 'Course registered successfully');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const renderCourse = ({ item: course }) => {
    const isRegistered = Boolean(course.isEnrolled);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{course.provider || 'Provider'}</Text>
          </View>
          {isRegistered && (
            <View style={styles.enrolledChip}>
              <Text style={styles.enrolledText}>Enrolled</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{course.courseName}</Text>
        <Text style={styles.description} numberOfLines={2}>{course.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Level: {course.skillLevel || '-'}</Text>
          <Text style={styles.meta}>Duration: {course.duration || '-'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, isRegistered && styles.continueButton]}
          onPress={() => handleRegister(course._id)}
          disabled={isRegistered}
        >
          <Text style={styles.actionText}>{isRegistered ? 'Registered' : 'Register'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#72869A" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {providers.map((provider) => (
          <TouchableOpacity
            key={provider}
            style={[styles.filterButton, selectedProvider === provider && styles.filterButtonActive]}
            onPress={() => setSelectedProvider(provider)}
          >
            <Text style={[styles.filterText, selectedProvider === provider && styles.filterTextActive]}>{provider}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.filterButton, selectedLevel === level && styles.filterButtonActive]}
            onPress={() => setSelectedLevel(level)}
          >
            <Text style={[styles.filterText, selectedLevel === level && styles.filterTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 90 }}
        data={filteredCourses}
        keyExtractor={(item) => item._id}
        renderItem={renderCourse}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCourses} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No courses found.</Text>
          </View>
        ) : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ds.colors.surface,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: ds.radius.pill,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  searchInput: { flex: 1, outlineStyle: 'none', outlineWidth: 0, color: ds.colors.textPrimary, ...typography.bodySm },
  filterRow: { paddingHorizontal: 10, paddingTop: 10 },
  filterButton: { backgroundColor: '#EEF2FF', borderRadius: ds.radius.pill, paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 4 },
  filterButtonActive: { backgroundColor: ds.colors.primaryIndigo },
  filterText: { color: ds.colors.textSecondary, ...typography.caption, fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  list: { padding: 14 },
  card: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  tag: { backgroundColor: '#E0E7FF', borderRadius: ds.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: ds.colors.primaryIndigo, ...typography.caption, fontWeight: '700' },
  enrolledChip: { backgroundColor: ds.status.approved.bg, borderRadius: ds.radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  enrolledText: { color: ds.status.approved.text, ...typography.caption, fontWeight: '700' },
  title: { ...typography.title, fontWeight: '700', color: ds.colors.textPrimary, marginTop: 10 },
  description: { color: ds.colors.textSecondary, ...typography.bodySm, marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  meta: { color: ds.colors.textSecondary, ...typography.caption },
  actionButton: { marginTop: 12, backgroundColor: ds.colors.primaryIndigo, borderRadius: ds.radius.pill, paddingVertical: 10, alignItems: 'center' },
  continueButton: { backgroundColor: ds.colors.emerald },
  actionText: { color: '#FFFFFF', ...typography.button, fontSize: 13 },
  empty: { backgroundColor: ds.colors.surface, borderRadius: ds.radius.lg, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: ds.colors.border },
  emptyText: { color: ds.colors.textSecondary, ...typography.bodySm },
});

export default UniversalCoursesScreen;
