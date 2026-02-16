# Next.js App Router Catch-up Project

A hands-on learning project to deeply understand **Next.js 16 App Router**,  
**React 19**, and the internal caching mechanisms while building a realistic CRUD application.

This project focuses on mastering practical, production-level patterns rather than just API usage.

---

# 🎯 Goal

The purpose of this project is to:

- Understand the **4 caching layers in Next.js**
- Design proper **Server Action mutation + revalidation strategies**
- Apply **React 19 features** in real-world scenarios
- Implement validated forms using **zod + react-hook-form**
- Build testable architecture with **Vitest, Testing Library, and Playwright**
- Document architectural decisions clearly

This is not a demo project.  
It is a **cache-aware full-stack design exercise**.

---

# 🏗 Application Overview

## Team Task Board (Local-first version)

A minimal task management application supporting:

- Create / Read / Update / Delete tasks
- Task status updates (Todo → Doing → Done)
- Filtering via search parameters
- Task detail page
- Optimistic UI updates
- Cache invalidation after mutations

---

# 🧠 What This Project Demonstrates

## 1️⃣ Next.js Caching Architecture

This project explicitly experiments with and documents:

- **Request Memoization**
- **Data Cache**
- **Full Route Cache**
- **Router Cache**

Each layer is intentionally observed and documented.

### Revalidate vs `cache: "no-store"`

- Visit `/tasks` to see the “Cache Strategy Comparison” panel added for Issue #17.
- The left card shows the cached response served by `next.revalidate` (currently 15 s).
- The right card issues the same query with `cache: "no-store"`, forcing a new fetch on every render.
- Refresh within the TTL to see the revalidate timestamp stay stable while the no-store timestamp updates immediately.

---

## 2️⃣ Server Actions & Revalidation

- `revalidatePath`
- `revalidateTag`
- Mutation flow design
- Cache invalidation strategies for CRUD

### Create Task Server Action (Issue #18)

- The `/tasks/new` form submits through a Server Action (`createTask`).
- Inputs are validated with `CreateTaskSchema`, and field errors are surfaced via `useActionState` without a full client mutation layer.
- Successful submissions revalidate both `/tasks` and `/api/cache/tasks` so the memoized + data-cache demo stays accurate before redirecting to the new task detail page.

### Update Task Server Action (Issue #19)

- Visit `/tasks/[id]/edit` to load the edit form that hydrates initial values server-side.
- The form posts to the `updateTask` Server Action, which validates via `UpdateTaskSchema`, updates the record, and revalidates `/tasks`, `/api/cache/tasks`, and the specific task detail route.
- Optimistic UX: after the mutation succeeds, users are redirected back to the task detail view reflecting the latest data.

### Delete Task Server Action (Issue #20)

- Delete buttons on both the task list and task detail page submit tiny forms pointing to the `deleteTask` Server Action.
- The action extracts the `taskId`, deletes through `TaskRepository`, and revalidates `/tasks`, `/api/cache/tasks`, and the deleted task’s detail path before redirecting back to `/tasks`.
- Because it revalidates the cached API endpoint, the data-cache demo immediately reflects the removal even if the TTL hasn’t expired.

---

## 3️⃣ React 19 Features

- `use()` hook
- Suspense boundaries
- Streaming behavior
- Optimistic UI

---

## 4️⃣ Validation & Forms

- Shared schema with `zod`
- `react-hook-form` integration
- Server-side validation consistency

---

## 5️⃣ Testing Strategy

- Unit tests (Vitest)
- Component tests (Testing Library)
- E2E tests (Playwright)
- Cache behavior verification

---

# 🗂 Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + daisyUI
- Prisma + SQLite
- zod
- react-hook-form
- Vitest
- Testing Library
- Playwright

---

# 📐 Architecture Philosophy

This project prioritizes:

- Clear separation of read vs write paths
- Explicit cache strategy per route
- Predictable mutation + revalidation flow
- Testable domain logic
- Documentation of design decisions

---

# 🚀 Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

---

# 🧩 Run tests:

```bash
npm run test
npm run test:e2e
```
