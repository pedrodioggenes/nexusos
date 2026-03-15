/**
 * BlockNote-to-PDF Converter
 * Maps BlockNote document blocks to @react-pdf/renderer components.
 */
import React from "react";
import { View, Text, Image, Link } from "@react-pdf/renderer";
import { BRAND, TYPE, SPACE } from "./theme";
import { resolveBlockNoteFileUrl } from "@/lib/storage-utils";

// ── Inline content styles ───────────────────────────────

interface InlineContent {
  type: string;
  text?: string;
  href?: string;
  styles?: Record<string, boolean | string>;
  content?: InlineContent[];
}

interface BlockData {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
  content?: InlineContent[];
  children?: BlockData[];
}

function getInlineStyle(styles: Record<string, boolean | string> = {}) {
  const s: Record<string, unknown> = {};
  if (styles.bold) s.fontFamily = "Helvetica-Bold";
  if (styles.italic) s.fontFamily = styles.bold ? "Helvetica-BoldOblique" : "Helvetica-Oblique";
  if (styles.underline) s.textDecoration = "underline";
  if (styles.strikethrough) s.textDecoration = "line-through";
  if (styles.code) {
    s.fontFamily = "Courier";
    s.fontSize = TYPE.body - 1;
    s.backgroundColor = BRAND.gray100;
  }
  if (styles.textColor && typeof styles.textColor === "string") {
    s.color = styles.textColor;
  }
  if (styles.backgroundColor && typeof styles.backgroundColor === "string") {
    s.backgroundColor = styles.backgroundColor;
  }
  return s;
}

function renderInlineContent(content: InlineContent[] | undefined): React.ReactNode {
  if (!content || content.length === 0) return null;

  return content.map((item, i) => {
    if (item.type === "text") {
      return (
        <Text key={i} style={getInlineStyle(item.styles)}>
          {item.text || ""}
        </Text>
      );
    }
    if (item.type === "link") {
      return (
        <Link key={i} src={item.href || "#"} style={{ color: BRAND.blue, textDecoration: "underline" }}>
          {item.content?.map((c, j) => (
            <Text key={j} style={getInlineStyle(c.styles)}>
              {c.text || ""}
            </Text>
          ))}
        </Link>
      );
    }
    return null;
  });
}

// ── Heading sizes ───────────────────────────────────────

const HEADING_SIZES: Record<number, { fontSize: number; marginBottom: number; marginTop: number }> = {
  1: { fontSize: TYPE.h1, marginBottom: SPACE.md, marginTop: SPACE.xl },
  2: { fontSize: TYPE.h2, marginBottom: SPACE.sm, marginTop: SPACE.lg },
  3: { fontSize: TYPE.h3, marginBottom: SPACE.sm, marginTop: SPACE.md },
};

// ── Block renderers ─────────────────────────────────────

function renderHeading(block: BlockData): React.ReactNode {
  const level = (block.props?.level as number) || 1;
  const style = HEADING_SIZES[level] || HEADING_SIZES[1];
  return (
    <Text
      key={block.id}
      style={{
        fontFamily: "Helvetica-Bold",
        fontSize: style.fontSize,
        color: BRAND.gray900,
        marginBottom: style.marginBottom,
        marginTop: style.marginTop,
      }}
    >
      {renderInlineContent(block.content)}
    </Text>
  );
}

function renderParagraph(block: BlockData): React.ReactNode {
  const hasContent = block.content && block.content.length > 0 &&
    block.content.some(c => c.text && c.text.trim().length > 0);
  
  if (!hasContent) {
    return <View key={block.id} style={{ height: SPACE.sm }} />;
  }
  
  return (
    <Text
      key={block.id}
      style={{
        fontSize: TYPE.body,
        color: BRAND.gray700,
        lineHeight: 1.6,
        marginBottom: SPACE.sm,
      }}
    >
      {renderInlineContent(block.content)}
    </Text>
  );
}

function renderBulletListItem(block: BlockData, depth = 0): React.ReactNode {
  const bullets = ["•", "◦", "▪"];
  const bullet = bullets[depth % bullets.length];
  return (
    <View key={block.id} style={{ flexDirection: "row", marginBottom: SPACE.xs, paddingLeft: depth * SPACE.lg }}>
      <Text style={{ fontSize: TYPE.body, color: BRAND.gray500, width: 14 }}>{bullet}</Text>
      <Text style={{ fontSize: TYPE.body, color: BRAND.gray700, flex: 1, lineHeight: 1.5 }}>
        {renderInlineContent(block.content)}
      </Text>
    </View>
  );
}

function renderNumberedListItem(block: BlockData, index: number, depth = 0): React.ReactNode {
  return (
    <View key={block.id} style={{ flexDirection: "row", marginBottom: SPACE.xs, paddingLeft: depth * SPACE.lg }}>
      <Text style={{ fontSize: TYPE.body, color: BRAND.gray500, width: 18, textAlign: "right", marginRight: 4 }}>
        {index}.
      </Text>
      <Text style={{ fontSize: TYPE.body, color: BRAND.gray700, flex: 1, lineHeight: 1.5 }}>
        {renderInlineContent(block.content)}
      </Text>
    </View>
  );
}

