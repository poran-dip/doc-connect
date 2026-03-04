import { useState } from "react";
import { Form } from "react-router";
import { Stethoscope, AlertTriangle, Pencil, X, UserCheck } from "lucide-react";
import type { Appointment, Doctor } from "~/lib/types";
import DeleteButton from "./DeleteButton";
import Field from "./Field";
import { inputCls, statusConfig } from "./colors";
import { departments } from "../../../lib/data";
import { toDatetimeLocal } from "~/lib/utils";

export default function AppointmentsTab({
  appointments,
  doctors,
  isSubmitting,
}: {
  appointments: Appointment[];
  doctors: Doctor[];
  isSubmitting: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const availableDoctors = doctors.filter((d) => d.status === "available");

  return (
    <div className="flex flex-col gap-3">
      {appointments.length === 0 ? (
        <div className="bg-cream border border-warm-subtle rounded-2xl px-6 py-10 text-center">
          <p className="text-[0.8125rem] font-light text-warm-muted">No appointments.</p>
        </div>
      ) : (
        appointments.map((a) => (
          <div key={a._id} className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
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
                {a.assignedDoctor ? (
                  <span className="text-[0.75rem] text-warm-muted font-light">
                    Dr. {a.assignedDoctor.name} · {a.assignedDoctor.specialization}
                  </span>
                ) : (
                  <span className="text-[0.75rem] text-warm-muted/40 font-light italic">No doctor assigned</span>
                )}
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
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === a._id ? null : a._id)}
                  className="flex items-center gap-1 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer"
                >
                  {editingId === a._id ? <><X size={12} strokeWidth={2} /> Close</> : <><Pencil size={12} strokeWidth={2} /> Edit</>}
                </button>
                <DeleteButton intent="deleteAppointment" id={a._id} label="Delete appointment" />
              </div>
            </div>

            {/* Assign doctor */}
            {a.status !== "completed" && a.status !== "cancelled" && !a.assignedDoctor && availableDoctors.length > 0 && (
              <Form method="post" className="flex items-center gap-2 pt-3 border-t border-warm-subtle">
                <input type="hidden" name="intent" value="assignDoctor" />
                <input type="hidden" name="appointmentId" value={a._id} />
                <select
                  name="doctorId"
                  className="flex-1 bg-warm-subtle/40 border border-warm-subtle hover:border-warm-muted/40 rounded-xl px-3 py-1.5 text-[0.8125rem] text-warm-dark focus:outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/10 transition-all duration-200"
                >
                  {availableDoctors.map((d) => (
                    <option key={d._id} value={d._id}>Dr. {d.name} · {d.specialization}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 text-[0.8125rem] font-medium bg-warm-dark hover:bg-warm-mid disabled:opacity-50 text-cream rounded-full px-3.5 py-1.5 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <UserCheck size={13} strokeWidth={2} />
                  Assign
                </button>
              </Form>
            )}

            {editingId === a._id && (
              <Form
                method="post"
                className="flex flex-col gap-4 pt-4 border-t border-warm-subtle"
                onSubmit={() => setEditingId(null)}
              >
                <input type="hidden" name="intent" value="updateAppointment" />
                <input type="hidden" name="id" value={a._id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Department">
                    <select name="department" defaultValue={a.department} className={inputCls}>
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Date & time">
                    <input
                      name="appointmentTime"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(a.appointmentTime)}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Status">
                    <select name="status" defaultValue={a.status} className={inputCls}>
                      {["pending", "assigned", "completed", "cancelled"].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`emg-${a._id}`}
                        name="emergency"
                        value="true"
                        defaultChecked={a.emergency}
                        className="accent-amber w-3.5 h-3.5"
                      />
                      <span className="flex items-center gap-1.5 text-[0.8125rem] text-warm-muted">
                        <AlertTriangle size={13} strokeWidth={2} className="text-red-400" />
                        Emergency
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-warm-dark hover:bg-warm-mid disabled:opacity-50 text-cream font-medium rounded-full px-4 py-1.5 text-[0.8125rem] transition-all duration-200 cursor-pointer"
                  >
                    {isSubmitting ? "Saving…" : "Save"}
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
  );
}
