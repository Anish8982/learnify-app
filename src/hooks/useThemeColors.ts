import { useTheme } from '../providers/ThemeProvider';

export interface ThemeColors {
    // Backgrounds
    bg: string;
    bgSecondary: string;
    bgCard: string;
    bgInput: string;
    // Borders
    border: string;
    borderLight: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    // Tab bar
    tabBar: string;
    tabBarBorder: string;
    // Skeleton
    skeleton: string;
    // Icon button bg
    iconBg: string;
    iconColor: string;
}

const light: ThemeColors = {
    bg: '#f8fafc',
    bgSecondary: '#f1f5f9',
    bgCard: '#ffffff',
    bgInput: '#f1f5f9',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    tabBar: '#ffffff',
    tabBarBorder: '#f1f5f9',
    skeleton: '#e2e8f0',
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
};

const dark: ThemeColors = {
    bg: '#0f172a',
    bgSecondary: '#1e293b',
    bgCard: '#1e293b',
    bgInput: '#1e293b',
    border: '#334155',
    borderLight: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    tabBar: '#0f172a',
    tabBarBorder: '#1e293b',
    skeleton: '#1e293b',
    iconBg: '#1e293b',
    iconColor: '#f1f5f9',
};

export function useThemeColors(): ThemeColors {
    const { isDark } = useTheme();
    return isDark ? dark : light;
}
