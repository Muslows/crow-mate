"use client";

import { useState } from "react";
import { InvitationInbox } from "@/components/invitations/InvitationInbox";
import { LeaveTeamButton } from "@/components/players/LeaveTeamButton";
import { ProfileForm } from "@/components/players/ProfileForm";
import {
  PlayerProfileCard,
  type ProfileCardData,
} from "@/components/players/PlayerProfileCard";
import { Panel } from "@/components/ui/Panel";

export function OwnerProfileStudio({
  profile,
  invitations = [],
}: {
  profile: ProfileCardData;
  invitations?: {
    id: string;
    message: string;
    team: { id: string; name: string };
    inviter: { name: string };
  }[];
}) {
  const [editing, setEditing] = useState(false);
  const roster = profile.user.rosterSlots ?? [];

  if (editing) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">
            Édition
          </p>
          <button
            type="button"
            className="hud-btn-ghost"
            onClick={() => setEditing(false)}
          >
            Annuler
          </button>
        </div>
        <Panel>
          <ProfileForm profile={profile} onSaved={() => setEditing(false)} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PlayerProfileCard
        profile={profile}
        showCopyId
        actions={
          <div className="flex flex-col gap-2 sm:items-end">
            <button type="button" className="hud-btn" onClick={() => setEditing(true)}>
              Modifier le profil
            </button>
            {roster.length > 0 ? (
              <LeaveTeamButton
                teamNames={roster.flatMap((slot) =>
                  slot.team ? [slot.team.name] : [],
                )}
              />
            ) : null}
          </div>
        }
      />
      <section id="invitations" className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em] text-cyan-400">
          Notifications
        </h2>
        <InvitationInbox invitations={invitations} />
      </section>
    </div>
  );
}
