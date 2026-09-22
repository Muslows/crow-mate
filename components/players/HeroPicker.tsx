"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
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

type DragMeta = {
  type: "rank" | "pool" | "lane-drop";
  name?: string;
  lane: HeroRole;
};

function rankId(lane: HeroRole, name: string) {
  return `rank:${lane}:${name}`;
}

function poolId(lane: HeroRole, name: string) {
  return `pool:${lane}:${name}`;
}

function laneDropId(lane: HeroRole) {
  return `lane-drop:${lane}`;
}

const laneFirstCollision: CollisionDetection = (args) => {
  const containers = args.droppableContainers.filter((container) => {
    const type = container.data.current?.type as DragMeta["type"] | undefined;
    return type === "lane-drop" || type === "rank";
  });
  const scoped = { ...args, droppableContainers: containers };
  const pointerHits = pointerWithin(scoped);
  if (pointerHits.length > 0) return pointerHits;
  return closestCorners(scoped);
};

function RankedHero({
  lane,
  name,
  rank,
  onRemove,
}: {
  lane: HeroRole;
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
  } = useSortable({
    id: rankId(lane, name),
    data: { type: "rank", name, lane } satisfies DragMeta,
  });

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
        className="flex flex-col items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 p-1.5 transition-colors duration-200 dark:border-orange-400/50 dark:bg-black/50"
        aria-label={`${name}, rang ${rank}. Glisser pour réordonner.`}
        {...attributes}
        {...listeners}
      >
        <span className="font-mono text-[0.6rem] text-orange-700 dark:text-orange-300">
          #{rank}
        </span>
        <HeroPortrait name={name} size={56} />
        <span className="max-w-[4.5rem] truncate font-mono text-[0.6rem] uppercase">
          {name}
        </span>
      </button>
      <button
        type="button"
        className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-[0.65rem] text-zinc-600 dark:text-zinc-400"
        aria-label={`Retirer ${name}`}
        onClick={onRemove}
      >
        ×
      </button>
    </li>
  );
}

function PoolHero({
  lane,
  name,
  disabled,
  onAdd,
}: {
  lane: HeroRole;
  name: string;
  disabled: boolean;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: poolId(lane, name),
      disabled,
      data: { type: "pool", name, lane } satisfies DragMeta,
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
        className="flex touch-none flex-col items-center gap-1 rounded-md border border-border bg-zinc-100 p-1 text-zinc-600 transition-colors duration-200 hover:border-orange-400 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-orange-300 dark:hover:text-orange-300"
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
  const { setNodeRef, isOver } = useDroppable({
    id: laneDropId(lane),
    data: { type: "lane-drop", lane } satisfies DragMeta,
  });
  const full = selected.length >= MAX_HEROES_PER_LANE;

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border bg-zinc-50 p-3 transition-colors duration-200 dark:bg-black/25 ${LANE_TONE[lane]} ${
        isOver ? "ring-1 ring-orange-300/70" : ""
      }`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-800 dark:text-orange-200">
          {HERO_LANE_LABELS[lane]}
        </h3>
        <p className="font-mono text-[0.65rem] text-zinc-500">
          {selected.length}/{MAX_HEROES_PER_LANE}
        </p>
      </div>
      <div className="min-h-[5.5rem] rounded-lg border border-dashed border-border p-2">
        {selected.length === 0 ? (
          <p className="py-4 text-center text-xs text-zinc-500">
            Glisse jusqu’à {MAX_HEROES_PER_LANE} héros ici
          </p>
        ) : null}
        <SortableContext
          items={selected.map((name) => rankId(lane, name))}
          strategy={horizontalListSortingStrategy}
        >
          <ol className="flex min-h-[1rem] flex-wrap gap-2">
            {selected.map((name, index) => (
              <RankedHero
                key={rankId(lane, name)}
                lane={lane}
                name={name}
                rank={index + 1}
                onRemove={() => onRemove(name)}
              />
            ))}
          </ol>
        </SortableContext>
      </div>
      <p className="mt-3 mb-2 text-[0.6rem] uppercase tracking-[0.14em] text-zinc-500">
        Réserve
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {pool.map((heroName) => (
          <PoolHero
            key={poolId(lane, heroName)}
            lane={lane}
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
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
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
    const data = event.active.data.current as DragMeta | undefined;
    setActiveName(data?.name ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveName(null);
    const active = event.active.data.current as DragMeta | undefined;
    const over = event.over?.data.current as DragMeta | undefined;
    if (!active) return;

    if (active.type === "pool" && active.name) {
      if (over && over.lane === active.lane) {
        addHero(active.name);
      }
      return;
    }

    if (active.type !== "rank" || !active.name || !over) return;
    if (over.lane !== active.lane) return;

    setBoard((current) => {
      const list = current[active.lane];
      const from = list.indexOf(active.name!);
      if (from < 0) return current;
      let to = from;
      if (over.type === "rank" && over.name) {
        const overIndex = list.indexOf(over.name);
        if (overIndex >= 0) to = overIndex;
      } else if (over.type === "lane-drop") {
        to = list.length - 1;
      }
      if (from === to) return current;
      return { ...current, [active.lane]: arrayMove([...list], from, to) };
    });
  }

  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        Tier list
      </legend>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Glisse les portraits pour un top {MAX_HEROES_PER_LANE} Tank, DPS et
        Support. L’ordre est immédiat ; il n’est enregistré qu’avec le profil.
      </p>
      <FieldError id="heroes-error" message={error} />
      {selectedHeroes.map((heroName) => (
        <input key={heroName} type="hidden" name={name} value={heroName} />
      ))}
      <DndContext
        sensors={sensors}
        collisionDetection={laneFirstCollision}
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
            <div className="rounded-lg border border-orange-400 bg-white p-1 shadow-xl dark:bg-black/80">
              <HeroPortrait name={activeName} size={56} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </fieldset>
  );
}
