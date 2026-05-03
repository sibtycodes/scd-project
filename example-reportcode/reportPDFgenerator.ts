import { PDFDocument, type PDFFont, type PDFPage, rgb, type RGB, StandardFonts } from 'pdf-lib'
import type { FullIdeaAnalysis } from '../fullIdeaAnalysis'

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89

const LAYOUT = {
  marginX: 44,
  marginTop: 44,
  marginBottom: 44,
  footerHeight: 30,
}

const CONTENT_WIDTH = PAGE_WIDTH - LAYOUT.marginX * 2

const SPACING = {
  xxs: 3,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
}

const FONT = {
  coverTitle: 34,
  coverSubtitle: 13,
  sectionTitle: 16,
  cardTitle: 12,
  body: 10,
  small: 8.5,
  metricValue: 19,
  metricLabel: 8,
}

const CARD = {
  paddingX: 12,
  paddingY: 12,
  accentWidth: 4,
}

const THEME = {
  primary: hexToRgb('#2563EB'),
  secondary: hexToRgb('#0F172A'),
  accent: hexToRgb('#38BDF8'),
  text: hexToRgb('#334155'),
  muted: hexToRgb('#64748B'),
  border: hexToRgb('#CBD5E1'),
  divider: hexToRgb('#E2E8F0'),
  surface: hexToRgb('#FFFFFF'),
  surfaceAlt: hexToRgb('#F8FAFC'),
  chip: hexToRgb('#DBEAFE'),
  shadow: hexToRgb('#94A3B8'),
}

type LooseRecord = Record<string, unknown>

type SectionIcon =
  | 'overview'
  | 'competitors'
  | 'market'
  | 'risks'
  | 'insights'
  | 'recommendations'
  | 'customers'
  | 'funding'

interface FontPack {
  regular: PDFFont
  bold: PDFFont
}

interface LayoutContext {
  pdfDoc: PDFDocument
  fonts: FontPack
  pages: PDFPage[]
  currentPage: PDFPage
  y: number
  generatedLabel: string
}

interface CardField {
  label: string
  value: string
}

interface CardBulletGroup {
  label: string
  items: string[]
}

interface CardOptions {
  title: string
  subtitle?: string
  fields?: CardField[]
  bullets?: CardBulletGroup[]
  accent?: RGB
  x?: number
  width?: number
}

interface MetricBox {
  label: string
  value: string
  note?: string
}

// Converts hex color tokens to pdf-lib RGB values for report theme rendering.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const normalized = clean.length === 3
    ? clean
        .split('')
        .map((c) => `${c}${c}`)
        .join('')
    : clean

  const value = Number.parseInt(normalized, 16)
  const r = ((value >> 16) & 255) / 255
  const g = ((value >> 8) & 255) / 255
  const b = (value & 255) / 255
  return rgb(r, g, b)
}

// Safely casts unknown payloads into object records for defensive field access.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function asRecord(value: unknown): LooseRecord {
  if (value && typeof value === 'object') {
    return value as LooseRecord
  }
  return {}
}

// Normalizes mixed input values into trimmed displayable text.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function normalizeText(value: unknown): string {
  if (typeof value === 'string') {
    return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }
  return ''
}

// Returns normalized text with fallback when source value is empty.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function textOrFallback(value: unknown, fallback: string = 'N/A'): string {
  const text = normalizeText(value)
  return text.length > 0 ? text : fallback
}

// Parses numeric values from unknown/serialized inputs for report metrics.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

// Parses string arrays from arrays, JSON, or delimited text.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) {
      return []
    }

    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => normalizeText(item)).filter(Boolean)
        }
      } catch {
        return []
      }
    }

    return raw
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

// Formats currency values into compact labels used by metric cards.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function formatCurrencyShort(value: number | null): string {
  if (value === null) {
    return 'N/A'
  }

  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

// Formats numbers with locale grouping for readable report output.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function formatInteger(value: number | null): string {
  if (value === null) {
    return 'N/A'
  }
  return value.toLocaleString('en-US')
}

// Formats percentage values from decimal or percentage-like inputs.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function formatPercent(value: number | null): string {
  if (value === null) {
    return 'N/A'
  }
  if (Math.abs(value) <= 1) {
    return `${(value * 100).toFixed(0)}%`
  }
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

// Formats opportunity score values into normalized /10 labels.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function formatOpportunityScore(value: number | null): string {
  if (value === null) {
    return 'N/A'
  }
  if (value > 10 && value <= 100) {
    return `${(value / 10).toFixed(1)} / 10`
  }
  if (value <= 10) {
    return `${value.toFixed(1)} / 10`
  }
  return value.toFixed(1)
}

// Breaks oversized words into chunks that fit within PDF layout width.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function breakLongWord(word: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const chunks: string[] = []
  let current = ''

  for (const char of word) {
    const candidate = `${current}${char}`
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || current.length === 0) {
      current = candidate
    } else {
      chunks.push(current)
      current = char
    }
  }

  if (current) {
    chunks.push(current)
  }

  return chunks
}

