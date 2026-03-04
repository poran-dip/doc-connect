import { useState } from "react";
import { Form } from "react-router";
import { UserPlus, Pencil, X } from "lucide-react";
import type { Patient } from "~/lib/types";
import Field from "./Field";
import { inputCls } from "./colors";
import DeleteButton from "./DeleteButton";

export default function PatientsTab({
  patients,
  isSubmitting,
}: {
  patients: Patient[];
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
            <UserPlus size={13} strokeWidth={2} /> New patient
          </>
        )}
      </button>

      {showCreate && (
        <div className="bg-cream border border-warm-subtle rounded-2xl p-5">
          <h3 className="font-serif text-[1rem] text-warm-dark tracking-tight mb-4">
            Create patient
          </h3>
          <Form
            method="post"
            className="flex flex-col gap-4"
            onSubmit={() => setShowCreate(false)}
          >
            <input type="hidden" name="intent" value="createPatient" />
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
              <Field label="Age">
                <input
                  name="age"
                  type="number"
                  min={0}
                  max={120}
                  required
                  className={inputCls}
                />
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
              {isSubmitting ? "Creating…" : "Create patient"}
            </button>
          </Form>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="bg-cream border border-warm-subtle rounded-2xl px-6 py-10 text-center">
          <p className="text-[0.8125rem] font-light text-warm-muted">
            No patients yet.
          </p>
        </div>
      ) : (
        patients.map((p) => (
          <div
            key={p._id}
            className="bg-cream border border-warm-subtle rounded-2xl px-5 py-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.9375rem] font-medium text-warm-dark">
                  {p.name}
                </span>
                <span className="text-[0.75rem] text-warm-muted font-light">
                  {p.email} · Age {p.age}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setEditingId(editingId === p._id ? null : p._id)
                  }
                  className="flex items-center gap-1 text-[0.75rem] text-warm-muted hover:text-warm-dark transition-colors cursor-pointer"
                >
                  {editingId === p._id ? (
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
                  intent="deletePatient"
                  id={p._id}
                  label="Delete patient"
                />
              </div>
            </div>

            {editingId === p._id && (
              <Form
                method="post"
                className="flex flex-col gap-4 pt-4 border-t border-warm-subtle"
                onSubmit={() => setEditingId(null)}
              >
                <input type="hidden" name="intent" value="updatePatient" />
                <input type="hidden" name="id" value={p._id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name">
                    <input
                      name="name"
                      type="text"
                      defaultValue={p.name}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      defaultValue={p.email}
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Age">
                    <input
                      name="age"
                      type="number"
                      defaultValue={p.age}
                      min={0}
                      max={120}
                      required
                      className={inputCls}
                    />
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
