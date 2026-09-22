import {
  AvailabilityMatrix,
  type AvailabilityMatrixRow,
} from "@/components/planning/AvailabilityMatrix";
import { AvailabilityLegend } from "@/components/planning/AvailabilityLegend";
import { PlanningWeekFrame } from "@/components/planning/WeekSwitcher";
import { formatDayHeading, formatWeekRange, weekDays } from "@/lib/week";
import type { OfficialScrimSlot, PlayerRole } from "@prisma/client";
import type { WeekdayKey } from "@/lib/week";
import type { ScrimSuggestion } from "@/lib/scrim-suggestion";

export function TeamPlanningBoard({
  offset,
  currentStart,
  nextStart,
  weekStartIso,
  teamId,
  players,
  suggestions,
  official,
  officialNotes,
  officialEditable = false,
  timeSlots,
}: {
  offset: 0 | 1;
  currentStart: string;
  nextStart: string;
  weekStartIso: string;
  teamId: string;
  players: {
    rosterId: string;
    name: string;
    role: PlayerRole;
    days: Record<WeekdayKey, string[]> | null;
  }[];
  suggestions: Record<WeekdayKey, ScrimSuggestion>;
  official: Record<WeekdayKey, OfficialScrimSlot>;
  officialNotes?: Record<WeekdayKey, string>;
  officialEditable?: boolean;
  timeSlots: { id: string; label: string }[];
}) {
  const columns = weekDays(weekStartIso).map((day) => ({
    key: day.key,
    label: formatDayHeading(day.iso),
  }));
  const rows: AvailabilityMatrixRow[] = players.map((player) => ({
    rosterId: player.rosterId,
    name: player.name,
    role: player.role,
    days: player.days,
  }));

  return (
    <PlanningWeekFrame
      offset={offset}
      currentLabel={formatWeekRange(currentStart)}
      nextLabel={formatWeekRange(nextStart)}
    >
      <AvailabilityLegend slots={timeSlots} />
      <AvailabilityMatrix
        columns={columns}
        rows={rows}
        suggestions={suggestions}
        official={official}
        officialNotes={officialNotes}
        officialEditable={officialEditable}
        teamId={teamId}
        weekStartDate={weekStartIso}
        timeSlots={timeSlots}
      />
    </PlanningWeekFrame>
  );
}
