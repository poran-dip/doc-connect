import { Form, useNavigation, useActionData } from "react-router";
import { useState } from "react";
import type { Admin, Appointment, Doctor, Patient } from "../../lib/types";

type Tab = "appointments" | "patients" | "doctors" | "admins" | "profile";

const statusColors: Record<Appointment["status"], string> = {
  pending: "bg-yellow-50 text-yellow-600",
  assigned: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const doctorStatusColors: Record<Doctor["status"], string> = {
  available: "text-green-600",
  busy: "text-yellow-600",
  dnd: "text-red-500",
};

const departments = ["General Medicine", "Cardiology", "Neurology", "Orthopedics", "Dermatology", "Pediatrics"];

const specializations = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
];

function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}

function isWithinTwoHours(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 && diff <= 1000 * 60 * 120;
}

function DeleteButton({ intent, id, label = "Delete" }: { intent: string; id: string; label?: string }) {
  return (
    <Form method="post" onSubmit={e => { if (!confirm(`${label}? This cannot be undone.`)) e.preventDefault(); }}>
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer">
        Delete
      </button>
    </Form>
  );
}

// ── Input helpers ──────────────────────────────────────────────────
const inputCls = "bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors w-full";
const labelCls = "text-xs font-medium text-slate-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ── Appointments Tab ───────────────────────────────────────────────
function AppointmentsTab({ appointments, doctors, isSubmitting }: {
  appointments: Appointment[];
  doctors: Doctor[];
  isSubmitting: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const availableDoctors = doctors.filter(d => d.status === "available");

  return (
    <div className="flex flex-col gap-3">
      {appointments.length === 0 ? (
        <p className="text-sm text-slate-400">No appointments.</p>
      ) : appointments.map(a => (
        <div key={a._id} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-700">{a.patientId.name}</span>
              <span className="text-xs text-slate-400">{a.department}</span>
              <span className="text-xs text-slate-400">
                {new Date(a.appointmentTime).toLocaleDateString()} · {new Date(a.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {a.assignedDoctor
                ? <span className="text-xs text-slate-400">Dr. {a.assignedDoctor.name} · {a.assignedDoctor.specialization}</span>
                : <span className="text-xs text-slate-300">No doctor assigned</span>
              }
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {a.emergency && <span className="text-xs bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full">Emergency</span>}
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[a.status]}`}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
              <button type="button" onClick={() => setEditingId(editingId === a._id ? null : a._id)}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
                {editingId === a._id ? "Close" : "Edit"}
              </button>
              <DeleteButton intent="deleteAppointment" id={a._id} label="Delete appointment" />
            </div>
          </div>

          {/* Assign doctor — only if within 2 hours and unassigned */}
          {a.status !== "completed" && a.status !== "cancelled" && !a.assignedDoctor && availableDoctors.length > 0 && (
            <Form method="post" className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input type="hidden" name="intent" value="assignDoctor" />
              <input type="hidden" name="appointmentId" value={a._id} />
              <select name="doctorId" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-400 transition-colors flex-1">
                {availableDoctors.map(d => (
                  <option key={d._id} value={d._id}>Dr. {d.name} · {d.specialization}</option>
                ))}
              </select>
              <button type="submit" disabled={isSubmitting}
                className="text-xs bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-3 py-1.5 transition-colors cursor-pointer shrink-0">
                Assign
              </button>
            </Form>
          )}

          {editingId === a._id && (
            <Form method="post" className="flex flex-col gap-3 pt-3 border-t border-slate-100"
              onSubmit={() => setEditingId(null)}>
              <input type="hidden" name="intent" value="updateAppointment" />
              <input type="hidden" name="id" value={a._id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Department">
                  <select name="department" defaultValue={a.department} className={inputCls}>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Date & time">
                  <input name="appointmentTime" type="datetime-local" defaultValue={toDatetimeLocal(a.appointmentTime)} required className={inputCls} />
                </Field>
                <Field label="Status">
                  <select name="status" defaultValue={a.status} className={inputCls}>
                    {["pending", "assigned", "completed", "cancelled"].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-center gap-2 self-end pb-2">
                  <input type="checkbox" id={`emg-${a._id}`} name="emergency" value="true" defaultChecked={a.emergency} className="accent-blue-500" />
                  <label htmlFor={`emg-${a._id}`} className="text-xs text-slate-500">Emergency</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingId(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Discard</button>
              </div>
            </Form>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Patients Tab ───────────────────────────────────────────────────
function PatientsTab({ patients, isSubmitting }: { patients: Patient[]; isSubmitting: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => setShowCreate(v => !v)}
        className="self-start text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer">
        {showCreate ? "Cancel" : "+ New patient"}
      </button>

      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-3">Create patient</h3>
          <Form method="post" className="flex flex-col gap-3" onSubmit={() => setShowCreate(false)}>
            <input type="hidden" name="intent" value="createPatient" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full name"><input name="name" type="text" required className={inputCls} /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
              <Field label="Age"><input name="age" type="number" min={0} max={120} required className={inputCls} /></Field>
              <Field label="Password"><input name="password" type="password" required className={inputCls} /></Field>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="self-start bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
              {isSubmitting ? "Creating…" : "Create patient"}
            </button>
          </Form>
        </div>
      )}

      {patients.length === 0 ? (
        <p className="text-sm text-slate-400">No patients.</p>
      ) : patients.map(p => (
        <div key={p._id} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-700">{p.name}</span>
              <span className="text-xs text-slate-400">{p.email} · Age {p.age}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setEditingId(editingId === p._id ? null : p._id)}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
                {editingId === p._id ? "Close" : "Edit"}
              </button>
              <DeleteButton intent="deletePatient" id={p._id} label="Delete patient" />
            </div>
          </div>
          {editingId === p._id && (
            <Form method="post" className="flex flex-col gap-3 pt-3 border-t border-slate-100"
              onSubmit={() => setEditingId(null)}>
              <input type="hidden" name="intent" value="updatePatient" />
              <input type="hidden" name="id" value={p._id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full name"><input name="name" type="text" defaultValue={p.name} required className={inputCls} /></Field>
                <Field label="Email"><input name="email" type="email" defaultValue={p.email} required className={inputCls} /></Field>
                <Field label="Age"><input name="age" type="number" defaultValue={p.age} min={0} max={120} required className={inputCls} /></Field>
                <Field label="New password"><input name="password" type="password" placeholder="Leave blank to keep" className={inputCls} /></Field>
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Discard</button>
              </div>
            </Form>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Doctors Tab ────────────────────────────────────────────────────
function DoctorsTab({ doctors, isSubmitting }: { doctors: Doctor[]; isSubmitting: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => setShowCreate(v => !v)}
        className="self-start text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer">
        {showCreate ? "Cancel" : "+ New doctor"}
      </button>

      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-3">Create doctor</h3>
          <Form method="post" className="flex flex-col gap-3" onSubmit={() => setShowCreate(false)}>
            <input type="hidden" name="intent" value="createDoctor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Full name"><input name="name" type="text" required className={inputCls} /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
              <Field label="Specialization">
                <select name="specialization" required className={inputCls}>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Password"><input name="password" type="password" required className={inputCls} /></Field>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="self-start bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
              {isSubmitting ? "Creating…" : "Create doctor"}
            </button>
          </Form>
        </div>
      )}

      {doctors.length === 0 ? (
        <p className="text-sm text-slate-400">No doctors.</p>
      ) : doctors.map(d => (
        <div key={d._id} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-700">{d.name}</span>
              <span className="text-xs text-slate-400">{d.email} · {d.specialization}</span>
              <span className={`text-xs font-medium ${doctorStatusColors[d.status]}`}>
                {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setEditingId(editingId === d._id ? null : d._id)}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
                {editingId === d._id ? "Close" : "Edit"}
              </button>
              <DeleteButton intent="deleteDoctor" id={d._id} label="Delete doctor" />
            </div>
          </div>
          {editingId === d._id && (
            <Form method="post" className="flex flex-col gap-3 pt-3 border-t border-slate-100"
              onSubmit={() => setEditingId(null)}>
              <input type="hidden" name="intent" value="updateDoctor" />
              <input type="hidden" name="id" value={d._id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Full name"><input name="name" type="text" defaultValue={d.name} required className={inputCls} /></Field>
                <Field label="Email"><input name="email" type="email" defaultValue={d.email} required className={inputCls} /></Field>
                <Field label="Specialization">
                  <select name="specialization" defaultValue={d.specialization ?? ""} className={inputCls}>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select name="status" defaultValue={d.status} className={inputCls}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="dnd">Do not disturb</option>
                  </select>
                </Field>
                <Field label="New password"><input name="password" type="password" placeholder="Leave blank to keep" className={inputCls} /></Field>
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Discard</button>
              </div>
            </Form>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Admins Tab ─────────────────────────────────────────────────────
function AdminsTab({ admins, currentUserId, isSubmitting }: { admins: Admin[]; currentUserId: string; isSubmitting: boolean }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const others = admins.filter(a => a._id !== currentUserId);

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={() => setShowCreate(v => !v)}
        className="self-start text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer">
        {showCreate ? "Cancel" : "+ New admin"}
      </button>

      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-600 mb-3">Create admin</h3>
          <Form method="post" className="flex flex-col gap-3" onSubmit={() => setShowCreate(false)}>
            <input type="hidden" name="intent" value="createAdmin" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name"><input name="name" type="text" required className={inputCls} /></Field>
              <Field label="Email"><input name="email" type="email" required className={inputCls} /></Field>
              <Field label="Location"><input name="location" type="text" required className={inputCls} /></Field>
              <Field label="Password"><input name="password" type="password" required className={inputCls} /></Field>
            </div>
            <button type="submit" disabled={isSubmitting}
              className="self-start bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
              {isSubmitting ? "Creating…" : "Create admin"}
            </button>
          </Form>
        </div>
      )}

      {others.length === 0 ? (
        <p className="text-sm text-slate-400">No other admins.</p>
      ) : others.map(a => (
        <div key={a._id} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-700">{a.name}</span>
              <span className="text-xs text-slate-400">{a.email} · {a.location}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setEditingId(editingId === a._id ? null : a._id)}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors cursor-pointer">
                {editingId === a._id ? "Close" : "Edit"}
              </button>
              <DeleteButton intent="deleteAdmin" id={a._id} label="Delete admin" />
            </div>
          </div>
          {editingId === a._id && (
            <Form method="post" className="flex flex-col gap-3 pt-3 border-t border-slate-100"
              onSubmit={() => setEditingId(null)}>
              <input type="hidden" name="intent" value="updateAdmin" />
              <input type="hidden" name="id" value={a._id} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name"><input name="name" type="text" defaultValue={a.name} required className={inputCls} /></Field>
                <Field label="Email"><input name="email" type="email" defaultValue={a.email} required className={inputCls} /></Field>
                <Field label="Location"><input name="location" type="text" defaultValue={a.location} required className={inputCls} /></Field>
                <Field label="New password"><input name="password" type="password" placeholder="Leave blank to keep" className={inputCls} /></Field>
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-xs transition-colors cursor-pointer">
                  {isSubmitting ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Discard</button>
              </div>
            </Form>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function AdminDashboard({ user, appointments, patients, doctors, admins }: {
  user: Admin;
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  admins: Admin[];
}) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: string }>();
  const isSubmitting = navigation.state === "submitting";
  const [tab, setTab] = useState<Tab>("appointments");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "appointments", label: "Appointments", count: appointments.length },
    { key: "patients", label: "Patients", count: patients.length },
    { key: "doctors", label: "Doctors", count: doctors.length },
    { key: "admins", label: "Admins", count: admins.filter(a => a._id !== user.id).length },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 self-start flex-wrap">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`text-xs font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 ${
              tab === t.key ? "bg-blue-500 text-white" : "text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-blue-400 text-white" : "bg-slate-100 text-slate-400"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
          {actionData.error}
        </div>
      )}

      {tab === "appointments" && <AppointmentsTab appointments={appointments} doctors={doctors} isSubmitting={isSubmitting} />}
      {tab === "patients" && <PatientsTab patients={patients} isSubmitting={isSubmitting} />}
      {tab === "doctors" && <DoctorsTab doctors={doctors} isSubmitting={isSubmitting} />}
      {tab === "admins" && <AdminsTab admins={admins} currentUserId={user.id} isSubmitting={isSubmitting} />}

      {tab === "profile" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Profile settings</h2>
          <Form method="post" className="flex flex-col gap-3">
            <input type="hidden" name="intent" value="updateProfile" />
            {actionData?.success && (
              <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-3 py-2 text-sm">
                {actionData.success}
              </div>
            )}
            <Field label="Name"><input name="name" type="text" defaultValue={user.name} required className={inputCls} /></Field>
            <Field label="Email"><input name="email" type="email" defaultValue={user.email} required className={inputCls} /></Field>
            <Field label="Location"><input name="location" type="text" defaultValue={user.location} required className={inputCls} /></Field>
            <Field label={`New password `}>
              <input name="password" type="password" placeholder="Leave blank to keep current" autoComplete="new-password" className={inputCls} />
            </Field>
            <button type="submit" disabled={isSubmitting}
              className="self-start mt-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full px-5 py-2 text-sm transition-colors cursor-pointer">
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}
