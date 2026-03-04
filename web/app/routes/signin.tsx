import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/signin";
import { getUserFromRequest } from "../lib/auth";
import { API_URL } from "~/lib/server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

  try {
    const res = await fetch(`${API_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error ?? "Sign in failed" };
    }

    const setCookie = res.headers.get("set-cookie");
    return redirect("/dashboard", {
      headers: setCookie ? { "Set-Cookie": setCookie } : {},
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Sign in failed" };
  }
}

const inputClass =
  "w-full bg-warm-subtle/40 border border-warm-subtle hover:border-warm-muted/40 rounded-xl px-3.5 py-2.5 text-sm text-warm-dark placeholder:text-warm-muted/50 focus:outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/10 transition-all duration-200";

const labelClass = "text-[0.7rem] font-medium text-warm-muted uppercase tracking-[0.08em]";

export default function Signin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-105 shrink-0 bg-warm-dark px-12 py-14">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img src="/logo.svg" alt="Doc Connect" className="h-6 w-auto brightness-0 invert" />
          <span className="font-serif text-[1.25rem] text-cream tracking-tight">Doc Connect</span>
        </Link>
        <div>
          <p className="font-serif text-[2rem] text-cream leading-[1.2] tracking-tight mb-4">
            Welcome<br /><em className="italic text-amber">back.</em>
          </p>
          <p className="text-[0.8125rem] text-cream/50 leading-relaxed font-light">
            Your appointments, doctors, and health records — all in one place.
          </p>
        </div>
        <p className="text-[0.6875rem] text-cream/25 tracking-wide">© {(new Date()).getFullYear()} Doc Connect</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden no-underline">
            <img src="/logo.svg" alt="" className="h-6 w-auto" />
            <span className="font-serif text-[1.2rem] text-warm-dark">Doc Connect</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors mb-7 no-underline"
          >
            ← Back to home
          </Link>

          <h2 className="font-serif text-[1.75rem] text-warm-dark tracking-tight leading-tight mb-1">
            Sign in
          </h2>
          <p className="text-[0.8125rem] text-warm-muted font-light mb-8">
            Good to have you back.
          </p>

          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
                {actionData.error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>Password</label>
              <input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-warm-dark hover:bg-warm-mid disabled:opacity-50 disabled:cursor-not-allowed text-cream font-medium rounded-full py-2.5 text-sm transition-all duration-200 hover:-translate-y-px shadow-[0_2px_12px_rgba(26,23,20,0.15)] cursor-pointer"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </Form>

          <p className="text-center text-warm-muted text-[0.75rem] mt-6">
            New to Doc Connect?{" "}
            <Link to="/register" className="text-amber hover:text-amber/80 font-medium transition-colors no-underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
