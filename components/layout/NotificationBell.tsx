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
      className="relative text-zinc-300 hover:text-orange-300"
    >
      Inbox
      {pending > 0 ? (
        <span className="absolute -right-3 -top-2 min-w-5 rounded-full bg-orange-500 px-1 text-center font-mono text-[0.65rem] text-black">
          {pending}
        </span>
      ) : null}
    </Link>
  );
}
