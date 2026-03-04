import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/signin";
import { getUserFromRequest } from "../lib/auth";

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
    const res = await fetch(`${process.env.API_URL ?? "http://localhost:3000"}/api/auth/signin`, {
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

export default function Signin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">Doc Connect</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sign in to your account</p>
        </div>

        <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 transition-colors mb-4">
          ← Back to home
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <Form method="post" className="flex flex-col gap-3">
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                {actionData.error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-slate-500">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-medium text-slate-500">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full py-2 text-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </Form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-4">
          New to Doc Connect?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
