import React, { useState } from 'react';
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
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    linkedin: '',
    github: '',
    role: 'student',
    adminDevOtp: '',
  });
  const [otp, setOtp] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusType, setStatusType] = useState('info');
  const { register, verifyEmailOtp, applySession } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    setStatusText('');
    setStatusType('info');
    const { username, email, password, confirmPassword, phone, adminDevOtp } = formData;

    const needsDeveloperOtp = formData.role !== 'student';
    if (!username || !email || !password || !confirmPassword || !phone || (needsDeveloperOtp && !adminDevOtp.trim())) {
      Alert.alert(
        'Error',
        needsDeveloperOtp
          ? 'Please fill in all mandatory fields including developer OTP'
          : 'Please fill in all mandatory fields'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await register(formData);
      if (data?.requiresLogin) {
        setStatusType('error');
        setStatusText(data.message || 'Account already exists. Please login.');
        return;
      }
      setRegisteredUserId(data.userId);
      const otpPreviewMessage = data.otpPreview ? `\nOTP (dev): ${data.otpPreview}` : '';
      const infoMessage =
        data.message || 'Check your email for OTP, then verify to complete registration.';
      setStatusText(infoMessage);
      setStatusType('success');
      Alert.alert('Registration Successful', `${infoMessage}${otpPreviewMessage}`);
    } catch (error) {
      const message = error?.message || 'Registration failed';
      if (error?.status === 400 && /already exists/i.test(message)) {
        setStatusText(`${message}. Please login with this account.`);
      } else {
        setStatusText(message);
      }
      setStatusType('error');
      Alert.alert('Registration Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setStatusText('');
    setStatusType('info');
    if (!registeredUserId || !otp) {
      Alert.alert('Error', 'Enter OTP to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await verifyEmailOtp(registeredUserId, otp);
      applySession(data.token, {
        id: registeredUserId,
        username: formData.username,
        email: formData.email,
        role: formData.role,
      });
      setStatusText('Registration and verification completed.');
      setStatusType('success');
      Alert.alert('Success', 'Registration and verification completed.');
      navigation.replace('Main');
    } catch (error) {
      setStatusText(error.message);
      setStatusType('error');
      Alert.alert('Verification Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
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
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today!</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.roleSwitch}>
            {['student', 'mentor', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleButton, formData.role === role && styles.roleButtonActive]}
                onPress={() => handleInputChange('role', role)}
              >
                <Text style={[styles.roleButtonText, formData.role === role && styles.roleButtonTextActive]}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppInput leftIcon="person-outline" placeholder="Username *" value={formData.username} onChangeText={(value) => handleInputChange('username', value)} autoCapitalize="none" />
          <AppInput leftIcon="mail-outline" placeholder="Email *" value={formData.email} onChangeText={(value) => handleInputChange('email', value)} autoCapitalize="none" keyboardType="email-address" />
          <AppInput leftIcon="call-outline" placeholder="Phone Number *" value={formData.phone} onChangeText={(value) => handleInputChange('phone', value)} keyboardType="phone-pad" />
          <AppInput leftIcon="lock-closed-outline" placeholder="Password *" value={formData.password} onChangeText={(value) => handleInputChange('password', value)} secureTextEntry={!showPassword} showToggle isPasswordVisible={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />
          <AppInput leftIcon="lock-closed-outline" placeholder="Confirm Password *" value={formData.confirmPassword} onChangeText={(value) => handleInputChange('confirmPassword', value)} secureTextEntry={!showConfirmPassword} showToggle isPasswordVisible={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} />
          <AppInput leftIcon="logo-linkedin" placeholder="LinkedIn Profile (Optional)" value={formData.linkedin} onChangeText={(value) => handleInputChange('linkedin', value)} autoCapitalize="none" />
          <AppInput leftIcon="logo-github" placeholder="GitHub Profile (Optional)" value={formData.github} onChangeText={(value) => handleInputChange('github', value)} autoCapitalize="none" />
          {formData.role !== 'student' && (
            <AppInput
              leftIcon="shield-checkmark-outline"
              placeholder="Developer OTP *"
              value={formData.adminDevOtp}
              onChangeText={(value) => handleInputChange('adminDevOtp', value)}
              secureTextEntry
            />
          )}

          {!registeredUserId ? (
            <AppButton label="REGISTER" onPress={handleRegister} loading={isSubmitting} style={styles.registerButton} />
          ) : (
            <>
              <View style={styles.otpBox}>
                <Text style={styles.otpTitle}>Verify Email OTP</Text>
                <AppInput
                  style={styles.otpInput}
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                />
              </View>
              <AppButton label="VERIFY OTP" onPress={handleVerifyOtp} loading={isSubmitting} style={styles.registerButton} />
            </>
          )}

          {!!statusText && (
            <View
              style={[
                styles.statusBox,
                statusType === 'error' && styles.statusBoxError,
                statusType === 'success' && styles.statusBoxSuccess,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  statusType === 'error' && styles.statusTextError,
                  statusType === 'success' && styles.statusTextSuccess,
                ]}
              >
                {statusText}
              </Text>
              {statusType === 'error' && /already exists/i.test(statusText) && (
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.statusAction}>Go to Login</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Login</Text>
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
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    ...typography.display,
    color: '#2C3E50',
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
  registerButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  otpBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: ds.radius.md,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  otpTitle: {
    ...typography.title,
    color: ds.colors.textPrimary,
    marginBottom: 8,
  },
  otpInput: {
    marginBottom: 0,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: ds.colors.textSecondary,
    ...typography.bodySm,
  },
  loginLink: {
    color: ds.colors.primaryBlue,
    ...typography.bodySm,
    fontWeight: '700',
  },
  statusBox: {
    borderRadius: ds.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 2,
    marginBottom: 8,
    backgroundColor: ds.colors.infoSoft,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statusBoxError: {
    backgroundColor: ds.colors.dangerSoft,
    borderColor: '#FECACA',
  },
  statusBoxSuccess: {
    backgroundColor: ds.colors.successSoft,
    borderColor: '#BBF7D0',
  },
  statusText: {
    color: ds.colors.textPrimary,
    ...typography.bodySm,
  },
  statusTextError: {
    color: '#991B1B',
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusAction: {
    marginTop: 6,
    color: ds.colors.primaryBlue,
    ...typography.label,
    fontWeight: '700',
  },
});

export default RegisterScreen;