function renderCheckListItem(block: BlockData): React.ReactNode {
  const checked = block.props?.checked as boolean;
  return (
    <View key={block.id} style={{ flexDirection: "row", marginBottom: SPACE.xs, alignItems: "center" }}>
      <Text style={{ fontSize: TYPE.body, color: checked ? BRAND.green : BRAND.gray400, width: 16 }}>
        {checked ? "☑" : "☐"}
      </Text>
      <Text
        style={{
          fontSize: TYPE.body,
          color: checked ? BRAND.gray400 : BRAND.gray700,
          flex: 1,
          lineHeight: 1.5,
          textDecoration: checked ? "line-through" : "none",
        }}
      >
        {renderInlineContent(block.content)}
      </Text>
    </View>
  );
}

function renderImage(block: BlockData, resolvedUrls: Map<string, string>): React.ReactNode {
  const url = block.props?.url as string;
  const caption = block.props?.caption as string;
  const resolvedUrl = resolvedUrls.get(url) || url;

  if (!resolvedUrl) return null;

  return (
    <View key={block.id} style={{ marginBottom: SPACE.lg, alignItems: "center" }}>
      <Image
        src={resolvedUrl}
        style={{
          maxWidth: "100%",
          maxHeight: 300,
          objectFit: "contain",
          borderRadius: 4,
        }}
      />
      {caption && (
        <Text style={{ fontSize: TYPE.caption, color: BRAND.gray500, marginTop: SPACE.xs, textAlign: "center" }}>
          {caption}
        </Text>
      )}
    </View>
  );
}

function renderTable(block: BlockData): React.ReactNode {
  const tableContent = block.content as unknown as { type: string; rows?: { cells: InlineContent[][] }[] };
  
  // BlockNote table structure
  if (block.type === "table" && block.content) {
    const rows = (block as unknown as { content: { rows: { cells: InlineContent[][] }[] } }).content?.rows;
    if (!rows || rows.length === 0) return null;

    return (
      <View key={block.id} style={{ marginBottom: SPACE.lg, borderWidth: 0.5, borderColor: BRAND.gray200, borderRadius: 4, overflow: "hidden" }}>
        {rows.map((row: { cells: InlineContent[][] }, rowIdx: number) => (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
              backgroundColor: rowIdx === 0 ? BRAND.gray100 : rowIdx % 2 === 0 ? BRAND.offWhite : BRAND.white,
              borderBottomWidth: rowIdx < rows.length - 1 ? 0.5 : 0,
              borderBottomColor: BRAND.gray200,
            }}
          >
            {row.cells.map((cell: InlineContent[], cellIdx: number) => (
              <View
                key={cellIdx}
                style={{
                  flex: 1,
                  padding: SPACE.sm,
                  borderRightWidth: cellIdx < row.cells.length - 1 ? 0.5 : 0,
                  borderRightColor: BRAND.gray200,
                }}
              >
                <Text
                  style={{
                    fontSize: rowIdx === 0 ? TYPE.caption : TYPE.body,
                    fontFamily: rowIdx === 0 ? "Helvetica-Bold" : "Helvetica",
                    color: rowIdx === 0 ? BRAND.gray800 : BRAND.gray700,
                  }}
                >
                  {renderInlineContent(cell)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }

  return null;
}

// ── Main converter ──────────────────────────────────────

/**
 * Collect all image URLs from a BlockNote document for pre-resolution.
 */
export function collectImageUrls(blocks: BlockData[]): string[] {
  const urls: string[] = [];
  
  for (const block of blocks) {
    if (block.type === "image" && block.props?.url) {
      urls.push(block.props.url as string);
    }
    if (block.children && block.children.length > 0) {
      urls.push(...collectImageUrls(block.children));
    }
  }
  
  return urls;
}

/**
 * Pre-resolve all image URLs to fresh signed URLs.
 */
export async function resolveAllImageUrls(
  urls: string[],
  bucket: string = "workspace-files"
): Promise<Map<string, string>> {
  const resolvedMap = new Map<string, string>();
  
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const resolved = await resolveBlockNoteFileUrl(url, bucket);
      return { original: url, resolved };
    })
  );
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      resolvedMap.set(result.value.original, result.value.resolved);
    }
  }
  
  return resolvedMap;
}

/**
 * Convert BlockNote blocks to react-pdf elements.
 */
export function blocksToPdfElements(
  blocks: BlockData[],
  resolvedUrls: Map<string, string> = new Map(),
  depth = 0
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  let numberedIndex = 0;

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        elements.push(renderHeading(block));
        numberedIndex = 0;
        break;
      case "paragraph":
        elements.push(renderParagraph(block));
        numberedIndex = 0;
        break;
      case "bulletListItem":
        elements.push(renderBulletListItem(block, depth));
        numberedIndex = 0;
        break;
      case "numberedListItem":
        numberedIndex++;
        elements.push(renderNumberedListItem(block, numberedIndex, depth));
        break;
      case "checkListItem":
        elements.push(renderCheckListItem(block));
        numberedIndex = 0;
        break;
      case "image":
        elements.push(renderImage(block, resolvedUrls));
        numberedIndex = 0;
        break;
      case "table":
        elements.push(renderTable(block));
        numberedIndex = 0;
        break;
      default:
        // For unknown blocks, try to render content as paragraph
        if (block.content && block.content.length > 0) {
          elements.push(renderParagraph(block));
        }
        numberedIndex = 0;
        break;
    }

    // Render children (nested blocks)
    if (block.children && block.children.length > 0) {
      elements.push(...blocksToPdfElements(block.children, resolvedUrls, depth + 1));
    }
  }

  return elements;
}
