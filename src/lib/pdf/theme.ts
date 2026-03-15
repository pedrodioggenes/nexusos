/**
 * PDF Design System — Brand Tokens & Typography
 * Used across all @react-pdf/renderer templates.
 */
import { StyleSheet } from "@react-pdf/renderer";

// ── Brand Colors ────────────────────────────────────────
export const BRAND = {
  black: "#0A0A0A",
  coverDark: "#0A0A0A",
  white: "#FFFFFF",
  offWhite: "#FAFAFA",
  warmGray: "#F5F3F0",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  red: "#A51C1C",
  redLight: "#FEE2E2",
  redDark: "#7F1D1D",
  yellow: "#FFC107",
  yellowLight: "#FEF3C7",
  blue: "#3B82F6",
  blueLight: "#DBEAFE",
  green: "#22C55E",
  greenLight: "#DCFCE7",
  orange: "#F59E0B",
  orangeLight: "#FFF7ED",
  teal: "#14B8A6",
  tealLight: "#E0F2FE",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  danger: "#EF4444",
  dangerLight: "#FFEBEE",
  accent: "#A51C1C",
} as const;

// ── Typography Scale ────────────────────────────────────
export const TYPE = {
  mega: 48,
  hero: 36,
  h1: 20,
  h2: 18,
  h3: 14,
  h4: 12,
  body: 10,
  value: 28,
  caption: 8.5,
  tiny: 7.5,
} as const;

// ── Spacing Scale ───────────────────────────────────────
export const SPACE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ── Page Dimensions ─────────────────────────────────────
export const PAGE = {
  width: 595.28, // A4 pt
  height: 841.89,
  margin: 40,
  get contentWidth() {
    return this.width - this.margin * 2;
  },
} as const;

// ── Reusable Base Styles ────────────────────────────────
export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: TYPE.body,
    color: BRAND.gray800,
    backgroundColor: BRAND.white,
    paddingTop: PAGE.margin,
    paddingBottom: PAGE.margin + 20,
    paddingHorizontal: PAGE.margin,
  },
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: BRAND.coverDark,
    padding: 0,
    paddingHorizontal: PAGE.margin + 20,
    paddingVertical: PAGE.margin + 20,
    justifyContent: "flex-end",
  },
  // Header strip
  headerStrip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: BRAND.red,
  },
  // Section title
  sectionTitle: {
    fontSize: TYPE.h1,
    fontFamily: "Helvetica-Bold",
    color: BRAND.gray900,
    marginBottom: SPACE.sm,
  },
  sectionSubtitle: {
    fontSize: TYPE.h4,
    color: BRAND.gray500,
    marginBottom: SPACE.xl,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: PAGE.margin,
    right: PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: TYPE.tiny,
    color: BRAND.gray400,
  },
  // KPI Card — new top-border style
  kpiCard: {
    backgroundColor: BRAND.gray100,
    borderRadius: 6,
    padding: SPACE.md,
    flex: 1,
  },
  kpiLabel: {
    fontSize: TYPE.caption,
    color: BRAND.gray500,
    marginBottom: SPACE.xs,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: TYPE.h2,
    fontFamily: "Helvetica-Bold",
    color: BRAND.gray900,
  },
  // Table — red header
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.red,
    borderRadius: 4,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: TYPE.caption,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BRAND.gray200,
  },
  tableRowAlt: {
    backgroundColor: BRAND.offWhite,
  },
  tableCell: {
    fontSize: TYPE.body,
    color: BRAND.gray700,
  },
  // Accent bar (left)
  accentBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: BRAND.red,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: BRAND.gray200,
    marginVertical: SPACE.lg,
  },
  // Badge
  badge: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: TYPE.tiny,
    fontFamily: "Helvetica-Bold",
  },
});
