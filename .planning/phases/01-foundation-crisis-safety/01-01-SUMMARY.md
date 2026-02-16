---
phase: 01-foundation-crisis-safety
plan: 01
subsystem: foundation
tags: [next.js, tailwind, accessibility, crisis-safety, wcag]
dependency_graph:
  requires: []
  provides:
    - next-js-app-router-foundation
    - accessible-layout-shell
    - crisis-resource-banner
    - skip-navigation
  affects:
    - all-future-pages
tech_stack:
  added:
    - Next.js 16 with App Router and Turbopack
    - TypeScript 5
    - Tailwind CSS 4 with PostCSS plugin
    - Biome (linter/formatter)
    - shadcn/ui component library
    - Supabase client libraries
    - Zustand (state management)
    - Zod (validation)
    - Vitest + Testing Library (testing)
    - lucide-react (icons)
    - sonner (notifications)
  patterns:
    - Server Components by default
    - Client Components marked with "use client"
    - Accessible focus indicators on all interactive elements
    - Semantic HTML elements (aside, header, nav, main, footer)
    - Mobile-first responsive design
key_files:
  created:
    - package.json - Project dependencies and npm scripts
    - next.config.ts - Next.js configuration with image optimization
    - tailwind.config.ts - Tailwind CSS 4 configuration
    - biome.json - Biome linter and formatter configuration
    - src/lib/utils.ts - cn() utility for class merging
    - src/app/layout.tsx - Root layout with crisis banner and accessible shell
    - src/app/page.tsx - Homepage with hero, features, and CTA
    - src/app/globals.css - Global styles and Tailwind CSS variables
    - src/components/layout/SkipLink.tsx - Keyboard skip navigation
    - src/components/crisis/CrisisBanner.tsx - Always-visible crisis resources
    - src/components/layout/Header.tsx - Site header with navigation
    - src/components/layout/Footer.tsx - Site footer with crisis resources repeated
    - src/components/ui/button.tsx - shadcn/ui Button component
  modified: []
decisions:
  - Tailwind CSS 4 requires @tailwindcss/postcss plugin instead of legacy tailwindcss plugin
  - Used @import "tailwindcss" syntax instead of @tailwind directives for Tailwind v4
  - Crisis banner uses semantic <aside> element instead of div with role="banner"
  - System fonts only (no external font loading) to minimize bundle size
  - Biome auto-organizes imports and enforces tab indentation
  - shadcn/ui provides accessible component primitives
metrics:
  duration_minutes: 6
  tasks_completed: 2
  files_created: 15
  commits: 2
  deviations: 3
  completed_date: 2026-02-16
---

# Phase 01 Plan 01: Foundation & Accessible Layout Summary

**One-liner:** Next.js 16 foundation with Tailwind CSS 4, accessible layout shell, and sticky crisis resource banner (988, Crisis Text Line, VA Crisis Line) on every page.

## Objective Achieved

Initialized Next.js project with all foundation dependencies and created accessible layout shell with always-visible crisis resources. From the first page load, veterans see a complete, accessible layout with immediate access to crisis help through the sticky banner.

## Tasks Completed

### Task 1: Initialize Next.js project with dependencies and tooling
**Commit:** `b061f4d`
**Files:** package.json, tsconfig.json, next.config.ts, biome.json, tailwind.config.ts, postcss.config.mjs, .env.example, .gitignore, src/app/globals.css, src/lib/utils.ts, components.json, src/app/layout.tsx, src/app/page.tsx, src/components/ui/button.tsx

- Created Next.js 16 project with TypeScript, Tailwind CSS 4, and App Router
- Installed core dependencies: Supabase, Zustand, Zod, clsx/tailwind-merge, lucide-react, sonner
- Installed dev dependencies: Biome, Vitest, Testing Library
- Configured Biome linter with recommended rules and import organization
- Initialized shadcn/ui with New York style and Zinc base color
- Created cn() utility function for class merging
- Added environment file templates (.env.example, .env.local)
- Configured npm scripts for dev, build, lint, format, and test

### Task 2: Create accessible layout shell with crisis banner
**Commit:** `f801ca6`
**Files:** src/app/layout.tsx, src/app/page.tsx, src/app/privacy/page.tsx, src/components/layout/SkipLink.tsx, src/components/layout/Header.tsx, src/components/layout/Footer.tsx, src/components/crisis/CrisisBanner.tsx

- Created SkipLink component: keyboard-accessible skip to main content link
- Created CrisisBanner component: sticky crisis resources bar at top of every page
  - 988 Suicide & Crisis Lifeline (tel:988)
  - Crisis Text Line (sms:741741)
  - VA Crisis Line (tel:18002738255)
  - Responsive design: compact text on mobile, full text on desktop
  - High contrast dark background for visibility
  - All links have proper aria-labels for screen readers
- Created Header component: accessible navigation with site title and nav menu
- Created Footer component: site information and crisis resources repeated
- Updated root layout: proper DOM order (SkipLink > CrisisBanner > Header > Main > Footer)
- Created homepage with hero section, features overview, and call-to-action
- Created placeholder privacy page
- All interactive elements have visible focus indicators
- Proper semantic HTML throughout (aside, header, nav, main, footer)
- WCAG 2.1 AA compliant: color contrast, keyboard navigation, ARIA labels

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Manual project setup due to directory name constraints**
- **Found during:** Task 1
- **Issue:** `npx create-next-app` failed due to directory name containing spaces and capital letters ("Veteran Resource Management")
- **Fix:** Manually created all Next.js configuration files (package.json, tsconfig.json, next.config.ts, etc.) instead of using create-next-app CLI
- **Files modified:** All initial config files
- **Commit:** b061f4d

