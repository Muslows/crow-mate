import { Panel } from "@/components/ui/Panel";

export function SundayPlanningBanner({
  isSunday,
  nextWeekSaved,
}: {
  isSunday: boolean;
  nextWeekSaved: boolean;
}) {
  const urgent = isSunday && !nextWeekSaved;

  return (
    <Panel
      className={
        urgent
          ? "border-orange-200 bg-orange-50 dark:border-orange-800/70 dark:bg-orange-950/40"
          : ""
      }
    >
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Rappel</p>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Remplis ou mets à jour ton planning chaque dimanche pour la semaine à
        venir.
      </p>
      {urgent ? (
        <p className="mt-2 text-sm text-orange-800 dark:text-orange-200">
          Dimanche : la semaine prochaine n&apos;est pas encore enregistrée.
          Confirme tes dispos avant le lundi.
        </p>
      ) : null}
    </Panel>
  );
}