// Wraps paragraph text into width-constrained lines for pdf-lib rendering.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const source = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const paragraphs = source.split('\n')
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }

    let currentLine = ''

    for (const word of words) {
      const segments = font.widthOfTextAtSize(word, size) > maxWidth
        ? breakLongWord(word, font, size, maxWidth)
        : [word]

      for (const segment of segments) {
        const candidate = currentLine ? `${currentLine} ${segment}` : segment
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          currentLine = candidate
        } else {
          if (currentLine) {
            lines.push(currentLine)
          }
          currentLine = segment
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines.length > 0 ? lines : ['']
}

// Returns consistent line-height scaling for text layout.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function getLineHeight(size: number): number {
  return size * 1.35
}

// Estimates wrapped text block height before drawing.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function measureTextHeight(font: PDFFont, text: string, size: number, maxWidth: number): number {
  const lines = wrapText(font, text, size, maxWidth)
  return lines.length * getLineHeight(size)
}

// Draws wrapped paragraph text and returns vertical space consumed.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawParagraph(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number,
  size: number,
  color: RGB,
  maxWidth: number
): number {
  const lines = wrapText(font, text, size, maxWidth)
  const lineHeight = getLineHeight(size)
  let cursorY = y

  for (const line of lines) {
    if (line) {
      page.drawText(line, {
        x,
        y: cursorY,
        size,
        font,
        color,
      })
    }
    cursorY -= lineHeight
  }

  return lines.length * lineHeight
}

// Adds a new page and resets cursor state for cover/content layout.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function addPage(context: LayoutContext, options?: { cover?: boolean }): void {
  const page = context.pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  context.currentPage = page
  context.pages.push(page)

  if (options?.cover) {
    context.y = PAGE_HEIGHT - LAYOUT.marginTop
    return
  }

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 10,
    width: PAGE_WIDTH,
    height: 10,
    color: THEME.primary,
    opacity: 0.08,
  })

  context.y = PAGE_HEIGHT - LAYOUT.marginTop
}

// Ensures there is enough vertical space before drawing the next block.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function ensureSpace(context: LayoutContext, neededHeight: number): void {
  const minY = LAYOUT.marginBottom + LAYOUT.footerHeight
  if (context.y - neededHeight < minY) {
    addPage(context)
  }
}

// Draws horizontal dividers between sections.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawDivider(context: LayoutContext): void {
  ensureSpace(context, SPACING.sm + 2)
  context.currentPage.drawLine({
    start: { x: LAYOUT.marginX, y: context.y },
    end: { x: PAGE_WIDTH - LAYOUT.marginX, y: context.y },
    thickness: 1,
    color: THEME.divider,
  })
  context.y -= SPACING.sm
}

