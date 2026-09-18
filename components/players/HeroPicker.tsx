"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { FieldError } from "@/components/forms/FieldError";
import { HeroPortrait } from "@/components/players/HeroPortrait";
import {
  flattenLaneBoard,
  groupHeroesByLane,
  heroLane,
  HERO_LANE_LABELS,
  HERO_LANES,
  MAX_HEROES_PER_LANE,
} from "@/lib/hero-lanes";
import { OW_HEROES, type HeroRole } from "@/lib/ow-heroes";

const LANE_TONE: Record<HeroRole, string> = {
  TANK: "border-sky-400/40",
  DPS: "border-orange-400/40",
  SUPPORT: "border-lime-400/40",
};

function rankId(name: string) {
  return `rank:${name}`;
}

function poolId(name: string) {
  return `pool:${name}`;
}

function parseHeroId(
  id: string,
): { zone: "rank" | "pool" | "lane"; name: string } | null {
  if (id.startsWith("rank:")) return { zone: "rank", name: id.slice(5) };
  if (id.startsWith("pool:")) return { zone: "pool", name: id.slice(5) };
  if (id.startsWith("lane:")) return { zone: "lane", name: id.slice(5) };
  return null;
}

function RankedHero({
  name,
  rank,
  onRemove,
}: {
  name: string;
  rank: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rankId(name), data: { name, zone: "rank" } });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`relative touch-none ${isDragging ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        className="flex flex-col items-center gap-1 rounded-lg border border-orange-400/50 bg-black/50 p-1.5"
        aria-label={`${name}, rang ${rank}. Glisser pour réordonner.`}
        {...attributes}
        {...listeners}
      >
        <span className="font-mono text-[0.6rem] text-orange-300">#{rank}</span>
        <HeroPortrait name={name} size={56} />
        <span className="max-w-[4.5rem] truncate font-mono text-[0.6rem] uppercase">
          {name}
        </span>
      </button>
      <button
        type="button"
        className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[0.65rem] text-zinc-400"
        aria-label={`Retirer ${name}`}
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  );
}

function PoolHero({
  name,
  disabled,
  onAdd,
}: {
  name: string;
  disabled: boolean;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: poolId(name),
      disabled,
      data: { name, zone: "pool" },
    });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={isDragging ? "opacity-40" : ""}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onAdd}
        className="flex touch-none flex-col items-center gap-1 rounded-md border border-border bg-zinc-800/50 p-1 text-zinc-500 transition hover:border-orange-300 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={
          disabled
            ? `${name}, top 5 de ce rôle déjà complet`
            : `Ajouter ${name} au top 5`
        }
        {...attributes}
        {...listeners}
      >
        <HeroPortrait name={name} size={40} />
        <span className="max-w-[3.5rem] truncate font-mono text-[0.55rem] uppercase">
          {name}
        </span>
      </button>
    </li>
  );
}

function LaneBoard({
  lane,
  selected,
  pool,
  onAdd,
  onRemove,
}: {
  lane: HeroRole;
  selected: string[];
  pool: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}) {
  const droppableId = `lane:${lane}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const full = selected.length >= MAX_HEROES_PER_LANE;

  return (
    <section
      className={`rounded-xl border bg-black/25 p-3 ${LANE_TONE[lane]} ${
        isOver ? "ring-1 ring-orange-300/70" : ""
      }`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
          {HERO_LANE_LABELS[lane]}
        </h3>
        <p className="font-mono text-[0.65rem] text-zinc-500">
          {selected.length}/{MAX_HEROES_PER_LANE}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className="min-h-[5.5rem] rounded-lg border border-dashed border-border p-2"
      >
        {selected.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-500">
            Glisse jusqu’à {MAX_HEROES_PER_LANE} héros ici
          </p>
        ) : (
          <SortableContext
            items={selected.map(rankId)}
            strategy={horizontalListSortingStrategy}
          >
            <ol className="flex flex-wrap gap-2">
              {selected.map((name, index) => (
                <RankedHero
                  key={name}
                  name={name}
                  rank={index + 1}
                  onRemove={() => onRemove(name)}
                />
              ))}
            </ol>
          </SortableContext>
        )}
      </div>
      <p className="mt-3 mb-2 text-[0.6rem] uppercase tracking-[0.14em] text-zinc-500">
        Réserve
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {pool.map((heroName) => (
          <PoolHero
            key={heroName}
            name={heroName}
            disabled={full}
            onAdd={() => onAdd(heroName)}
          />
        ))}
      </ul>
    </section>
  );
}

