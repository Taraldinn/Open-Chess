import { createTheme, MantineColorsTuple } from '@mantine/core';

// Cheerful sunshine honey/amber gold
const sunshine: MantineColorsTuple = [
  '#fff9db',
  '#fff3bf',
  '#ffe066',
  '#ffd43b',
  '#fcc419',
  '#fab005',
  '#f59f00',
  '#f08c00',
  '#e67700',
  '#d9480f',
];

// Playful punchy watermelon/coral for accents
const coral: MantineColorsTuple = [
  '#fff0f3',
  '#ffe3e8',
  '#ffccd5',
  '#ffb3c1',
  '#ff758f',
  '#ff4d6d',
  '#c9184a',
  '#a4133c',
  '#800f2f',
  '#590d22',
];

// Joyful electric violet for arcade highlights
const arcadeViolet: MantineColorsTuple = [
  '#f8f0fc',
  '#f3d9fa',
  '#eebefa',
  '#e599f7',
  '#da77f2',
  '#cc5de8',
  '#ae3ec9',
  '#9c36b5',
  '#862e9c',
  '#702688',
];

// Fresh spring mint for wins & confirmations
const mintJoy: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#40c057',
  '#37b24d',
  '#2f9e44',
  '#2b8a3e',
];

// Rich, warm cozy indigo-slate dark mode (warm midnight instead of stark cold gray)
const playfulDark: MantineColorsTuple = [
  '#f1f5f9', // 0: text primary
  '#cbd5e1', // 1: text secondary
  '#94a3b8', // 2: text muted
  '#64748b', // 3: subtle borders
  '#334155', // 4: active hover
  '#222a3f', // 5: input bg / card border
  '#191f32', // 6: card / paper background
  '#101423', // 7: body background
  '#0b0e19', // 8: deep header
  '#06080f', // 9: lowest floor
];

export const theme = createTheme({
  primaryColor: 'yellow',
  primaryShade: { light: 5, dark: 4 },
  colors: {
    yellow: sunshine,
    sunshine,
    coral,
    arcadeViolet,
    mintJoy,
    green: mintJoy,
    dark: playfulDark,
  },
  fontFamily:
    'var(--font-sans), "Plus Jakarta Sans", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily:
      'var(--font-sans), "Plus Jakarta Sans", "Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '800',
  },
  defaultRadius: 'lg',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        fw: 700,
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xl',
        fw: 700,
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        shadow: 'sm',
        withBorder: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xl',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Tabs: {
      defaultProps: {
        radius: 'xl',
      },
      styles: {
        tab: {
          fontWeight: 700,
          borderRadius: '9999px',
        },
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
      },
    },
    Stepper: {
      defaultProps: {
        color: 'yellow',
        radius: 'xl',
      },
    },
    Switch: {
      defaultProps: {
        color: 'yellow',
        radius: 'xl',
      },
    },
    Radio: {
      defaultProps: {
        color: 'yellow',
      },
    },
    Checkbox: {
      defaultProps: {
        color: 'yellow',
        radius: 'md',
      },
    },
    Menu: {
      defaultProps: {
        radius: 'lg',
        shadow: 'md',
      },
    },
  },
});
