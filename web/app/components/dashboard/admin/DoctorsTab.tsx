import { useState } from "react";
import { Form } from "react-router";
import { Stethoscope, Pencil, X } from "lucide-react";
import type { Doctor } from "~/lib/types";
import Field from "./Field";
import { doctorStatusColors, inputCls } from "./colors";
import { specializations } from "../../../lib/data";
import DeleteButton from "./DeleteButton";

const doctorStatusDot: Record<Doctor["status"], string> = {
  available: "bg-green-500",
  busy: "bg-amber",
  dnd: "bg-red-400",
};

const doctorStatusLabel: Record<Doctor["status"], string> = {
  available: "Available",
  busy: "Busy",
  dnd: "Do not disturb",
};

export default function DoctorsTab({
  doctors,
  isSubmitting,
}: {
  doctors: Doctor[];
  isSubmitting: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setShowCreate((v) => !v)}
        className="self-start flex items-center gap-1.5 text-[0.8125rem] font-medium bg-warm-dark hover:bg-warm-mid text-cream rounded-full px-4 py-1.5 transition-all duration-200 hover:-translate-y-px cursor-pointer"
      >
        {showCreate ? (
          <>
            <X size={13} strokeWidth={2} /> Cancel
          </>
        ) : (
          <>
            <Stethoscope size={13} strokeWidth={2} /> New doctor
          </>
        )}
      </button>

      {showCreate && (
        <div className="bg-cream border border-warm-subtle rounded-2xl p-5">
          <h3 className="font-serif text-[1rem] text-warm-dark tracking-tight mb-4">
            Create doctor
          </h3>
          <Form
            method="post"
            className="flex flex-col gap-4"
            onSubmit={() => setShowCreate(false)}
          >
            <input type="hidden" name="intent" value="createDoctor" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name">
                <input name="name" type="text" required className={inputCls} />
              </Field>
              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Specialization">
                <select name="specialization" required className={inputCls}>
                  {specializations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  required
                  className={inputCls}
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start bg-warm-dark hover:bg-warm-mid disabled:opacity-50 text-cream font-medium rounded-full px-4 py-1.5 text-[0.8125rem] transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? "Creating…" : "Create doctor"}
            </button>
          </Form>
        </div>
      )}

      {doctors.length === 0 ? (
        <div className="bg-cream border border-warm-subtle rounded-2xl px-6 py-10 text-center">
          <p className="text-[0.8125rem] font-light text-warm-muted">
            No doctors yet.
          </p>
        </div>
      ) : (
        doctors.map((d) => (
          <div
            key={d._id}
            className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[0.9375rem] font-medium text-warm-dark">
                  {d.name}
                </span>
                <span className="text-[0.75rem] text-warm-muted font-light">
                  {d.email} · {d.specialization}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[0.75rem] font-medium ${doctorStatusColors[d.status]}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${doctorStatusDot[d.status]}`}
                  />
                  {doctorStatusLabel[d.status]}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setEditingId(editingId === d._id ? null : d._id)
                  }
                  className="flex items-center gap-1 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer"
                >
                  {editingId === d._id ? (
                    <>
                      <X size={12} strokeWidth={2} /> Close
                    </>
                  ) : (
                    <>
                      <Pencil size={12} strokeWidth={2} /> Edit
                    </>
                  )}
                </button>
                <DeleteButton
                  intent="deleteDoctor"
                  id={d._id}
                  label="Delete doctor"
                />
              </div>
            </div>

            {editingId === d._id && (
              <Form
                method="post"
                className="flex flex-col gap-4 pt-4 border-t border-warm-subtle"
                onSubmit={() => setEditingId(null)}
              >
                <input type="hidden" name="intent" value="updateDoctor" />
                <input type="hidden" name="id" value={d._id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name">
                    <input
                      name="name"
                      type="text"
                      defaultValue={d.name}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      defaultValue={d.email}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Specialization">
                    <select
                      name="specialization"
                      defaultValue={d.specialization ?? ""}
                      className={inputCls}
                    >
                      {specializations.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      name="status"
                      defaultValue={d.status}
                      className={inputCls}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="dnd">Do not disturb</option>
                    </select>
                  </Field>
                  <Field label="New password">
                    <input
                      name="password"
                      type="password"
                      placeholder="Leave blank to keep"
                      className={inputCls}
                    />
                  </Field>
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
