import { Form, useNavigation, useActionData } from "react-router";
import { useState, useRef } from "react";
import type { Patient, Appointment } from "../../lib/types";

const statusColors: Record<Appointment["status"], string> = {
  pending: "bg-yellow-50 text-yellow-600",
  assigned: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const departments = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
];

function canEdit(a: Appointment) {
  return (
    (a.status === "pending" || a.status === "assigned") &&
    new Date(a.appointmentTime) > new Date()
  );
}

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

function CancelModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-slate-700">
            Cancel appointment
          </h3>
          <p className="text-xs text-slate-400">
            Are you sure you want to cancel this appointment? This cannot be
            undone.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-3 py-1.5"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type Tab = "appointments" | "profile";

export default function PatientDashboard({
  user,
  appointments,
}: {
  user: Patient;
  appointments: Appointment[];
}) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const isSubmitting = navigation.state === "submitting";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("appointments");
  const cancelFormRef = useRef<HTMLFormElement>(null);

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
        <div className="flex flex-col gap-8">
          {/* Book appointment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Book an appointment
            </h2>
            <Form method="post" className="flex flex-col gap-3">
              <input type="hidden" name="intent" value="book" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="department"
                    className="text-xs font-medium text-slate-500"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="appointmentTime"
                    className="text-xs font-medium text-slate-500"
                  >
                    Date & time
                  </label>
                  <input
                    id="appointmentTime"
                    name="appointmentTime"
                    type="datetime-local"
                    required
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emergency"
                  name="emergency"
                  value="true"
                  className="accent-blue-500"
                />
                <label htmlFor="emergency" className="text-xs text-slate-500">
                  Mark as emergency
                </label>
              </div>
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                  {actionData.error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="self-start bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors cursor-pointer"
              >
                {isSubmitting ? "Booking…" : "Book appointment"}
              </button>
            </Form>
          </div>

          {/* Appointments list */}
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">
              My appointments
            </h2>
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-400">No appointments yet.</p>
            ) : (
              appointments.map((a) => (
                <div
                  key={a._id}
                  className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-slate-700">
                        {a.department}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(a.appointmentTime).toLocaleDateString()} ·{" "}
                        {new Date(a.appointmentTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {a.assignedDoctor && (
                        <span className="text-xs text-slate-400">
                          Dr. {a.assignedDoctor.name} ·{" "}
                          {a.assignedDoctor.specialization}
                        </span>
                      )}
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
                      {canEdit(a) && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(editingId === a._id ? null : a._id)
                          }
                          className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {editingId === a._id ? "Close" : "Edit"}
                        </button>
                      )}
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCancellingId(a._id)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <Form
                            method="post"
                            ref={
                              cancellingId === a._id ? cancelFormRef : undefined
                            }
                            className="hidden"
                          >
                            <input type="hidden" name="intent" value="cancel" />
                            <input
                              type="hidden"
                              name="appointmentId"
                              value={a._id}
                            />
                          </Form>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === a._id && (
                    <Form
                      method="post"
                      className="flex flex-col gap-3 pt-3 border-t border-slate-100"
                      onSubmit={() => setEditingId(null)}
                    >
                      <input type="hidden" name="intent" value="edit" />
                      <input type="hidden" name="appointmentId" value={a._id} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-500">
                            Department
                          </label>
                          <select
                            name="department"
                            defaultValue={a.department}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                          >
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-slate-500">
                            Date & time
                          </label>
                          <input
                            name="appointmentTime"
                            type="datetime-local"
                            defaultValue={toDatetimeLocal(a.appointmentTime)}
                            required
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`emergency-${a._id}`}
                          name="emergency"
                          value="true"
                          defaultChecked={a.emergency}
                          className="accent-blue-500"
                        />
                        <label
                          htmlFor={`emergency-${a._id}`}
                          className="text-xs text-slate-500"
                        >
                          Mark as emergency
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer"
                        >
                          {isSubmitting ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          Discard
                        </button>
                      </div>
                    </Form>
                  )}
                </div>
              ))
            )}
          </div>
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
                htmlFor="profileAge"
                className="text-xs font-medium text-slate-500"
              >
                Age
              </label>
              <input
                id="profileAge"
                name="age"
                type="number"
                defaultValue={user.age}
                min={0}
                max={120}
                required
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
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

      {cancellingId && (
        <CancelModal
          onClose={() => setCancellingId(null)}
          onConfirm={() => {
            cancelFormRef.current?.submit();
            setCancellingId(null);
          }}
        />
      )}
    </div>
  );
}
