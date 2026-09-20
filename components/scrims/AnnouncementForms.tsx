"use client";

import { useActionState, useEffect, useState } from "react";
import { createLfsAnnouncement } from "@/lib/actions/announcements";
import { emptyActionState, firstFieldError } from "@/lib/actions/state";
import { FieldError } from "@/components/forms/FieldError";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Panel } from "@/components/ui/Panel";
import {
  LFS_PLATFORMS,
  LFS_REGIONS,
  LFS_START_HOURS,
  WEEKDAY_EN,
  WEEKDAY_FR,
  formatSrAsK,
  lfsHeadlineForSelection,
  type LfsPlatform,
  type LfsRegion,
  type LfsStartHour,
} from "@/lib/lfs";
import { WEEKDAY_KEYS, type WeekdayKey } from "@/lib/week";

export function LfScrimForm({
  teamId,
  teamName,
  estimatedSr,
  initialHeadline,
  initialExpiresLabel,
}: {
  teamId: string;
  teamName: string;
  estimatedSr: number;
  initialHeadline: string;
  initialExpiresLabel: string;
}) {
  const [region, setRegion] = useState<LfsRegion>("EU");
  const [platform, setPlatform] = useState<LfsPlatform>("PC");
  const [weekday, setWeekday] = useState<WeekdayKey>("monday");
  const [startHour, setStartHour] = useState<LfsStartHour>(21);
  const [headline, setHeadline] = useState(initialHeadline);
  const [expiresLabel, setExpiresLabel] = useState(initialExpiresLabel);
  const [content, setContent] = useState(initialHeadline);
  const [dirty, setDirty] = useState(false);
  const [state, action, pending] = useActionState(
    createLfsAnnouncement,
    emptyActionState,
  );

  useEffect(() => {
    const generated = lfsHeadlineForSelection({
      region,
      platform,
      estimatedSr,
      weekday,
      startHour,
    });
    setHeadline(generated.headline);
    setExpiresLabel(
      generated.expiresAt.toLocaleString("fr-FR", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
      }),
    );
    if (!dirty) setContent(generated.headline);
  }, [region, platform, estimatedSr, weekday, startHour, dirty]);

  return (
    <Panel>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="teamId" value={teamId} />
        <input type="hidden" name="region" value={region} />
        <input type="hidden" name="platform" value={platform} />
        <input type="hidden" name="weekday" value={weekday} />
        <input type="hidden" name="startHour" value={String(startHour)} />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
            Publier un LFS
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Modèle scène EU :{" "}
            <span className="font-mono text-zinc-800 dark:text-zinc-100">
              LFS EU PC {formatSrAsK(estimatedSr)} Monday 21h - 23h CEST
            </span>
            . Le jour est toujours généré en anglais. Ton Discord de contact
            sera affiché sur le site et dans l’embed.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="form-label">
            Région
            <select
              className="hud-input"
              value={region}
              onChange={(event) => setRegion(event.target.value as LfsRegion)}
            >
              {LFS_REGIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Plateforme
            <select
              className="hud-input"
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value as LfsPlatform)
              }
            >
              {LFS_PLATFORMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Jour
            <select
              className="hud-input"
              value={weekday}
              onChange={(event) =>
                setWeekday(event.target.value as WeekdayKey)
              }
            >
              {WEEKDAY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {WEEKDAY_FR[key]} ({WEEKDAY_EN[key]})
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Créneau
            <select
              className="hud-input"
              value={String(startHour)}
              onChange={(event) =>
                setStartHour(Number(event.target.value) as LfsStartHour)
              }
            >
              {LFS_START_HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour}h – {hour + 2}h
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {teamName} · SR estimé {estimatedSr} → {formatSrAsK(estimatedSr)} ·
          expire à la fin du créneau ({expiresLabel} Europe/Paris)
        </p>
        <label className="form-label">
          Annonce
          <textarea
            name="content"
            rows={3}
            maxLength={500}
            className="hud-input min-h-20 font-mono text-sm"
            value={content}
            onChange={(event) => {
              setDirty(true);
              setContent(event.target.value);
            }}
          />
          <FieldError
            id="lfs-content-error"
            message={firstFieldError(state.fieldErrors, "content")}
          />
        </label>
        {dirty ? (
          <button
            type="button"
            className="hud-btn-ghost w-fit"
            onClick={() => {
              setDirty(false);
              setContent(headline);
            }}
          >
            Réinitialiser le modèle
          </button>
        ) : null}
        <FieldError
          id="scrim-expiry-error"
          message={firstFieldError(state.fieldErrors, "expiresAt")}
        />
        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-sm ${
              state.ok
                ? "text-lime-700 dark:text-lime-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <SubmitButton
          pending={pending}
          idleLabel="Publier le LFS"
          pendingLabel="Publication…"
        />
      </form>
    </Panel>
  );
}
