import { Form } from "react-router";
import type { User } from "../lib/types";

const roleColors = {
  Patient: "text-blue-500",
  Doctor: "text-green-600",
  Admin: "text-orange-500",
};

export default function DashboardNavbar({ user }: { user: User }) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
      <div className="flex flex-col">
        <span className="text-blue-600 font-bold text-lg tracking-tight leading-tight">Doc Connect</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">{user.name}</span>
          <span className="text-slate-300 text-xs">·</span>
          <span className={`text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
        </div>
      </div>
      <Form method="post" action="/signout">
        <button type="submit" className="text-sm text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
          Sign out
        </button>
      </Form>
    </nav>
  );
}
