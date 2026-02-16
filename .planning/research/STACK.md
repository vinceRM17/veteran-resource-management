# Technology Stack

**Project:** Veteran Resource Management Platform (Active Heroes)
**Researched:** 2026-02-15
**Confidence:** HIGH

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.x (latest stable) | Full-stack React framework | Industry standard for SSR/SSG, React Server Components, built-in routing, API routes, and excellent Vercel deployment. Next.js 16 includes production-ready Turbopack (5x faster builds), stable React Compiler, and improved hydration error handling. |
| React | 19.x | UI library | Required minimum version for Next.js 15+. React 19 includes improved Server Components, automatic memoization with React Compiler, and better hydration error messages. |
| TypeScript | 5.8.x | Type safety | Latest stable release (Feb 2026) with improved type checking for conditional returns, performance optimizations, and better uninitialized variable detection. Critical for large-scale applications with complex eligibility rules. |
| Node.js | 22.x LTS | Runtime | Default on Vercel, active LTS support through 2026+. Version 22.11.0+ with automatic minor/patch updates. |

### Database & Backend
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase | Latest (Cloud) | Backend-as-a-Service | Managed PostgreSQL with built-in authentication, Row-Level Security (RLS), realtime subscriptions, and pgvector for semantic search. Eliminates backend infrastructure complexity while providing enterprise-grade features. EU cloud available for GDPR. |
| PostgreSQL | 15+ (via Supabase) | Relational database | Industry standard for complex relational data, ACID compliance, full-text search, JSON support, and battle-tested at scale. Required for 85K+ organizations and complex benefit eligibility relationships. |
| pgvector | Latest | Vector similarity search | Supabase pre-installed extension for semantic search across resources, enabling "find similar programs" and AI-powered matching. Uses cosine distance for fastest normalized vector similarity. |
| Drizzle ORM | Latest | Database ORM | Type-safe, lightweight (smaller bundle than Prisma), SQL-like TypeScript API, excellent for serverless/edge. Better performance and smaller footprint than Prisma for Next.js App Router. Supports PostgreSQL natively with Supabase compatibility. |

### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | Latest | Client state management | Lightweight (1KB), zero boilerplate, excellent TypeScript support, 40% market adoption in 2026. Perfect middle ground between Context API and Redux Toolkit. Use for screening questionnaire state, user preferences, and UI state. |
| TanStack Query (React Query) | 5.x | Server state management | Industry standard for data fetching, automatic caching, background re-fetching, optimistic updates. Pairs perfectly with Supabase for managing server data. v5 renamed isLoading to isPending for better semantics. |
| React Hook Form | Latest | Form state management | Best-in-class form library with minimal re-renders, excellent performance, built-in validation support. De facto standard for complex forms like multi-step screening questionnaires. |

### UI & Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS framework | Industry standard (clear leader in 2026), CSS-first configuration with @theme, Lightning CSS engine (5x+ faster builds), zero-config content detection. Accessibility-first defaults with focus states, contrast control, and sr-only utilities. |
| shadcn/ui | Latest | Component library | Copy-paste accessible components built on Radix UI primitives. WCAG 2.2 AA compliant out-of-box, customizable with Tailwind, no runtime overhead. Exploded in popularity 2025-2026. Components support keyboard navigation, screen readers, and ARIA attributes automatically. |
| Radix UI | Latest (via shadcn/ui) | Headless UI primitives | Powers shadcn/ui. Accessibility gold standard with focus management, keyboard navigation, and ARIA handled correctly. Unstyled primitives allow full design control. |
| Headless UI | Latest | Unstyled components | From Tailwind team. Use for components not in shadcn/ui. Built-in accessibility, keyboard navigation, state management. Complements shadcn/ui. |

