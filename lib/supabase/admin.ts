import { createClient } from "@supabase/supabase-js";

type AuthAdminUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
};

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function findAuthUserByEmail(
  email: string,
): Promise<AuthAdminUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  const response = await fetch(
    `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    console.error("[auth] admin user lookup", response.status);
    return null;
  }
  const body = (await response.json()) as { users?: AuthAdminUser[] };
  const users = body.users ?? [];
  const match = users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );
  if (match) return match;
  if (users.length === 0) return null;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error || !data?.users) return null;
  return (
    data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ??
    null
  );
}
