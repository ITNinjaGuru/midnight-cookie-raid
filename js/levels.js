/**
 * Eight distinct levels — tile/platform arrays, entities, spawns.
 * World units in pixels. Ground typically at y=320 for 360-tall view.
 */

const TILE = 32;
const GROUND_Y = 320;
const VIEW_H = 360;

function plat(x, y, w, h = 16) {
  return { x, y, w, h };
}
function groundStrip(x, w, y = GROUND_Y) {
  return plat(x, y, w, 40);
}

const LEVELS = [
  // 1 — The Cookie Factory (intro)
  {
    name: 'The Cookie Factory',
    width: 2200,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 500),
      plat(520, 280, 120),
      plat(680, 240, 100),
      groundStrip(820, 400),
      plat(1100, 260, 90),
      plat(1240, 220, 100),
      groundStrip(1400, 800),
    ],
    cookies: [
      { x: 200, y: 290 }, { x: 320, y: 290 }, { x: 560, y: 250 },
      { x: 720, y: 210 }, { x: 900, y: 290 }, { x: 1150, y: 230 },
      { x: 1280, y: 190 }, { x: 1600, y: 290 }, { x: 1800, y: 290 },
    ],
    fizzies: [{ x: 640, y: 210 }, { x: 1500, y: 290 }],
    guards: [
      { x: 900, y: 288, w: 20, h: 32, minX: 840, maxX: 1100, speed: 50 },
      { x: 1700, y: 288, w: 20, h: 32, minX: 1450, maxX: 2000, speed: 55 },
    ],
    dogs: [],
    vats: [],
    mashers: [],
    exit: { x: 2080, y: 256, w: 36, h: 64 },
  },

  // 2 — Storage
  {
    name: 'Storage',
    width: 2600,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 350),
      plat(400, 270, 100),
      plat(540, 220, 90),
      plat(680, 170, 100),
      groundStrip(820, 200),
      plat(1080, 270, 80),
      plat(1200, 220, 80),
      plat(1320, 170, 90),
      groundStrip(1480, 300),
      plat(1850, 260, 120),
      plat(2020, 210, 100),
      groundStrip(2180, 420),
    ],
    cookies: [
      { x: 180, y: 290 }, { x: 440, y: 240 }, { x: 580, y: 190 },
      { x: 720, y: 140 }, { x: 900, y: 290 }, { x: 1120, y: 240 },
      { x: 1240, y: 190 }, { x: 1360, y: 140 }, { x: 1600, y: 290 },
      { x: 1900, y: 230 }, { x: 2060, y: 180 }, { x: 2300, y: 290 },
    ],
    fizzies: [{ x: 700, y: 140 }, { x: 1550, y: 290 }, { x: 2100, y: 180 }],
    guards: [
      { x: 900, y: 288, w: 20, h: 32, minX: 830, maxX: 980, speed: 60 },
      { x: 1550, y: 288, w: 20, h: 32, minX: 1500, maxX: 1720, speed: 65 },
      { x: 2300, y: 288, w: 20, h: 32, minX: 2200, maxX: 2500, speed: 70 },
    ],
    dogs: [],
    vats: [],
    mashers: [],
    exit: { x: 2500, y: 256, w: 36, h: 64 },
  },

  // 3 — Research (introduce dogs)
  {
    name: 'Research',
    width: 2800,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 450),
      plat(500, 260, 140),
      groundStrip(700, 350),
      plat(1100, 250, 100),
      plat(1250, 200, 120),
      groundStrip(1450, 400),
      plat(1920, 260, 150),
      groundStrip(2140, 660),
    ],
    cookies: [
      { x: 200, y: 290 }, { x: 380, y: 290 }, { x: 560, y: 230 },
      { x: 850, y: 290 }, { x: 1140, y: 220 }, { x: 1300, y: 170 },
      { x: 1600, y: 290 }, { x: 1750, y: 290 }, { x: 1980, y: 230 },
      { x: 2300, y: 290 }, { x: 2500, y: 290 },
    ],
    fizzies: [{ x: 620, y: 230 }, { x: 1280, y: 170 }, { x: 2000, y: 230 }],
    guards: [
      { x: 800, y: 288, w: 20, h: 32, minX: 720, maxX: 1000, speed: 55 },
      { x: 1600, y: 288, w: 20, h: 32, minX: 1480, maxX: 1800, speed: 60 },
    ],
    dogs: [
      { x: 1050, y: 300, w: 28, h: 20, wakeRadius: 90, facing: -1 },
      { x: 2100, y: 300, w: 28, h: 20, wakeRadius: 100, facing: 1 },
    ],
    vats: [],
    mashers: [],
    exit: { x: 2700, y: 256, w: 36, h: 64 },
  },

  // 4 — Packing Floor
  {
    name: 'Packing Floor',
    width: 3000,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 280),
      plat(320, 270, 80),
      plat(440, 220, 80),
      plat(560, 170, 80),
      plat(680, 220, 80),
      groundStrip(800, 280),
      plat(1140, 260, 100),
      groundStrip(1300, 250),
      plat(1600, 250, 90),
      plat(1740, 200, 90),
      plat(1880, 150, 100),
      groundStrip(2050, 350),
      plat(2460, 260, 120),
      groundStrip(2640, 360),
    ],
    cookies: [
      { x: 160, y: 290 }, { x: 360, y: 240 }, { x: 480, y: 190 },
      { x: 600, y: 140 }, { x: 720, y: 190 }, { x: 950, y: 290 },
      { x: 1180, y: 230 }, { x: 1400, y: 290 }, { x: 1640, y: 220 },
      { x: 1780, y: 170 }, { x: 1920, y: 120 }, { x: 2200, y: 290 },
      { x: 2500, y: 230 }, { x: 2800, y: 290 },
    ],
    fizzies: [
      { x: 580, y: 140 }, { x: 1450, y: 290 }, { x: 1900, y: 120 }, { x: 2550, y: 230 },
    ],
    guards: [
      { x: 900, y: 288, w: 20, h: 32, minX: 820, maxX: 1050, speed: 70 },
      { x: 1400, y: 288, w: 20, h: 32, minX: 1320, maxX: 1520, speed: 65 },
      { x: 2200, y: 288, w: 20, h: 32, minX: 2080, maxX: 2350, speed: 75 },
      { x: 2750, y: 288, w: 20, h: 32, minX: 2660, maxX: 2950, speed: 70 },
    ],
    dogs: [
      { x: 1100, y: 300, w: 28, h: 20, wakeRadius: 85, facing: -1 },
      { x: 2400, y: 300, w: 28, h: 20, wakeRadius: 95, facing: 1 },
    ],
    vats: [],
    mashers: [],
    exit: { x: 2920, y: 256, w: 36, h: 64 },
  },

  // 5 — Upper Catwalks
  {
    name: 'Upper Catwalks',
    width: 3200,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 200),
      plat(250, 270, 70),
      plat(360, 220, 70),
      plat(470, 170, 70),
      plat(580, 120, 90),
      plat(720, 170, 70),
      plat(840, 220, 70),
      plat(960, 170, 80),
      plat(1100, 120, 100),
      plat(1260, 170, 80),
      plat(1400, 220, 80),
      plat(1540, 170, 90),
      plat(1700, 120, 110),
      plat(1880, 170, 80),
      plat(2020, 220, 80),
      plat(2160, 170, 90),
      plat(2320, 120, 100),
      plat(2500, 180, 120),
      groundStrip(2700, 500),
    ],
    cookies: [
      { x: 280, y: 240 }, { x: 400, y: 190 }, { x: 510, y: 140 },
      { x: 620, y: 90 }, { x: 760, y: 140 }, { x: 880, y: 190 },
      { x: 1000, y: 140 }, { x: 1140, y: 90 }, { x: 1300, y: 140 },
      { x: 1440, y: 190 }, { x: 1580, y: 140 }, { x: 1740, y: 90 },
      { x: 1920, y: 140 }, { x: 2060, y: 190 }, { x: 2200, y: 140 },
      { x: 2360, y: 90 }, { x: 2550, y: 150 }, { x: 2900, y: 290 },
    ],
    fizzies: [
      { x: 600, y: 90 }, { x: 1140, y: 90 }, { x: 1740, y: 90 }, { x: 2360, y: 90 },
    ],
    guards: [
      { x: 1120, y: 88, w: 20, h: 32, minX: 1100, maxX: 1180, speed: 40 },
      { x: 1720, y: 88, w: 20, h: 32, minX: 1700, maxX: 1790, speed: 45 },
      { x: 2800, y: 288, w: 20, h: 32, minX: 2720, maxX: 3100, speed: 80 },
    ],
    dogs: [
      { x: 2550, y: 160, w: 28, h: 20, wakeRadius: 80, facing: -1 },
      { x: 3000, y: 300, w: 28, h: 20, wakeRadius: 100, facing: -1 },
    ],
    vats: [],
    mashers: [],
    exit: { x: 3100, y: 256, w: 36, h: 64 },
  },

  // 6 — Vat Room
  {
    name: 'Vat Room',
    width: 3000,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 280),
      plat(320, 260, 100),
      // gap over vat
      plat(560, 260, 100),
      groundStrip(720, 200),
      plat(980, 250, 90),
      // gap
      plat(1220, 250, 90),
      groundStrip(1380, 180),
      plat(1620, 240, 100),
      // gap
      plat(1880, 240, 100),
      groundStrip(2050, 250),
      plat(2360, 250, 120),
      groundStrip(2550, 450),
    ],
    cookies: [
      { x: 150, y: 290 }, { x: 360, y: 230 }, { x: 600, y: 230 },
      { x: 820, y: 290 }, { x: 1020, y: 220 }, { x: 1260, y: 220 },
      { x: 1480, y: 290 }, { x: 1660, y: 210 }, { x: 1920, y: 210 },
      { x: 2150, y: 290 }, { x: 2400, y: 220 }, { x: 2700, y: 290 },
    ],
    fizzies: [{ x: 580, y: 230 }, { x: 1240, y: 220 }, { x: 1900, y: 210 }],
    guards: [
      { x: 800, y: 288, w: 20, h: 32, minX: 740, maxX: 900, speed: 60 },
      { x: 1450, y: 288, w: 20, h: 32, minX: 1400, maxX: 1540, speed: 55 },
      { x: 2150, y: 288, w: 20, h: 32, minX: 2070, maxX: 2280, speed: 70 },
      { x: 2700, y: 288, w: 20, h: 32, minX: 2580, maxX: 2900, speed: 75 },
    ],
    dogs: [
      { x: 2300, y: 300, w: 28, h: 20, wakeRadius: 90, facing: -1 },
    ],
    vats: [
      { x: 440, y: 300, w: 100, h: 60 },
      { x: 1090, y: 300, w: 110, h: 60 },
      { x: 1740, y: 300, w: 120, h: 60 },
      { x: 2480, y: 300, w: 60, h: 60 },
    ],
    mashers: [],
    exit: { x: 2900, y: 256, w: 36, h: 64 },
  },

  // 7 — Masher Alley
  {
    name: 'Masher Alley',
    width: 3200,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 400),
      groundStrip(450, 350),
      groundStrip(860, 400),
      groundStrip(1320, 350),
      groundStrip(1740, 400),
      groundStrip(2200, 350),
      groundStrip(2620, 580),
    ],
    cookies: [
      { x: 180, y: 290 }, { x: 350, y: 290 }, { x: 600, y: 290 },
      { x: 750, y: 290 }, { x: 1000, y: 290 }, { x: 1200, y: 290 },
      { x: 1500, y: 290 }, { x: 1650, y: 290 }, { x: 1900, y: 290 },
      { x: 2100, y: 290 }, { x: 2350, y: 290 }, { x: 2500, y: 290 },
      { x: 2800, y: 290 }, { x: 3000, y: 290 },
    ],
    fizzies: [
      { x: 400, y: 290 }, { x: 1100, y: 290 }, { x: 1800, y: 290 }, { x: 2550, y: 290 },
    ],
    guards: [
      { x: 600, y: 288, w: 20, h: 32, minX: 470, maxX: 780, speed: 70 },
      { x: 1500, y: 288, w: 20, h: 32, minX: 1340, maxX: 1640, speed: 75 },
      { x: 2350, y: 288, w: 20, h: 32, minX: 2220, maxX: 2520, speed: 80 },
    ],
    dogs: [
      { x: 2000, y: 300, w: 28, h: 20, wakeRadius: 100, facing: -1 },
    ],
    vats: [
      { x: 820, y: 300, w: 30, h: 60 },
      { x: 1700, y: 300, w: 30, h: 60 },
    ],
    mashers: [
      { x: 280, y: 0, w: 50, bladeH: 28, rangeMin: 80, rangeMax: 292, speed: 90, dir: 1 },
      { x: 1000, y: 0, w: 50, bladeH: 28, rangeMin: 60, rangeMax: 292, speed: 110, dir: 1 },
      { x: 1550, y: 0, w: 50, bladeH: 28, rangeMin: 100, rangeMax: 292, speed: 100, dir: -1 },
      { x: 2050, y: 0, w: 50, bladeH: 28, rangeMin: 70, rangeMax: 292, speed: 120, dir: 1 },
      { x: 2450, y: 0, w: 50, bladeH: 28, rangeMin: 90, rangeMax: 292, speed: 105, dir: -1 },
    ],
    exit: { x: 3100, y: 256, w: 36, h: 64 },
  },

  // 8 — Cookie Vault (climax)
  {
    name: 'Cookie Vault',
    width: 3600,
    spawn: { x: 40, y: 260 },
    platforms: [
      groundStrip(0, 250),
      plat(300, 260, 80),
      plat(420, 210, 80),
      plat(540, 160, 90),
      // vat gap below
      plat(700, 210, 80),
      groundStrip(840, 200),
      plat(1100, 250, 70),
      plat(1220, 200, 70),
      plat(1340, 150, 100),
      groundStrip(1520, 220),
      // mashers zone
      groundStrip(1800, 500),
      plat(2360, 250, 90),
      plat(2500, 200, 90),
      plat(2640, 150, 100),
      groundStrip(2820, 780),
    ],
    cookies: [
      { x: 140, y: 290 }, { x: 340, y: 230 }, { x: 460, y: 180 },
      { x: 580, y: 130 }, { x: 740, y: 180 }, { x: 950, y: 290 },
      { x: 1140, y: 220 }, { x: 1260, y: 170 }, { x: 1380, y: 120 },
      { x: 1600, y: 290 }, { x: 1900, y: 290 }, { x: 2100, y: 290 },
      { x: 2400, y: 220 }, { x: 2540, y: 170 }, { x: 2680, y: 120 },
      { x: 3000, y: 290 }, { x: 3200, y: 290 }, { x: 3400, y: 290 },
    ],
    fizzies: [
      { x: 560, y: 130 }, { x: 1360, y: 120 }, { x: 2000, y: 290 },
      { x: 2660, y: 120 }, { x: 3100, y: 290 },
    ],
    guards: [
      { x: 900, y: 288, w: 20, h: 32, minX: 860, maxX: 1020, speed: 75 },
      { x: 1600, y: 288, w: 20, h: 32, minX: 1540, maxX: 1700, speed: 80 },
      { x: 2000, y: 288, w: 20, h: 32, minX: 1850, maxX: 2200, speed: 85 },
      { x: 3000, y: 288, w: 20, h: 32, minX: 2850, maxX: 3300, speed: 90 },
      { x: 3300, y: 288, w: 20, h: 32, minX: 3100, maxX: 3500, speed: 70 },
    ],
    dogs: [
      { x: 1050, y: 300, w: 28, h: 20, wakeRadius: 90, facing: -1 },
      { x: 2250, y: 300, w: 28, h: 20, wakeRadius: 100, facing: 1 },
      { x: 2900, y: 300, w: 28, h: 20, wakeRadius: 110, facing: -1 },
    ],
    vats: [
      { x: 640, y: 300, w: 50, h: 60 },
      { x: 1460, y: 300, w: 50, h: 60 },
      { x: 2320, y: 300, w: 30, h: 60 },
      { x: 2780, y: 300, w: 30, h: 60 },
    ],
    mashers: [
      { x: 1900, y: 0, w: 50, bladeH: 28, rangeMin: 80, rangeMax: 292, speed: 130, dir: 1 },
      { x: 2100, y: 0, w: 50, bladeH: 28, rangeMin: 60, rangeMax: 292, speed: 140, dir: -1 },
      { x: 3150, y: 0, w: 50, bladeH: 28, rangeMin: 100, rangeMax: 292, speed: 120, dir: 1 },
    ],
    exit: { x: 3480, y: 256, w: 36, h: 64 },
  },
];

function cloneLevel(idx) {
  const src = LEVELS[idx];
  const L = JSON.parse(JSON.stringify(src));
  // runtime fields
  L.guards.forEach((g) => {
    g.facing = 1;
    g.knocked = false;
    g.knockTimer = 0;
    g.vx = g.speed;
  });
  L.dogs.forEach((d) => {
    d.awake = false;
    d.barkTimer = 0;
  });
  L.cookies.forEach((c) => {
    c.r = 8;
    c.collected = false;
  });
  L.fizzies.forEach((f) => {
    f.collected = false;
  });
  L.mashers.forEach((m) => {
    m.crushY = m.dir > 0 ? m.rangeMin : m.rangeMax;
    m.shaftTop = 0;
  });
  return L;
}