### Validation & Type Safety
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | Latest | Runtime validation | De facto standard for schema validation in 2026. Perfect TypeScript integration with z.infer<typeof schema>, declarative validation logic, reusable across client and server. Critical for eligibility rules engine and data import validation. |
| @hookform/resolvers | Latest | Form validation bridge | Connects Zod schemas to React Hook Form. Automatic type inference, seamless integration, reduces boilerplate. |

### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | Latest | Unit/integration testing | Vite-native, faster than Jest, built-in TypeScript support, parallel test execution. Official Next.js recommendation for synchronous component testing. Compatible with React Testing Library API. |
| React Testing Library | Latest | Component testing | Test user behavior, not implementation. Accessibility-focused queries (getByRole, getByLabelText). Works with Vitest via jsdom. |
| Playwright | Latest | E2E testing | Modern E2E framework from Microsoft. Built-in accessibility testing via axe-core integration (AxeBuilder.withTags() for WCAG 2.1 AA). Automated detection of ~30% of a11y issues. Fast, reliable, supports parallel testing. |
| @axe-core/playwright | Latest | Accessibility testing | Industry-standard a11y engine from Deque Systems. Scans for WCAG violations automatically. Integrate into Playwright E2E tests for continuous accessibility monitoring. |

### Developer Tools
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Biome | 2.3+ | Linting & formatting | Unified tool replacing ESLint + Prettier. 97% Prettier compatible, 50x+ faster (0.8s vs 45s for 10K files). Type-aware linting with 423+ rules. Clear winner in 2026 for new projects. |
| GitHub Actions | N/A | CI/CD | Free for public repos, native GitHub integration, excellent Next.js ecosystem support. Automate testing, linting, building, and deployment on every push. |

### Data Processing & ETL
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Prisma | Latest | Data import ETL | Type-safe database operations for importing 85K+ organizations and 5.5K+ businesses. Better for batch operations and migrations than Drizzle. Use for ETL pipelines, use Drizzle for app queries. |
| csv-parse | Latest | CSV parsing | Node.js standard for CSV processing. Stream-based for large files (85K+ rows). Built-in validation and transformation. |
| Zod | Latest | Data validation | Validate imported data against schemas. Prevent corruption from schema mismatches. Catch API/data changes early during transformation, not after DB insertion. |

### Authentication & Authorization
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase Auth | Latest | Authentication | Built-in auth with social login (Google, GitHub, etc.), MFA support, magic links, and email/password. Row-Level Security (RLS) integration with auth.uid() and auth.jwt() for database-level authorization. |
| NextAuth.js (Auth.js) | 5.x | OAuth integration (optional) | Alternative if need OAuth providers not in Supabase Auth. Adaptable with Clerk and Auth.js per 2026 best practices. Supabase Auth preferred for simplicity. |

### Communication
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Resend | Latest | Transactional email | Developer-friendly email API. Powers React Email (their open-source component library). Templates support dark mode, Tailwind 4, realtime collaboration, and versioning. Modern alternative to SendGrid/Mailgun. |
| React Email | 5.x | Email templates | Build responsive emails with React + TypeScript. Unstyled components, dark mode support, integrates seamlessly with Resend. Reduces pain of coding responsive emails. |

### File Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| UploadThing | Latest | File uploads | Type-safe file upload solution for Next.js. Built-in validation, access controls, CDN-backed delivery, resumable uploads. Simpler than S3 for document uploads (veteran documents, proof of service, etc.). |
| Supabase Storage | Latest | File storage (alternative) | If already using Supabase, Storage provides S3-compatible object storage with RLS policies. Use if need tight integration with database authorization. UploadThing better DX for simple use cases. |

### Observability & Analytics
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Sentry | Latest | Error monitoring | Industry standard for error tracking and performance monitoring. Native Vercel integration, session replay, distributed tracing, log drains. Essential for production debugging. |
| PostHog | Latest (Cloud EU or Self-hosted) | Product analytics | Privacy-focused, GDPR compliant, self-hosting option for data sovereignty. All-in-one: analytics, feature flags, session replay, experiments, surveys. EU cloud hosted in Frankfurt. |
| Vercel Analytics | Latest | Performance analytics | Built-in Web Vitals tracking, Real Experience Score. Free tier available. Automatic integration with Vercel deployment. |