// Draws lightweight icon glyphs for each report section header.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawSectionIcon(page: PDFPage, x: number, y: number, size: number, icon: SectionIcon): void {
  page.drawRectangle({
    x,
    y,
    width: size,
    height: size,
    color: THEME.surfaceAlt,
    borderColor: THEME.border,
    borderWidth: 1,
  })

  const innerX = x + 4
  const innerY = y + 4
  const innerSize = size - 8

  if (icon === 'overview') {
    page.drawRectangle({ x: innerX, y: innerY + innerSize - 3, width: innerSize, height: 2, color: THEME.primary })
    page.drawRectangle({ x: innerX, y: innerY + innerSize - 7, width: innerSize * 0.7, height: 2, color: THEME.accent })
    page.drawRectangle({ x: innerX, y: innerY + 1, width: innerSize * 0.85, height: 2, color: THEME.primary })
  } else if (icon === 'competitors') {
    page.drawCircle({ x: innerX + 2, y: innerY + innerSize - 2, size: 2, color: THEME.primary })
    page.drawCircle({ x: innerX + innerSize - 2, y: innerY + innerSize - 2, size: 2, color: THEME.primary })
    page.drawCircle({ x: innerX + innerSize / 2, y: innerY + 2, size: 2, color: THEME.primary })
    page.drawLine({ start: { x: innerX + 2, y: innerY + innerSize - 2 }, end: { x: innerX + innerSize / 2, y: innerY + 2 }, thickness: 1, color: THEME.accent })
    page.drawLine({ start: { x: innerX + innerSize - 2, y: innerY + innerSize - 2 }, end: { x: innerX + innerSize / 2, y: innerY + 2 }, thickness: 1, color: THEME.accent })
  } else if (icon === 'market') {
    page.drawRectangle({ x: innerX, y: innerY, width: 3, height: innerSize * 0.5, color: THEME.primary })
    page.drawRectangle({ x: innerX + 5, y: innerY, width: 3, height: innerSize * 0.8, color: THEME.accent })
    page.drawRectangle({ x: innerX + 10, y: innerY, width: 3, height: innerSize, color: THEME.primary })
  } else if (icon === 'risks') {
    page.drawLine({ start: { x: innerX + innerSize / 2, y: innerY + innerSize }, end: { x: innerX, y: innerY }, thickness: 1, color: THEME.primary })
    page.drawLine({ start: { x: innerX + innerSize / 2, y: innerY + innerSize }, end: { x: innerX + innerSize, y: innerY }, thickness: 1, color: THEME.primary })
    page.drawLine({ start: { x: innerX, y: innerY }, end: { x: innerX + innerSize, y: innerY }, thickness: 1, color: THEME.primary })
    page.drawRectangle({ x: innerX + innerSize / 2 - 1, y: innerY + 3, width: 2, height: 5, color: THEME.accent })
    page.drawCircle({ x: innerX + innerSize / 2, y: innerY + 1, size: 1, color: THEME.accent })
  } else if (icon === 'insights') {
    page.drawLine({ start: { x: innerX + innerSize / 2, y: innerY + innerSize }, end: { x: innerX + innerSize / 2, y: innerY }, thickness: 1, color: THEME.primary })
    page.drawLine({ start: { x: innerX, y: innerY + innerSize / 2 }, end: { x: innerX + innerSize, y: innerY + innerSize / 2 }, thickness: 1, color: THEME.primary })
    page.drawLine({ start: { x: innerX + 1, y: innerY + 1 }, end: { x: innerX + innerSize - 1, y: innerY + innerSize - 1 }, thickness: 1, color: THEME.accent })
    page.drawLine({ start: { x: innerX + 1, y: innerY + innerSize - 1 }, end: { x: innerX + innerSize - 1, y: innerY + 1 }, thickness: 1, color: THEME.accent })
  } else if (icon === 'recommendations') {
    page.drawLine({ start: { x: innerX + 1, y: innerY + 5 }, end: { x: innerX + 5, y: innerY + 1 }, thickness: 1.5, color: THEME.primary })
    page.drawLine({ start: { x: innerX + 5, y: innerY + 1 }, end: { x: innerX + innerSize - 1, y: innerY + innerSize - 1 }, thickness: 1.5, color: THEME.primary })
    page.drawRectangle({ x: innerX, y: innerY + innerSize - 2, width: innerSize, height: 1.5, color: THEME.accent })
  } else if (icon === 'customers') {
    page.drawCircle({ x: innerX + 4, y: innerY + innerSize - 3, size: 2, color: THEME.primary })
    page.drawCircle({ x: innerX + innerSize - 4, y: innerY + innerSize - 3, size: 2, color: THEME.primary })
    page.drawRectangle({ x: innerX + 1, y: innerY + 1, width: innerSize - 2, height: 3, color: THEME.accent })
  } else if (icon === 'funding') {
    page.drawCircle({ x: innerX + 4, y: innerY + innerSize - 4, size: 3, color: THEME.primary, opacity: 0.2 })
    page.drawCircle({ x: innerX + 8, y: innerY + innerSize - 7, size: 3, color: THEME.primary, opacity: 0.25 })
    page.drawCircle({ x: innerX + 12, y: innerY + innerSize - 10, size: 3, color: THEME.primary, opacity: 0.3 })
    page.drawRectangle({ x: innerX + 2, y: innerY + 1, width: innerSize - 2, height: 2, color: THEME.accent })
  }
}

// Renders standardized section header blocks with icon, title, and subtitle.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawSectionHeader(context: LayoutContext, title: string, subtitle: string, icon: SectionIcon): void {
  ensureSpace(context, 64)
  drawDivider(context)
  context.y -= SPACING.xs

  const iconSize = 18
  const iconY = context.y - iconSize + 2
  drawSectionIcon(context.currentPage, LAYOUT.marginX, iconY, iconSize, icon)

  const titleX = LAYOUT.marginX + iconSize + 10
  const titleY = context.y - 2

  context.currentPage.drawText(title, {
    x: titleX,
    y: titleY,
    size: FONT.sectionTitle,
    font: context.fonts.bold,
    color: THEME.secondary,
  })

  const subtitleWidth = CONTENT_WIDTH - iconSize - 12
  const subtitleUsed = drawParagraph(
    context.currentPage,
    context.fonts.regular,
    subtitle,
    titleX,
    titleY - 15,
    FONT.small,
    THEME.muted,
    subtitleWidth
  )

  context.y = titleY - 15 - subtitleUsed - SPACING.xs
}

// Draws bullet lists with wrapped text and spacing control.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawBulletList(
  page: PDFPage,
  font: PDFFont,
  items: string[],
  x: number,
  y: number,
  width: number,
  size: number,
  color: RGB
): number {
  let used = 0

  for (const item of items) {
    const text = `- ${item}`
    const height = drawParagraph(page, font, text, x, y - used, size, color, width)
    used += height + SPACING.xxs
  }

  return used
}

