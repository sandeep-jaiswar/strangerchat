/**
 * Design Tokens - Apple-inspired Design System
 *
 * Following Apple's design principles:
 * - Clarity: Text is legible, icons are precise, adornments are subtle
 * - Deference: Content is paramount, UI helps users understand and interact
 * - Depth: Visual layers and motion impart vitality and understanding
 */

// Semantic color system with light/dark mode support
export const colors = {
  // Primary brand colors - elegant blue inspired by iOS
  primary: {
    50: "#e6f0ff",
    100: "#cce0ff",
    200: "#99c2ff",
    300: "#66a3ff",
    400: "#3385ff",
    500: "#0071e3", // Apple's signature blue
    600: "#005bb5",
    700: "#004687",
    800: "#003059",
    900: "#001a2b",
    DEFAULT: "#0071e3",
    foreground: "#ffffff",
    hover: "#005bb5",
    active: "#004687",
  },

  // Secondary colors - sophisticated gray scale
  secondary: {
    50: "#f5f5f7",
    100: "#e8e8ed",
    200: "#d2d2d7",
    300: "#b0b0b8",
    400: "#86868b",
    500: "#6e6e73",
    600: "#515154",
    700: "#3a3a3c",
    800: "#2c2c2e",
    900: "#1c1c1e",
    DEFAULT: "#86868b",
    foreground: "#ffffff",
    hover: "#6e6e73",
    active: "#515154",
  },

  // Accent colors for messaging app
  accent: {
    blue: "#007aff",
    green: "#34c759",
    indigo: "#5856d6",
    orange: "#ff9500",
    pink: "#ff2d55",
    purple: "#af52de",
    red: "#ff3b30",
    teal: "#5ac8fa",
    yellow: "#ffcc00",
  },

  // System colors
  system: {
    background: {
      primary: "#ffffff",
      secondary: "#f5f5f7",
      tertiary: "#ffffff",
      elevated: "#ffffff",
    },
    backgroundDark: {
      primary: "#000000",
      secondary: "#1c1c1e",
      tertiary: "#2c2c2e",
      elevated: "#1c1c1e",
    },
    label: {
      primary: "#000000",
      secondary: "rgba(60, 60, 67, 0.6)",
      tertiary: "rgba(60, 60, 67, 0.3)",
      quaternary: "rgba(60, 60, 67, 0.18)",
    },
    labelDark: {
      primary: "#ffffff",
      secondary: "rgba(235, 235, 245, 0.6)",
      tertiary: "rgba(235, 235, 245, 0.3)",
      quaternary: "rgba(235, 235, 245, 0.18)",
    },
    fill: {
      primary: "rgba(120, 120, 128, 0.2)",
      secondary: "rgba(120, 120, 128, 0.16)",
      tertiary: "rgba(118, 118, 128, 0.12)",
      quaternary: "rgba(116, 116, 128, 0.08)",
    },
    fillDark: {
      primary: "rgba(120, 120, 128, 0.36)",
      secondary: "rgba(120, 120, 128, 0.32)",
      tertiary: "rgba(118, 118, 128, 0.24)",
      quaternary: "rgba(116, 116, 128, 0.18)",
    },
  },

  // Semantic status colors
  success: {
    DEFAULT: "#34c759",
    light: "#d1f5dd",
    dark: "#248a3d",
    foreground: "#ffffff",
  },
  error: {
    DEFAULT: "#ff3b30",
    light: "#ffe5e5",
    dark: "#d70015",
    foreground: "#ffffff",
  },
  warning: {
    DEFAULT: "#ff9500",
    light: "#fff4e5",
    dark: "#c93400",
    foreground: "#ffffff",
  },
  info: {
    DEFAULT: "#007aff",
    light: "#e5f1ff",
    dark: "#0051d5",
    foreground: "#ffffff",
  },

  // Separator colors for dividers and borders
  separator: {
    opaque: "rgba(60, 60, 67, 0.36)",
    nonOpaque: "rgba(60, 60, 67, 0.29)",
  },
  separatorDark: {
    opaque: "rgba(84, 84, 88, 0.65)",
    nonOpaque: "rgba(84, 84, 88, 0.6)",
  },

  // Material colors for glassmorphism effects
  material: {
    regular: "rgba(255, 255, 255, 0.7)",
    thick: "rgba(255, 255, 255, 0.85)",
    thin: "rgba(255, 255, 255, 0.5)",
    ultraThin: "rgba(255, 255, 255, 0.3)",
  },
  materialDark: {
    regular: "rgba(30, 30, 30, 0.7)",
    thick: "rgba(30, 30, 30, 0.85)",
    thin: "rgba(30, 30, 30, 0.5)",
    ultraThin: "rgba(30, 30, 30, 0.3)",
  },
}

