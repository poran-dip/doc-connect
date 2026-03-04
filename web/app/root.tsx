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
    href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon-96x96.png",
    sizes: "96x96",
  },
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
        <meta
          name="description"
          content="Doc Connect — simple appointment booking for patients, doctors, and hospitals."
        />
        <meta name="theme-color" content="#1a1714" />
        <meta name="apple-mobile-web-app-title" content="DocConnect" />
        <meta property="og:title" content="Doc Connect" />
        <meta
          property="og:description"
          content="Simple appointment booking for patients, doctors, and hospitals."
        />
        <meta property="og:type" content="website" />
        <title>Doc Connect</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-cream text-warm-dark antialiased">
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
    ? error.status === 404
      ? "404 — Page not found"
      : error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong";

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="font-serif text-[6rem] leading-none text-warm-subtle select-none">
        {isNotFound ? "404" : "!"}
      </p>
      <h1 className="font-serif text-[1.5rem] text-warm-dark tracking-tight">
        {isNotFound ? "Page not found" : "Something went wrong"}
      </h1>
      <p className="text-[0.8125rem] font-light text-warm-muted max-w-xs leading-relaxed">
        {message}
      </p>
      {import.meta.env.DEV && error instanceof Error && error.stack && (
        <pre className="mt-4 w-full max-w-2xl rounded-xl bg-warm-subtle/60 border border-warm-subtle px-5 py-4 text-xs text-warm-muted overflow-x-auto text-left">
          {error.stack}
        </pre>
      )}
    </main>
  );
}
