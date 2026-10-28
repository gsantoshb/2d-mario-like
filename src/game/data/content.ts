export type HeroId = 'balayya' | 'chiru' | 'pk';
export type LevelId =
  'festival-run' | 'rooftop-chase' | 'papikondalu-trail' | 'studio-showdown' | 'fortress-finale';
export const CAMPAIGN: readonly LevelId[] = [
  'festival-run',
  'rooftop-chase',
  'papikondalu-trail',
  'studio-showdown',
  'fortress-finale',
];
export const nextLevel = (id: LevelId): LevelId | undefined => CAMPAIGN[CAMPAIGN.indexOf(id) + 1];
export const actNumber = (id: LevelId) => CAMPAIGN.indexOf(id) + 1;
export const getLevel = (id: LevelId): Level => {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
};
export const HEROES: {
  id: HeroId;
  name: string;
  title: string;
  skill: string;
  description: string;
  color: string;
  number: string;
}[] = [
  {
    id: 'balayya',
    name: 'BALAYYA',
    title: 'THE LION',
    skill: 'Simha Roar',
    description: 'Unleash a mighty shockwave. Send everything in your path flying.',
    color: '#f7bf4f',
    number: '01',
  },
  {
    id: 'chiru',
    name: 'CHIRU',
    title: 'THE MEGASTAR',
    skill: 'Mega Spin',
    description: 'Spin into action. Strike enemies on both sides with one stylish move.',
    color: '#65c6ab',
    number: '02',
  },
  {
    id: 'pk',
    name: 'PK',
    title: 'THE POWER STAR',
    skill: 'Power Dash',
    description: 'Move like lightning. Dash through enemies before they see you coming.',
    color: '#ef8169',
    number: '03',
  },
];
export const SKINS = HEROES.flatMap((h) => [
  {
    id: `${h.id}-default`,
    hero: h.id,
    name: 'Original',
    price: 0,
    sheet: h.id,
  },
  {
    id: `${h.id}-alt`,
    hero: h.id,
    name:
      h.id === 'balayya' ? 'Royal Saffron' : h.id === 'chiru' ? 'Midnight Mega' : 'Electric Blue',
    price: 30,
    sheet: `${h.id}-alt`,
  },
]);
export const TUNING = {
  speed: 106,
  jump: 286,
  gravity: 760,
  coyote: 100,
  buffer: 100,
  protection: 1000,
  cooldown: 3000,
  dashSpeed: 240,
  dashDuration: 220,
  skillDuration: 340,
  growthScale: 1.25,
  starDuration: 8000,
};
export interface Surface {
  x: number;
  y: number;
  w: number;
  h?: number;
  moving?: boolean;
  travel?: number;
}
export interface EnemySpawn {
  x: number;
  y: number;
  kind: 'patrol' | 'ranged';
  min: number;
  max: number;
}
export interface Level {
  id: LevelId;
  title: string;
  subtitle: string;
  location: string;
  color: string;
  width: number;
  theme: 'village' | 'city' | 'forest' | 'studio' | 'fort';
  pickups: { id: string; kind: 'growshroom' | 'star'; x: number; y: number }[];
  ground: [number, number][];
  platforms: Surface[];
  enemies: EnemySpawn[];
  checkpoints: number[];
  coins: [number, number][];
  exit: number;
  escape?: { start: number; seconds: number };
  boss?: number;
}
const coinsAlong = (xs: number[], y = 166): [number, number][] =>
  xs.flatMap(
    (x) =>
      [
        [x, y],
        [x + 16, y - 6],
        [x + 32, y],
      ] as [number, number][],
  );
