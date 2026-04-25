export function formatZodError(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] ?? "Invalid value"]),
  );
}
