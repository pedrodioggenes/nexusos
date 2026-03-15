# Aurora 3 Design System — Nexus OS

> Premium-tech visual identity with Apple-inspired neutral surfaces and brand colors in text/accents

---

## 📐 Design Philosophy

### Apple-Level Principles

1. **Neutral Containers** — Buttons and inputs use warm gray (hue 30°, saturation 5-8%), NOT colored backgrounds
2. **Color in Text** — Brand identity lives in typography and icons, not in container backgrounds
3. **Top-Down Lighting** — All surfaces have consistent light source from above (highlight top edge, shadow bottom)
4. **Multi-Layer Shadows** — Shadows use 2-3 layers: focused (small blur) + diffuse (large blur)
5. **Micro-Gradients** — No flat surfaces; always 2-3% luminosity variation for depth
6. **Recessed Inputs** — Input fields appear carved into the surface (darker top = inset effect)

---

## 🎨 CSS Variables

### Core Colors (Global)

| Variable | HSL Value | Description |
|----------|-----------|-------------|
| `--background` | `0 0% 0%` | Pure black base |
| `--foreground` | `0 0% 98%` | Near-white text |
| `--card` | `0 0% 4%` | Card surfaces |
| `--card-elevated` | `0 0% 6%` | Elevated cards |
| `--muted` | `0 0% 10%` | Muted backgrounds |
| `--muted-foreground` | `0 0% 50%` | Secondary text |
| `--border` | `0 0% 12%` | Standard borders |
| `--border-subtle` | `0 0% 8%` | Subtle borders |

### Primary (Brand Red)

| Variable | HSL Value | Usage |
|----------|-----------|-------|
| `--primary` | `357 76% 35%` | Primary actions |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--primary-glow` | `357 76% 45%` | Glow effects |

### Accent (Brand Yellow)

| Variable | HSL Value | Usage |
|----------|-----------|-------|
| `--accent` | `45 99% 62%` | Highlights, CTAs |
| `--accent-foreground` | `0 0% 0%` | Text on accent |
| `--accent-glow` | `45 99% 70%` | Glow effects |

### Brand Tokens

| Variable | HSL Value | Usage |
|----------|-----------|-------|
| `--brand-yellow` | `45 99% 62%` | Brand Yellow |
| `--brand-red` | `357 76% 35%` | Brand Red |

### Aurora 3 Base Colors (Background)

| Variable | HSL Value | Description |
|----------|-----------|-------------|
| `--aurora3-base` | `220 15% 5%` | Deep charcoal base |
| `--aurora3-charcoal` | `260 10% 11%` | Elevated surface |
| `--aurora3-slate` | `240 12% 15%` | Card backgrounds |
| `--aurora3-deep-neutral` | `15 8% 10%` | Warm undertone |
| `--aurora3-steel` | `230 10% 18%` | Borders, subtle accents |

### Aurora 3 Highlight Gradient Stops (Brand Palette)

| Variable | HSL Value | Color Name |
|----------|-----------|------------|
| `--aurora3-highlight-1` | `44 75% 56%` | Honey Amber |
| `--aurora3-highlight-2` | `36 70% 50%` | Aged Gold |
| `--aurora3-highlight-3` | `12 68% 46%` | Soft Terracotta |
| `--aurora3-highlight-4` | `357 60% 36%` | Deep Wine |

### Aurora 3 Soft Palette (Text & Subtle Elements)

| Variable | HSL Value | Usage |
|----------|-----------|-------|
| `--aurora3-soft-amber` | `44 45% 55%` | Desaturated amber |
| `--aurora3-soft-text` | `44 50% 65%` | Soft amber text |
| `--aurora3-soft-border` | `44 30% 40%` | Subtle borders |

### Module Colors (Harmonized)

| Variable | HSL Value | Module |
|----------|-----------|--------|
| `--module-ia` | `44 70% 55%` | HiperIA (Intelligence) |
| `--module-gestao` | `32 65% 52%` | HiperGestão (Management) |
| `--module-trade` | `15 68% 50%` | HiperTrade (Trade) |
| `--module-ofertas` | `357 55% 45%` | HiperOfertas (Offers) |
| `--module-console` | `195 85% 50%` | Console (Admin) |

### Semantic States

| Variable | HSL Value | Usage |
|----------|-----------|-------|
| `--success` | `145 55% 45%` | Success states |
| `--warning` | `45 100% 50%` | Warning states |
| `--destructive` | `0 84% 60%` | Error/delete states |

---

## 🔘 Button System

### Standard Variants

```tsx
import { Button } from "@/components/ui/button";

// Primary (Brand Red)
<Button variant="default">Primary Action</Button>

// Secondary (Gray)
<Button variant="secondary">Secondary</Button>

// Outline
<Button variant="outline">Outlined</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Destructive
<Button variant="destructive">Delete</Button>
```

### Brand Variants (Vibrant)

```tsx
// Full gradient (amber-to-coral)
<Button variant="hipersenna">Bold Action</Button>

