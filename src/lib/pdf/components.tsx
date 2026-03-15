/**
 * Shared PDF components used across all report templates.
 * Built with @react-pdf/renderer primitives.
 * Redesigned to match Genspark mockups — editorial quality.
 */
import React from "react";
import { View, Text, Page, Svg, Rect, Circle, Path, G } from "@react-pdf/renderer";
import { BRAND, TYPE, SPACE, PAGE, baseStyles } from "./theme";

// ── Cover Page ──────────────────────────────────────────
interface CoverPageProps {
  title: string;
  subtitle: string;
  periodLabel: string;
  companyName?: string;
  confidential?: boolean;
  reportType?: string; // "WBR" | "MMR" | "QBR"
}

export function CoverPage({
  title,
  subtitle,
  periodLabel,
  companyName = "Empresa",
  confidential = true,
  reportType,
}: CoverPageProps) {
  const acronym = reportType || title.split(" ").map(w => w[0]).join("").toUpperCase();
  return (
    <Page size="A4" style={baseStyles.coverPage}>
      {/* Top accent strip */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: BRAND.red,
        }}
      />

      {/* Company name — top left */}
      <View style={{ position: "absolute", top: 40, left: PAGE.margin + 20 }}>
        <Text
          style={{
            fontSize: TYPE.caption,
            fontFamily: "Helvetica-Bold",
            color: BRAND.gray400,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {companyName}
        </Text>
      </View>

      {/* Main content — bottom-aligned, left-aligned */}
      <View>
        {/* Giant acronym */}
        <Text
          style={{
            fontSize: TYPE.mega,
            fontFamily: "Helvetica-Bold",
            color: BRAND.white,
            letterSpacing: 6,
            marginBottom: SPACE.sm,
          }}
        >
          {acronym}
        </Text>

        {/* Full title */}
        <Text
          style={{
            fontSize: TYPE.h2,
            fontFamily: "Helvetica",
            color: BRAND.gray300,
            marginBottom: SPACE.xs,
          }}
        >
          {title}
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: TYPE.h4,
            fontFamily: "Helvetica",
            color: BRAND.gray500,
            marginBottom: SPACE.xl,
          }}
        >
          {subtitle}
        </Text>

        {/* Red bar separator */}
        <View
          style={{
            width: 80,
            height: 4,
            backgroundColor: BRAND.red,
            marginBottom: SPACE.xl,
          }}
        />

        {/* Period */}
        <Text
          style={{
            fontSize: TYPE.h3,
            fontFamily: "Helvetica",
            color: BRAND.gray400,
            letterSpacing: 1,
          }}
        >
          {periodLabel}
        </Text>
      </View>

      {/* Bottom footer */}
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: PAGE.margin + 20,
          right: PAGE.margin + 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {confidential && (
          <Text
            style={{
              fontSize: TYPE.tiny,
              color: BRAND.red,
              fontFamily: "Helvetica-Bold",
              letterSpacing: 2,
            }}
          >
            CONFIDENCIAL
          </Text>
        )}
        <Text style={{ fontSize: TYPE.tiny, color: BRAND.gray500 }}>
          Gerado em{" "}
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>
    </Page>
  );
}

// ── Content Page Wrapper ────────────────────────────────
interface ContentPageProps {
  children: React.ReactNode;
  moduleName?: string;
}

