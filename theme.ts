import { createTheme, MantineColorsTuple } from '@mantine/core';

// shadcn/ui "zinc" look. Primary is near-black in light mode and near-white in dark mode:
// index 6 is used in light mode, index 4 in dark mode (see primaryShade).
const zinc: MantineColorsTuple = [
  '#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#fafafa',
  '#71717a', '#18181b', '#3f3f46', '#27272a', '#09090b',
];
const gray: MantineColorsTuple = [
  '#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa',
  '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b',
];
const green: MantineColorsTuple = [
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
];
const red: MantineColorsTuple = [
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
];
const amber: MantineColorsTuple = [
  '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
  '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
];
const violet: MantineColorsTuple = [
  '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
];
const blue: MantineColorsTuple = [
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
];
// Dark mode surfaces: body = dark.7 (#09090b)
const dark: MantineColorsTuple = [
  '#fafafa', '#e4e4e7', '#a1a1aa', '#71717a', '#3f3f46',
  '#27272a', '#18181b', '#09090b', '#050506', '#000000',
];

export const theme = createTheme({
  primaryColor: 'zinc',
  primaryShade: { light: 6, dark: 4 },
  autoContrast: true,
  black: '#09090b',
  colors: {
    zinc,
    sage: zinc,
    yellow: zinc,
    board: zinc,
    gray,
    green,
    mintJoy: green,
    red,
    coral: red,
    gold: amber,
    arcadeViolet: violet,
    blue,
    dark,
  },
  fontFamily:
    'var(--font-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
  radius: { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '12px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  fontSizes: { xs: '12px', sm: '14px', md: '14px', lg: '16px', xl: '18px' },
  lineHeights: { xs: '1.4', sm: '1.45', md: '1.5', lg: '1.5', xl: '1.5' },
  headings: {
    fontFamily:
      'var(--font-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '30px', lineHeight: '1.2' },
      h2: { fontSize: '24px', lineHeight: '1.25' },
      h3: { fontSize: '20px', lineHeight: '1.3' },
      h4: { fontSize: '16px', lineHeight: '1.4' },
      h5: { fontSize: '14px', lineHeight: '1.4' },
      h6: { fontSize: '12px', lineHeight: '1.4' },
    },
  },
  cursorType: 'pointer',
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.06)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Button: { defaultProps: { radius: 'md', fw: 500, size: 'sm' } },
    Badge: { defaultProps: { radius: 'xl', fw: 600, size: 'md' } },
    Card: { defaultProps: { radius: 'lg', shadow: 'xs', withBorder: true, padding: 'lg' } },
    Paper: { defaultProps: { radius: 'lg' } },
    ActionIcon: { defaultProps: { radius: 'md', size: 'lg' } },
    TextInput: { defaultProps: { radius: 'md', size: 'sm' } },
    NumberInput: { defaultProps: { radius: 'md', size: 'sm' } },
    Textarea: { defaultProps: { radius: 'md', size: 'sm' } },
    Select: { defaultProps: { radius: 'md', size: 'sm' } },
    FileInput: { defaultProps: { radius: 'md', size: 'sm' } },
    Modal: { defaultProps: { radius: 'lg', padding: 'lg' } },
    Drawer: { defaultProps: { radius: 'md' } },
    Tabs: { defaultProps: { radius: 'md' } },
    Table: { defaultProps: { highlightOnHover: true, verticalSpacing: 'sm', horizontalSpacing: 'md' } },
    Stepper: { defaultProps: { color: 'zinc', radius: 'md', size: 'sm' } },
    Switch: { defaultProps: { color: 'zinc', size: 'md' } },
    Radio: { defaultProps: { color: 'zinc', size: 'sm' } },
    Checkbox: { defaultProps: { color: 'zinc', radius: 'sm', size: 'sm' } },
    Menu: { defaultProps: { radius: 'md', shadow: 'md' } },
    Progress: { defaultProps: { color: 'zinc', size: 'sm', radius: 'xl' } },
  },
});