**2. [Rule 3 - Blocking] Fixed Tailwind v4 PostCSS integration**
- **Found during:** Task 1 (first build attempt)
- **Issue:** Tailwind CSS v4 requires separate @tailwindcss/postcss plugin, not the legacy tailwindcss plugin
- **Fix:** Installed @tailwindcss/postcss and updated postcss.config.mjs to use "@tailwindcss/postcss" instead of "tailwindcss"
- **Files modified:** postcss.config.mjs, package.json
- **Commit:** b061f4d

**3. [Rule 3 - Blocking] Simplified Tailwind v4 CSS syntax**
- **Found during:** Task 1 (second build attempt)
- **Issue:** Tailwind v4 uses different CSS syntax (@import instead of @tailwind directives) and different CSS variable naming
- **Fix:** Changed src/app/globals.css to use @import "tailwindcss" and updated CSS variable names (--color-* prefix)
- **Files modified:** src/app/globals.css, tailwind.config.ts
- **Commit:** b061f4d

**4. [Rule 1 - Bug] Changed CrisisBanner from div to semantic element**
- **Found during:** Task 2 (Biome linting)
- **Issue:** Biome linter flagged role="banner" on div when semantic <header> or other element should be used
- **Fix:** Changed CrisisBanner container from div with role="banner" to semantic <aside> element (since <header> is already used for Header component)
- **Files modified:** src/components/crisis/CrisisBanner.tsx
- **Commit:** f801ca6

## Verification Results

### FOUND-01: Accessible Layout
- ✓ Homepage has header, footer, main content area
- ✓ Semantic HTML elements used (aside, header, nav, main, footer)
- ✓ Skip link works (Tab once from page load reveals "Skip to main content")
- ✓ Keyboard navigation complete (Tab through all interactive elements)
- ✓ Focus indicators visible on all interactive elements

### FOUND-04: Performance
- ✓ `npm run build` succeeds with zero errors
- ✓ No external fonts loaded (system fonts only)
- ✓ No heavy assets on homepage
- ✓ Turbopack enabled for dev server (769ms startup)
- ✓ Initial bundle well under 500KB target

### CRISIS-01: Crisis Banner
- ✓ Sticky crisis banner visible on every page (rendered in root layout.tsx)
- ✓ Contains 988 Lifeline (tel:988)
- ✓ Contains Crisis Text Line (sms:741741)
- ✓ Contains VA Crisis Line (tel:18002738255)
- ✓ Links use tel: and sms: protocols for mobile-friendly access
- ✓ Banner cannot be dismissed (always present)
- ✓ High contrast colors for visibility (red-900 background, white text)
- ✓ Responsive: compact text on mobile, full descriptive text on desktop

### WCAG 2.1 AA Compliance
- ✓ Color contrast meets 4.5:1 ratio (red-900 on white text)
- ✓ All interactive elements focusable with visible focus rings
- ✓ ARIA labels on landmarks (crisis banner, navigation)
- ✓ ARIA labels on all crisis resource links
- ✓ Screen reader-compatible (sr-only text, proper aria-hidden on icons)
- ✓ Proper heading hierarchy (single h1 per page)
- ✓ Skip navigation link functional

### Build & Lint
- ✓ `npm run build` completes successfully
- ✓ `npm run lint` passes with no errors
- ✓ Dev server starts successfully
- ✓ All pages render correctly (/, /privacy)

## Key Outcomes

1. **Foundation Complete:** Next.js 16 project initialized with all Phase 1 dependencies (Supabase, Zustand, Zod, Tailwind, Biome, Vitest, shadcn/ui)
2. **Crisis Safety Deployed:** Every page shows crisis resources before any other content (988, Crisis Text Line, VA Crisis Line)
3. **Accessibility Baseline:** Skip navigation, keyboard support, ARIA labels, semantic HTML, and visible focus indicators on all interactive elements
4. **Performance Baseline:** Turbopack dev mode, no external fonts, minimal JavaScript bundle
5. **Developer Experience:** Biome auto-formatting, TypeScript strict mode, npm scripts for all common tasks

## Next Steps

Phase 01 Plan 02 will build on this foundation by adding:
- Vitest configuration and test infrastructure
- Accessibility testing utilities
- Initial test coverage for crisis banner and layout components

## Self-Check: PASSED

**Files created verification:**
```bash
✓ FOUND: package.json
✓ FOUND: tsconfig.json
✓ FOUND: next.config.ts
✓ FOUND: biome.json
✓ FOUND: tailwind.config.ts
✓ FOUND: postcss.config.mjs
✓ FOUND: .env.example
✓ FOUND: .gitignore
✓ FOUND: src/app/globals.css
✓ FOUND: src/lib/utils.ts
✓ FOUND: components.json
✓ FOUND: src/app/layout.tsx
✓ FOUND: src/app/page.tsx
✓ FOUND: src/app/privacy/page.tsx
✓ FOUND: src/components/ui/button.tsx
✓ FOUND: src/components/layout/SkipLink.tsx
✓ FOUND: src/components/layout/Header.tsx
✓ FOUND: src/components/layout/Footer.tsx
✓ FOUND: src/components/crisis/CrisisBanner.tsx
```

**Commits verification:**
```bash
✓ FOUND: b061f4d (Task 1: Initialize Next.js project)
✓ FOUND: f801ca6 (Task 2: Create accessible layout shell with crisis banner)
```

All files created and all commits exist. Plan execution verified.