export function ContentPage({ children, moduleName = "nexusOS" }: ContentPageProps) {
  return (
    <Page size="A4" style={baseStyles.page}>
      <View style={baseStyles.headerStrip} />
      {children}
      <View style={baseStyles.footer} fixed>
        <Text style={baseStyles.footerText}>
          {moduleName} •{" "}
          {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </Text>
        <Text
          style={baseStyles.footerText}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    </Page>
  );
}

// ── Flow Page (continuous content, no forced breaks) ────
interface FlowPageProps {
  children: React.ReactNode;
  moduleName?: string;
}

export function FlowPage({ children, moduleName = "nexusOS" }: FlowPageProps) {
  return (
    <Page size="A4" style={baseStyles.page} wrap>
      <View style={baseStyles.headerStrip} fixed />
      {children}
      <View style={baseStyles.footer} fixed>
        <Text style={baseStyles.footerText}>
          {moduleName} •{" "}
          {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </Text>
        <Text
          style={baseStyles.footerText}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    </Page>
  );
}

// ── Smart Section (minPresenceAhead to avoid orphans) ───
interface SmartSectionProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  number?: string;
}

export function SmartSection({ children, title, subtitle, number }: SmartSectionProps) {
  return (
    <View minPresenceAhead={120} style={{ marginBottom: SPACE.xl }}>
      <SectionHeader title={title} subtitle={subtitle} number={number} />
      {children}
    </View>
  );
}

// ── Section Header ──────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  number?: string;
}

export function SectionHeader({ title, subtitle, number }: SectionHeaderProps) {
  return (
    <View style={{ marginBottom: SPACE.xl }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs }}>
        {number && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: BRAND.red,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: TYPE.caption, fontFamily: "Helvetica-Bold", color: BRAND.white }}>
              {number}
            </Text>
          </View>
        )}
        <Text style={baseStyles.sectionTitle}>{title}</Text>
      </View>
      {subtitle && <Text style={baseStyles.sectionSubtitle}>{subtitle}</Text>}
      <View style={{ height: 2, backgroundColor: BRAND.gray200, marginTop: SPACE.xs }} />
    </View>
  );
}

// ── KPI Row (redesigned: top colored border + variance) ─
interface KpiItem {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  accentColor?: string;
}

interface KpiRowProps {
  items: KpiItem[];
  columns?: 2 | 3 | 4;
}

