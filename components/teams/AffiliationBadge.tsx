import { Badge } from "@/components/ui/Badge";
import { affiliationLabel, affiliationModel } from "@/lib/affiliation";

export function AffiliationBadge({
  name,
  orgId,
  orgName,
  parentTeamId,
  parentName,
  academyCount = 0,
}: {
  name: string;
  orgId?: string | null;
  orgName?: string | null;
  parentTeamId?: string | null;
  parentName?: string | null;
  academyCount?: number;
}) {
  const model = affiliationModel({ orgId, parentTeamId, academyCount });
  const tone =
    model === "STRUCTURE" ? "orange" : model === "CLUB" ? "cyan" : "muted";
  return (
    <Badge tone={tone}>
      {affiliationLabel({
        name,
        orgId,
        orgName,
        parentTeamId,
        parentName,
        academyCount,
      })}
    </Badge>
  );
}
