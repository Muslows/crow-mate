import { MessagesNavLink } from "@/components/chat/MessagesNavLink";
import { NotificationBell } from "@/components/layout/NotificationBell";

export function AlertsCluster({
  userId,
  unreadMessages,
  inboxHref,
}: {
  userId: string;
  unreadMessages: number;
  inboxHref: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <MessagesNavLink initialCount={unreadMessages} />
      <NotificationBell userId={userId} href={inboxHref} />
    </div>
  );
}
