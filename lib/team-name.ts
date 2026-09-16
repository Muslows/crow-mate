export function teamDisplayName(
  name: string,
  tag?: string | null,
): string {
  const prefix = tag?.trim().toUpperCase();
  if (!prefix) return name;
  return `${prefix} | ${name}`;
}
