import { ZodError } from "zod";

export type ActionState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string[]>;
};

export const emptyActionState: ActionState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

export function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formStringArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

export function fieldErrorsFromZod(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export function firstFieldError(
  fieldErrors: Record<string, string[]>,
  key: string,
): string | undefined {
  return fieldErrors[key]?.[0];
}
