import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { firebaseApp, firebaseAuth, DEVELOPER_VERIFY_PHONE } from '../services/firebase';

const LoginScreen = ({ navigation }) => {
  const recaptchaVerifier = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('user');
  const [verificationId, setVerificationId] = useState('');
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [firebaseIdToken, setFirebaseIdToken] = useState('');
  const [adminDevOtp, setAdminDevOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { login, isAuthLoading } = useAuth();

  const resetAdminOtpFlow = () => {
    setVerificationId('');
    setAdminOtpCode('');
    setFirebaseIdToken('');
    setAdminDevOtp('');
  };

  const handleRoleChange = (role) => {
    setLoginRole(role);
    if (role !== 'admin') {
      resetAdminOtpFlow();
    }
  };

  const handleSendAdminOtp = async () => {
    try {
      setIsSendingOtp(true);
      const provider = new PhoneAuthProvider(firebaseAuth);
      const id = await provider.verifyPhoneNumber(DEVELOPER_VERIFY_PHONE, recaptchaVerifier.current);
      setVerificationId(id);
      Alert.alert('OTP Sent', `Developer OTP sent to ${DEVELOPER_VERIFY_PHONE}`);
    } catch (error) {
      Alert.alert('OTP Send Failed', error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAdminOtp = async () => {
    if (!verificationId || !adminOtpCode) {
      Alert.alert('Error', 'Enter the OTP first');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const credential = PhoneAuthProvider.credential(verificationId, adminOtpCode);
      const userCredential = await signInWithCredential(firebaseAuth, credential);
      const idToken = await userCredential.user.getIdToken(true);
      setFirebaseIdToken(idToken);
      Alert.alert('Verified', 'Developer phone verification successful');
    } catch (error) {
      Alert.alert('OTP Verification Failed', error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (loginRole === 'admin' && !firebaseIdToken && !adminDevOtp.trim()) {
      Alert.alert('Admin Verification Required', 'Verify phone OTP or enter your developer code.');
      return;
    }

    try {
      await login(
        email,
        password,
        loginRole,
        loginRole === 'admin' ? firebaseIdToken : '',
        loginRole === 'admin' ? adminDevOtp.trim() : ''
      );
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Google Sign-In integration is not configured in this build.');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FirebaseRecaptchaVerifierModal ref={recaptchaVerifier} firebaseConfig={firebaseApp.options} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Ionicons name="school-outline" size={80} color="#4A90E2" />
          <Text style={styles.title}>Course Registration</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.roleSwitch}>
            <TouchableOpacity
              style={[styles.roleButton, loginRole === 'user' && styles.roleButtonActive]}
              onPress={() => handleRoleChange('user')}
            >
              <Text style={[styles.roleButtonText, loginRole === 'user' && styles.roleButtonTextActive]}>
                User Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, loginRole === 'admin' && styles.roleButtonActive]}
              onPress={() => handleRoleChange('admin')}
            >
              <Text style={[styles.roleButtonText, loginRole === 'admin' && styles.roleButtonTextActive]}>
                Admin Login
              </Text>
            </TouchableOpacity>
          </View>

          {loginRole === 'admin' && (
            <View style={styles.otpCard}>
              <Text style={styles.otpTitle}>Developer Verification</Text>
              <Text style={styles.otpHint}>Phone: {DEVELOPER_VERIFY_PHONE}</Text>

              <TouchableOpacity style={styles.otpButton} onPress={handleSendAdminOtp} disabled={isSendingOtp}>
                {isSendingOtp ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.otpButtonText}>Send OTP</Text>}
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  value={adminOtpCode}
                  onChangeText={setAdminOtpCode}
                  keyboardType="number-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.otpButton, styles.verifyOtpButton]}
                onPress={handleVerifyAdminOtp}
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.otpButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.altVerifyText}>Or use developer code (fallback)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter developer code"
                  value={adminDevOtp}
                  onChangeText={setAdminDevOtp}
                  secureTextEntry
                />
              </View>

              {Boolean(firebaseIdToken) && <Text style={styles.verifiedText}>Developer OTP verified</Text>}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isAuthLoading}>
            {isAuthLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>LOGIN</Text>}
          </TouchableOpacity>

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EEF3F9',
    borderRadius: 10,
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
    backgroundColor: '#4A90E2',
  },
  roleButtonText: {
    color: '#53708A',
    fontWeight: '600',
    fontSize: 13,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  otpCard: {
    backgroundColor: '#EFF7FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  otpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  otpHint: {
    fontSize: 12,
    color: '#5A748B',
    marginTop: 4,
    marginBottom: 10,
  },
  otpButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyOtpButton: {
    backgroundColor: '#2EA86B',
  },
  otpButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  verifiedText: {
    color: '#2EA86B',
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  altVerifyText: {
    textAlign: 'center',
    color: '#5A748B',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#7F8C8D',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    marginLeft: 10,
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  registerLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