### Date & Time
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| date-fns | Latest | Date manipulation | Most modular, tree-shakable (import only what you need), excellent TypeScript support. 2026 recommendation for date-dependent applications due to larger feature set than Luxon and better tree-shaking. |
| date-fns-tz | Latest | Timezone support | Extension for date-fns providing timezone handling. Pair with date-fns for complete date/time solution. |

### Internationalization (Future)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next-intl | Latest | i18n for Next.js | Next.js-native, App Router and Server Components support, ICU message syntax, type-safe translations with autocomplete. Best-in-class for Next.js 15+ in 2026. Defer until Phase 3+. |

### Deployment & Hosting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | Latest | Hosting platform | Native Next.js platform, automatic preview deployments, edge functions, built-in analytics. Zero-config deployment, global CDN, automatic HTTPS. Industry standard for Next.js. |

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/ssr | 0.5.x | Supabase SSR | Required for Next.js App Router + Supabase. Handles cookies, sessions in Server Components. |
| clsx | Latest | Conditional classes | Combine Tailwind classes conditionally. Lightweight utility. |
| tailwind-merge | Latest | Merge Tailwind classes | Resolve conflicting Tailwind classes. Pair with clsx for cn() utility. |
| lucide-react | Latest | Icons | Modern, tree-shakable icon library. 1000+ icons, consistent design, React components. |
| sonner | Latest | Toast notifications | Beautiful, accessible toast notifications. Built for React, works perfectly with shadcn/ui. |
| cmdk | Latest | Command palette | Accessible command menu (⌘K). Used in shadcn/ui command component. |
| vaul | Latest | Drawer component | Mobile-friendly drawer. Part of shadcn/ui ecosystem. |
| recharts | Latest | Charts | Composable charting library. Used in shadcn/ui charts. Accessibility improvements ongoing. |

## Installation