// Estimates card height in advance to prevent page overflow.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function estimateCardHeight(context: LayoutContext, card: CardOptions): number {
  const width = card.width ?? CONTENT_WIDTH
  const innerWidth = width - CARD.paddingX * 2 - CARD.accentWidth
  let height = CARD.paddingY

  height += measureTextHeight(context.fonts.bold, card.title, FONT.cardTitle, innerWidth)

  if (card.subtitle) {
    height += SPACING.xs
    height += measureTextHeight(context.fonts.regular, card.subtitle, FONT.body, innerWidth)
  }

  if (card.fields && card.fields.length > 0) {
    height += SPACING.sm
    for (const field of card.fields) {
      const fieldText = `${field.label}: ${field.value}`
      height += measureTextHeight(context.fonts.regular, fieldText, FONT.body, innerWidth)
      height += SPACING.xxs
    }
  }

  if (card.bullets && card.bullets.length > 0) {
    for (const group of card.bullets) {
      if (group.items.length === 0) continue
      height += SPACING.sm
      height += measureTextHeight(context.fonts.bold, group.label, FONT.small, innerWidth)
      for (const item of group.items.slice(0, 5)) {
        height += measureTextHeight(context.fonts.regular, `- ${item}`, FONT.body, innerWidth - 4)
        height += SPACING.xxs
      }
      if (group.items.length > 5) {
        const remaining = group.items.length - 5
        height += measureTextHeight(context.fonts.regular, `+ ${remaining} more`, FONT.small, innerWidth)
      }
    }
  }

  return height + CARD.paddingY
}

// Draws a themed report card with title, fields, and bullet groups.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawCard(context: LayoutContext, card: CardOptions): void {
  const x = card.x ?? LAYOUT.marginX
  const width = card.width ?? CONTENT_WIDTH
  const cardHeight = estimateCardHeight(context, card)

  ensureSpace(context, cardHeight + SPACING.md)

  const topY = context.y
  const bottomY = topY - cardHeight

  context.currentPage.drawRectangle({
    x: x + 1,
    y: bottomY - 1,
    width,
    height: cardHeight,
    color: THEME.shadow,
    opacity: 0.08,
  })

  context.currentPage.drawRectangle({
    x,
    y: bottomY,
    width,
    height: cardHeight,
    color: THEME.surface,
    borderColor: THEME.border,
    borderWidth: 1,
  })

  context.currentPage.drawRectangle({
    x,
    y: bottomY,
    width: CARD.accentWidth,
    height: cardHeight,
    color: card.accent ?? THEME.primary,
  })

  const textX = x + CARD.paddingX + CARD.accentWidth
  const innerWidth = width - CARD.paddingX * 2 - CARD.accentWidth
  let cursorY = topY - CARD.paddingY - FONT.cardTitle

  const titleUsed = drawParagraph(
    context.currentPage,
    context.fonts.bold,
    card.title,
    textX,
    cursorY,
    FONT.cardTitle,
    THEME.secondary,
    innerWidth
  )
  cursorY -= titleUsed

  if (card.subtitle) {
    cursorY -= SPACING.xs
    const subtitleUsed = drawParagraph(
      context.currentPage,
      context.fonts.regular,
      card.subtitle,
      textX,
      cursorY,
      FONT.body,
      THEME.text,
      innerWidth
    )
    cursorY -= subtitleUsed
  }

  if (card.fields && card.fields.length > 0) {
    cursorY -= SPACING.sm
    for (const field of card.fields) {
      const fieldUsed = drawParagraph(
        context.currentPage,
        context.fonts.regular,
        `${field.label}: ${field.value}`,
        textX,
        cursorY,
        FONT.body,
        THEME.text,
        innerWidth
      )
      cursorY -= fieldUsed + SPACING.xxs
    }
  }

  if (card.bullets && card.bullets.length > 0) {
    for (const group of card.bullets) {
      if (group.items.length === 0) continue

      cursorY -= SPACING.xs
      const labelUsed = drawParagraph(
        context.currentPage,
        context.fonts.bold,
        group.label,
        textX,
        cursorY,
        FONT.small,
        THEME.secondary,
        innerWidth
      )
      cursorY -= labelUsed + SPACING.xxs

      const visibleItems = group.items.slice(0, 5)
      const listUsed = drawBulletList(
        context.currentPage,
        context.fonts.regular,
        visibleItems,
        textX + 2,
        cursorY,
        innerWidth - 2,
        FONT.body,
        THEME.text
      )
      cursorY -= listUsed

      if (group.items.length > 5) {
        const remaining = group.items.length - 5
        const moreUsed = drawParagraph(
          context.currentPage,
          context.fonts.regular,
          `+ ${remaining} more`,
          textX + 2,
          cursorY,
          FONT.small,
          THEME.muted,
          innerWidth - 2
        )
        cursorY -= moreUsed
      }
    }
  }

  context.y = bottomY - SPACING.md
}

