"use client";

import { useState } from "react";
import { OW_MAPS, mapScreenshotUrl } from "@/lib/ow-maps";

export function MapPickerModal({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}) {
  const [failed, setFailed] = useState<Record<string, true>>({});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-surface/40"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choisir une map"
        className="relative z-10 max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Maps</h2>
          <button type="button" className="hud-btn-ghost" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OW_MAPS.map((map) => {
            const selected = map.value === value;
            return (
              <button
                key={map.value}
                type="button"
                onClick={() => {
                  onSelect(map.value);
                  onClose();
                }}
                className={`overflow-hidden rounded-xl border text-left ${
                  selected
                    ? "border-orange-400 ring-2 ring-orange-200"
                    : "border-border hover:border-orange-800/70"
                }`}
              >
                <span className="relative block aspect-video bg-zinc-800">
                  {failed[map.value] ? (
                    <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs font-medium text-zinc-400">
                      {map.value}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mapScreenshotUrl(map.value)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() =>
                        setFailed((current) => ({ ...current, [map.value]: true }))
                      }
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-surface/55 px-2 py-1 text-xs font-medium text-white">
                    {map.value}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
