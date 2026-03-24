import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const AppLoader = ({ fullscreen = false, color = '#4A90E2' }) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullscreen: {
    flex: 1,
  },
});

export default AppLoader;