// Draws a single metric box used in market and score summaries.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawMetricBox(context: LayoutContext, metric: MetricBox, x: number, y: number, width: number, height: number): void {
  const page = context.currentPage

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: THEME.surfaceAlt,
    borderColor: THEME.border,
    borderWidth: 1,
  })

  page.drawRectangle({
    x,
    y: y + height - 4,
    width,
    height: 4,
    color: THEME.accent,
    opacity: 0.65,
  })

  const label = metric.label.toUpperCase()
  page.drawText(label, {
    x: x + 10,
    y: y + height - 15,
    size: FONT.metricLabel,
    font: context.fonts.bold,
    color: THEME.muted,
  })

  const valueWidth = width - 20
  drawParagraph(
    page,
    context.fonts.bold,
    metric.value,
    x + 10,
    y + height - 40,
    FONT.metricValue,
    THEME.secondary,
    valueWidth
  )

  if (metric.note) {
    drawParagraph(
      page,
      context.fonts.regular,
      metric.note,
      x + 10,
      y + 10,
      FONT.small,
      THEME.muted,
      valueWidth
    )
  }
}

// Draws metric boxes in responsive rows.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawMetricBoxes(context: LayoutContext, metrics: MetricBox[]): void {
  const usable = metrics.filter((m) => m.label.trim().length > 0)
  if (usable.length === 0) {
    return
  }

  const columns = Math.min(3, usable.length)
  const gap = SPACING.sm
  const boxHeight = 92
  const boxWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns

  for (let i = 0; i < usable.length; i += columns) {
    const rowItems = usable.slice(i, i + columns)
    ensureSpace(context, boxHeight + SPACING.md)
    const boxY = context.y - boxHeight

    rowItems.forEach((metric, index) => {
      const x = LAYOUT.marginX + index * (boxWidth + gap)
      drawMetricBox(context, metric, x, boxY, boxWidth, boxHeight)
    })

    context.y = boxY - SPACING.md
  }
}

// Draws placeholder card content when a section has no data.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawEmptyCard(context: LayoutContext, title: string, message: string): void {
  drawCard(context, {
    title,
    subtitle: message,
    accent: THEME.border,
  })
}

// Renders the PDF cover page with title, metadata, and branding accents.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawCoverPage(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  addPage(context, { cover: true })

  const page = context.currentPage
  const idea = asRecord(analysis.idea)
  const ideaTitle = textOrFallback(idea.title, 'Untitled Startup Idea')
  const category = textOrFallback(idea.category, 'N/A')
  const stage = textOrFallback(idea.stage, 'N/A')

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: THEME.surface,
  })

  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 210,
    width: PAGE_WIDTH,
    height: 210,
    color: THEME.primary,
    opacity: 0.06,
  })

  page.drawCircle({
    x: PAGE_WIDTH - 70,
    y: PAGE_HEIGHT - 70,
    size: 95,
    color: THEME.accent,
    opacity: 0.17,
  })

  page.drawCircle({
    x: PAGE_WIDTH - 140,
    y: PAGE_HEIGHT - 130,
    size: 52,
    color: THEME.primary,
    opacity: 0.14,
  })

  page.drawRectangle({
    x: LAYOUT.marginX - 12,
    y: PAGE_HEIGHT - 380,
    width: 8,
    height: 220,
    color: THEME.primary,
  })

  const headline = 'Startup Validation Report'
  const subhead = 'Investor-ready venture analysis generated by MedValidateAI'

  const coverTitleY = PAGE_HEIGHT - 220
  const headlineHeight = drawParagraph(
    page,
    context.fonts.bold,
    headline,
    LAYOUT.marginX,
    coverTitleY,
    FONT.coverTitle,
    THEME.secondary,
    CONTENT_WIDTH * 0.78
  )

  const subheadY = coverTitleY - headlineHeight - SPACING.sm
  drawParagraph(
    page,
    context.fonts.regular,
    subhead,
    LAYOUT.marginX,
    subheadY,
    FONT.coverSubtitle,
    THEME.text,
    CONTENT_WIDTH * 0.74
  )

  page.drawRectangle({
    x: LAYOUT.marginX,
    y: 112,
    width: CONTENT_WIDTH,
    height: 132,
    color: THEME.surfaceAlt,
    borderColor: THEME.border,
    borderWidth: 1,
  })

  page.drawRectangle({
    x: LAYOUT.marginX,
    y: 238,
    width: CONTENT_WIDTH,
    height: 6,
    color: THEME.accent,
  })

  drawParagraph(
    page,
    context.fonts.bold,
    ideaTitle,
    LAYOUT.marginX + 12,
    212,
    FONT.cardTitle,
    THEME.secondary,
    CONTENT_WIDTH - 24
  )

  drawParagraph(
    page,
    context.fonts.regular,
    `Category: ${category}    Stage: ${stage}`,
    LAYOUT.marginX + 12,
    192,
    FONT.body,
    THEME.text,
    CONTENT_WIDTH - 24
  )

  drawParagraph(
    page,
    context.fonts.regular,
    `Generated on ${context.generatedLabel}`,
    LAYOUT.marginX + 12,
    172,
    FONT.body,
    THEME.muted,
    CONTENT_WIDTH - 24
  )

  drawParagraph(
    page,
    context.fonts.regular,
    'Confidential. This report is intended for strategic planning and investor preparation.',
    LAYOUT.marginX,
    72,
    FONT.small,
    THEME.muted,
    CONTENT_WIDTH
  )
}

