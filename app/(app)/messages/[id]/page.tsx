import { notFound } from "next/navigation";
import Link from "next/link";
import { ChatPanel } from "@/components/chat/ChatPanel";
import {
  getConversationForUser,
  listMessagesForConversation,
} from "@/lib/data/chat";
import { publicDisplayName } from "@/lib/privacy";
import { requireAuthSession } from "@/lib/session";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuthSession();
  const { id } = await params;
  const conversation = await getConversationForUser(id, session.user.id);
  if (!conversation) notFound();

  const peer =
    conversation.recruiterId === session.user.id
      ? conversation.candidate
      : conversation.recruiter;
  const peerName = publicDisplayName({
    displayName: peer.playerProfile?.displayName,
    name: peer.name,
  });
  const messages = await listMessagesForConversation(id, session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/messages" className="hud-btn-ghost w-fit">
        Tous les messages
      </Link>
      <ChatPanel
        conversationId={id}
        currentUserId={session.user.id}
        peerName={peerName}
        initialMessages={messages ?? []}
      />
    </main>
  );
}
