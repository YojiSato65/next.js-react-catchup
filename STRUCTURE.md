# Project Structure Guide

## Directory Organization

```
src/
├── app/                    # Next.js App Router
│   └── tasks/             # Task routes
├── components/            # Reusable React components
│   ├── ui/               # Base UI components (Button, Badge, etc.)
│   └── forms/            # Form components
├── lib/                   # Utilities and shared logic
│   ├── schema/           # Zod schemas for validation
│   └── fetchers/         # Data fetching functions
└── tests/                 # Test files
    ├── unit/             # Unit tests
    └── component/        # Component tests
```

## Key Principles

### Schema-First Design
- All domain models are defined in `lib/schema/` using Zod
- Schemas are single source of truth for validation
- Used on both client and server sides

### Server Components by Default
- All components are Server Components unless explicitly marked with `"use client"`
- Client Components only used for:
  - Form state management (with react-hook-form)
  - Interactive UI elements
  - User event handling

### Server Actions for Mutations
- All CRUD operations use Server Actions (in `app/actions.ts`)
- No REST API endpoints
- Type-safe data flow from client to server

### Testing Strategy
- **vitest**: Unit tests for schemas and utilities
- **testing-library**: Component behavior tests
- **Storybook**: Component documentation
- **Playwright**: E2E tests (in separate `e2e/` directory)

## Setup Complete ✓

### What's Configured
- ✅ Next.js 16 with App Router
- ✅ React 19 with proper setup
- ✅ TypeScript with path aliases (@/*)
- ✅ Zod for schema validation
- ✅ react-hook-form for form handling
- ✅ Tailwind CSS & daisyUI for styling
- ✅ vitest for testing
- ✅ Directory structure ready for development

## Getting Started

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Run tests: `npm test`
4. Run linter: `npm run lint`

## Next Steps

- Issue #6: Configure Tailwind CSS and daisyUI
- Issue #7: Configure testing environment
- Issue #8: Setup Prisma with SQLite
- Issue #9: Define Task schema with Prisma
