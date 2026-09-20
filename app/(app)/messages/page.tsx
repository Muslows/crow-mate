import Link from "next/link";
import {
  conversationThreadCopy,
  listConversationsForUser,
} from "@/lib/data/chat";
import { requireAuthSession } from "@/lib/session";
import { Panel } from "@/components/ui/Panel";

export default async function MessagesIndexPage() {
  const session = await requireAuthSession();
  const conversations = await listConversationsForUser(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-400">
          Messages
        </p>
        <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">
          Messages
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Fils privés : LFS, staff de scrim, et recrutement. Un badge rouge
          indique les messages non lus.
        </p>
      </div>
      {conversations.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Aucune conversation. Contacte un LFS, un staff adverse, un joueur ou
          une équipe.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {conversations.map((item) => {
            const thread = conversationThreadCopy(item);
            return (
            <li key={item.id}>
              <Link href={`/messages/${item.id}`}>
                <Panel className="transition hover:border-orange-400/40">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-400">
                    {thread.kicker}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold uppercase tracking-wide text-zinc-900 dark:text-cyan-100">
                    {item.peerName}
                  </h2>
                  {item.unreadCount > 0 ? (
                    <span className="mt-2 inline-block min-w-5 rounded-full bg-red-500 px-2 py-0.5 text-center font-mono text-[0.65rem] text-white">
                      {item.unreadCount} non lu{item.unreadCount > 1 ? "s" : ""}
                    </span>
                  ) : null}
                  <p className="mt-2 truncate text-sm text-zinc-600 dark:text-zinc-400">
                    {item.lastBody || "Nouveau fil"}
                  </p>
                </Panel>
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
