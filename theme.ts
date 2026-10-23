import { createTheme, MantineColorsTuple } from '@mantine/core';

const chessGold: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffca28',
  '#ffc107',
  '#ffb300',
  '#ffa000',
  '#ff8f00',
  '#ff6f00'
];

export const theme = createTheme({
  primaryColor: 'yellow',
  colors: {
    chessGold,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  defaultRadius: 'md',
  cursorType: 'pointer',
});
