import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AcademicCoursesScreen from '../screens/AcademicCoursesScreen';
import UniversalCoursesScreen from '../screens/UniversalCoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminCertificatesScreen from '../screens/AdminCertificatesScreen';
import { useAuth } from '../context/AuthContext';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'mentor';
  const isVerifier = isAdmin || isMentor;
  const hasCollegeEmail = String(user?.email || '').toLowerCase().endsWith('@bitsathy.ac.in');
  const canAccessAcademic = !isAdmin && (hasCollegeEmail || isMentor);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Academic') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Universal') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: ds.colors.primaryIndigo,
        tabBarInactiveTintColor: ds.colors.muted,
        tabBarStyle: {
          backgroundColor: ds.colors.surface,
          borderTopWidth: 1,
          borderTopColor: ds.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: ds.colors.primaryIndigo,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          ...typography.title,
          color: '#FFFFFF',
          fontWeight: '700',
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: '600',
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Dashboard' }} />

      {!isAdmin && (
        <>
          {canAccessAcademic && (
            <Tab.Screen
              name="Academic"
              component={AcademicCoursesScreen}
              options={{ title: 'Academic Courses' }}
            />
          )}
          <Tab.Screen
            name="Universal"
            component={UniversalCoursesScreen}
            options={{ title: 'Universal Courses' }}
          />
        </>
      )}

      {isVerifier && (
        <Tab.Screen
          name="Admin"
          component={AdminCertificatesScreen}
          options={{ title: 'Verification Panel' }}
        />
      )}

      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
