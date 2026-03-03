import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, refreshProfile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    linkedinLink: '',
    githubLink: '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      linkedinLink: user.linkedinLink || '',
      githubLink: user.githubLink || '',
    });
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        await refreshProfile();
      } catch (error) {
        // keep existing values if request fails
      }
    };
    load();
  }, []);

  const initials = useMemo(() => {
    const value = profileData.username || 'U';
    return value.charAt(0).toUpperCase();
  }, [profileData.username]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        username: profileData.username,
        phone: profileData.phone,
        linkedinLink: profileData.linkedinLink,
        githubLink: profileData.githubLink,
      });
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.headerName}>{profileData.username || 'User'}</Text>
        <Text style={styles.headerEmail}>{profileData.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? 'close-circle-outline' : 'create-outline'} size={18} color="#4A90E2" />
          <Text style={styles.actionButtonText}>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={profileData.username}
          editable={isEditing}
          onChangeText={(username) => setProfileData((prev) => ({ ...prev, username }))}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, styles.inputDisabled]} value={profileData.email} editable={false} />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={profileData.phone}
          editable={isEditing}
          onChangeText={(phone) => setProfileData((prev) => ({ ...prev, phone }))}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>LinkedIn</Text>
        <TextInput
          style={styles.input}
          value={profileData.linkedinLink}
          editable={isEditing}
          onChangeText={(linkedinLink) => setProfileData((prev) => ({ ...prev, linkedinLink }))}
          autoCapitalize="none"
        />

        <Text style={styles.label}>GitHub</Text>
        <TextInput
          style={styles.input}
          value={profileData.githubLink}
          editable={isEditing}
          onChangeText={(githubLink) => setProfileData((prev) => ({ ...prev, githubLink }))}
          autoCapitalize="none"
        />
      </View>

      {isEditing && (
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  profileHeader: { backgroundColor: '#4A90E2', alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 34, fontWeight: 'bold', color: '#4A90E2' },
  headerName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerEmail: { color: '#E8F4FD', marginTop: 4 },
  section: { padding: 20 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
  },
  actionButtonText: { marginLeft: 8, color: '#4A90E2', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 14 },
  label: { fontSize: 13, color: '#6D7A86', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE6EF',
    paddingHorizontal: 12,
    height: 44,
  },
  inputDisabled: { backgroundColor: '#F0F4F8' },
  saveButton: {
    marginHorizontal: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700' },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
  },
  logoutButtonText: { marginLeft: 8, color: '#E74C3C', fontWeight: '700' },
});

export default ProfileScreen;
