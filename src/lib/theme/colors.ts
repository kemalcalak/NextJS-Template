// Single source of truth for theme colors.
// Both Tailwind utilities (via emitted CSS variables) and antd ConfigProvider
// tokens read from this file. Edit values here, do NOT add CSS color blocks
// to globals.css.

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export const lightColors: ThemeColors = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.32 0.087 246)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.32 0.087 246)",
  primary: "oklch(0.32 0.087 246)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.95 0.003 247)",
  secondaryForeground: "oklch(0.32 0.087 246)",
  muted: "oklch(0.965 0.003 247)",
  mutedForeground: "oklch(0.625 0.006 247)",
  destructive: "oklch(0.6 0.21 27)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.9 0.005 247)",
  input: "oklch(0.9 0.005 247)",
  ring: "oklch(0.32 0.087 246)",
};

export const darkColors: ThemeColors = {
  background: "oklch(0.18 0.045 246)",
  foreground: "oklch(0.95 0.003 247)",
  card: "oklch(0.23 0.05 246)",
  cardForeground: "oklch(0.95 0.003 247)",
  primary: "oklch(0.77 0.075 87)",
  primaryForeground: "oklch(0.18 0.045 246)",
  secondary: "oklch(0.28 0.045 246)",
  secondaryForeground: "oklch(0.95 0.003 247)",
  muted: "oklch(0.28 0.045 246)",
  mutedForeground: "oklch(0.72 0.005 247)",
  destructive: "oklch(0.55 0.2 27)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.32 0.05 246)",
  input: "oklch(0.32 0.05 246)",
  ring: "oklch(0.77 0.075 87)",
};

// Hex equivalents used as antd ConfigProvider tokens, since antd's algorithmic
// shade derivation (colorPrimaryHover, etc.) needs a parseable color value
// rather than a CSS variable reference.
export const lightAntdTokens = {
  primary: "#1c2e4a",
  error: "#c8442a",
  // Elevated overlay surface (dropdowns, modals, notifications) — hex of the
  // `card` oklch above so antd overlays match the app theme.
  bgElevated: "#ffffff",
} as const;

export const darkAntdTokens = {
  primary: "#d4b06a",
  error: "#d97757",
  bgElevated: "#051f33",
} as const;

const camelToKebab = (key: string): string => key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

export function colorsToCssDeclarations(colors: ThemeColors): string {
  return (Object.entries(colors) as [keyof ThemeColors, string][])
    .map(([key, value]) => `--${camelToKebab(key)}: ${value};`)
    .join("\n  ");
}

export function buildThemeStyleSheet(): string {
  return `:root {\n  ${colorsToCssDeclarations(lightColors)}\n}\n.dark {\n  ${colorsToCssDeclarations(darkColors)}\n}`;
}
