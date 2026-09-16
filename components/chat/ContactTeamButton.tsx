"use client";

import { openTeamConversation } from "@/lib/actions/chat";
import { ChatLaunchButton } from "@/components/chat/ChatLaunchButton";

export function ContactTeamButton({
  teamId,
  teamName,
  currentUserId,
}: {
  teamId: string;
  teamName: string;
  currentUserId: string;
}) {
  return (
    <ChatLaunchButton
      action={openTeamConversation}
      hiddenFields={{ teamId }}
      idleLabel="Contacter l'équipe"
      peerName={teamName}
      currentUserId={currentUserId}
    />
  );
}
