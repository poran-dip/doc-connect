import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  },
  { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "shortcut icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Doc Connect — simple appointment booking for patients, doctors, and hospitals." />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-title" content="DocConnect" />
        <meta property="og:title" content="Doc Connect" />
        <meta property="og:description" content="Simple appointment booking for patients, doctors, and hospitals." />
        <meta property="og:type" content="website" />
        <title>Doc Connect</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? error.status === 404 ? "404 — Page not found" : error.statusText
    : error instanceof Error ? error.message : "Something went wrong";

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-semibold">{isNotFound ? "404" : "Error"}</h1>
      <p className="text-muted-foreground">{message}</p>
      {import.meta.env.DEV && error instanceof Error && error.stack && (
        <pre className="mt-4 w-full max-w-2xl rounded-lg bg-muted p-4 text-sm overflow-x-auto">
          {error.stack}
        </pre>
      )}
    </main>
  );
}
