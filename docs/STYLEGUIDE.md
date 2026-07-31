# PasteBin UI/UX Style Guide

This document defines the visual design system, styling guidelines, and theme variables for the PasteBin code-sharing platform.

## 1. Visual Theme (Shadcn/UI Inspired)

PasteBin utilizes a developer-first dark/light system optimized for syntax readability and visual hierarchy.

### Dark Mode (Default)

- **Background**: `#09090b` (Slate-950)
- **Cards/Containers**: `#18181b` (Slate-900)
- **Primary Indigo Accent**: `#6366f1` (Indigo-500)
- **Muted text**: `#a1a1aa` (Slate-400)
- **Border borders**: `#27272a` (Slate-800)

### Light Mode

- **Background**: `#ffffff` (White)
- **Cards/Containers**: `#f8fafc` (Slate-50)
- **Primary Indigo Accent**: `#4f46e5` (Indigo-600)
- **Muted text**: `#64748b` (Slate-500)
- **Border borders**: `#e2e8f0` (Slate-200)

---

## 2. Typography

- **Body Text**: **Inter** (sans-serif)
  - Clean, neutral, high-legibility sans-serif font.
- **Code Snippets / Editors**: **JetBrains Mono** or **Fira Code** (monospace)
  - Monospace spacing optimized for code rendering and syntax highlighting.

---

## 3. Spacing & Borders

- **Radius**: We use `0.75rem` (12px) for cards, inputs, and primary buttons for a smooth, modern visual layout.
- **Grids & Gaps**: We adhere strictly to standard spacing (multiples of `4px` or `0.25rem`):
  - `gap-2` (8px) for icons and labels.
  - `gap-4` (16px) for item rows.
  - `p-6` or `p-8` for card interiors.
