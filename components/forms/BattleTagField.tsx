"use client";

import { useEffect, useState } from "react";
import { FieldError } from "@/components/forms/FieldError";

const BATTLETAG_PATTERN = /^[A-Za-z0-9]{3,12}#\d{4,6}$/;

export function BattleTagField({
  defaultValue = "",
  serverError,
}: {
  defaultValue?: string;
  serverError?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [takenError, setTakenError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const tag = value.trim();
    if (!BATTLETAG_PATTERN.test(tag) || tag === defaultValue.trim()) {
      setTakenError(undefined);
      setChecking(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setChecking(true);
      try {
        const response = await fetch(
          `/api/battletag?tag=${encodeURIComponent(tag)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setTakenError(undefined);
          return;
        }
        const payload = (await response.json()) as {
          available?: boolean;
          error?: boolean;
        };
        if (payload.error) {
          setTakenError(undefined);
          return;
        }
        setTakenError(
          payload.available === false
            ? "Ce BattleTag est déjà utilisé"
            : undefined,
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setTakenError(undefined);
      } finally {
        setChecking(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, defaultValue]);

  const message = serverError ?? takenError;

  return (
    <label className="flex flex-col gap-1 text-sm uppercase tracking-wider text-zinc-400">
      BattleTag
      <input
        name="battleTag"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
        placeholder="Player#1234"
        pattern="[A-Za-z0-9]{3,12}#[0-9]{4,6}"
        className="hud-input font-mono"
        aria-invalid={Boolean(message)}
        aria-describedby="profile-battletag-error"
      />
      {checking ? (
        <span className="font-mono text-[0.65rem] text-cyan-400">Vérification…</span>
      ) : null}
      <FieldError id="profile-battletag-error" message={message} />
    </label>
  );
}