// Renders startup overview cards from core idea metadata.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderIdeaOverview(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  const idea = asRecord(analysis.idea)

  drawSectionHeader(
    context,
    'Idea Overview',
    'Core startup narrative, positioning, and product thesis.',
    'overview'
  )

  drawCard(context, {
    title: textOrFallback(idea.title, 'Untitled Startup Idea'),
    subtitle: `${textOrFallback(idea.domain, 'N/A')} / ${textOrFallback(idea.subdomain, 'N/A')}`,
    fields: [
      { label: 'Category', value: textOrFallback(idea.category, 'N/A') },
      { label: 'Stage', value: textOrFallback(idea.stage, 'N/A') },
      { label: 'Team Size', value: textOrFallback(idea.team_size, 'N/A') },
      { label: 'Funding Needed', value: textOrFallback(idea.funding_needed, 'N/A') },
    ],
    accent: THEME.primary,
  })

  drawCard(context, {
    title: 'Description',
    subtitle: textOrFallback(idea.description, 'No description provided.'),
    accent: THEME.accent,
  })

  drawCard(context, {
    title: 'Problem Statement',
    subtitle: textOrFallback(idea.problem_statement, 'No problem statement provided.'),
    accent: THEME.accent,
  })

  drawCard(context, {
    title: 'Target Audience',
    subtitle: textOrFallback(idea.target_audience, 'No target audience defined.'),
    accent: THEME.accent,
  })

  drawCard(context, {
    title: 'Unique Value Proposition',
    subtitle: textOrFallback(idea.unique_value_proposition, 'No UVP provided.'),
    accent: THEME.accent,
  })
}

// Renders competitor snapshots and strategic positioning data.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderCompetitors(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Competitor Analysis',
    'Structured snapshots of key players, market positioning, and strategic strengths.',
    'competitors'
  )

  if (!analysis.competitors || analysis.competitors.length === 0) {
    drawEmptyCard(context, 'No Competitor Data', 'No competitor entries were found for this idea.')
    return
  }

  for (const item of analysis.competitors) {
    const competitor = asRecord(item)
    const strengths = parseStringArray(competitor.strengths)
    const weaknesses = parseStringArray(competitor.weaknesses)

    drawCard(context, {
      title: textOrFallback(competitor.competitor_name, 'Unknown Competitor'),
      subtitle: textOrFallback(competitor.competitor_description, 'No description available.'),
      fields: [
        {
          label: 'Market Position',
          value: textOrFallback(competitor.market_position, 'N/A'),
        },
        {
          label: 'Funding Raised',
          value: formatCurrencyShort(parseNumber(competitor.funding_raised)),
        },
        {
          label: 'Estimated Market Share',
          value: formatPercent(parseNumber(competitor.market_share_estimated)),
        },
      ],
      bullets: [
        { label: 'Strengths', items: strengths },
        { label: 'Weaknesses', items: weaknesses },
      ],
      accent: THEME.primary,
    })
  }
}

// Renders market metrics, gaps, and trend indicators.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderMarketData(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Market Data',
    'Headline market metrics and demand-side signals.',
    'market'
  )

  const market = asRecord(analysis.marketData)
  const marketGaps = parseStringArray(market.market_gaps)
  const trends = parseStringArray(market.market_trends)

  drawMetricBoxes(context, [
    {
      label: 'Market Size',
      value: formatCurrencyShort(parseNumber(market.market_size_usd)),
      note: 'Total addressable opportunity',
    },
    {
      label: 'Growth Rate',
      value: formatPercent(parseNumber(market.market_growth_rate_percent)),
      note: 'Year-over-year growth',
    },
    {
      label: 'Opportunity Score',
      value: formatOpportunityScore(parseNumber(market.opportunity_score)),
      note: 'Normalized startup potential',
    },
  ])

  if (marketGaps.length === 0 && trends.length === 0) {
    drawEmptyCard(context, 'Additional Market Signals', 'No market gaps or trend indicators available.')
    return
  }

  drawCard(context, {
    title: 'Market Landscape',
    subtitle: 'Signals that shape product and go-to-market decisions.',
    bullets: [
      { label: 'Market Gaps', items: marketGaps },
      { label: 'Market Trends', items: trends },
    ],
    accent: THEME.accent,
  })
}