export function KpiRow({ items, columns = 3 }: KpiRowProps) {
  return (
    <View style={{ flexDirection: "row", gap: SPACE.sm, marginBottom: SPACE.lg }}>
      {items.map((item, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: BRAND.gray100,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          {/* Top colored border */}
          <View
            style={{
              height: 3,
              backgroundColor: item.accentColor || BRAND.red,
            }}
          />
          <View style={{ padding: SPACE.md }}>
            <Text style={baseStyles.kpiLabel}>{item.label}</Text>
            <Text style={baseStyles.kpiValue}>{item.value}</Text>
            {item.change && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: SPACE.xs }}>
                <Text
                  style={{
                    fontSize: TYPE.caption,
                    fontFamily: "Helvetica-Bold",
                    color:
                      item.changeType === "positive"
                        ? BRAND.green
                        : item.changeType === "negative"
                        ? BRAND.red
                        : BRAND.gray500,
                  }}
                >
                  {item.changeType === "positive" ? "▲ " : item.changeType === "negative" ? "▼ " : ""}
                  {item.change}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Data Table (redesigned: red header, white text) ─────
interface TableColumn {
  key: string;
  label: string;
  width: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: TableColumn[];
  rows: Record<string, string | number>[];
  title?: string;
}

export function DataTable({ columns, rows, title }: DataTableProps) {
  return (
    <View style={{ marginBottom: SPACE.xl }}>
      {title && (
        <Text
          style={{
            fontSize: TYPE.h3,
            fontFamily: "Helvetica-Bold",
            color: BRAND.gray800,
            marginBottom: SPACE.md,
          }}
        >
          {title}
        </Text>
      )}
      {/* Header — red background, white text */}
      <View style={baseStyles.tableHeader}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={{
              ...baseStyles.tableHeaderCell,
              width: col.width,
              textAlign: col.align || "left",
            }}
          >
            {col.label}
          </Text>
        ))}
      </View>
      {/* Rows */}
      {rows.map((row, idx) => (
        <View
          key={idx}
          style={{
            ...baseStyles.tableRow,
            ...(idx % 2 === 1 ? baseStyles.tableRowAlt : {}),
          }}
        >
          {columns.map((col) => {
            const val = String(row[col.key] ?? "—");
            // Check for status-like values and render badges
            const statusColors = getStatusColor(val);
            if (statusColors && col.key.toLowerCase().includes("status")) {
              return (
                <View key={col.key} style={{ width: col.width, justifyContent: "center" }}>
                  <StatusBadge label={val} color={statusColors.text} bgColor={statusColors.bg} />
                </View>
              );
            }
            return (
              <Text
                key={col.key}
                style={{
                  ...baseStyles.tableCell,
                  width: col.width,
                  textAlign: col.align || "left",
                }}
              >
                {val}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function getStatusColor(status: string): { text: string; bg: string } | null {
  const s = status.toLowerCase();
  if (s.includes("sucesso") || s.includes("concluí") || s.includes("aprovad") || s.includes("ativ"))
    return { text: BRAND.green, bg: BRAND.greenLight };
  if (s.includes("andamento") || s.includes("revisão") || s.includes("planejad") || s.includes("recorrente"))
    return { text: BRAND.orange, bg: BRAND.orangeLight };
  if (s.includes("crítico") || s.includes("atrasad") || s.includes("cancelad") || s.includes("percad"))
    return { text: BRAND.red, bg: BRAND.redLight };
  return null;
}

// ── Progress Bar ────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  label?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, label, color = BRAND.red, height = 8 }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={{ marginBottom: SPACE.md }}>
      {label && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACE.xs }}>
          <Text style={{ fontSize: TYPE.caption, color: BRAND.gray600 }}>{label}</Text>
          <Text style={{ fontSize: TYPE.caption, fontFamily: "Helvetica-Bold", color: BRAND.gray700 }}>
            {clamped.toFixed(0)}%
          </Text>
        </View>
      )}
      <Svg width="100%" height={height}>
        <Rect x="0" y="0" width="100%" height={height} rx={height / 2} fill={BRAND.gray200} />
        <Rect x="0" y="0" width={`${clamped}%`} height={height} rx={height / 2} fill={color} />
      </Svg>
    </View>
  );
}

// ── Callout Box ─────────────────────────────────────────
interface CalloutBoxProps {
  text: string;
  type?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export function CalloutBox({ text, type = "info", title }: CalloutBoxProps) {
  const colors = {
    info: { bg: BRAND.blueLight, border: BRAND.blue, text: BRAND.blue },
    success: { bg: BRAND.greenLight, border: BRAND.green, text: BRAND.green },
    warning: { bg: BRAND.yellowLight, border: BRAND.orange, text: BRAND.orange },
    danger: { bg: BRAND.redLight, border: BRAND.red, text: BRAND.red },
  };
  const c = colors[type];

  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderLeftWidth: 3,
        borderLeftColor: c.border,
        borderRadius: 4,
        padding: SPACE.md,
        marginBottom: SPACE.lg,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: TYPE.body,
            fontFamily: "Helvetica-Bold",
            color: c.text,
            marginBottom: SPACE.xs,
          }}
        >
          {title}
        </Text>
      )}
      <Text style={{ fontSize: TYPE.body, color: BRAND.gray700, lineHeight: 1.5 }}>{text}</Text>
    </View>
  );
}

// ── Horizontal Bar Chart ────────────────────────────────
interface BarChartItem {
  label: string;
  value: number;
  formattedValue?: string;
  color?: string;
}

interface HorizontalBarChartProps {
  items: BarChartItem[];
  title?: string;
}

export function HorizontalBarChart({ items, title }: HorizontalBarChartProps) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);
  return (
    <View style={{ marginBottom: SPACE.xl }}>
      {title && (
        <Text
          style={{
            fontSize: TYPE.h3,
            fontFamily: "Helvetica-Bold",
            color: BRAND.gray800,
            marginBottom: SPACE.md,
          }}
        >
          {title}
        </Text>
      )}
      {items.map((item, idx) => (
        <View key={idx} style={{ marginBottom: SPACE.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
            <Text style={{ fontSize: TYPE.caption, color: BRAND.gray600 }}>{item.label}</Text>
            <Text style={{ fontSize: TYPE.caption, fontFamily: "Helvetica-Bold", color: BRAND.gray700 }}>
              {item.formattedValue ?? String(item.value)}
            </Text>
          </View>
          <Svg width="100%" height={6}>
            <Rect x="0" y="0" width="100%" height={6} rx={3} fill={BRAND.gray200} />
            <Rect
              x="0"
              y="0"
              width={`${(item.value / maxValue) * 100}%`}
              height={6}
              rx={3}
              fill={item.color || BRAND.red}
            />
          </Svg>
        </View>
      ))}
    </View>
  );
}

// ── Two-Column Layout ───────────────────────────────────
interface TwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
  split?: "50/50" | "60/40" | "40/60";
}

