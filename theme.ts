import { createTheme, MantineColorsTuple } from '@mantine/core';

// Chess-board emerald: primary brand color (aliased as `yellow` so existing color="yellow" props pick it up)
const board: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b',
];

// Warm gold accent for trophies and highlights
const gold: MantineColorsTuple = [
  '#fff9db',
  '#fff3bf',
  '#ffec99',
  '#ffe066',
  '#ffd43b',
  '#fcc419',
  '#fab005',
  '#f59f00',
  '#f08c00',
  '#e67700',
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

// Neutral deep green-slate dark mode
const playfulDark: MantineColorsTuple = [
  '#f1f5f4',
  '#cbd5d1',
  '#9aa8a3',
  '#6b7b75',
  '#33403b',
  '#232d29',
  '#1a221f',
  '#121816',
  '#0c100f',
  '#070908',
];

export const theme = createTheme({
  primaryColor: 'board',
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  colors: {
    board,
    yellow: board,
    gold,
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
  defaultRadius: 'md',
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
