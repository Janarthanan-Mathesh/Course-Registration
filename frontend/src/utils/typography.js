import { Platform } from 'react-native';

const fontFamilies = Platform.select({
  web: {
    regular: '"Inter", "Segoe UI", "Roboto", sans-serif',
    medium: '"Inter", "Segoe UI", "Roboto", sans-serif',
    semibold: '"Inter", "Segoe UI", "Roboto", sans-serif',
    bold: '"Poppins", "Inter", "Segoe UI", "Roboto", sans-serif',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif-bold',
  },
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
});

const typography = {
  display: {
    fontFamily: fontFamilies.bold,
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  heading1: {
    fontFamily: fontFamilies.bold,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  heading2: {
    fontFamily: fontFamilies.semibold,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: fontFamilies.semibold,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodySm: {
    fontFamily: fontFamilies.regular,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fontFamilies.medium,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: fontFamilies.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: fontFamilies.regular,
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.25,
  },
};

export default typography;
