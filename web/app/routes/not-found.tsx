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
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-2">
        <p className="font-serif text-[7rem] leading-none text-warm-subtle tracking-tight select-none mb-2">
          404
        </p>
        <h1 className="font-serif text-[1.5rem] text-warm-dark tracking-tight leading-tight">
          Page not found
        </h1>
        <p className="text-[0.8125rem] font-light text-warm-muted max-w-65 leading-relaxed mt-1">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center gap-2 mt-5">
          {user ? (
            <>
              <button
                onClick={() => navigate(-1)}
                className="text-[0.8125rem] text-warm-muted hover:text-warm-dark transition-colors px-3 py-1.5 cursor-pointer"
              >
                ← Go back
              </button>
              <Link
                to="/dashboard"
                className="text-[0.8125rem] font-medium text-cream bg-warm-dark hover:bg-warm-mid px-4 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-px no-underline"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="text-[0.8125rem] font-medium text-cream bg-warm-dark hover:bg-warm-mid px-4 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-px no-underline"
            >
              Back to home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