// Typography - San Francisco inspired system
export const typography = {
  fontFamily: {
    // Apple uses SF Pro, we'll use system fonts that match the style
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "SF Pro Display",
      "SF Pro Text",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ],
    // For monospace/code
    mono: ["SF Mono", "Menlo", "Monaco", "Courier New", "monospace"],
    // Rounded variant for friendly UI elements
    rounded: ["SF Pro Rounded", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
  },

  // Apple's type scale - precise and harmonious
  fontSize: {
    // Small utility text
    caption2: ["0.6875rem", { lineHeight: "1.09091", letterSpacing: "0.016em" }], // 11px
    caption1: ["0.75rem", { lineHeight: "1.33333", letterSpacing: "0.012em" }], // 12px

    // Body text
    footnote: ["0.8125rem", { lineHeight: "1.23077", letterSpacing: "0.006em" }], // 13px
    subheadline: ["0.9375rem", { lineHeight: "1.26667", letterSpacing: "0.006em" }], // 15px
    body: ["1.0625rem", { lineHeight: "1.29412", letterSpacing: "0.004em" }], // 17px

    // Headlines
    callout: ["1rem", { lineHeight: "1.3125", letterSpacing: "0.004em" }], // 16px
    headline: ["1.0625rem", { lineHeight: "1.23529", letterSpacing: "0.003em", fontWeight: 600 }], // 17px
    title3: ["1.25rem", { lineHeight: "1.25", letterSpacing: "0.002em", fontWeight: 600 }], // 20px
    title2: ["1.375rem", { lineHeight: "1.18182", letterSpacing: "0.001em", fontWeight: 600 }], // 22px
    title1: ["1.75rem", { lineHeight: "1.14286", letterSpacing: "-0.002em", fontWeight: 700 }], // 28px

    // Large display text
    largeTitle: ["2.125rem", { lineHeight: "1.11765", letterSpacing: "-0.003em", fontWeight: 700 }], // 34px
    display: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.004em", fontWeight: 700 }], // 40px
  },

  // Font weights matching SF Pro
  fontWeight: {
    ultralight: 100,
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800,
    black: 900,
  },

  // Line heights for optimal readability
  lineHeight: {
    tight: "1.2",
    snug: "1.3",
    normal: "1.4",
    relaxed: "1.5",
    loose: "1.6",
  },

  // Letter spacing for different contexts
  letterSpacing: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.01em",
    wider: "0.02em",
    widest: "0.04em",
  },
}

// Spacing system - 4px base unit for consistency
export const spacing = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
}

// Border radius - smooth and refined
export const radii = {
  none: "0",
  xs: "0.25rem", // 4px - subtle rounding
  sm: "0.375rem", // 6px - cards, buttons
  md: "0.5rem", // 8px - default for most elements
  lg: "0.75rem", // 12px - larger cards
  xl: "1rem", // 16px - modals, sheets
  "2xl": "1.25rem", // 20px - prominent cards
  "3xl": "1.5rem", // 24px - hero sections
  full: "9999px", // pills, avatars
  // iOS-style continuous curve radii
  continuous: {
    sm: "0.5rem",
    md: "0.875rem",
    lg: "1.25rem",
    xl: "1.75rem",
    "2xl": "2.5rem",
  },
}

