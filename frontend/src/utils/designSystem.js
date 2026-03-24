const colors = {
  primaryIndigo: '#4F46E5',
  primaryBlue: '#2563EB',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  muted: '#94A3B8',
  infoSoft: '#EEF2FF',
  warningSoft: '#FFFBEB',
  successSoft: '#ECFDF5',
  dangerSoft: '#FEF2F2',
};

const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
};

const status = {
  approved: {
    bg: '#DCFCE7',
    text: '#166534',
  },
  pending: {
    bg: '#FEF3C7',
    text: '#92400E',
  },
  rejected: {
    bg: '#FEE2E2',
    text: '#991B1B',
  },
};

const ds = {
  colors,
  radius,
  spacing,
  shadows,
  status,
};

export default ds;