// Gradient border only
<Button variant="hipersenna-outline">Outlined Gradient</Button>
```

### Brand Soft Variants (Apple-like) ⭐

```tsx
// Neutral warm gray with amber text
<Button variant="hipersenna-soft">Soft Action</Button>

// Minimal, almost invisible
<Button variant="hipersenna-subtle">Subtle Action</Button>
```

### Button Sizes

| Size | Height | Usage |
|------|--------|-------|
| `sm` | 32px | Compact UIs |
| `default` | 40px | Standard |
| `lg` | 48px | Large touch targets |
| `icon` | 40x40px | Icon-only buttons |

---

## 📝 Input System

### PremiumInput Variants

```tsx
import { PremiumInput, PremiumTextarea } from "@/components/ui/premium-input";

// Standard with accent glow
<PremiumInput glowColor="accent" placeholder="Type here..." />

// Brand gradient border
<PremiumInput variant="hipersenna" placeholder="Gradient border" />

// Apple-like neutral recessed ⭐
<PremiumInput variant="hipersenna-soft" placeholder="Neutral recessed" />
```

### Glow Colors

| Value | Description |
|-------|-------------|
| `primary` | Red glow |
| `accent` | Yellow glow |
| `module-ia` | Purple glow |
| `hipersenna` | Amber glow |
| `hipersenna-soft` | No glow (neutral) |

---

## 🎨 CSS Utility Classes

### Brand Gradient Utilities

```css
/* Horizontal gradient (for buttons, pills) */
.hipersenna-gradient {
  background: linear-gradient(90deg, 
    hsl(var(--aurora3-highlight-1)) 0%, 
    hsl(var(--aurora3-highlight-2)) 40%, 
    hsl(var(--aurora3-highlight-3)) 100%
  );
}

/* Vertical gradient (for bars, progress) */
.hipersenna-gradient-vertical {
  background: linear-gradient(180deg, 
    hsl(var(--aurora3-highlight-1)) 0%, 
    hsl(var(--aurora3-highlight-2)) 35%, 
    hsl(var(--aurora3-highlight-3)) 70%, 
    hsl(var(--aurora3-highlight-4)) 100%
  );
}

