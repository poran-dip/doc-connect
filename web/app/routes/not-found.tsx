import { Link, useNavigate } from "react-router";
import { getUserFromRequest } from "../lib/auth";
import type { Route } from "./+types/not-found";
import Navbar from "../components/Navbar";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  return { user };
}

export default function NotFound({ loaderData }: Route.ComponentProps) {
  const user = loaderData?.user;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
        <p className="text-6xl font-bold text-blue-500">404</p>
        <h1 className="text-xl font-semibold text-slate-700 tracking-tight">Page not found</h1>
        <p className="text-sm text-slate-400 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center gap-2 mt-2">
          {user ? (
            <>
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-slate-500 hover:text-blue-500 transition-colors px-3 py-1.5 cursor-pointer"
              >
                ← Go back
              </button>
              <Link to="/dashboard" className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-4 py-1.5 transition-colors">
                Dashboard
              </Link>
            </>
          ) : (
            <Link to="/" className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-4 py-1.5 transition-colors">
              Back to home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
