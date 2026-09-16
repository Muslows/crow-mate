"use client";

import { SignOutButton } from "@/components/layout/SignOutButton";
import { NavMenu, NavMenuLink } from "@/components/layout/NavMenu";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({
  name,
  player,
  manager,
  admin,
  org,
  playerHref,
}: {
  name: string;
  player: boolean;
  manager: boolean;
  admin: boolean;
  org: boolean;
  playerHref: string;
}) {
  return (
    <NavMenu
      label={
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400/80 to-cyan-400/40 text-[0.7rem] font-bold text-black"
          >
            {initials(name) || "OW"}
          </span>
          <span className="hidden max-w-28 truncate text-xs font-semibold uppercase tracking-[0.12em] sm:inline sm:max-w-40">
            {name}
          </span>
        </span>
      }
    >
      {player ? (
        <>
          <NavMenuLink href={playerHref}>Profil joueur</NavMenuLink>
          <NavMenuLink href="/profile/planning">Planning</NavMenuLink>
        </>
      ) : (
        <NavMenuLink href="/profile">Activer le profil</NavMenuLink>
      )}
      {manager ? (
        <NavMenuLink href="/manage">Dashboard manager</NavMenuLink>
      ) : (
        <NavMenuLink href="/manage/teams/new">Créer une équipe</NavMenuLink>
      )}
      {org ? <NavMenuLink href="/org">Dashboard structure</NavMenuLink> : null}
      {admin ? <NavMenuLink href="/admin">Administration</NavMenuLink> : null}
      <NavMenuLink href="/profile/settings">Paramètres</NavMenuLink>
      <div className="mt-1 border-t border-white/10 px-3 py-2">
        <SignOutButton />
      </div>
    </NavMenu>
  );
}
