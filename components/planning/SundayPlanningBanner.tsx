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
          ? "border-orange-400/70 bg-orange-400/10"
          : "border-cyan-400/30"
      }
    >
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-orange-300">
        Rappel récurrent
      </p>
      <p className="mt-2 text-lg font-semibold uppercase tracking-wide text-cyan-100">
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
