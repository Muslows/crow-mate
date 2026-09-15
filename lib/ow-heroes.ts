import type { PlayerRole } from "@prisma/client";

export type OwHero = {
  name: string;
  slug: string;
  role: PlayerRole;
  portrait: string;
};

const CDN = "https://d15f34w2p8l1cc.cloudfront.net/overwatch";

function hero(
  name: string,
  slug: string,
  role: PlayerRole,
  hash: string,
): OwHero {
  return { name, slug, role, portrait: `${CDN}/${hash}.png` };
}

/** Official Blizzard CDN portraits (via Overfast / playoverwatch hashes). */
export const OW_HEROES: OwHero[] = [
  hero("D.Va", "dva", "TANK", "df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56"),
  hero("D.Mon", "dmon", "TANK", "a46c60b8562fdbd0b8308396d0808f7606fba208bc67cccf3f82fe56d2c73b9d"),
  hero("Domina", "domina", "TANK", "1161c112292c56c052c0ae711792fcde06e3251b98bc9709e582dd7585b5dcd6"),
  hero("Doomfist", "doomfist", "TANK", "ff5c54f43ad253c7faeda9c4ed31d42582ea6b19205d197866f3dd0c0aa14c16"),
  hero("Hazard", "hazard", "TANK", "ca48b96dbae6ea7f58ce8a5e73513c8c62b1685bdbf258020fb78bb21a008b5f"),
  hero("Junker Queen", "junker-queen", "TANK", "06eeecb359f311f43a8f5121d4f9f3a93c565d70b30e94ef543c05596c9a39dc"),
  hero("Mauga", "mauga", "TANK", "33d39bb439c08975197fc52eff4874716839711b5356c4fdc174f9c24bac1d0e"),
  hero("Orisa", "orisa", "TANK", "a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6"),
  hero("Ramattra", "ramattra", "TANK", "ddef7c9fb8ce4256e8508196b486f81950efe7aaa6cf27fec4668beb4cd15774"),
  hero("Reinhardt", "reinhardt", "TANK", "551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e"),
  hero("Roadhog", "roadhog", "TANK", "89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03"),
  hero("Sigma", "sigma", "TANK", "a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d"),
  hero("Winston", "winston", "TANK", "46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5"),
  hero("Wrecking Ball", "wrecking-ball", "TANK", "9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa"),
  hero("Zarya", "zarya", "TANK", "9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080"),
  hero("Anran", "anran", "DPS", "2c38b41d79a1ce9a08b9ad8eb7edf3ff819bd448af16a5815be8c7fdb7203aa0"),
  hero("Ashe", "ashe", "DPS", "4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94"),
  hero("Bastion", "bastion", "DPS", "4ede795c2a681aaccfa72d0c901cba0cb8a2c292fd6a97b2ba9faed161c2d184"),
  hero("Cassidy", "cassidy", "DPS", "9240cd64cc8ef58df9acbf55204ab1b5d8578f743fda5931f0dbccbd75ab841b"),
  hero("Echo", "echo", "DPS", "d4f2d5b0c2b7e82d61353186c5f23152ccba9d3569b50839aa580dca3e9114ba"),
  hero("Emre", "emre", "DPS", "c51e2f698138861c0e3b6cfab3c3ca9d67fd709be175e7c397aa6f2649712a30"),
  hero("Freja", "freja", "DPS", "811963897c352d9f178bec882d94bd0281074feee7c429c5145b6b8ea8ebe862"),
  hero("Genji", "genji", "DPS", "156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8"),
  hero("Hanzo", "hanzo", "DPS", "78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5"),
  hero("Junkrat", "junkrat", "DPS", "7660b9fc6f25f30858fdd8797fe0d52b2306f1e78fef99843f58a274e69af046"),
  hero("Mei", "mei", "DPS", "4a55ced3bd597fb08e0fde9dc007f8543ac616ba98ca3db9b0e4d871a8ae17f8"),
  hero("Pharah", "pharah", "DPS", "60ac2d5de4a6d34644d8872233da402f1436c87f804bb11a21661bb30bf4a51f"),
  hero("Reaper", "reaper", "DPS", "dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9"),
  hero("Shion", "shion", "DPS", "070481cf871590a2b45a51d1335f9fe3d65eb4e4d361ecdd998b34fae2ed65d5"),
  hero("Sierra", "sierra", "DPS", "4bfd3d8b95844231115cb5bf4db03344c71bc3e865189c52403b2dc51438e63a"),
  hero("Sojourn", "sojourn", "DPS", "82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889"),
  hero("Soldier: 76", "soldier-76", "DPS", "c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2"),
  hero("Sombra", "sombra", "DPS", "47727b02a16e3bd7b2447d86ae1edf11587bc320b2aecb4f2f16a7ca4ad4e8a0"),
  hero("Symmetra", "symmetra", "DPS", "ebec57e8bd68b3d4383edfeb34f8f52dd0b94a6467d594c2fee722e8a97c32aa"),
  hero("Torbjörn", "torbjorn", "DPS", "ce17118cedc29b0d2ac1e059666bed36b9531c85079b0b894bb402d12c917ba9"),
  hero("Tracer", "tracer", "DPS", "4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502"),
  hero("Vendetta", "vendetta", "DPS", "cf8ffb52b6f315546d5e94e9d6defad5a2c570798776956de23f47536f9529da"),
  hero("Venture", "venture", "DPS", "dcab9123f5f55df22e54d4e797de43c71b917e0149dd059a7fd6136f48464cd0"),
  hero("Widowmaker", "widowmaker", "DPS", "6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259"),
  hero("Ana", "ana", "SUPPORT", "985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed"),
  hero("Baptiste", "baptiste", "SUPPORT", "d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680"),
  hero("Brigitte", "brigitte", "SUPPORT", "795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0"),
  hero("Illari", "illari", "SUPPORT", "ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4"),
  hero("Jetpack Cat", "jetpack-cat", "SUPPORT", "03a184cd0de27091e0099ac22635ad9615a8f6997881a5c25cc5f2444764f729"),
  hero("Juno", "juno", "SUPPORT", "c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0"),
  hero("Kiriko", "kiriko", "SUPPORT", "408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d"),
  hero("Lifeweaver", "lifeweaver", "SUPPORT", "3376515cebed0904012e67e956f6d1b9c12e03da642845eeaf787b7e4c7b339d"),
  hero("Lúcio", "lucio", "SUPPORT", "040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044"),
  hero("Mercy", "mercy", "SUPPORT", "3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab"),
  hero("Mizuki", "mizuki", "SUPPORT", "a9733c2367e0cbd70b9316fd2e1e17028653ec56d0051ea6ff098531dc4f99fc"),
  hero("Moira", "moira", "SUPPORT", "f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de"),
  hero("Wuyang", "wuyang", "SUPPORT", "4959500b495b35c0908be2abda56b53f2601b2c5cc39a1cfde8df1bffd38d66d"),
  hero("Zenyatta", "zenyatta", "SUPPORT", "7d1546b1541a8afc39353f9337a408d6275a141b0432b7e560ef61579996b0fc"),
];

export const OW_HERO_NAMES = OW_HEROES.map((hero) => hero.name) as [
  string,
  ...string[],
];

export function findHero(name: string): OwHero | undefined {
  return OW_HEROES.find((hero) => hero.name === name);
}
