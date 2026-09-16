"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceSwitch({
  manager,
  player,
  admin = false,
  org = false,
  playerHref = "/profile",
}: {
  manager: boolean;
  player: boolean;
  admin?: boolean;
  org?: boolean;
  playerHref?: string;
}) {
  const pathname = usePathname();
  const onManage = pathname.startsWith("/manage");
  const onOrg = pathname.startsWith("/org");
  const onAdmin = pathname.startsWith("/admin");
  const onProfile =
    pathname.startsWith("/profile") ||
    (playerHref !== "/profile" && pathname.startsWith(playerHref));
  const onPlanning = pathname.startsWith("/profile/planning");

  return (
    <>
      {admin ? (
        <Link
          href="/admin"
          className={
            onAdmin
              ? "text-orange-200"
              : "text-zinc-300 hover:text-orange-300"
          }
        >
          Admin
        </Link>
      ) : null}
      {org ? (
        <Link
          href="/org"
          className={
            onOrg ? "text-orange-200" : "text-zinc-300 hover:text-orange-300"
          }
        >
          Structure
        </Link>
      ) : null}
      {manager && player ? (
        <span className="inline-flex border border-cyan-400/30">
          <Link
            href="/manage"
            className={`px-3 py-1 text-xs uppercase tracking-[0.16em] ${
              onManage ? "bg-orange-400/20 text-orange-200" : "text-zinc-400"
            }`}
          >
            Manager
          </Link>
          <Link
            href={playerHref}
            className={`px-3 py-1 text-xs uppercase tracking-[0.16em] ${
              onProfile && !onPlanning
                ? "bg-cyan-400/20 text-cyan-200"
                : "text-zinc-400"
            }`}
          >
            Joueur
          </Link>
        </span>
      ) : (
        <>
          {manager ? (
            <Link href="/manage" className="text-zinc-300 hover:text-orange-300">
              Roster
            </Link>
          ) : null}
          {player ? (
            <Link href={playerHref} className="text-zinc-300 hover:text-orange-300">
              Mon profil
            </Link>
          ) : null}
        </>
      )}
      {player ? (
        <Link
          href="/profile/planning"
          className={
            onPlanning
              ? "text-orange-200"
              : "text-zinc-300 hover:text-orange-300"
          }
        >
          Planning
        </Link>
      ) : null}
    </>
  );
}
