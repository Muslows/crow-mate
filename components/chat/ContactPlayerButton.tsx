"use client";

import { openConversation } from "@/lib/actions/chat";
import { ChatLaunchButton } from "@/components/chat/ChatLaunchButton";

export function ContactPlayerButton({
  candidateUserId,
  displayName,
  currentUserId,
}: {
  candidateUserId: string;
  displayName: string;
  currentUserId: string;
}) {
  return (
    <ChatLaunchButton
      action={openConversation}
      hiddenFields={{ candidateUserId }}
      idleLabel="Contacter"
      peerName={displayName}
      currentUserId={currentUserId}
    />
  );
}
