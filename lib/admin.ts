/**
 * Source unique de vérité pour le droit admin.
 *
 * Aujourd'hui : IDs dans l'env (`ADMIN_ID` ou `ADMIN_IDS`).
 * Demain : remplacer uniquement `loadAdminIds()` (lecture DB, etc.) —
 * `isAdmin()` et les gardes restent inchangés.
 */
const USER_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

function parseUserId(raw: string, source: string): string | null {
  const id = raw.trim();
  if (!id) return null;
  if (!USER_ID_PATTERN.test(id)) {
    throw new Error(
      `${source} invalide : attendu un ID utilisateur Better Auth (8–128 caractères [A-Za-z0-9_-]).`,
    );
  }
  return id;
}

function loadAdminIds(): ReadonlySet<string> {
  const ids = new Set<string>();
  const many = process.env.ADMIN_IDS ?? "";
  const single = process.env.ADMIN_ID ?? "";

  for (const chunk of many.split(",")) {
    const parsed = parseUserId(chunk, "ADMIN_IDS");
    if (parsed) ids.add(parsed);
  }

  const primary = parseUserId(single, "ADMIN_ID");
  if (primary) ids.add(primary);

  return ids;
}

const ADMIN_IDS = loadAdminIds();

export function getAdminIds(): ReadonlySet<string> {
  return ADMIN_IDS;
}

/** Compare l'utilisateur connecté à la liste d'admins configurée. */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return ADMIN_IDS.has(userId);
}
