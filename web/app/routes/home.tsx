import { Link } from "react-router";
import { getUserFromRequest } from "../lib/auth";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) return { user };
  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const user = loaderData?.user;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <Navbar user={user} />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center max-w-2xl mx-auto gap-4">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-tight">
          Healthcare appointments,
          <br />
          <span className="text-blue-500">simplified.</span>
        </h1>
        <p className="text-slate-400 text-baseS">
          Doc Connect connects patients, doctors, and administrators in one
          place — making appointment booking and management effortless.
        </p>
        <Link
          to="/register"
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full px-6 py-2.5 text-sm transition-colors"
        >
          Book your first appointment
        </Link>
      </main>

      {/* Feature cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8 pb-16 max-w-4xl mx-auto w-full">
        {[
          {
            role: "Patients",
            color: "bg-blue-50 border-blue-100",
            accent: "text-blue-500",
            description:
              "Book appointments by department, flag emergencies, and track your appointment status in real time.",
          },
          {
            role: "Doctors",
            color: "bg-slate-50 border-slate-100",
            accent: "text-slate-600",
            description:
              "View your assigned appointments, update statuses, and mark consultations as completed.",
          },
          {
            role: "Admins",
            color: "bg-slate-50 border-slate-100",
            accent: "text-slate-600",
            description:
              "Full oversight — manage patients, doctors, assign appointments, and keep everything running smoothly.",
          },
        ].map(({ role, color, accent, description }) => (
          <div key={role} className={`border rounded-2xl p-5 ${color}`}>
            <p
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${accent}`}
            >
              {role}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
