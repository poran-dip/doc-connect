import { Form, Link } from "react-router";
import type { User } from "../lib/types";

const roleBadge: Record<string, string> = {
  Patient: "bg-amber/10 text-amber",
  Doctor:  "bg-green-100 text-green-700",
  Admin:   "bg-warm-subtle text-warm-muted",
};

export default function DashboardNavbar({ user }: { user: User }) {
  return (
    <nav className="flex items-center justify-between px-8 h-14 border-b border-warm-subtle/60 bg-cream/90 backdrop-blur-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <img src="/logo.svg" alt="Doc Connect" className="h-5 w-auto" />
        <span className="font-serif text-[1.1rem] text-warm-dark tracking-tight">Doc Connect</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] text-warm-muted">{user.name}</span>
          <span
            className={`text-[0.6875rem] font-medium px-2 py-0.5 rounded-full ${roleBadge[user.role] ?? "bg-warm-subtle text-warm-muted"}`}
          >
            {user.role}
          </span>
        </div>

        <div className="w-px h-4 bg-warm-subtle" />

        <Form method="post" action="/signout">
          <button
            type="submit"
            className="text-[0.8125rem] text-warm-muted hover:text-red-500 transition-colors duration-200 cursor-pointer"
          >
            Sign out
          </button>
        </Form>
      </div>
    </nav>
  );
}