// Renders identified risks with mitigation strategies.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderRisks(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Risk Assessment',
    'Priority risks with impact and probability context.',
    'risks'
  )

  if (!analysis.risks || analysis.risks.length === 0) {
    drawEmptyCard(context, 'No Risk Data', 'No risk entries are available for this idea.')
    return
  }

  for (const item of analysis.risks) {
    const risk = asRecord(item)
    const mitigations = parseStringArray(risk.mitigation_strategies)
    drawCard(context, {
      title: `${textOrFallback(risk.risk_type, 'risk')} - ${textOrFallback(risk.risk_name, 'Unnamed risk')}`,
      subtitle: textOrFallback(risk.risk_description, 'No risk description provided.'),
      fields: [
        {
          label: 'Probability',
          value: formatPercent(parseNumber(risk.probability_percent)),
        },
        {
          label: 'Impact',
          value: textOrFallback(risk.impact_level, 'N/A').toUpperCase(),
        },
      ],
      bullets: [{ label: 'Mitigation Strategies', items: mitigations }],
      accent: hexToRgb('#F97316'),
    })
  }
}

// Renders AI insight cards or derived fallback summaries.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderInsights(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'AI Insights',
    'Machine-assisted synthesis of market and execution signals.',
    'insights'
  )

  const insights = (analysis.aiInsights ?? []).map((item) => asRecord(item))

  if (insights.length === 0) {
    const report = asRecord(analysis.detailedReports?.[0])
    const marketSummary = asRecord(report.market_analysis)
    const competitiveSummary = asRecord(report.competitive_analysis)
    const customerSummary = asRecord(report.customer_analysis)
    const riskSummary = asRecord(report.risk_assessment)

    const fallbackCards: Array<{ title: string; body: string }> = [
      {
        title: 'Executive Summary',
        body: textOrFallback(report.executive_summary, ''),
      },
      {
        title: 'Market Signal',
        body: textOrFallback(marketSummary.summary, ''),
      },
      {
        title: 'Competitive Signal',
        body: textOrFallback(competitiveSummary.summary, ''),
      },
      {
        title: 'Customer Signal',
        body: textOrFallback(customerSummary.summary, ''),
      },
      {
        title: 'Risk Signal',
        body: textOrFallback(riskSummary.summary, ''),
      },
    ].filter((card) => card.body !== 'N/A' && card.body.length > 0)

    if (fallbackCards.length === 0) {
      drawEmptyCard(context, 'No AI Insights', 'No AI-generated insight records are currently available.')
      return
    }

    for (const card of fallbackCards) {
      drawCard(context, {
        title: card.title,
        subtitle: card.body,
        accent: hexToRgb('#0EA5E9'),
      })
    }

    return
  }

  for (const insight of insights) {
    const hasStructuredMarketFields = normalizeText(insight.market_size).length > 0

    if (hasStructuredMarketFields) {
      drawCard(context, {
        title: 'Market Signal Insight',
        fields: [
          { label: 'Market Size', value: textOrFallback(insight.market_size, 'N/A') },
          { label: 'Growth Rate', value: textOrFallback(insight.growth_rate, 'N/A') },
          { label: 'Target Potential', value: textOrFallback(insight.target_potential, 'N/A') },
        ],
        accent: hexToRgb('#0EA5E9'),
      })
      continue
    }

    const confidence = parseNumber(insight.confidence_score)
    const confidenceText = confidence !== null
      ? `${Math.round(confidence <= 1 ? confidence * 100 : confidence)}%`
      : 'N/A'

    drawCard(context, {
      title: `${textOrFallback(insight.insight_type, 'Insight')} - ${textOrFallback(insight.insight_category, 'General')}`,
      subtitle: textOrFallback(insight.insight_content, 'No insight body available.'),
      fields: [{ label: 'Confidence', value: confidenceText }],
      accent: hexToRgb('#0EA5E9'),
    })
  }
}

// Renders prioritized strategic recommendation cards.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderRecommendations(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Strategic Recommendations',
    'Action plan cards prioritized for venture traction and execution quality.',
    'recommendations'
  )

  if (!analysis.strategicRecommendations || analysis.strategicRecommendations.length === 0) {
    drawEmptyCard(context, 'No Recommendations', 'No strategic recommendations were generated.')
    return
  }

  for (const item of analysis.strategicRecommendations) {
    const recommendation = asRecord(item)

    drawCard(context, {
      title: textOrFallback(recommendation.recommendation_type, 'Recommendation'),
      subtitle: textOrFallback(recommendation.recommendation_content, 'No recommendation details provided.'),
      fields: [
        { label: 'Priority', value: textOrFallback(recommendation.priority_level, 'N/A').toUpperCase() },
        { label: 'Expected Impact', value: formatInteger(parseNumber(recommendation.expected_impact_on_score)) },
        { label: 'Implementation Difficulty', value: textOrFallback(recommendation.implementation_difficulty, 'N/A').toUpperCase() },
      ],
      accent: hexToRgb('#10B981'),
    })
  }
}

