import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const AppButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSuccess = variant === 'success';
  const isDanger = variant === 'danger';
  const computedDisabled = disabled || loading;
  const activityColor = isPrimary || isSuccess || isDanger ? '#FFFFFF' : ds.colors.primaryIndigo;
  const variantTextStyle = isPrimary || isSuccess || isDanger ? styles.primaryText : styles.secondaryText;
  const variantButtonStyle = isSuccess
    ? styles.success
    : isDanger
      ? styles.danger
      : isPrimary
        ? styles.primary
        : styles.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantButtonStyle,
        computedDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={computedDisabled}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color={activityColor} />
      ) : (
        <Text style={[styles.text, variantTextStyle, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: ds.radius.md,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    ...ds.shadows.soft,
  },
  primary: {
    backgroundColor: ds.colors.primaryIndigo,
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  success: {
    backgroundColor: ds.colors.emerald,
    borderWidth: 1,
    borderColor: '#059669',
  },
  danger: {
    backgroundColor: ds.colors.rose,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  secondary: {
    backgroundColor: ds.colors.surface,
    borderWidth: 1,
    borderColor: ds.colors.primaryIndigo,
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    ...typography.button,
    textTransform: 'uppercase',
  },
  primaryText: {
    color: ds.colors.surface,
  },
  secondaryText: {
    color: ds.colors.primaryIndigo,
  },
});

export default AppButton;
