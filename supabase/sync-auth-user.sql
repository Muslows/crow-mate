-- Synchronise auth.users -> public.user + "PlayerProfile"
-- À exécuter dans le SQL Editor Supabase. L’app upsert aussi au login / callback.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."user" (
    id,
    name,
    email,
    "emailVerified",
    "isManager",
    "isPlayer",
    "isCoach",
    "isCaster",
    "isStaff",
    role,
    "openToCast",
    "openToCoach",
    "createdAt",
    "updatedAt"
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'joueur'), '@', 1)),
    lower(coalesce(new.email, '')),
    new.email_confirmed_at is not null,
    false,
    true,
    false,
    false,
    false,
    'PLAYER',
    'CLOSED',
    'CLOSED',
    now(),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        "emailVerified" = excluded."emailVerified",
        "updatedAt" = now();

  insert into public."PlayerProfile" (
    id,
    "userId",
    sr,
    role,
    "favoriteHeroes",
    experience,
    "createdAt",
    "updatedAt"
  )
  values (
    gen_random_uuid()::text,
    new.id,
    0,
    'TANK',
    ARRAY[]::text[],
    '',
    now(),
    now()
  )
  on conflict ("userId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
