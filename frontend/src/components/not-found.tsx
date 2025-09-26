import { Link } from '@tanstack/react-router'

export const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-2xl bg-background p-10 shadow-lg sm:p-12">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Error
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            404
          </h1>
        </div>
        <p className="max-w-md text-base text-muted-foreground sm:text-lg">
          The page you were looking for doesn't exist or might have been moved.
          Double-check the URL or head back to the start.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Return home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-md border border-input px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
