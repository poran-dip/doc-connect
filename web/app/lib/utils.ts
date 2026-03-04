export function toDatetimeLocal(iso: string) {
  return new Date(iso).toISOString().slice(0, 16);
}
