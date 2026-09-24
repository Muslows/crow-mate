import { BotDocs } from "@/components/discord/BotDocs";
import {
  discordBotInviteUrl,
  discordCommunityInviteUrl,
} from "@/lib/discord/config";

export default function BotDiscordPage() {
  return (
    <BotDocs
      communityInviteUrl={discordCommunityInviteUrl()}
      botInviteUrl={discordBotInviteUrl()}
    />
  );
}