```bash
# Initialize Next.js 16 with TypeScript and Tailwind
npx create-next-app@latest veteran-resource-platform --typescript --tailwind --app --use-npm

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm drizzle-kit
npm install @tanstack/react-query
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns date-fns-tz

# UI & Styling (shadcn/ui init will scaffold components)
npx shadcn@latest init
npm install clsx tailwind-merge lucide-react
npm install sonner cmdk vaul recharts

# Email
npm install resend react-email

# File uploads
npm install uploadthing @uploadthing/react

# Observability
npm install @sentry/nextjs
npm install posthog-js

# Dev dependencies
npm install -D @biomejs/biome
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test @axe-core/playwright
npm install -D prisma  # For ETL/migrations only
npm install -D csv-parse

# Types
npm install -D @types/node @types/react @types/react-dom
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| State Management | Zustand | Redux Toolkit | Redux requires boilerplate, provider wrapping, and 10KB bundle. Only justified for 5+ developer teams with strict architectural needs. Zustand is 1KB, zero boilerplate, and handles 90% of use cases. |
| State Management | Zustand | Context API | Context API is for dependency injection (theme, auth), not reactive state. Causes unnecessary re-renders. Use for stable values only. |
| ORM | Drizzle | Prisma | Prisma has larger bundle (bad for serverless cold starts), requires binary dependencies, and schema-first model abstracts SQL. Drizzle is SQL-like, smaller, faster, better for edge. Use Prisma only for ETL pipelines. |
| Linting/Formatting | Biome | ESLint + Prettier | Two tools vs one, slower (45s vs 0.8s for 10K files), more config overhead. Biome is 97% Prettier compatible with 423+ lint rules and type-aware linting. Clear 2026 winner for new projects. |
| Testing | Vitest | Jest | Jest lacks native Vite integration, slower test execution, requires additional TypeScript config. Vitest is Vite-native, faster, built-in TypeScript support. Official Next.js recommendation. |
| E2E Testing | Playwright | Cypress | Playwright is faster, better multi-browser support, built-in accessibility testing with axe-core, from Microsoft with strong community. Cypress is heavier, slower. |
| Date Library | date-fns | Luxon | Luxon less modular, larger bundle. date-fns is tree-shakable, larger feature set, better TypeScript support. Add date-fns-tz for timezone support. |
| Date Library | date-fns | Day.js | Day.js is lightweight but requires plugins for features. date-fns has more features out-of-box, better tree-shaking. Luxon better if need built-in i18n/tz without plugins. |
| UI Components | shadcn/ui | Material UI | MUI is component library (runtime overhead, opinionated design). shadcn/ui is copy-paste (no runtime, full control, Tailwind-based). MUI harder to customize, larger bundle. |
| UI Components | shadcn/ui | Chakra UI | Chakra is runtime library with styling overhead. shadcn/ui is copy-paste with no runtime. Chakra moving to Ark UI (headless) which competes with Radix. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Moment.js | Deprecated, massive bundle (66KB), mutable API, maintenance mode | date-fns (modular, immutable) or Luxon (if need built-in tz/i18n) |
| Create React App (CRA) | No longer maintained, no SSR, no built-in routing, outdated tooling | Next.js (industry standard, SSR/SSG, routing, API routes) |
| Jest (new projects) | Slower than Vitest, no native Vite integration, requires transform config | Vitest (Vite-native, faster, official Next.js recommendation) |
| CSS Modules (alone) | Verbose, no design system, hard to maintain consistent spacing/colors | Tailwind CSS (design tokens, utility-first, industry standard 2026) |
| Styled Components | Runtime CSS-in-JS overhead, larger bundle, hydration issues, slower | Tailwind CSS + shadcn/ui (zero-runtime, smaller bundle, faster) |
| Express.js (for API) | Separate server needed, more infrastructure, deployment complexity | Next.js API Routes / Route Handlers (built-in, serverless-ready) |
| MongoDB (for this use case) | Not ideal for complex relational data (85K orgs, eligibility rules, many-to-many) | PostgreSQL (ACID, relational integrity, complex queries, proven at scale) |
| Firebase | Vendor lock-in, NoSQL limitations for complex queries, pricing unpredictable | Supabase (open-source, PostgreSQL, more control, clearer pricing) |
| client-side routing only | Poor SEO, slow initial load, not suitable for public-facing resource platform | Next.js App Router (SSR, SSG, SEO-friendly, faster initial load) |

## Stack Patterns by Use Case

**For screening questionnaire:**
- Zustand for multi-step form state (persistent across steps)
- React Hook Form + Zod for per-step validation
- TanStack Query for fetching eligibility rules
- LocalStorage persistence via Zustand middleware

**For eligibility rules engine:**
- Zod schemas for rule definitions (runtime validation + TypeScript types)
- Drizzle ORM for querying rules from PostgreSQL
- JSON column in PostgreSQL for complex rule configurations
- Separate rules per state (Kentucky first, then expand)

**For data import (85K+ organizations):**
- Prisma for batch inserts (better for ETL than Drizzle)
- csv-parse for streaming large CSV files
- Zod for validating each row before insert
- Transaction batching (1000 rows per transaction)
- Progress tracking with job queue

**For search (organizations, programs):**
- PostgreSQL full-text search (ts_vector, ts_rank) for keyword search
- pgvector for semantic similarity search ("find similar programs")
- Hybrid search: combine full-text + vector similarity
- TanStack Query for client-side caching of search results

**For authentication:**
- Supabase Auth with email/password + social login (Google)
- Row-Level Security (RLS) for data authorization
- auth.uid() in RLS policies for user-specific data
- Separate roles: veteran, caregiver, admin (role column + RLS)

**For accessibility (WCAG 2.1 AA):**
- shadcn/ui components (WCAG 2.2 AA out-of-box)
- Tailwind sr-only for screen reader text
- Focus management with Radix UI primitives
- Playwright + axe-core in CI for automated a11y testing
- Manual testing for remaining 70% of a11y issues

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.x | React 19 is minimum required version for Next.js 15+ |
| Next.js 16.x | Node.js 22.x | Node 22 LTS is default on Vercel, required for Next.js 16 |
| React Hook Form | Zod + @hookform/resolvers | Use zodResolver from @hookform/resolvers |
| Drizzle ORM | PostgreSQL 15+ | Full support for Supabase PostgreSQL |
| TanStack Query 5.x | React 19.x | v5 renamed isLoading to isPending |
| Vitest | React Testing Library | Use @vitejs/plugin-react + jsdom |
| Playwright | @axe-core/playwright | Use AxeBuilder.withTags(['wcag2aa']) for WCAG 2.1 AA |
| shadcn/ui | Radix UI + Tailwind 4.x | Requires Tailwind CSS 4.x, React 19, Radix UI latest |
| Biome 2.3+ | TypeScript 5.8 | Type-aware linting requires TypeScript 5.0+ |
| date-fns | date-fns-tz | Pair together for complete date/time + timezone solution |
| Supabase | @supabase/ssr 0.5.x | Required for Next.js App Router SSR support |

## Sources

### Official Documentation (HIGH confidence)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) - Turbopack, React Compiler, features
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15) - React 19 support, App Router
- [TypeScript 5.8 Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) - Latest features
- [Supabase Documentation](https://supabase.com/docs/guides/database/overview) - Database, Auth, Storage
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) - Component library, accessibility
- [Vercel Next.js Support](https://vercel.com/docs/frameworks/full-stack/nextjs) - Deployment, Node.js versions
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing) - axe-core integration
- [TanStack Query v5](https://tanstack.com/query/latest) - React Query features, Supabase integration
- [Biome Documentation](https://biomejs.dev/) - Linting, formatting, performance

### Web Search - Verified (MEDIUM confidence)
- [Next.js Best Practices 2026](https://www.serviots.com/blog/nextjs-development-best-practices) - Production patterns
- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Zustand vs Redux vs Context
- [Drizzle vs Prisma 2026](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) - ORM comparison
- [React Hook Form + Zod Guide 2026](https://practicaldev.online/blog/reactjs/react-hook-form-zod-validation-guide) - Form validation patterns
- [Biome vs ESLint 2026](https://pockit.tools/blog/biome-eslint-prettier-migration-guide/) - Migration guide
- [WCAG Compliance with shadcn/ui](https://blog.logrocket.com/shadcn-ui-adoption-guide/) - Accessibility features
- [Supabase Row Level Security 2026](https://designrevision.com/blog/supabase-row-level-security) - RLS guide
- [TypeScript for ETL Pipelines](https://blog.logrocket.com/use-typescript-instead-python-etl-pipelines/) - Data import patterns
- [Tailwind CSS Best Practices 2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) - Design systems
- [GitHub Actions CI/CD Next.js](https://ayyaztech.com/blog/auto-deploy-nextjs-with-github-actions-complete-cicd-guide-2025) - Deployment automation

### Community Resources (MEDIUM confidence)
- [NYC Benefits Platform Eligibility API](https://digitalgovernmenthub.org/examples/nyc-benefits-platform-eligibility-screening-api/) - Rule-based eligibility patterns
- [date-fns vs Luxon vs Day.js](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) - Date library comparison
- [PostHog GDPR Compliance](https://userpilot.com/blog/posthog-analytics/) - Privacy-focused analytics
- [Resend + React Email](https://mikebifulco.com/newsletter/tools-i-love-resend-react-email) - Email patterns

---
*Stack research for: Veteran Resource Management Platform*
*Researched: 2026-02-15*
*Next steps: Review FEATURES.md, ARCHITECTURE.md, and PITFALLS.md for roadmap planning*
