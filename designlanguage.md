# the ibbe design language

a human-centered, tactile, no-bullshit design system for chaos.

---

## 1. core philosophy

**ibbe is tactile, playful, and unapologetic.**

every pixel should feel deliberate. every interaction should surprise you. every message should roast you gently. we reject:
- generic UI patterns
- corporate sterility
- jargon-filled interfaces
- false politeness

we embrace:
- thick borders (because thin is cowardly)
- bold typography (because whispers don't change minds)
- humor embedded in every state (onboarding, errors, empty states)
- smooth, spring-loaded animations (because performance is a feature)

---

## 2. color palette

### primary colors

| token | hex | rgb | usage |
|-------|-----|-----|-------|
| **cream** | `#F7F2E9` | `247, 242, 233` | page background, primary neutral |
| **bone** | `#FFF9F0` | `255, 249, 240` | card backgrounds, surfaces, app shells |
| **charcoal** | `#1D1D1F` | `29, 29, 31` | text, borders, dark accents |

### supporting colors

| token | hex | rgb | usage |
|-------|-----|-----|-------|
| **gray** | `#8E8E93` | `142, 142, 147` | secondary text, disabled states, placeholders |
| **line** | `#E8E2D8` | `232, 226, 216` | borders, dividers, subtle separators |

### semantic colors

| token | hex | rgb | usage |
|-------|-----|-----|-------|
| **green** | `#28C76F` | `40, 199, 111` | success, online status, positive actions |
| **red** | `#FF453A` | `255, 69, 58` | danger, end call, delete, warnings |
| **blue** | `#2962FF` | `41, 98, 255` | primary CTA, links, information |

### do's & don'ts

✅ **DO:**
- Use cream/bone for 80% of interfaces (they're neutral partners)
- Layer colors intentionally (never random)
- Maintain high contrast for accessibility (charcoal on bone, always passes WCAG AA)
- Use color semantically (green = go, red = stop)

❌ **DON'T:**
- Add arbitrary gradients or light blue nonsense
- Use color for decoration (function first)
- Break the palette for "visual interest" (boring is the goal; personality comes from copy)

---

## 3. typography

### font family

**primary:** `Inter` (all weights: 400, 500, 600, 700, 800)
- system fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- clean, geometric, works at any size
- letter-spacing adjustments: tighten at large sizes

**secondary (technical contexts):** `JetBrains Mono` (monospace)
- used in: chat timestamps, code, IDs, terminal text
- weight: 400 (regular), 700 (bold)

### hierarchy

| level | size | weight | line-height | usage |
|-------|------|--------|------------|-------|
| **h1** | 32px | 800 | 1.1 | page titles, major headings |
| **h2** | 28px | 700 | 1.2 | section titles |
| **h3** | 24px | 700 | 1.3 | card titles, subsections |
| **h4** | 20px | 700 | 1.3 | minor headings |
| **body** | 16px | 400 | 1.5 | main text, paragraphs |
| **sm-text** | 15px | 400 | 1.5 | secondary text, descriptions |
| **label** | 13px | 600 | 1.4 | form labels, badges, hints |
| **xs-text** | 11px | 600 | 1.4 | timestamps, metadata |

### do's & don'ts

✅ **DO:**
- Use weight 700+ for headers (signal hierarchy)
- Use weight 400 for body (readability)
- Keep line-height generous (1.5+ for text, 1.1 for headings)
- Use text-transform: `lowercase` for UI labels (not headings)
- Apply letter-spacing: -0.5px to large headings (tighten them)

❌ **DON'T:**
- Mix fonts randomly (Inter is law)
- Use italics (we don't have italic weights)
- Set body text smaller than 15px
- Use ALL CAPS outside of technical contexts

---

## 4. spacing & layout

### spacing scale

all spacing uses an 8px base unit:

| token | value | usage |
|-------|-------|-------|
| `--space-1` | 1px | hairlines, borders |
| `--space-2` | 2px | micro spacing |
| `--space-4` | 4px | icon padding, tight spacing |
| `--space-6` | 6px | input padding |
| `--space-8` | 8px | small gaps, button padding |
| `--space-12` | 12px | medium gaps |
| `--space-16` | 16px | standard padding |
| `--space-20` | 20px | large sections |
| `--space-24` | 24px | section separation |
| `--space-32` | 32px | major breaks |

### responsive breakpoints

