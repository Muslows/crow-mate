import Link from "next/link";
import { countPendingInvitations } from "@/lib/data/invitations";

export async function NotificationBell({
  userId,
  href = "/profile#invitations",
}: {
  userId: string;
  href?: string;
}) {
  const pending = await countPendingInvitations(userId);
  return (
    <Link
      href={href}
      aria-label={
        pending > 0 ? `Notifications, ${pending} en attente` : "Notifications"
      }
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:border-orange-400/40 hover:text-orange-200"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
        <path
          fill="currentColor"
          d="M10 2a5 5 0 0 0-5 5v2.2L3.4 12A1 1 0 0 0 4.2 13.5h11.6a1 1 0 0 0 .8-1.5L14 9.2V7a5 5 0 0 0-5-5Zm0 16a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 10 18Z"
        />
      </svg>
      {pending > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-500 px-1 text-center text-[0.6rem] font-bold text-black">
          {pending > 99 ? "99+" : pending}
        </span>
      ) : null}
    </Link>
  );
}
