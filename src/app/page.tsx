import { Button } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100">
      <div className="flex flex-col items-center justify-center pt-20 px-4">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Next.js React Catch-Up
        </h1>
        <p className="text-xl text-base-content/70 mb-8 text-center max-w-2xl">
          A hands-on learning project to master modern full-stack development
          with Next.js 16, React 19, and Server Components.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            View Docs
          </Button>
        </div>

        {/* Feature showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title text-lg">🎯 Schema-First</h2>
              <p>Single source of truth for validation with Zod</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title text-lg">⚡ Server Actions</h2>
              <p>Type-safe mutations without REST APIs</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title text-lg">🧪 Testing</h2>
              <p>vitest, testing-library, and E2E coverage</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
