export const THEME_COOKIE = "crow-mate-theme";

export type AppTheme = "light" | "dark";

export function parseAppTheme(value: string | undefined | null): AppTheme {
  return value === "light" ? "light" : "dark";
}

export function themeCookieSetter(theme: AppTheme): string {
  return `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
