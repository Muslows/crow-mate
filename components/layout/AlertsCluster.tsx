"use client";

import { MessagesNavLink } from "@/components/chat/MessagesNavLink";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import type { NotificationInbox } from "@/lib/data/notifications";

export function AlertsCluster({
  unreadMessages,
  inbox,
}: {
  unreadMessages: number;
  inbox: NotificationInbox;
}) {
  return (
    <div className="flex items-center gap-1">
      <MessagesNavLink initialCount={unreadMessages} />
      <NotificationCenter inbox={inbox} />
    </div>
  );
}
