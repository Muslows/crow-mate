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
    <Panel className={urgent ? "border-orange-800/70 bg-orange-950/40" : ""}>
      <p className="text-xs font-medium text-zinc-500">Rappel</p>
      <p className="mt-2 text-lg font-semibold text-foreground">
        Remplis ou mets à jour ton planning chaque dimanche pour la semaine à
        venir.
      </p>
      {urgent ? (
        <p className="mt-2 text-sm text-orange-200">
          Dimanche : la semaine prochaine n&apos;est pas encore enregistrée.
          Confirme tes dispos avant le lundi.
        </p>
      ) : null}
    </Panel>
  );
}
