import { Form, useNavigation, useActionData } from "react-router";
import { useState } from "react";
import type { Doctor, Appointment } from "../../lib/types";

const statusColors: Record<Appointment["status"], string> = {
  pending: "bg-yellow-50 text-yellow-600",
  assigned: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const doctorStatusConfig = {
  available: {
    label: "Available",
    classes: "bg-green-50 text-green-600 border-green-200",
  },
  busy: {
    label: "Busy",
    classes: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  dnd: {
    label: "Do not disturb",
    classes: "bg-red-50 text-red-600 border-red-200",
  },
};

const specializations = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
];

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

  const active = appointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled",
  );
  const archived = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled",
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 self-start">
        {(["appointments", "profile"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer capitalize ${
              tab === t
                ? "bg-blue-500 text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "appointments" && (
        <div className="flex flex-col gap-6">
          {/* Status switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-slate-500">
                Your status
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border self-start ${doctorStatusConfig[currentStatus].classes}`}
              >
                {doctorStatusConfig[currentStatus].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(Object.keys(doctorStatusConfig) as Doctor["status"][]).map(
                (s) =>
                  s !== currentStatus && (
                    <Form key={s} method="post">
                      <input type="hidden" name="intent" value="updateStatus" />
                      <input type="hidden" name="status" value={s} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs text-slate-400 hover:text-blue-500 border border-slate-200 hover:border-blue-300 rounded-full px-3 py-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {doctorStatusConfig[s].label}
                      </button>
                    </Form>
                  ),
              )}
            </div>
          </div>

          {/* Active appointments */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Upcoming appointments
            </h2>
            {active.length === 0 ? (
              <p className="text-sm text-slate-400">
                No upcoming appointments.
              </p>
            ) : (
              active.map((a) => (
                <div
                  key={a._id}
                  className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-slate-700">
                      {a.patientId.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {a.department}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(a.appointmentTime).toLocaleDateString()} ·{" "}
                      {new Date(a.appointmentTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.emergency && (
                      <span className="text-xs bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full">
                        Emergency
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[a.status]}`}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="intent"
                        value="completeAppointment"
                      />
                      <input type="hidden" name="appointmentId" value={a._id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-xs bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold rounded-full px-3 py-1 transition-colors cursor-pointer"
                      >
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
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer self-start"
              >
                <span>{showArchived ? "▾" : "▸"}</span>
                {showArchived ? "Hide" : "Show"} archived ({archived.length})
              </button>
              {showArchived &&
                archived.map((a) => (
                  <div
                    key={a._id}
                    className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-start justify-between gap-4 opacity-60"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-600">
                        {a.patientId.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {a.department}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(a.appointmentTime).toLocaleDateString()} ·{" "}
                        {new Date(a.appointmentTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${statusColors[a.status]}`}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Profile settings
          </h2>
          <Form method="post" className="flex flex-col gap-3">
            <input type="hidden" name="intent" value="updateProfile" />
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                {actionData.error}
              </div>
            )}
            {actionData?.success && (
              <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-3 py-2 text-sm">
                {actionData.success}
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-xs font-medium text-slate-500"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-500"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="specialization"
                className="text-xs font-medium text-slate-500"
              >
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                defaultValue={user.specialization}
                required
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              >
                {[
                  "General Medicine",
                  "Cardiology",
                  "Neurology",
                  "Orthopedics",
                  "Dermatology",
                  "Pediatrics",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-500"
              >
                New password{" "}
                <span className="text-slate-300">
                  (leave blank to keep current)
                </span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start mt-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}
