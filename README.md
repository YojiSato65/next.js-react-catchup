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

---

## 2️⃣ Server Actions & Revalidation

- `revalidatePath`
- `revalidateTag`
- Mutation flow design
- Cache invalidation strategies for CRUD

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
