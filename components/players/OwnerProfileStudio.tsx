"use client";

import Link from "next/link";
import { useState } from "react";
import { LeaveTeamButton } from "@/components/players/LeaveTeamButton";
import { ProfileForm } from "@/components/players/ProfileForm";
import {
  PlayerProfileCard,
  type ProfileCardData,
} from "@/components/players/PlayerProfileCard";
import { Panel } from "@/components/ui/Panel";

export function OwnerProfileStudio({
  profile,
}: {
  profile: ProfileCardData;
}) {
  const [editing, setEditing] = useState(false);
  const roster = profile.user.rosterSlots ?? [];

  if (editing) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-zinc-200">Édition</p>
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
        revealBattleTag
        revealDiscord
        actions={
          <div className="flex flex-col gap-2 sm:items-end">
            <button type="button" className="hud-btn" onClick={() => setEditing(true)}>
              Modifier le profil
            </button>
            <Link href="/profile/planning" className="hud-btn-ghost">
              Mon planning
            </Link>
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
    </div>
  );
}
