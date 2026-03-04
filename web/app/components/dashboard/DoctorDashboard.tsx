import { Form, useNavigation, useActionData } from "react-router";
import { useState } from "react";
import { CalendarClock, User, Stethoscope, AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { Doctor, Appointment } from "../../lib/types";

const statusConfig: Record<Appointment["status"], { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-amber/10 text-amber" },
  assigned:  { label: "Assigned",  classes: "bg-blue-50 text-blue-600" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-warm-subtle text-warm-muted" },
};

const doctorStatusConfig: Record<NonNullable<Doctor["status"]>, { label: string; dot: string; classes: string }> = {
  available: { label: "Available",       dot: "bg-green-500",  classes: "bg-green-50 text-green-700 border-green-200" },
  busy:      { label: "Busy",            dot: "bg-amber",      classes: "bg-amber/10 text-amber border-amber/20" },
  dnd:       { label: "Do not disturb",  dot: "bg-red-400",    classes: "bg-red-50 text-red-600 border-red-200" },
};

const inputClass =
  "w-full bg-warm-subtle/40 border border-warm-subtle hover:border-warm-muted/40 rounded-xl px-3.5 py-2.5 text-sm text-warm-dark placeholder:text-warm-muted/50 focus:outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/10 transition-all duration-200";

const labelClass = "text-[0.7rem] font-medium text-warm-muted uppercase tracking-[0.08em]";

type Tab = "appointments" | "profile";

export default function DoctorDashboard({
  user,
  appointments,
}: {
  user: Doctor;
  appointments: Appointment[];
}) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const isSubmitting = navigation.state === "submitting";
  const [tab, setTab] = useState<Tab>("appointments");
  const [showArchived, setShowArchived] = useState(false);
  const currentStatus = user.status ?? "available";

  const active = appointments.filter((a) => a.status !== "completed" && a.status !== "cancelled");
  const archived = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-warm-subtle/40 border border-warm-subtle rounded-full p-1 self-start">
        {(["appointments", "profile"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-[0.8125rem] font-medium px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer capitalize ${
              tab === t ? "bg-warm-dark text-cream shadow-sm" : "text-warm-muted hover:text-warm-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "appointments" && (
        <div className="flex flex-col gap-6">
          {/* Status switcher */}
          <div className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Your status</span>
              <span className={`inline-flex items-center gap-1.5 text-[0.75rem] font-medium px-2.5 py-0.5 rounded-full border self-start ${doctorStatusConfig[currentStatus].classes}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${doctorStatusConfig[currentStatus].dot}`} />
                {doctorStatusConfig[currentStatus].label}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {(Object.keys(doctorStatusConfig) as NonNullable<Doctor["status"]>[]).map((s) =>
                s !== currentStatus && (
                  <Form key={s} method="post">
                    <input type="hidden" name="intent" value="updateStatus" />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-[0.75rem] text-warm-muted hover:text-warm-dark border border-warm-subtle hover:border-warm-muted/40 rounded-full px-3 py-1 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {doctorStatusConfig[s].label}
                    </button>
                  </Form>
                )
              )}
            </div>
          </div>

          {/* Active appointments */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock size={15} strokeWidth={1.75} className="text-warm-muted" />
              <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">Upcoming appointments</h2>
              {active.length > 0 && (
                <span className="text-[0.6875rem] font-medium text-warm-muted bg-warm-subtle px-2 py-0.5 rounded-full">
                  {active.length}
                </span>
              )}
            </div>

            {active.length === 0 ? (
              <div className="bg-cream border border-warm-subtle rounded-2xl px-6 py-10 text-center">
                <p className="text-[0.8125rem] font-light text-warm-muted">No upcoming appointments.</p>
              </div>
            ) : (
              active.map((a) => (
                <div
                  key={a._id}
                  className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.9375rem] font-medium text-warm-dark">{a.patientId.name}</span>
                    <span className="text-[0.75rem] text-warm-muted font-light flex items-center gap-1">
                      <Stethoscope size={11} strokeWidth={2} />
                      {a.department}
                    </span>
                    <span className="text-[0.75rem] text-warm-muted font-light">
                      {new Date(a.appointmentTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      {" · "}
                      {new Date(a.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {a.emergency && (
                      <span className="flex items-center gap-1 text-[0.6875rem] bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} strokeWidth={2.5} />
                        Emergency
                      </span>
                    )}
                    <span className={`text-[0.6875rem] font-medium px-2.5 py-0.5 rounded-full ${statusConfig[a.status].classes}`}>
                      {statusConfig[a.status].label}
                    </span>
                    <Form method="post">
                      <input type="hidden" name="intent" value="completeAppointment" />
                      <input type="hidden" name="appointmentId" value={a._id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 text-[0.75rem] bg-green-50 hover:bg-green-100 text-green-700 font-medium border border-green-200 rounded-full px-3 py-1 transition-all duration-200 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle size={12} strokeWidth={2} />
                        Mark complete
                      </button>
                    </Form>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Archived */}
          {archived.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-1.5 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer self-start"
              >
                {showArchived ? <ChevronDown size={13} strokeWidth={2} /> : <ChevronRight size={13} strokeWidth={2} />}
                {showArchived ? "Hide" : "Show"} archived ({archived.length})
              </button>
              {showArchived &&
                archived.map((a) => (
                  <div
                    key={a._id}
                    className="bg-warm-subtle/30 border border-warm-subtle rounded-2xl px-5 py-4 flex items-start justify-between gap-4 opacity-60"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium text-warm-dark">{a.patientId.name}</span>
                      <span className="text-[0.75rem] text-warm-muted font-light">{a.department}</span>
                      <span className="text-[0.75rem] text-warm-muted font-light">
                        {new Date(a.appointmentTime).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}
                        {new Date(a.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className={`text-[0.6875rem] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${statusConfig[a.status].classes}`}>
                      {statusConfig[a.status].label}
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="bg-cream border border-warm-subtle rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} strokeWidth={1.75} className="text-amber" />
            <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">Profile settings</h2>
          </div>
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="updateProfile" />
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
                {actionData.error}
              </div>
            )}
            {actionData?.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
                {actionData.success}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input id="name" name="name" type="text" defaultValue={user.name} required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" name="email" type="email" defaultValue={user.email} required className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="specialization" className={labelClass}>Specialization</label>
              <select id="specialization" name="specialization" defaultValue={user.specialization} required className={inputClass}>
                {["General Medicine","Cardiology","Neurology","Orthopedics","Dermatology","Pediatrics"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>
                New password{" "}
                <span className="text-warm-muted/40 normal-case tracking-normal">(leave blank to keep current)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start mt-1 bg-warm-dark hover:bg-warm-mid disabled:opacity-50 disabled:cursor-not-allowed text-cream font-medium rounded-full px-5 py-2 text-[0.8125rem] transition-all duration-200 hover:-translate-y-px cursor-pointer"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}
