import { Link } from "react-router";
import { LogIn, LayoutDashboard } from "lucide-react";
import type { User } from "../lib/types";

export default function Navbar({ user }: { user: User | null | undefined }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 bg-cream/85 backdrop-blur-md border-b border-warm-subtle/40">
      <Link
        to="/"
        className="flex items-center gap-2.5 font-serif text-[1.35rem] text-warm-dark tracking-tight no-underline"
      >
        <img src="/logo.svg" alt="Doc Connect" className="h-6 w-auto" />
        Doc Connect
      </Link>

      <div className="flex items-center gap-1">
        {user ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-cream bg-warm-dark hover:bg-warm-mid px-4 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-px no-underline"
          >
            <LayoutDashboard size={13} strokeWidth={2} />
            Open app
          </Link>
        ) : (
          <>
            <Link
              to="/signin"
              className="flex items-center gap-1.5 text-[0.8125rem] text-warm-muted hover:text-warm-dark hover:bg-black/5 px-3.5 py-1.5 rounded-full transition-all duration-200 no-underline"
            >
              <LogIn size={13} strokeWidth={2} />
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-[0.8125rem] font-medium text-cream bg-warm-dark hover:bg-warm-mid px-4 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-px no-underline"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