/* Gradient text */
.hipersenna-text {
  background: linear-gradient(90deg, ...);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Gradient border */
.hipersenna-border {
  background: linear-gradient(...) padding-box,
              linear-gradient(...) border-box;
  border: 1px solid transparent;
}

/* Focus ring */
.hipersenna-focus:focus-visible {
  box-shadow: 0 0 0 2px hsl(var(--aurora3-base)),
              0 0 0 4px hsl(var(--aurora3-highlight-1) / 0.5);
}
```

### Apple-Level Component Classes ⭐

```css
/* Button Soft - Neutral warm gray with depth */
.hipersenna-btn-soft {
  background: linear-gradient(180deg, 
    hsl(30 8% 22% / 0.6) 0%,
    hsl(30 6% 18% / 0.5) 100%
  );
  border: 1px solid hsl(30 5% 30% / 0.4);
  border-top-color: hsl(0 0% 100% / 0.08);
  box-shadow: 
    inset 0 1px 0 hsl(0 0% 100% / 0.06),
    0 1px 2px hsl(0 0% 0% / 0.12),
    0 4px 12px hsl(0 0% 0% / 0.08);
}

/* Button Subtle - Almost invisible */
.hipersenna-btn-subtle {
  background: transparent;
  border: 1px solid hsl(0 0% 30% / 0.3);
}

/* Input Soft - Neutral recessed */
.hipersenna-input-soft {
  background: linear-gradient(180deg, 
    hsl(30 5% 10% / 0.5) 0%,
    hsl(30 8% 13% / 0.4) 100%
  );
  border: 1px solid hsl(30 5% 25% / 0.35);
  box-shadow: 
    inset 0 2px 4px hsl(0 0% 0% / 0.2),
    inset 0 1px 0 hsl(0 0% 0% / 0.1);
}
```

### Module Color Utilities

```css
/* Text colors */
.text-module-gestao  { color: hsl(var(--module-gestao)); }
.text-module-ia      { color: hsl(var(--module-ia)); }
.text-module-ofertas { color: hsl(var(--module-ofertas)); }
.text-module-trade   { color: hsl(var(--module-trade)); }
.text-module-console { color: hsl(var(--module-console)); }

/* Background colors */
.bg-module-gestao  { background-color: hsl(var(--module-gestao)); }
.bg-module-ia      { background-color: hsl(var(--module-ia)); }
/* ... */

/* Border colors */
.border-module-gestao  { border-color: hsl(var(--module-gestao)); }
/* ... */

/* Glow effects */
.glow-module-gestao { box-shadow: 0 0 20px hsl(var(--module-gestao) / 0.4); }
/* ... */
```

### Brand Text Utilities

```css
.text-brand-yellow { color: hsl(var(--brand-yellow)); }
.text-brand-red    { color: hsl(var(--brand-red)); }
```

### Premium Effects

```css
/* Gradient text */
.text-gradient-primary {
  background: linear-gradient(135deg, 
    hsl(var(--foreground)) 0%, 
    hsl(var(--muted-foreground)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-accent {
  background: linear-gradient(135deg, 
    hsl(var(--accent)) 0%, 
    hsl(var(--accent-glow)) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Grid pattern background */
.bg-grid-pattern { /* 60x60 grid lines */ }
.bg-grid-pattern-fade { /* with radial mask */ }
```

---

## 📦 Components

### Aurora3Background

Full-page container with mesh gradient, noise texture, and vignette effects.

```tsx
import { Aurora3Background } from "@/components/ui/aurora3-background";

<Aurora3Background
  withNoise={true}        // Noise texture overlay
  noiseOpacity={0.04}     // Noise opacity (0-1)
  withVignette={true}     // Edge vignette effect
  withSpotlight={true}    // Center spotlight glow
>
  {/* Content */}
</Aurora3Background>
```

### SolidCard

Premium card with opaque surfaces (no glassmorphism).

```tsx
import { 
  SolidCard, 
  SolidCardHeader, 
  SolidCardTitle, 
  SolidCardDescription, 
  SolidCardContent,
  SolidCardFooter 
} from "@/components/ui/solid-card";

<SolidCard 
  variant="default"     // "subtle" | "default" | "strong"
  withGradient={true}   // Top highlight gradient
  hoverable={true}      // Hover lift effect
>
  <SolidCardHeader>
    <SolidCardTitle>Title</SolidCardTitle>
    <SolidCardDescription>Description</SolidCardDescription>
  </SolidCardHeader>
  <SolidCardContent>
    {/* Content */}
  </SolidCardContent>
</SolidCard>
```

**Variants:**
- `subtle`: 70% opacity, very thin border
- `default`: 85% opacity, subtle border
- `strong`: 95% opacity, visible border

### AccentBar

Vertical gradient bar with brand colors.

```tsx
import { AccentBar } from "@/components/ui/accent-bar";

<AccentBar
  height={200}          // Height in pixels
  width={56}            // Width in pixels
  withGlow={false}      // Glow effect (default: false)
/>
```

### AccentPill

Badge/tag with horizontal brand gradient and Apple-like depth.

```tsx
import { AccentPill } from "@/components/ui/accent-bar";

<AccentPill withGlow={false}>
  Premium Design System v3
</AccentPill>
```

**Features:**
- Diagonal gradient (95°) for natural light simulation
- Inner highlight (top edge)
- Multi-layer shadow (inner + outer)
- Subtle text shadow for depth

### MetricBar

Vertical bar for benchmark visualizations.

```tsx
import { MetricBar } from "@/components/ui/metric-bar";

<MetricBar
  height={140}          // Height in pixels
  width={48}            // Width in pixels
  variant="default"     // "subtle" | "default" | "strong"
/>
```

### MetricTile

Stat card for metrics display.

```tsx
import { MetricTile } from "@/components/ui/metric-bar";

<MetricTile 
  variant="default"     // "subtle" | "default" | "strong"
  hoverable={true}      // Hover lift effect
>
  <div className="text-3xl font-bold text-white/90">98%</div>
  <div className="text-xs text-white/40">Uptime</div>
</MetricTile>
```

### GlassCard (Legacy)

Frosted glass effect card. Use for decorative elements only.

```tsx
import { GlassCard } from "@/components/ui/glass-card";

<GlassCard className="p-6">
  {/* Content */}
</GlassCard>
```

---

## 🎯 Usage Guidelines

### Do's ✅

1. **Use semantic tokens** — Never hardcode colors directly
2. **Color in text, not containers** — Brand identity in typography
3. **Neutral button backgrounds** — Use soft variants for Apple-like feel
4. **Consistent lighting** — Top-down light source on all elements
5. **Multi-layer shadows** — Focused + diffuse for depth
6. **Recessed inputs** — Darker top edge for inset effect
7. **Use HSL format** — All colors must be HSL

### Don'ts ❌

1. Don't use colored button backgrounds (use neutral gray)
2. Don't enable `withGlow` for production UIs (decorative only)
3. Don't mix Aurora 2 (teal-blue) with Aurora 3 (amber-coral)
4. Don't use glassmorphism in main UI (use SolidCard)
5. Don't hardcode hex/rgb colors (use CSS variables)

---

## 🖥️ Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `xs` | 375px | Small phones |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Classes

```tsx
// Grid that stacks on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Text that adjusts
<h1 className="text-2xl md:text-4xl lg:text-5xl">

// Full-width buttons on mobile
<Button className="w-full md:w-auto">
```

---

## 📋 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2025-01 | Initial Aurora 3 with harmonized brand palette |
| 3.0.1 | 2025-01 | Removed default glow from accent components |
| 3.0.2 | 2025-01 | Added brand button/input variants |
| 3.1.0 | 2026-03 | Rebranded to Nexus OS — removed legacy naming |