export function HeroPicker({
  name = "heroes",
  defaultSelected = [],
  error,
}: {
  name?: string;
  defaultSelected?: string[];
  error?: string;
}) {
  const [board, setBoard] = useState(() => {
    const grouped = groupHeroesByLane(defaultSelected);
    for (const lane of HERO_LANES) {
      grouped[lane] = grouped[lane].slice(0, MAX_HEROES_PER_LANE);
    }
    return grouped;
  });
  const [activeName, setActiveName] = useState<string | null>(null);
  const selectedHeroes = flattenLaneBoard(board);

  const poolByLane = useMemo(() => {
    const selected = new Set(selectedHeroes);
    const pools: Record<HeroRole, string[]> = {
      TANK: [],
      DPS: [],
      SUPPORT: [],
    };
    for (const hero of OW_HEROES) {
      if (selected.has(hero.name)) continue;
      pools[hero.role].push(hero.name);
    }
    return pools;
  }, [selectedHeroes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function addHero(heroName: string) {
    const lane = heroLane(heroName);
    if (!lane) return;
    setBoard((current) => {
      if (current[lane].includes(heroName)) return current;
      if (current[lane].length >= MAX_HEROES_PER_LANE) return current;
      return { ...current, [lane]: [...current[lane], heroName] };
    });
  }

  function removeHero(heroName: string) {
    const lane = heroLane(heroName);
    if (!lane) return;
    setBoard((current) => ({
      ...current,
      [lane]: current[lane].filter((item) => item !== heroName),
    }));
  }

  function onDragStart(event: DragStartEvent) {
    const parsed = parseHeroId(String(event.active.id));
    setActiveName(parsed?.name ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveName(null);
    const active = parseHeroId(String(event.active.id));
    if (!active || !event.over) return;
    const over = parseHeroId(String(event.over.id));
    const lane = heroLane(active.name);
    if (!lane) return;

    if (active.zone === "pool") {
      const targetLane =
        over?.zone === "lane"
          ? (over.name as HeroRole)
          : over?.zone === "rank"
            ? heroLane(over.name)
            : undefined;
      if (targetLane === lane) addHero(active.name);
      return;
    }

    setBoard((current) => {
      const list = current[lane];
      const from = list.indexOf(active.name);
      if (from < 0) return current;
      let to = from;
      if (over?.zone === "rank") {
        const overIndex = list.indexOf(over.name);
        if (overIndex >= 0) to = overIndex;
      }
      if (from === to) return current;
      return { ...current, [lane]: arrayMove(list, from, to) };
    });
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm uppercase tracking-wider text-zinc-400">
        Tier list
      </legend>
      <p className="mb-4 text-sm text-zinc-400">
        Glisse les portraits pour un top {MAX_HEROES_PER_LANE} Tank, DPS et
        Support. L’ordre est immédiat ; il n’est enregistré qu’avec le profil.
      </p>
      <FieldError id="heroes-error" message={error} />
      {selectedHeroes.map((heroName) => (
        <input key={heroName} type="hidden" name={name} value={heroName} />
      ))}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragCancel={() => setActiveName(null)}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col gap-4">
          {HERO_LANES.map((lane) => (
            <LaneBoard
              key={lane}
              lane={lane}
              selected={board[lane]}
              pool={poolByLane[lane]}
              onAdd={addHero}
              onRemove={removeHero}
            />
          ))}
        </div>
        <DragOverlay>
          {activeName ? (
            <div className="rounded-lg border border-orange-400 bg-black/80 p-1 shadow-xl">
              <HeroPortrait name={activeName} size={56} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </fieldset>
  );
}
