import { Link } from "react-router";
import type { User } from "../lib/types";

export default function Navbar({ user }: { user: User | null | undefined }) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
      <Link to="/" className="text-blue-600 font-bold text-lg tracking-tight">Doc Connect</Link>
      <div className="flex items-center gap-2">
        {user ? (
          <Link to="/dashboard" className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-4 py-1.5 transition-colors">
            Open app
          </Link>
        ) : (
          <>
            <Link to="/signin" className="text-sm text-slate-500 hover:text-blue-500 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link to="/register" className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-4 py-1.5 transition-colors">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
