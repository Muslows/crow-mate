CREATE TYPE "ScrimMapPool" AS ENUM ('OFFICIEL', 'ALTERNATIVE', 'LOOSERPICK', 'CUSTOM');
CREATE TYPE "ScrimLobbyHostPref" AS ENUM ('NOUS_UNIQUEMENT', 'PREFERENCE_NOUS', 'PEU_IMPORTE', 'PREFERENCE_VOUS', 'VOUS_UNIQUEMENT');

CREATE TABLE "TeamScrimConfig" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "discordManager" TEXT NOT NULL DEFAULT '',
    "battleTagContact" TEXT NOT NULL DEFAULT '',
    "stagger" BOOLEAN NOT NULL DEFAULT false,
    "povStream" BOOLEAN NOT NULL DEFAULT false,
    "mapPool" "ScrimMapPool" NOT NULL DEFAULT 'OFFICIEL',
    "lobbyHost" "ScrimLobbyHostPref" NOT NULL DEFAULT 'PEU_IMPORTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamScrimConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamScrimConfig_teamId_key" ON "TeamScrimConfig"("teamId");
CREATE INDEX "TeamScrimConfig_teamId_idx" ON "TeamScrimConfig"("teamId");

ALTER TABLE "TeamScrimConfig" ADD CONSTRAINT "TeamScrimConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