// Shadows - subtle depth with multiple layers
export const shadows = {
  // Small elevations
  xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",

  // Medium elevations
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",

  // Large elevations
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",

  // Special shadows
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  none: "none",

  // Apple-style soft shadows
  soft: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.08)",
    md: "0 4px 16px rgba(0, 0, 0, 0.12)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.16)",
    xl: "0 16px 64px rgba(0, 0, 0, 0.2)",
  },

  // Colored shadows for emphasis
  colored: {
    primary: "0 4px 16px rgba(0, 113, 227, 0.2)",
    success: "0 4px 16px rgba(52, 199, 89, 0.2)",
    error: "0 4px 16px rgba(255, 59, 48, 0.2)",
    warning: "0 4px 16px rgba(255, 149, 0, 0.2)",
  },
}

// Z-index layers - organized hierarchy
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 1090,
  toast: 1100,
}

// Breakpoints - responsive design
export const breakpoints = {
  xs: "375px", // iPhone SE
  sm: "640px", // Small tablets
  md: "768px", // iPad portrait
  lg: "1024px", // iPad landscape, small laptops
  xl: "1280px", // Desktop
  "2xl": "1536px", // Large desktop
  "3xl": "1920px", // Ultra-wide
}

// Animation timing - natural and fluid
export const animation = {
  // Duration
  duration: {
    instant: "0ms",
    fast: "150ms",
    base: "250ms",
    slow: "350ms",
    slower: "500ms",
    slowest: "700ms",
  },

  // Easing functions - Apple's spring animations
  easing: {
    // Standard curves
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",

    // Apple-style spring curves
    spring: {
      gentle: "cubic-bezier(0.16, 1, 0.3, 1)",
      smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      snappy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },

    // iOS-style curves
    ios: {
      default: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },

  // Common transitions
  transition: {
    fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 350ms cubic-bezier(0.4, 0, 0.2, 1)",
    colors:
      "color 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
}

// Opacity levels
export const opacity = {
  disabled: 0.38,
  hover: 0.08,
  focus: 0.12,
  selected: 0.16,
  activated: 0.24,
  pressed: 0.32,
  dragged: 0.16,
}

// Blur effects for glassmorphism
export const blur = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  "2xl": "40px",
  "3xl": "64px",
}

// Border widths
export const borderWidth = {
  none: "0",
  thin: "0.5px", // Hairline
  default: "1px",
  medium: "2px",
  thick: "3px",
  heavy: "4px",
}

// Icon sizes
export const iconSize = {
  xs: "0.75rem", // 12px
  sm: "1rem", // 16px
  md: "1.25rem", // 20px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px
}

// Component-specific tokens
export const components = {
  // Button sizes
  button: {
    height: {
      sm: "2rem", // 32px
      md: "2.75rem", // 44px - iOS touch target
      lg: "3.5rem", // 56px
    },
    padding: {
      sm: "0.5rem 1rem",
      md: "0.75rem 1.5rem",
      lg: "1rem 2rem",
    },
    fontSize: {
      sm: "0.875rem",
      md: "1rem",
      lg: "1.0625rem",
    },
  },

  // Input fields
  input: {
    height: {
      sm: "2rem",
      md: "2.75rem", // iOS standard
      lg: "3.5rem",
    },
    padding: {
      horizontal: "1rem",
      vertical: "0.75rem",
    },
  },

  // Cards
  card: {
    padding: {
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
    },
    radius: "0.875rem", // Continuous curve
  },

  // Modal
  modal: {
    width: {
      sm: "20rem",
      md: "28rem",
      lg: "36rem",
      xl: "48rem",
      full: "100%",
    },
    padding: "1.5rem",
    radius: "1.25rem",
  },

  // Avatar
  avatar: {
    size: {
      xs: "1.5rem",
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
      xl: "4rem",
      "2xl": "5rem",
    },
  },
}

// Accessibility
export const accessibility = {
  // Minimum touch target size (iOS HIG)
  minTouchTarget: "44px",

  // Focus ring
  focusRing: {
    width: "3px",
    offset: "2px",
    color: "rgba(0, 113, 227, 0.6)",
  },

  // Reduced motion preferences
  reducedMotion: {
    duration: "0.01ms",
    easing: "linear",
  },
}
