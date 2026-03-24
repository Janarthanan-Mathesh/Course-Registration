import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const ProfileScreen = ({ navigation }) => {
  const { user, refreshProfile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [statusBanner, setStatusBanner] = useState({ text: '', type: 'info' });
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
      setStatusBanner({ text: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setStatusBanner({ text: error.message || 'Profile update failed', type: 'error' });
      Alert.alert('Update Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    let currentNav = navigation;
    while (currentNav) {
      const state = currentNav.getState?.();
      if (state?.routeNames?.includes('Login')) {
        currentNav.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Login',
                params: {
                  statusMessage: 'Logged out successfully',
                  statusType: 'success',
                },
              },
            ],
          })
        );
        return;
      }
      currentNav = currentNav.getParent?.();
    }

    if (navigation.navigate) {
      navigation.navigate('Login', {
        statusMessage: 'Logged out successfully',
        statusType: 'success',
      });
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
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

      {!!statusBanner.text && (
        <View
          style={[
            styles.statusBox,
            statusBanner.type === 'success' && styles.statusBoxSuccess,
            statusBanner.type === 'error' && styles.statusBoxError,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              statusBanner.type === 'success' && styles.statusTextSuccess,
              statusBanner.type === 'error' && styles.statusTextError,
            ]}
          >
            {statusBanner.text}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <Text style={styles.label}>Username</Text>
        <AppInput
          style={styles.input}
          value={profileData.username}
          editable={isEditing}
          onChangeText={(username) => setProfileData((prev) => ({ ...prev, username }))}
        />

        <Text style={styles.label}>Email</Text>
        <AppInput style={[styles.input, styles.inputDisabled]} value={profileData.email} editable={false} />

        <Text style={styles.label}>Phone</Text>
        <AppInput
          style={styles.input}
          value={profileData.phone}
          editable={isEditing}
          onChangeText={(phone) => setProfileData((prev) => ({ ...prev, phone }))}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>LinkedIn</Text>
        <AppInput
          style={styles.input}
          value={profileData.linkedinLink}
          editable={isEditing}
          onChangeText={(linkedinLink) => setProfileData((prev) => ({ ...prev, linkedinLink }))}
          autoCapitalize="none"
        />

        <Text style={styles.label}>GitHub</Text>
        <AppInput
          style={styles.input}
          value={profileData.githubLink}
          editable={isEditing}
          onChangeText={(githubLink) => setProfileData((prev) => ({ ...prev, githubLink }))}
          autoCapitalize="none"
        />
      </View>

      {isEditing && (
        <AppButton
          label={loading ? 'Saving...' : 'Save Changes'}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLogoutConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalLogout}
                onPress={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                  navigateToLogin();
                }}
              >
                <Text style={styles.modalLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ds.colors.background },
  contentContainer: { paddingBottom: 90 },
  profileHeader: { backgroundColor: ds.colors.primaryIndigo, alignItems: 'center', paddingVertical: 28, borderBottomLeftRadius: ds.radius.xl, borderBottomRightRadius: ds.radius.xl },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { ...typography.heading1, fontSize: 34, color: '#4A90E2' },
  headerName: { ...typography.heading1, color: '#FFFFFF' },
  headerEmail: { ...typography.bodySm, color: '#E0E7FF', marginTop: 4 },
  section: { padding: 20 },
  statusBox: {
    marginHorizontal: 20,
    borderRadius: ds.radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  statusBoxSuccess: {
    backgroundColor: ds.colors.successSoft,
    borderColor: '#86EFAC',
  },
  statusBoxError: {
    backgroundColor: ds.colors.dangerSoft,
    borderColor: '#FCA5A5',
  },
  statusText: {
    ...typography.bodySm,
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusTextError: {
    color: '#991B1B',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.pill,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  actionButtonText: { ...typography.title, marginLeft: 8, color: ds.colors.primaryIndigo },
  sectionTitle: { ...typography.heading2, color: ds.colors.textPrimary, marginBottom: 14 },
  label: { ...typography.label, color: ds.colors.textSecondary, marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.md,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingHorizontal: 0,
    minHeight: 44,
  },
  inputDisabled: { backgroundColor: '#F1F5F9' },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 4,
  },
  saveButtonDisabled: { opacity: 0.7 },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ds.colors.dangerSoft,
    borderRadius: ds.radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: { ...typography.button, marginLeft: 8, color: ds.colors.rose, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.card,
  },
  modalTitle: {
    ...typography.heading2,
    color: ds.colors.textPrimary,
    marginBottom: 8,
  },
  modalText: {
    ...typography.body,
    color: ds.colors.textSecondary,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    borderRadius: ds.radius.md,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalCancelText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: ds.colors.textSecondary,
  },
  modalLogout: {
    flex: 1,
    borderRadius: ds.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: ds.colors.rose,
  },
  modalLogoutText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
