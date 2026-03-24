import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('student');
  const [adminDevOtp, setAdminDevOtp] = useState('');
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState('info');

  const { login, isAuthLoading } = useAuth();

  useEffect(() => {
    const incomingMessage = route?.params?.statusMessage;
    const incomingType = route?.params?.statusType;
    if (!incomingMessage) return;
    setStatusText(incomingMessage);
    setStatusType(incomingType || 'info');
    navigation.setParams({ statusMessage: undefined, statusType: undefined });
  }, [route?.params?.statusMessage, route?.params?.statusType, navigation]);

  const handleRoleChange = (role) => setLoginRole(role);

  const handleLogin = async () => {
    setStatusText('');
    setStatusType('info');
    if (!email || !password) {
      const message = 'Please fill in all fields';
      setStatusText(message);
      setStatusType('warning');
      Alert.alert('Error', message);
      return;
    }

    if (loginRole !== 'student' && !adminDevOtp.trim()) {
      const message = 'Enter your developer OTP to continue.';
      setStatusText(message);
      setStatusType('warning');
      Alert.alert('Developer OTP Required', message);
      return;
    }

    try {
      await login(email, password, loginRole, '', adminDevOtp.trim());
      Alert.alert('Success', 'Logged in successfully', [
        { text: 'OK', onPress: () => navigation.replace('Main') },
      ]);
    } catch (error) {
      const message = error?.message || 'Login failed';
      setStatusText(message);
      setStatusType('error');
      Alert.alert('Login Failed', message);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Google Sign-In integration is not configured in this build.');
  };

  const Container = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const containerProps =
    Platform.OS === 'web'
      ? { style: styles.container }
      : { behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.container };

  return (
    <Container {...containerProps}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Ionicons name="school-outline" size={80} color="#4A90E2" />
          <Text style={styles.title}>Course Registration</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.roleSwitch}>
            {['student', 'mentor', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleButton, loginRole === role && styles.roleButtonActive]}
                onPress={() => handleRoleChange(role)}
              >
                <Text style={[styles.roleButtonText, loginRole === role && styles.roleButtonTextActive]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loginRole !== 'student' && (
            <View style={styles.otpCard}>
              <Text style={styles.otpTitle}>Developer Verification</Text>
              <Text style={styles.otpHint}>Developer OTP is required for mentor/admin.</Text>
              <AppInput
                leftIcon="shield-checkmark-outline"
                placeholder="Enter developer OTP"
                value={adminDevOtp}
                onChangeText={setAdminDevOtp}
                secureTextEntry
              />
            </View>
          )}

          <AppInput
            leftIcon="mail-outline"
            placeholder="Email or Username"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            leftIcon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            showToggle
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AppButton label="LOGIN" onPress={handleLogin} loading={isAuthLoading} style={styles.loginButton} />
          {!!statusText && (
            <View
              style={[
                styles.statusBox,
                statusType === 'success' && styles.statusBoxSuccess,
                statusType === 'error' && styles.statusBoxError,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  statusType === 'success' && styles.statusTextSuccess,
                  statusType === 'error' && styles.statusTextError,
                  statusType === 'warning' && styles.statusTextWarning,
                ]}
              >
                {statusText}
              </Text>
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ds.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.display,
    color: '#2C3E50',
    marginTop: 20,
  },
  subtitle: {
    ...typography.title,
    color: ds.colors.textSecondary,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: ds.colors.surface,
    borderRadius: ds.radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.card,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: ds.radius.md,
    padding: 4,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: ds.colors.primaryIndigo,
  },
  roleButtonText: {
    ...typography.label,
    color: ds.colors.textSecondary,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  otpCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: ds.radius.md,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  otpTitle: {
    ...typography.title,
    color: '#2C3E50',
  },
  otpHint: {
    ...typography.bodySm,
    color: ds.colors.textSecondary,
    marginTop: 4,
    marginBottom: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: ds.colors.primaryBlue,
    ...typography.bodySm,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: ds.colors.primaryIndigo,
    borderRadius: ds.radius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBox: {
    borderRadius: ds.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: ds.colors.warningSoft,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
    color: ds.colors.textPrimary,
    ...typography.bodySm,
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusTextError: {
    color: '#991B1B',
  },
  statusTextWarning: {
    color: '#92400E',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ds.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#7F8C8D',
    ...typography.bodySm,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: ds.colors.surface,
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    marginLeft: 10,
    color: ds.colors.textPrimary,
    ...typography.title,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: ds.colors.textSecondary,
    ...typography.bodySm,
  },
  registerLink: {
    color: ds.colors.primaryBlue,
    ...typography.bodySm,
    fontWeight: '700',
  },
});

export default LoginScreen;
