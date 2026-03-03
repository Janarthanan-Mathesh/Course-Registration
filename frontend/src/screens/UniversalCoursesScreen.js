import React, { useCallback, useMemo, useState } from 'react';
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

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCourses} />}
      >
        {filteredCourses.map((course) => {
          const isRegistered = Boolean(course.isEnrolled);
          return (
            <View key={course._id} style={styles.card}>
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
        })}

        {!loading && filteredCourses.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No courses found.</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: { flex: 1 },
  filterRow: { paddingHorizontal: 10, paddingTop: 10 },
  filterButton: { backgroundColor: '#EAF0F6', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: 4 },
  filterButtonActive: { backgroundColor: '#4A90E2' },
  filterText: { color: '#607A91', fontWeight: '600', fontSize: 12 },
  filterTextActive: { color: '#FFFFFF' },
  list: { padding: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  tag: { backgroundColor: '#EAF4FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#4A90E2', fontSize: 12, fontWeight: '700' },
  enrolledChip: { backgroundColor: '#E2F7EA', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  enrolledText: { color: '#27AE60', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#233547', marginTop: 10 },
  description: { color: '#6C7E8E', marginTop: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  meta: { color: '#607789', fontSize: 12 },
  actionButton: { marginTop: 12, backgroundColor: '#4A90E2', borderRadius: 20, paddingVertical: 10, alignItems: 'center' },
  continueButton: { backgroundColor: '#27AE60' },
  actionText: { color: '#FFFFFF', fontWeight: '700' },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#7A8B9A' },
});

export default UniversalCoursesScreen;
