import { Form } from "react-router";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  intent,
  id,
  label = "Delete",
}: {
  intent: string;
  id: string;
  label?: string;
}) {
  return (
    <Form
      method="post"
      onSubmit={(e) => {
        if (!confirm(`${label}? This cannot be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-warm-muted hover:text-red-500 transition-colors duration-200 cursor-pointer"
        title={label}
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </button>
    </Form>
  );
}
