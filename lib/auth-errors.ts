type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
  status?: number;
  statusText?: string;
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  email_not_confirmed:
    "Confirme d’abord ton email. Vérifie ta boîte de réception.",
  EMAIL_NOT_VERIFIED:
    "Confirme d’abord ton email. Vérifie ta boîte de réception.",
  user_already_exists: "Un compte existe déjà avec cet email.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email.",
  email_exists: "Cette adresse email est déjà utilisée.",
  email_address_invalid: "Cette adresse email est invalide.",
  email_address_not_authorized:
    "Cette adresse email n’est pas autorisée par le service d’authentification.",
  over_email_send_rate_limit: "Trop de tentatives. Réessaie dans un instant.",
  same_password: "Choisis un mot de passe différent de l’actuel.",
  weak_password: "Le mot de passe ne respecte pas les exigences de sécurité.",
  INVALID_EMAIL: "Email invalide.",
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function messageForAuthError(
  error: AuthErrorLike | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;
  const code = error.code?.trim();
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  const message = error.message?.trim();
  if (!message) return fallback;
  const lowered = normalize(message);
  if (lowered.includes("invalid login")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }
  if (lowered.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }
  if (lowered.includes("already registered")) {
    return AUTH_ERROR_MESSAGES.user_already_exists;
  }
  if (
    lowered.includes("already been registered") ||
    lowered.includes("email already") ||
    lowered.includes("email exists")
  ) {
    return AUTH_ERROR_MESSAGES.email_exists;
  }
  if (lowered.includes("password") && lowered.includes("weak")) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }
  if (lowered.includes("rate limit")) {
    return AUTH_ERROR_MESSAGES.over_email_send_rate_limit;
  }
  return message;
}
