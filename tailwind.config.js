const { colors, typography, spacing, radii, shadows, breakpoints } = require("./tokens/design-tokens")

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      ...colors,
    },
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    spacing: spacing,
    borderRadius: radii,
    boxShadow: shadows,
    screens: breakpoints,
    extend: {},
  },
  plugins: [require("tailwindcss"), require("prettier-plugin-tailwindcss")],
}
