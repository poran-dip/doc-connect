import { Form, useNavigation, useActionData } from "react-router";
import { useState } from "react";
import { User } from "lucide-react";
import type { Admin, Appointment, Doctor, Patient } from "../../lib/types";
import Field from "./admin/Field";
import { inputCls } from "./admin/colors";
import AppointmentsTab from "./admin/AppointmentsTab";
import PatientsTab from "./admin/PatientsTab";
import DoctorsTab from "./admin/DoctorsTab";
import AdminsTab from "./admin/AdminsTab";

type Tab = "appointments" | "patients" | "doctors" | "admins" | "profile";

export default function AdminDashboard({
  user,
  appointments,
  patients,
  doctors,
  admins,
}: {
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
    { key: "patients",     label: "Patients",     count: patients.length },
    { key: "doctors",      label: "Doctors",      count: doctors.length },
    { key: "admins",       label: "Admins",       count: admins.filter((a) => a._id !== user.id).length },
    { key: "profile",      label: "Profile" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-warm-subtle/40 border border-warm-subtle rounded-full p-1 self-start flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`text-[0.8125rem] font-medium px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              tab === t.key
                ? "bg-warm-dark text-cream shadow-sm"
                : "text-warm-muted hover:text-warm-dark"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-[0.6875rem] px-1.5 py-0.5 rounded-full ${
                tab === t.key ? "bg-white/15 text-cream" : "bg-warm-subtle text-warm-muted"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
          {actionData.error}
        </div>
      )}

      {tab === "appointments" && (
        <AppointmentsTab appointments={appointments} doctors={doctors} isSubmitting={isSubmitting} />
      )}
      {tab === "patients" && (
        <PatientsTab patients={patients} isSubmitting={isSubmitting} />
      )}
      {tab === "doctors" && (
        <DoctorsTab doctors={doctors} isSubmitting={isSubmitting} />
      )}
      {tab === "admins" && (
        <AdminsTab admins={admins} currentUserId={user.id} isSubmitting={isSubmitting} />
      )}

      {tab === "profile" && (
        <div className="bg-cream border border-warm-subtle rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} strokeWidth={1.75} className="text-amber" />
            <h2 className="font-serif text-[1.1rem] text-warm-dark tracking-tight">Profile settings</h2>
          </div>
          <Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intent" value="updateProfile" />
            {actionData?.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-3.5 py-2.5 text-[0.8125rem]">
                {actionData.success}
              </div>
            )}
            <Field label="Name">
              <input name="name" type="text" defaultValue={user.name} required className={inputCls} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={user.email} required className={inputCls} />
            </Field>
            <Field label="Location">
              <input name="location" type="text" defaultValue={user.location} required className={inputCls} />
            </Field>
            <Field label="New password">
              <input name="password" type="password" placeholder="Leave blank to keep current" autoComplete="new-password" className={inputCls} />
            </Field>
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
