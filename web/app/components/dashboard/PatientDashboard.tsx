import { Form, useNavigation, useActionData } from "react-router";
import { useState, useRef } from "react";
import {
  CalendarPlus,
  Clock,
  Stethoscope,
  AlertTriangle,
  Pencil,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import type { Patient, Appointment } from "../../lib/types";

const statusConfig: Record<
  Appointment["status"],
  { label: string; classes: string }
> = {
  pending: { label: "Pending", classes: "bg-amber/10 text-amber" },
  assigned: { label: "Assigned", classes: "bg-blue-50 text-blue-600" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-warm-subtle text-warm-muted" },
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

const inputClass =
  "w-full bg-warm-subtle/40 border border-warm-subtle hover:border-warm-muted/40 rounded-xl px-3.5 py-2.5 text-sm text-warm-dark placeholder:text-warm-muted/50 focus:outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/10 transition-all duration-200";

const labelClass =
  "text-[0.7rem] font-medium text-warm-muted uppercase tracking-[0.08em]";

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
        className="absolute inset-0 bg-warm-dark/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-cream rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-4 flex flex-col gap-4 border border-warm-subtle">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">
            Cancel appointment
          </h3>
          <p className="text-[0.8125rem] font-light text-warm-muted leading-relaxed">
            Are you sure you want to cancel this appointment? This cannot be
            undone.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-[0.8125rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer px-3 py-1.5"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-[0.8125rem] bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-4 py-1.5 transition-all duration-200 cursor-pointer"
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
      <div className="flex items-center gap-1 bg-warm-subtle/40 border border-warm-subtle rounded-full p-1 self-start">
        {(["appointments", "profile"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-[0.8125rem] font-medium px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer capitalize ${
              tab === t
                ? "bg-warm-dark text-cream shadow-sm"
                : "text-warm-muted hover:text-warm-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "appointments" && (
        <div className="flex flex-col gap-6">
          {/* Book appointment */}
          <div className="bg-cream border border-warm-subtle rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CalendarPlus
                size={16}
                strokeWidth={1.75}
                className="text-amber"
              />
              <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">
                Book an appointment
              </h2>
            </div>
            <Form method="post" className="flex flex-col gap-4">
              <input type="hidden" name="intent" value="book" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="department" className={labelClass}>
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className={inputClass}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="appointmentTime" className={labelClass}>
                    Date & time
                  </label>
                  <input
                    id="appointmentTime"
                    name="appointmentTime"
                    type="datetime-local"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer self-start">
                <input
                  type="checkbox"
                  name="emergency"
                  value="true"
                  className="accent-amber w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1.5 text-[0.8125rem] text-warm-muted">
                  <AlertTriangle
                    size={13}
                    strokeWidth={2}
                    className="text-red-400"
                  />
                  Mark as emergency
                </span>
              </label>
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
                  {actionData.error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="self-start bg-warm-dark hover:bg-warm-mid disabled:opacity-50 disabled:cursor-not-allowed text-cream font-medium rounded-full px-5 py-2 text-[0.8125rem] transition-all duration-200 hover:-translate-y-px cursor-pointer"
              >
                {isSubmitting ? "Booking…" : "Book appointment"}
              </button>
            </Form>
          </div>

          {/* Appointments list */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock size={15} strokeWidth={1.75} className="text-warm-muted" />
              <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">
                My appointments
              </h2>
              {appointments.length > 0 && (
                <span className="text-[0.6875rem] font-medium text-warm-muted bg-warm-subtle px-2 py-0.5 rounded-full">
                  {appointments.length}
                </span>
              )}
            </div>

            {appointments.length === 0 ? (
              <div className="bg-cream border border-warm-subtle rounded-2xl px-6 py-10 text-center">
                <p className="text-[0.8125rem] font-light text-warm-muted">
                  No appointments yet.
                </p>
              </div>
            ) : (
              appointments.map((a) => (
                <div
                  key={a._id}
                  className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.9375rem] font-medium text-warm-dark">
                        {a.department}
                      </span>
                      <span className="text-[0.75rem] text-warm-muted font-light">
                        {new Date(a.appointmentTime).toLocaleDateString(
                          undefined,
                          { weekday: "short", month: "short", day: "numeric" },
                        )}
                        {" · "}
                        {new Date(a.appointmentTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {a.assignedDoctor && (
                        <span className="text-[0.75rem] text-warm-muted font-light flex items-center gap-1">
                          <Stethoscope size={11} strokeWidth={2} />
                          Dr. {a.assignedDoctor.name} ·{" "}
                          {a.assignedDoctor.specialization}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {a.emergency && (
                        <span className="flex items-center gap-1 text-[0.6875rem] bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} strokeWidth={2.5} />
                          Emergency
                        </span>
                      )}
                      <span
                        className={`text-[0.6875rem] font-medium px-2.5 py-0.5 rounded-full ${statusConfig[a.status].classes}`}
                      >
                        {statusConfig[a.status].label}
                      </span>
                      {canEdit(a) && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(editingId === a._id ? null : a._id)
                          }
                          className="flex items-center gap-1 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer"
                        >
                          {editingId === a._id ? (
                            <>
                              <X size={12} strokeWidth={2} /> Close
                            </>
                          ) : (
                            <>
                              <Pencil size={12} strokeWidth={2} /> Edit
                            </>
                          )}
                        </button>
                      )}
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCancellingId(a._id)}
                            className="text-[0.75rem] text-warm-muted hover:text-red-500 transition-colors cursor-pointer"
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
                      className="flex flex-col gap-4 pt-4 border-t border-warm-subtle"
                      onSubmit={() => setEditingId(null)}
                    >
                      <input type="hidden" name="intent" value="edit" />
                      <input type="hidden" name="appointmentId" value={a._id} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Department</label>
                          <select
                            name="department"
                            defaultValue={a.department}
                            className={inputClass}
                          >
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className={labelClass}>Date & time</label>
                          <input
                            name="appointmentTime"
                            type="datetime-local"
                            defaultValue={toDatetimeLocal(a.appointmentTime)}
                            required
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer self-start">
                        <input
                          type="checkbox"
                          id={`emergency-${a._id}`}
                          name="emergency"
                          value="true"
                          defaultChecked={a.emergency}
                          className="accent-amber w-3.5 h-3.5"
                        />
                        <span className="flex items-center gap-1.5 text-[0.8125rem] text-warm-muted">
                          <AlertTriangle
                            size={13}
                            strokeWidth={2}
                            className="text-red-400"
                          />
                          Mark as emergency
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-warm-dark hover:bg-warm-mid disabled:opacity-50 text-cream font-medium rounded-full px-4 py-1.5 text-[0.8125rem] transition-all duration-200 cursor-pointer"
                        >
                          {isSubmitting ? "Saving…" : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-[0.8125rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer"
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
        <div className="bg-cream border border-warm-subtle rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} strokeWidth={1.75} className="text-amber" />
            <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">
              Profile settings
            </h2>
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
              <label htmlFor="name" className={labelClass}>
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profileAge" className={labelClass}>
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
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>
                New password{" "}
                <span className="text-warm-muted/40 normal-case tracking-normal">
                  (leave blank to keep current)
                </span>
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
