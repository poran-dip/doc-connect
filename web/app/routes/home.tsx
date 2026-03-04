import { Link } from "react-router";
import { CalendarCheck, Stethoscope, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { getUserFromRequest } from "../lib/auth";
import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) return { user };
  return null;
}

const cards = [
  {
    n: "01",
    role: "Patients",
    icon: <CalendarCheck size={18} strokeWidth={1.75} />,
    description: "Book by department, flag emergencies, and track your appointment status from request to completion.",
  },
  {
    n: "02",
    role: "Doctors",
    icon: <Stethoscope size={18} strokeWidth={1.75} />,
    description: "Review your schedule, update appointment statuses, and mark consultations complete — all in one view.",
  },
  {
    n: "03",
    role: "Admins",
    icon: <ShieldCheck size={18} strokeWidth={1.75} />,
    description: "Full oversight of patients, doctors, and assignments. Keep every moving part running smoothly.",
  },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const user = loaderData?.user;

  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-hidden">
      {/* Background radial tints */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(196,121,58,0.07),transparent_60%)] z-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_50%_40%_at_-10%_80%,rgba(180,150,100,0.06),transparent_50%)] z-0" />

      <Navbar user={user} />

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <img
          src="/logo.svg"
          alt="Doc Connect"
          className="h-14 w-auto mb-5 opacity-90 animate-fade-up"
        />

        <span
          className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium tracking-[0.12em] uppercase text-amber border border-amber/25 bg-amber/6 rounded-full px-3.5 py-1.5 mb-6 animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <Sparkles size={11} strokeWidth={2} />
          Healthcare made simple
        </span>

        <h1
          className="font-serif text-[clamp(2.8rem,6vw,4.5rem)] font-normal text-warm-dark leading-[1.1] tracking-[-0.02em] max-w-xl mb-5 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          Your appointments,<br />
          <em className="italic text-amber">effortlessly</em> managed.
        </h1>

        <p
          className="text-[0.9375rem] font-light text-warm-muted max-w-sm leading-relaxed mb-9 animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          Doc Connect brings patients, doctors, and administrators together — booking and managing healthcare visits has never felt this smooth.
        </p>

        <div
          className="flex items-center gap-3.5 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 text-sm font-medium text-cream bg-warm-dark hover:bg-warm-mid px-6 py-3 rounded-full shadow-[0_2px_12px_rgba(26,23,20,0.18)] hover:shadow-[0_6px_20px_rgba(26,23,20,0.22)] hover:-translate-y-0.5 transition-all duration-200 no-underline"
          >
            Book your first appointment
            <ArrowRight size={14} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/signin"
            className="text-sm text-warm-muted hover:text-warm-dark px-2 py-3 transition-colors duration-200 no-underline"
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* Feature cards */}
      <section className="relative z-10 grid grid-cols-1 sm:grid-cols-3 border-t border-b border-warm-subtle">
        {cards.map(({ n, role, icon, description }, i) => (
          <div
            key={role}
            className={`group bg-cream hover:bg-amber-light/40 px-8 py-9 relative transition-colors duration-200 ${i < cards.length - 1 ? "sm:border-r border-warm-subtle" : ""}`}
          >
            {/* Top accent line on hover */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-amber transition-colors duration-300" />

            <p className="font-serif text-xs italic text-amber/70 mb-5">{n}</p>
            <div className="flex items-center gap-2 mb-3 text-amber">
              {icon}
              <p className="font-serif text-[1.35rem] font-normal text-warm-dark tracking-[-0.01em]">{role}</p>
            </div>
            <p className="text-[0.8125rem] font-light text-warm-muted leading-[1.75]">{description}</p>
          </div>
        ))}
      </section>

      <footer className="relative z-10 flex items-center justify-center py-6">
        <span className="text-xs text-warm-muted/50 tracking-wide">© {(new Date()).getFullYear()} Doc Connect · All rights reserved</span>
      </footer>
    </div>
  );
}
