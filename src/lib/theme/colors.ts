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

// "Derin Su" palette — calm, modern, trustworthy. Light is ice white + deep
// petrol ink with a petrol-teal accent; dark is night petrol with the same
// identity shifted to a vivid turquoise for contrast.
export const lightColors: ThemeColors = {
  background: "oklch(0.98 0.005 220)",
  foreground: "oklch(0.26 0.04 220)",
  card: "oklch(0.995 0.003 220)",
  cardForeground: "oklch(0.26 0.04 220)",
  primary: "oklch(0.5 0.1 205)",
  primaryForeground: "oklch(0.98 0.005 220)",
  secondary: "oklch(0.93 0.015 210)",
  secondaryForeground: "oklch(0.26 0.04 220)",
  muted: "oklch(0.945 0.012 212)",
  mutedForeground: "oklch(0.5 0.035 215)",
  destructive: "oklch(0.55 0.2 27)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.885 0.012 212)",
  input: "oklch(0.885 0.012 212)",
  ring: "oklch(0.5 0.1 205)",
};

export const darkColors: ThemeColors = {
  background: "oklch(0.2 0.03 220)",
  foreground: "oklch(0.94 0.01 210)",
  card: "oklch(0.245 0.032 218)",
  cardForeground: "oklch(0.94 0.01 210)",
  primary: "oklch(0.78 0.12 195)",
  primaryForeground: "oklch(0.2 0.05 215)",
  secondary: "oklch(0.3 0.03 218)",
  secondaryForeground: "oklch(0.94 0.01 210)",
  muted: "oklch(0.28 0.03 218)",
  mutedForeground: "oklch(0.7 0.025 210)",
  destructive: "oklch(0.6 0.19 30)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.33 0.032 218)",
  input: "oklch(0.33 0.032 218)",
  ring: "oklch(0.78 0.12 195)",
};

// Hex equivalents used as antd ConfigProvider tokens, since antd's algorithmic
// shade derivation (colorPrimaryHover, etc.) needs a parseable color value
// rather than a CSS variable reference.
export const lightAntdTokens = {
  primary: "#0f6c84",
  error: "#c0392b",
  // Elevated overlay surface (dropdowns, modals, notifications) — hex of the
  // `card` oklch above so antd overlays match the app theme.
  bgElevated: "#fcfdfe",
} as const;

export const darkAntdTokens = {
  primary: "#45c5d6",
  error: "#d96c52",
  bgElevated: "#1a2b33",
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
