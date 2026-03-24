import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AppLoader from '../components/AppLoader';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const SplashScreen = ({ navigation }) => {
  const { isSessionReady, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isSessionReady) return;
    navigation.replace(isLoggedIn ? 'Main' : 'Login');
  }, [isLoggedIn, isSessionReady, navigation]);

  return (
    <View style={styles.container}>
      <Ionicons name="school-outline" size={72} color="#FFFFFF" />
      <Text style={styles.title}>Course Registration</Text>
      <AppLoader color="#FFFFFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ds.colors.primaryIndigo,
  },
  title: {
    marginTop: 14,
    marginBottom: 14,
    ...typography.heading1,
    color: '#FFFFFF',
  },
});

export default SplashScreen;