// Renders customer segment details and monetization signals.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderCustomerSegments(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Customer Segments',
    'Segment-specific value and monetization potential.',
    'customers'
  )

  if (!analysis.customerSegments || analysis.customerSegments.length === 0) {
    drawEmptyCard(context, 'No Customer Segment Data', 'No customer segments were found for this idea.')
    return
  }

  for (const item of analysis.customerSegments) {
    const segment = asRecord(item)

    drawCard(context, {
      title: textOrFallback(segment.segment_name, 'Unnamed Segment'),
      fields: [
        { label: 'Estimated Size', value: formatInteger(parseNumber(segment.segment_size_estimate)) },
        { label: 'Willingness to Pay', value: formatCurrencyShort(parseNumber(segment.willingness_to_pay)) },
      ],
      bullets: [{ label: 'Pain Points', items: parseStringArray(segment.pain_points) }],
      accent: hexToRgb('#8B5CF6'),
    })
  }
}

// Renders funding source cards with stage/category focus.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function renderFunding(context: LayoutContext, analysis: FullIdeaAnalysis): void {
  drawSectionHeader(
    context,
    'Potential Funding Sources',
    'Relevant investor profiles and ticket size ranges.',
    'funding'
  )

  if (!analysis.fundingSources || analysis.fundingSources.length === 0) {
    drawEmptyCard(context, 'No Funding Data', 'No funding sources available in the current dataset.')
    return
  }

  const trimmed = analysis.fundingSources.slice(0, 8)
  for (const item of trimmed) {
    const funding = asRecord(item)
    const min = parseNumber(funding.typical_check_size_min)
    const max = parseNumber(funding.typical_check_size_max)
    const checkRange = min !== null && max !== null
      ? `${formatCurrencyShort(min)} - ${formatCurrencyShort(max)}`
      : 'N/A'

    drawCard(context, {
      title: textOrFallback(funding.name, 'Funding Source'),
      fields: [
        { label: 'Type', value: textOrFallback(funding.funder_type, 'N/A') },
        { label: 'Typical Check Size', value: checkRange },
      ],
      bullets: [
        { label: 'Category Focus', items: parseStringArray(funding.category_focus) },
        { label: 'Stage Focus', items: parseStringArray(funding.stage_focus) },
      ],
      accent: hexToRgb('#14B8A6'),
    })
  }
}

// Draws footer metadata including generation date and pagination.
// Frontend usage: indirect via app/(authenticated)/dashboard/results/page.tsx through getOrCreateIdeaReportPDF -> reportActions -> generatePDFBuffer.
function drawFooter(page: PDFPage, fonts: FontPack, pageNumber: number, totalPages: number, generatedLabel: string): void {
  const lineY = LAYOUT.marginBottom + 18
  const footerY = LAYOUT.marginBottom + 6

  page.drawLine({
    start: { x: LAYOUT.marginX, y: lineY },
    end: { x: PAGE_WIDTH - LAYOUT.marginX, y: lineY },
    thickness: 1,
    color: THEME.divider,
  })

  const leftLabel = 'MedValidateAI startup report'
  page.drawText(leftLabel, {
    x: LAYOUT.marginX,
    y: footerY,
    size: FONT.small,
    font: fonts.regular,
    color: THEME.muted,
  })

  const dateLabel = `Generated ${generatedLabel}`
  const dateWidth = fonts.regular.widthOfTextAtSize(dateLabel, FONT.small)
  page.drawText(dateLabel, {
    x: PAGE_WIDTH / 2 - dateWidth / 2,
    y: footerY,
    size: FONT.small,
    font: fonts.regular,
    color: THEME.muted,
  })

  const pageLabel = `Page ${pageNumber} of ${totalPages}`
  const pageWidth = fonts.regular.widthOfTextAtSize(pageLabel, FONT.small)
  page.drawText(pageLabel, {
    x: PAGE_WIDTH - LAYOUT.marginX - pageWidth,
    y: footerY,
    size: FONT.small,
    font: fonts.regular,
    color: THEME.muted,
  })
}

/**
 * Builds the full PDF report buffer from full-analysis data.
 * Frontend usage: indirect from app/(authenticated)/dashboard/results/page.tsx via lib/api.ts getOrCreateIdeaReportPDF -> reportActions.generateReportForIdea.
 */
export async function generatePDFBuffer(analysis: FullIdeaAnalysis): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()

  const fonts: FontPack = {
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
  }

  const generatedLabel = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })

  const context: LayoutContext = {
    pdfDoc,
    fonts,
    pages: [],
    currentPage: null as unknown as PDFPage,
    y: PAGE_HEIGHT - LAYOUT.marginTop,
    generatedLabel,
  }

  drawCoverPage(context, analysis)
  addPage(context)

  renderIdeaOverview(context, analysis)
  renderCompetitors(context, analysis)
  renderMarketData(context, analysis)
  renderRisks(context, analysis)
  renderInsights(context, analysis)
  renderRecommendations(context, analysis)
  renderCustomerSegments(context, analysis)
  renderFunding(context, analysis)

  const totalPages = context.pages.length
  context.pages.forEach((page, index) => {
    drawFooter(page, context.fonts, index + 1, totalPages, context.generatedLabel)
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}