export function TwoColumn({ left, right, gap = SPACE.lg, split = "50/50" }: TwoColumnProps) {
  const splits = {
    "50/50": ["50%", "50%"],
    "60/40": ["58%", "38%"],
    "40/60": ["38%", "58%"],
  };
  const [l, r] = splits[split];
  return (
    <View style={{ flexDirection: "row", gap }}>
      <View style={{ width: l }}>{left}</View>
      <View style={{ width: r }}>{right}</View>
    </View>
  );
}

// ── Status Badge ────────────────────────────────────────
interface StatusBadgeProps {
  label: string;
  color: string;
  bgColor: string;
}

export function StatusBadge({ label, color, bgColor }: StatusBadgeProps) {
  return (
    <View
      style={{
        ...baseStyles.badge,
        backgroundColor: bgColor,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color, fontSize: TYPE.tiny, fontFamily: "Helvetica-Bold" }}>{label}</Text>
    </View>
  );
}

// ── Insight Grid (2x2 colored cards) ────────────────────
interface InsightCard {
  title: string;
  text: string;
  items?: string[];
  type: "opportunity" | "warning" | "success" | "danger";
}

interface InsightGridProps {
  cards: InsightCard[];
}

const insightColors = {
  opportunity: { bg: BRAND.greenLight, border: BRAND.green, title: BRAND.green },
  warning: { bg: BRAND.yellowLight, border: BRAND.orange, title: BRAND.orange },
  success: { bg: BRAND.blueLight, border: BRAND.blue, title: BRAND.blue },
  danger: { bg: BRAND.redLight, border: BRAND.red, title: BRAND.red },
};

const insightLabels = {
  opportunity: "Oportunidades",
  warning: "Atenção",
  success: "Vitórias",
  danger: "Alerta Urgente",
};

