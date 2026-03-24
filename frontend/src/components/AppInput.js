import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import typography from '../utils/typography';
import ds from '../utils/designSystem';

const AppInput = ({
  value,
  onChangeText,
  placeholder,
  leftIcon,
  secureTextEntry = false,
  showToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  style,
  inputStyle,
  placeholderTextColor = '#7A8794',
  ...rest
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused, style]}>
      {leftIcon ? <Ionicons name={leftIcon} size={20} color={isFocused ? ds.colors.primaryIndigo : '#64748B'} style={styles.inputIcon} /> : null}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        underlineColorAndroid="transparent"
        {...rest}
      />
      {showToggle ? (
        <TouchableOpacity onPress={onTogglePassword}>
          <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748B" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: ds.radius.md,
    paddingHorizontal: 15,
    marginBottom: 12,
    minHeight: 52,
    borderWidth: 1,
    borderColor: ds.colors.border,
    ...ds.shadows.soft,
  },
  containerFocused: {
    borderColor: ds.colors.primaryIndigo,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: ds.colors.textPrimary,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
});

export default AppInput;
