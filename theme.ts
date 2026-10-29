import { createTheme, MantineColorsTuple } from '@mantine/core';

// Calm preset: low-saturation sage primary, soft sand / clay / slate / green accents.
const sage: MantineColorsTuple = [
  '#eef5f3', '#dbe8e4', '#bfd5cf', '#a0bfb7', '#86aca3',
  '#6f9a90', '#5a8479', '#496d64', '#3a564f', '#2c413c',
];
const sand: MantineColorsTuple = [
  '#faf6ec', '#f1e8d0', '#e6d6ae', '#dac28a', '#cfb06b',
  '#c4a05a', '#a8864a', '#8a6d3c', '#6d552f', '#4f3e22',
];
const clay: MantineColorsTuple = [
  '#faf0ee', '#f1dcd7', '#e5c1b9', '#d8a398', '#cc887b',
  '#c2776a', '#a8604f', '#8a4e40', '#6d3e33', '#502e26',
];
const slate: MantineColorsTuple = [
  '#f3f2f8', '#e3e1ee', '#cbc8de', '#b0abcb', '#968fb9',
  '#8279a8', '#6c6490', '#585275', '#443f5b', '#322e44',
];
const moss: MantineColorsTuple = [
  '#eff5ec', '#dce8d5', '#c0d5b5', '#a3c297', '#8bb27c',
  '#78a468', '#628b53', '#4e7042', '#3d5733', '#2d4126',
];
// Soft blue-charcoal dark mode (no pure black, text is off-white)
const calmDark: MantineColorsTuple = [
  '#dde3e1', '#c0c9c6', '#97a3a0', '#6f7d7a', '#3b4644',
  '#2b3432', '#222a29', '#1b2221', '#151b1a', '#101514',
];

export const theme = createTheme({
  primaryColor: 'sage',
  primaryShade: { light: 6, dark: 4 },
  autoContrast: true,
  black: '#2d3836',
  colors: {
    sage,
    yellow: sage,
    board: sage,
    gold: sand,
    coral: clay,
    arcadeViolet: slate,
    mintJoy: moss,
    green: moss,
    dark: calmDark,
  },
  fontFamily:
    'var(--font-sans), "Plus Jakarta Sans", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'sm',
  radius: { xs: '2px', sm: '4px', md: '6px', lg: '8px', xl: '10px' },
  spacing: { xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  fontSizes: { xs: '11px', sm: '13px', md: '14px', lg: '16px', xl: '18px' },
  lineHeights: { xs: '1.3', sm: '1.4', md: '1.45', lg: '1.5', xl: '1.5' },
  headings: {
    fontFamily:
      'var(--font-sans), "Plus Jakarta Sans", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '26px', lineHeight: '1.25' },
      h2: { fontSize: '22px', lineHeight: '1.3' },
      h3: { fontSize: '18px', lineHeight: '1.3' },
      h4: { fontSize: '16px', lineHeight: '1.35' },
      h5: { fontSize: '14px', lineHeight: '1.4' },
      h6: { fontSize: '13px', lineHeight: '1.4' },
    },
  },
  cursorType: 'pointer',
  shadows: {
    xs: '0 1px 2px rgba(30, 40, 38, 0.06)',
    sm: '0 1px 3px rgba(30, 40, 38, 0.08)',
    md: '0 4px 12px rgba(30, 40, 38, 0.08)',
    lg: '0 8px 24px rgba(30, 40, 38, 0.1)',
    xl: '0 12px 32px rgba(30, 40, 38, 0.12)',
  },
  components: {
    Button: { defaultProps: { radius: 'sm', fw: 600, size: 'sm' } },
    Badge: { defaultProps: { radius: 'sm', fw: 600, size: 'sm' } },
    Card: { defaultProps: { radius: 'md', shadow: 'xs', withBorder: true, padding: 'md' } },
    Paper: { defaultProps: { radius: 'md' } },
    ActionIcon: { defaultProps: { radius: 'sm', size: 'md' } },
    TextInput: { defaultProps: { radius: 'sm', size: 'sm' } },
    NumberInput: { defaultProps: { radius: 'sm', size: 'sm' } },
    Textarea: { defaultProps: { radius: 'sm', size: 'sm' } },
    Select: { defaultProps: { radius: 'sm', size: 'sm' } },
    FileInput: { defaultProps: { radius: 'sm', size: 'sm' } },
    Modal: { defaultProps: { radius: 'md', padding: 'md' } },
    Drawer: { defaultProps: { radius: 'sm' } },
    Tabs: {
      defaultProps: { radius: 'sm' },
      styles: { tab: { fontWeight: 600, borderRadius: 6, padding: '6px 12px' } },
    },
    Table: { defaultProps: { highlightOnHover: true, verticalSpacing: 'xs', horizontalSpacing: 'sm' } },
    Stepper: { defaultProps: { color: 'sage', radius: 'sm', size: 'sm' } },
    Switch: { defaultProps: { color: 'sage', size: 'sm' } },
    Radio: { defaultProps: { color: 'sage', size: 'sm' } },
    Checkbox: { defaultProps: { color: 'sage', radius: 'xs', size: 'sm' } },
    Menu: { defaultProps: { radius: 'sm', shadow: 'md' } },
    Progress: { defaultProps: { color: 'sage', size: 'sm' } },
  },
});
