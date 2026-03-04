import type { Appointment, Doctor } from "~/lib/types";

export const labelCls = "text-[0.7rem] font-medium text-warm-muted uppercase tracking-[0.08em]";
export const inputCls =
  "w-full bg-warm-subtle/40 border border-warm-subtle hover:border-warm-muted/40 rounded-xl px-3.5 py-2.5 text-sm text-warm-dark placeholder:text-warm-muted/50 focus:outline-none focus:border-amber/50 focus:ring-2 focus:ring-amber/10 transition-all duration-200";

export const statusConfig: Record<Appointment["status"], { label: string; classes: string }> = {
  pending:   { label: "Pending",   classes: "bg-amber/10 text-amber" },
  assigned:  { label: "Assigned",  classes: "bg-blue-50 text-blue-600" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelled", classes: "bg-warm-subtle text-warm-muted" },
};

export const statusColors: Record<Appointment["status"], string> = {
  pending:   statusConfig.pending.classes,
  assigned:  statusConfig.assigned.classes,
  completed: statusConfig.completed.classes,
  cancelled: statusConfig.cancelled.classes,
};

export const doctorStatusColors: Record<Doctor["status"], string> = {
  available: "text-green-700",
  busy:      "text-amber",
  dnd:       "text-red-500",
};