export const LEVELS: Level[] = [
  {
    id: 'festival-run',
    title: 'Festival Run',
    subtitle: 'Every legend starts somewhere.',
    location: 'GODAVARI VILLAGE',
    color: '#e9b56c',
    width: 2240,
    theme: 'village',
    pickups: [
      { id: 'grow-intro', kind: 'growshroom', x: 160, y: 177 },
      { id: 'star-intro', kind: 'star', x: 272, y: 126 },
      { id: 'grow-recovery', kind: 'growshroom', x: 1198, y: 177 },
    ],
    ground: [
      [0, 480],
      [544, 480],
      [1088, 496],
      [1648, 592],
    ],
    platforms: [
      { x: 240, y: 148, w: 64 },
      { x: 432, y: 150, w: 64 },
      { x: 720, y: 136, w: 80 },
      { x: 960, y: 150, w: 64 },
      { x: 1248, y: 144, w: 64 },
      { x: 1520, y: 150, w: 80 },
      { x: 1824, y: 136, w: 80 },
      { x: 2080, y: 160, w: 16, h: 32 },
    ],
    enemies: [
      { x: 360, y: 180, kind: 'patrol', min: 300, max: 440 },
      { x: 800, y: 180, kind: 'patrol', min: 670, max: 930 },
      { x: 1330, y: 180, kind: 'ranged', min: 1250, max: 1440 },
      { x: 1900, y: 180, kind: 'patrol', min: 1780, max: 2040 },
    ],
    checkpoints: [640, 1184, 1744],
    coins: coinsAlong([128, 256, 432, 608, 736, 960, 1136, 1264, 1520, 1728, 1840, 2016]),
    exit: 2160,
  },
  {
    id: 'rooftop-chase',
    title: 'Rooftop Chase',
    subtitle: 'The city is your playground.',
    location: 'HYDERABAD ROOFTOPS',
    color: '#8cb5ca',
    width: 2560,
    theme: 'city',
    pickups: [
      { id: 'grow-roof', kind: 'growshroom', x: 160, y: 177 },
      { id: 'star-roof', kind: 'star', x: 256, y: 177 },
      { id: 'star-escape', kind: 'star', x: 2056, y: 177 },
    ],
    ground: [
      [0, 400],
      [480, 352],
      [928, 432],
      [1456, 384],
      [1936, 624],
    ],
    platforms: [
      { x: 352, y: 146, w: 64 },
      { x: 432, y: 150, w: 64, moving: true, travel: 22 },
      { x: 768, y: 144, w: 64 },
      { x: 856, y: 150, w: 64, moving: true, travel: 20 },
      { x: 1200, y: 136, w: 80 },
      { x: 1392, y: 168, w: 64, moving: true, travel: 10 },
      { x: 1776, y: 144, w: 64 },
      { x: 1864, y: 150, w: 64, moving: true, travel: 18 },
      { x: 2144, y: 136, w: 96 },
    ],
    enemies: [
      { x: 300, y: 180, kind: 'patrol', min: 240, max: 365 },
      { x: 680, y: 180, kind: 'ranged', min: 560, max: 760 },
      { x: 1100, y: 180, kind: 'patrol', min: 990, max: 1260 },
      { x: 1680, y: 180, kind: 'ranged', min: 1540, max: 1760 },
      { x: 2200, y: 180, kind: 'patrol', min: 2070, max: 2370 },
    ],
    checkpoints: [544, 1008, 1504, 2016],
    coins: coinsAlong([
      128, 256, 368, 560, 736, 864, 1008, 1216, 1328, 1504, 1664, 1792, 1872, 2048, 2160, 2336,
    ]),
    exit: 2480,
    escape: { start: 2016, seconds: 18 },
  },
  {
    id: 'papikondalu-trail',
    title: 'Papikondalu Trail',
    subtitle: 'Find your flow. Follow the river.',
    location: 'PAPIKONDALU RIVER TRAIL',
    color: '#80cdb2',
    width: 2400,
    theme: 'forest',
    ground: [
      [0, 448],
      [480, 416],
      [960, 416],
      [1456, 416],
      [1936, 464],
    ],
    platforms: [
      { x: 224, y: 144, w: 64 },
      { x: 352, y: 144, w: 32 },
      { x: 656, y: 136, w: 64 },
      { x: 848, y: 150, w: 64 },
      { x: 1136, y: 144, w: 64 },
      { x: 1328, y: 150, w: 64 },
      { x: 1400, y: 168, w: 64, moving: true, travel: 8 },
      { x: 1648, y: 136, w: 80 },
      { x: 1824, y: 150, w: 64 },
      { x: 1880, y: 168, w: 64, moving: true, travel: 8 },
      { x: 2080, y: 144, w: 96 },
    ],
    enemies: [
      { x: 324, y: 180, kind: 'patrol', min: 280, max: 370 },
      { x: 780, y: 180, kind: 'patrol', min: 760, max: 820 },
      { x: 1216, y: 180, kind: 'ranged', min: 1100, max: 1280 },
      { x: 1728, y: 180, kind: 'patrol', min: 1670, max: 1790 },
      { x: 2200, y: 180, kind: 'ranged', min: 2160, max: 2260 },
    ],
    checkpoints: [544, 1040, 1536, 2016],
    coins: coinsAlong([
      128, 240, 384, 544, 672, 864, 1024, 1152, 1344, 1472, 1664, 1840, 1984, 2096, 2240,
    ]),
    exit: 2320,
    pickups: [
      { id: 'grow-trail', kind: 'growshroom', x: 160, y: 177 },
      { id: 'star-canopy', kind: 'star', x: 256, y: 122 },
      { id: 'grow-bank', kind: 'growshroom', x: 1536, y: 177 },
    ],
  },
  {
    id: 'studio-showdown',
    title: 'Studio Showdown',
    subtitle: 'Every jump deserves a second take.',
    location: 'RAMOJI STUDIO BACKLOT',
    color: '#d5a6db',
    width: 2560,
    theme: 'studio',
    ground: [
      [0, 480],
      [544, 464],
      [1072, 464],
      [1616, 416],
      [2112, 448],
    ],
    platforms: [
      { x: 288, y: 144, w: 80 },
      { x: 432, y: 150, w: 64 },
      { x: 736, y: 136, w: 64 },
      { x: 960, y: 150, w: 64 },
      { x: 1248, y: 144, w: 64 },
      { x: 1488, y: 150, w: 64 },
      { x: 1552, y: 168, w: 64, moving: true, travel: 8 },
      { x: 1760, y: 144, w: 80 },
      { x: 1984, y: 150, w: 64 },
      { x: 2056, y: 168, w: 64, moving: true, travel: 10 },
      { x: 2320, y: 160, w: 16, h: 32 },
    ],
    enemies: [
      { x: 368, y: 180, kind: 'patrol', min: 300, max: 410 },
      { x: 848, y: 180, kind: 'ranged', min: 800, max: 920 },
      { x: 1360, y: 180, kind: 'patrol', min: 1330, max: 1410 },
      { x: 1872, y: 180, kind: 'ranged', min: 1820, max: 1930 },
      { x: 2240, y: 180, kind: 'patrol', min: 2180, max: 2270 },
    ],
    checkpoints: [608, 1152, 1680, 2176],
    coins: coinsAlong([
      128, 304, 448, 608, 752, 976, 1136, 1264, 1504, 1664, 1776, 2000, 2160, 2272, 2400,
    ]),
    exit: 2480,
    pickups: [
      { id: 'grow-studio', kind: 'growshroom', x: 160, y: 177 },
      { id: 'star-rig', kind: 'star', x: 320, y: 122 },
      { id: 'grow-final-take', kind: 'growshroom', x: 2176, y: 177 },
    ],
  },
  {
    id: 'fortress-finale',
    title: 'Fortress Finale',
    subtitle: 'One last stand. Make it count.',
    location: 'THE VILLAIN’S FORTRESS',
    color: '#ad93ce',
    width: 2560,
    theme: 'fort',
    pickups: [
      { id: 'grow-fort', kind: 'growshroom', x: 160, y: 177 },
      { id: 'star-fort', kind: 'star', x: 256, y: 126 },
      { id: 'grow-arena', kind: 'growshroom', x: 1872, y: 177 },
    ],
    ground: [
      [0, 448],
      [512, 448],
      [1024, 448],
      [1536, 1024],
    ],
    platforms: [
      { x: 224, y: 144, w: 80 },
      { x: 400, y: 150, w: 64 },
      { x: 704, y: 136, w: 64 },
      { x: 912, y: 150, w: 64 },
      { x: 1216, y: 136, w: 64 },
      { x: 1424, y: 150, w: 64 },
      { x: 1728, y: 144, w: 64 },
    ],
    enemies: [
      { x: 340, y: 180, kind: 'ranged', min: 260, max: 400 },
      { x: 820, y: 180, kind: 'patrol', min: 620, max: 880 },
      { x: 1300, y: 180, kind: 'ranged', min: 1140, max: 1380 },
      { x: 1680, y: 180, kind: 'patrol', min: 1600, max: 1800 },
    ],
    checkpoints: [592, 1104, 1824],
    coins: coinsAlong([128, 240, 416, 576, 720, 928, 1088, 1232, 1440, 1600, 1744, 1856]),
    exit: 2480,
    boss: 2224,
  },
];

// Coin arcs advertise the new acts' river/rig crossings without making a power mandatory.
for (const level of LEVELS.filter((l) => l.theme === 'forest' || l.theme === 'studio')) {
  for (let i = 1; i < level.ground.length; i++) {
    const previous = level.ground[i - 1],
      edge = previous[0] + previous[1],
      landing = level.ground[i][0];
    level.coins.push([edge - 8, 148], [(edge + landing) / 2, 132], [landing + 8, 148]);
  }
}