export function InsightGrid({ cards }: InsightGridProps) {
  // Render 2x2 grid
  const rows: InsightCard[][] = [];
  for (let i = 0; i < cards.length; i += 2) {
    rows.push(cards.slice(i, i + 2));
  }
  return (
    <View style={{ marginBottom: SPACE.xl }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: SPACE.sm, marginBottom: SPACE.sm }}>
          {row.map((card, ci) => {
            const c = insightColors[card.type];
            return (
              <View
                key={ci}
                style={{
                  flex: 1,
                  backgroundColor: c.bg,
                  borderRadius: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: c.border,
                  padding: SPACE.md,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPE.caption,
                    fontFamily: "Helvetica-Bold",
                    color: c.title,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: SPACE.xs,
                  }}
                >
                  {insightLabels[card.type]}
                </Text>
                <Text
                  style={{
                    fontSize: TYPE.body,
                    fontFamily: "Helvetica-Bold",
                    color: BRAND.gray800,
                    marginBottom: SPACE.xs,
                  }}
                >
                  {card.title}
                </Text>
                <Text style={{ fontSize: TYPE.caption, color: BRAND.gray600, lineHeight: 1.4 }}>
                  {card.text}
                </Text>
                {card.items && card.items.length > 0 && (
                  <View style={{ marginTop: SPACE.xs }}>
                    {card.items.map((item, ii) => (
                      <Text key={ii} style={{ fontSize: TYPE.tiny, color: BRAND.gray600, marginBottom: 1 }}>
                        • {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Donut Chart (SVG) ───────────────────────────────────
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  title?: string;
}

export function DonutChart({ segments, centerLabel, centerValue, size = 120, title }: DonutChartProps) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  // Build arc paths
  let startAngle = -90;
  const arcs = segments.map((seg) => {
    const angle = total > 0 ? (seg.value / total) * 360 : 0;
    const endAngle = startAngle + angle;
    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
    const largeArc = angle > 180 ? 1 : 0;
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ");
    startAngle = endAngle;
    return { d, color: seg.color };
  });

  return (
    <View style={{ marginBottom: SPACE.lg, alignItems: "center" }}>
      {title && (
        <Text
          style={{
            fontSize: TYPE.caption,
            fontFamily: "Helvetica-Bold",
            color: BRAND.gray700,
            marginBottom: SPACE.sm,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      )}
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <Path key={i} d={arc.d} fill={arc.color} />
        ))}
        {/* Center circle */}
        <Circle cx={cx} cy={cy} r={innerRadius - 2} fill={BRAND.white} />
      </Svg>
      {(centerLabel || centerValue) && (
        <View style={{ marginTop: -size / 2 - 8, alignItems: "center", marginBottom: size / 2 - 20 }}>
          {centerValue && (
            <Text style={{ fontSize: TYPE.h3, fontFamily: "Helvetica-Bold", color: BRAND.gray900 }}>
              {centerValue}
            </Text>
          )}
          {centerLabel && (
            <Text style={{ fontSize: TYPE.tiny, color: BRAND.gray500 }}>{centerLabel}</Text>
          )}
        </View>
      )}
      {/* Legend */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm, marginTop: SPACE.xs, justifyContent: "center" }}>
        {segments.map((seg, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: seg.color }} />
            <Text style={{ fontSize: TYPE.tiny, color: BRAND.gray600 }}>
              {seg.label} ({total > 0 ? ((seg.value / total) * 100).toFixed(0) : 0}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── Vertical Bar Chart (SVG) ────────────────────────────
interface VerticalBarItem {
  label: string;
  values: { value: number; color: string; legend?: string }[];
}

interface VerticalBarChartProps {
  items: VerticalBarItem[];
  title?: string;
  height?: number;
}

export function VerticalBarChart({ items, title, height = 100 }: VerticalBarChartProps) {
  const allValues = items.flatMap((i) => i.values.map((v) => v.value));
  const maxVal = Math.max(...allValues, 1);
  const barWidth = 16;
  const groupGap = 20;
  const barGap = 3;
  const chartWidth = items.length * (items[0]?.values.length * (barWidth + barGap) + groupGap);

  return (
    <View style={{ marginBottom: SPACE.xl }}>
      {title && (
        <Text
          style={{
            fontSize: TYPE.h3,
            fontFamily: "Helvetica-Bold",
            color: BRAND.gray800,
            marginBottom: SPACE.md,
          }}
        >
          {title}
        </Text>
      )}
      <Svg width={Math.max(chartWidth, 200)} height={height + 20} viewBox={`0 0 ${Math.max(chartWidth, 200)} ${height + 20}`}>
        {/* Baseline */}
        <Rect x="0" y={height} width={Math.max(chartWidth, 200)} height={0.5} fill={BRAND.gray300} />
        {items.map((group, gi) => {
          const groupX = gi * (group.values.length * (barWidth + barGap) + groupGap) + 10;
          return (
            <G key={gi}>
              {group.values.map((v, vi) => {
                const barH = (v.value / maxVal) * (height - 10);
                const x = groupX + vi * (barWidth + barGap);
                return (
                  <Rect
                    key={vi}
                    x={x}
                    y={height - barH}
                    width={barWidth}
                    height={barH}
                    rx={2}
                    fill={v.color}
                  />
                );
              })}
            </G>
          );
        })}
      </Svg>
      {/* Labels */}
      <View style={{ flexDirection: "row", gap: groupGap - 4, marginLeft: 10 }}>
        {items.map((group, gi) => (
          <Text
            key={gi}
            style={{
              fontSize: TYPE.tiny,
              color: BRAND.gray500,
              width: group.values.length * (barWidth + barGap),
              textAlign: "center",
            }}
          >
            {group.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
