const MAP_SCREENSHOT_KEYS: Record<string, string> = {
  Ilios: "ilios",
  "Lijiang Tower": "lijiang-tower",
  Nepal: "nepal",
  Oasis: "oasis",
  Busan: "busan",
  "Antarctic Peninsula": "antarctic-peninsula",
  Samoa: "samoa",
  "Watchpoint: Gibraltar": "watchpoint-gibraltar",
  Dorado: "dorado",
  "Route 66": "route-66",
  Junkertown: "junkertown",
  Rialto: "rialto",
  "Shambali Monastery": "shambali-monastery",
  "Circuit Royal": "circuit-royal",
  Havana: "havana",
  "King's Row": "kings-row",
  Numbani: "numbani",
  Hollywood: "hollywood",
  Eichenwalde: "eichenwalde",
  Midtown: "midtown",
  Paraiso: "paraiso",
  "Blizzard World": "blizzard-world",
  "New Queen Street": "new-queen-street",
  Colosseo: "colosseo",
  Esperança: "esperanca",
  Runasapi: "runasapi",
  "New Junk City": "new-junk-city",
  Suravasa: "suravasa",
  Aatlis: "aatlis",
  Hanaoka: "hanaoka",
  "Throne of Anubis": "throne-of-anubis",
};

export const OW_MAPS = [
  { value: "Ilios", group: "Control" },
  { value: "Lijiang Tower", group: "Control" },
  { value: "Nepal", group: "Control" },
  { value: "Oasis", group: "Control" },
  { value: "Busan", group: "Control" },
  { value: "Antarctic Peninsula", group: "Control" },
  { value: "Samoa", group: "Control" },
  { value: "Watchpoint: Gibraltar", group: "Escort" },
  { value: "Dorado", group: "Escort" },
  { value: "Route 66", group: "Escort" },
  { value: "Junkertown", group: "Escort" },
  { value: "Rialto", group: "Escort" },
  { value: "Shambali Monastery", group: "Escort" },
  { value: "Circuit Royal", group: "Escort" },
  { value: "Havana", group: "Escort" },
  { value: "King's Row", group: "Hybrid" },
  { value: "Numbani", group: "Hybrid" },
  { value: "Hollywood", group: "Hybrid" },
  { value: "Eichenwalde", group: "Hybrid" },
  { value: "Midtown", group: "Hybrid" },
  { value: "Paraiso", group: "Hybrid" },
  { value: "Blizzard World", group: "Hybrid" },
  { value: "New Queen Street", group: "Push" },
  { value: "Colosseo", group: "Push" },
  { value: "Esperança", group: "Push" },
  { value: "Runasapi", group: "Push" },
  { value: "New Junk City", group: "Flashpoint" },
  { value: "Suravasa", group: "Flashpoint" },
  { value: "Aatlis", group: "Flashpoint" },
  { value: "Hanaoka", group: "Clash" },
  { value: "Throne of Anubis", group: "Clash" },
] as const;

export type OwMapName = (typeof OW_MAPS)[number]["value"];

export const OW_MAP_NAMES = OW_MAPS.map((map) => map.value) as [
  OwMapName,
  ...OwMapName[],
];

export function mapScreenshotUrl(name: string): string {
  const key =
    MAP_SCREENSHOT_KEYS[name] ??
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’:]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `https://overfast-api.tekrop.fr/static/maps/${key}.jpg`;
}
