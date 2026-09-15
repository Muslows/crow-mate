import { cleanupOrphanRosterPlayers } from "../lib/admin/cleanup-orphans";

async function main() {
  try {
    const result = await cleanupOrphanRosterPlayers();
    console.log(`Orphan roster players deleted: ${result.deleted}`);
  } catch (error) {
    console.error("Cleanup failed", error);
    process.exitCode = 1;
  }
}

main();
