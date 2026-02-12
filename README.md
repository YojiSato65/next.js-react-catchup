# Next.js / React Full-Stack Catch-Up Project

## Overview

This repository is a hands-on learning project to systematically catch up on a modern full-stack architecture centered around Next.js 16 and React 19.

Rather than focusing on isolated demos, this project emphasizes:

- App Router and React Server Components (RSC) as the default architecture
- Server Actions–based data mutations
- Explicit cache strategies and data governance awareness
- Practical form handling, validation, and testing
- Being able to explain why each technology and design choice was made

## Tech Stack

### Frameworks

- Next.js 16 (App Router)
- React 19

### UI / Styling

- Tailwind CSS
- daisyUI
- emotion (used only where necessary)

### Forms / Validation

- react-hook-form
- zod

### Testing

- vitest
- @testing-library/react
- Storybook
- Playwright

## Directory Structure (excerpt)

```
app/
├── users/
│   ├── page.tsx (User list / RSC)
│   └── new/
│       └── [id]/
│           └── edit/
│               └── layout.tsx
├── actions.ts (Server Actions)
├── components/
│   ├── forms/
│   └── ui/
├── lib/
│   ├── schema (zod schemas)
│   └── fetchers
└── tests/
    ├── unit
    └── component
```

## Architectural Principles

### App Router / RSC

- Server Components are the default
- Client Components are used only when necessary:
  - Form state management
  - Interactive UI elements
  - Avoid adding "use client" without a clear reason

### Server Actions

- All CRUD operations are implemented using Server Actions
- API Routes are intentionally avoided
- Validation is handled with shared zod schemas on both client and server
- Cache revalidation is triggered via `revalidatePath` / `revalidateTag`

### Why Server Actions

- Reduce boilerplate between frontend and backend
- Enable a type-safe and straightforward data flow
- Fit naturally with the App Router and RSC model

### Cache Strategy

`fetch` caching behavior is explicitly controlled based on use cases.

| Use case                 | Cache setting         |
| ------------------------ | --------------------- |
| List pages               | `force-cache`         |
| Detail pages             | `revalidate`          |
| Admin / management pages | `no-store`            |
| After mutations          | Explicit revalidation |

**Key considerations:**

- Be able to explain why data is cached or not
- Intentionally reproduce and fix cache-related issues to deepen understanding

## Form Design

### zod

- Single source of truth for data shape and validation
- Always enforced on the server side (Server Actions)

### react-hook-form

- Handles UI state and interactions
- Integrated via `zodResolver`

**Design goals:**

- Keep validation logic out of UI components
- Ensure schema changes propagate to both client and server

## Styling Strategy

Base UI components are built with daisyUI

Layout and spacing are handled with Tailwind CSS

emotion is used only when:

- Styles depend on complex runtime state
- Tailwind becomes impractical or unreadable
- Required by external libraries

**Goal:**

Not to eliminate emotion, but to clearly justify its usage

## React 19 Highlights

- Use the `use()` hook to consume Promises directly
- Design Suspense boundaries intentionally
- Further clarify responsibilities between Server and Client Components

## Testing Strategy

Each testing tool has a clearly defined role.

### vitest

- zod schemas
- Pure business and utility logic

### testing-library

- Component behavior
- User interaction flows

### Storybook

- Isolated UI development
- Visual documentation of component states

### Playwright

- End-to-end tests from a user perspective
- Covers CRUD happy paths only

## Learning Workflow

One ticket equals roughly 0.5–1 day of work

For each ticket, explicitly document:

- Why the design was chosen
- What issues were encountered
- What could be improved next

## Future Improvements

- Authorization models (RBAC / ABAC)
- Metadata management and data catalogs
- Optimizing E2E execution in CI
- Automated performance measurement

## Goal

The ultimate goal of this repository is not just to use modern technologies, but to be able to explain and justify them in a real-world context.
