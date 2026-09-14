/* ==================== STANDALONE TANK + RPG BLAST ==================== */
/* spawntank | alt-click = enter/exit | left-click = fire (in tank) */

if (!globalThis.tanks) globalThis.tanks = [];
if (!globalThis.tankDriver) globalThis.tankDriver = {};
if (!globalThis.tankCooldown) globalThis.tankCooldown = {};
if (!globalThis.tankShots) globalThis.tankShots = [];
if (!globalThis.lastTankToggle) globalThis.lastTankToggle = {};
if (!globalThis.tankRecoil) globalThis.tankRecoil = {};

const BLAST_RADIUS = 3;
const HARD_BLOCKS = ["Bedrock", "Barrier", "Moonstone", "Moonstone Block"];

function box(w, h, d, color) {
  try {
    return api.attemptCreateMeshEntity("Box", {
      width: w, height: h, depth: d, diffuseColor: color
    }, "");
  } catch (e) {
    return null;
  }
}

function spawnDetailedTankAt(x, y, z) {
  const body = box(4.6, 1.25, 7.2, [42, 72, 38]);
  const lower = box(4.4, 0.5, 6.9, [26, 46, 24]);
  const front = box(4.2, 0.5, 1.5, [48, 80, 42]);
  const rear = box(4.2, 1.05, 1.3, [36, 62, 34]);
  const engine = box(3.4, 0.75, 1.6, [34, 54, 30]);
  const engineGrill = box(2.8, 0.15, 1.2, [20, 20, 20]);
  const sideArmorL = box(0.18, 0.9, 5.5, [40, 68, 36]);
  const sideArmorR = box(0.18, 0.9, 5.5, [40, 68, 36]);
  const trackL = box(0.65, 0.8, 6.8, [16, 16, 16]);
  const trackR = box(0.65, 0.8, 6.8, [16, 16, 16]);
  const skirtL = box(0.2, 0.5, 6.0, [33, 53, 28]);
  const skirtR = box(0.2, 0.5, 6.0, [33, 53, 28]);
  const wL1 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wL2 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wL3 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wL4 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wR1 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wR2 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wR3 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const wR4 = box(0.55, 0.55, 0.55, [14, 14, 14]);
  const turret = box(2.9, 1.05, 3.1, [50, 85, 45]);
  const turretRing = box(3.1, 0.2, 3.1, [45, 75, 40]);
  const turretTop = box(2.4, 0.18, 2.4, [55, 90, 50]);
  const cupola = box(0.85, 0.4, 0.85, [40, 65, 38]);
  const hatch = box(0.7, 0.14, 0.7, [24, 38, 20]);
  const sight = box(0.35, 0.25, 0.5, [30, 30, 30]);
  const mantlet = box(1.1, 0.85, 0.7, [32, 32, 32]);
  const barrelBase = box(0.55, 0.5, 1.1, [26, 26, 26]);
  const barrel = box(0.28, 0.28, 4.8, [18, 18, 18]);
  const barrelTip = box(0.35, 0.35, 0.4, [12, 12, 12]);
  const muzzle = box(0.48, 0.48, 0.5, [10, 10, 10]);
  const boxL = box(0.6, 0.55, 1.4, [40, 65, 35]);
  const boxR = box(0.6, 0.55, 1.4, [40, 65, 35]);
  const crateL = box(0.5, 0.45, 0.9, [55, 40, 25]);
  const crateR = box(0.5, 0.45, 0.9, [55, 40, 25]);
  const exhaustL = box(0.3, 0.3, 0.8, [20, 20, 20]);
  const exhaustR = box(0.3, 0.3, 0.8, [20, 20, 20]);
  const antenna = box(0.07, 1.6, 0.07, [8, 8, 8]);
  const antenna2 = box(0.06, 1.2, 0.06, [8, 8, 8]);
  const lightL = box(0.28, 0.28, 0.28, [255, 230, 150]);
  const lightR = box(0.28, 0.28, 0.28, [255, 230, 150]);
  const mg = box(0.12, 0.12, 1.0, [25, 25, 25]);

  if (!body) return false;

  try { api.setPosition(body, x, y + 0.9, z); } catch (e) {}
  try { if (lower) api.setPosition(lower, x, y + 0.25, z); } catch (e) {}
  try { if (front) api.setPosition(front, x, y + 0.7, z - 3.0); } catch (e) {}
  try { if (rear) api.setPosition(rear, x, y + 0.95, z + 3.1); } catch (e) {}
  try { if (engine) api.setPosition(engine, x, y + 1.45, z + 2.8); } catch (e) {}
  try { if (engineGrill) api.setPosition(engineGrill, x, y + 1.9, z + 2.8); } catch (e) {}
  try { if (sideArmorL) api.setPosition(sideArmorL, x - 2.35, y + 1.0, z); } catch (e) {}
  try { if (sideArmorR) api.setPosition(sideArmorR, x + 2.35, y + 1.0, z); } catch (e) {}
  try { if (trackL) api.setPosition(trackL, x - 2.35, y + 0.3, z); } catch (e) {}
  try { if (trackR) api.setPosition(trackR, x + 2.35, y + 0.3, z); } catch (e) {}
  try { if (skirtL) api.setPosition(skirtL, x - 2.35, y + 0.85, z); } catch (e) {}
  try { if (skirtR) api.setPosition(skirtR, x + 2.35, y + 0.85, z); } catch (e) {}
  try { if (wL1) api.setPosition(wL1, x - 2.35, y + 0.25, z - 2.4); } catch (e) {}
  try { if (wL2) api.setPosition(wL2, x - 2.35, y + 0.25, z - 0.8); } catch (e) {}
  try { if (wL3) api.setPosition(wL3, x - 2.35, y + 0.25, z + 0.8); } catch (e) {}
  try { if (wL4) api.setPosition(wL4, x - 2.35, y + 0.25, z + 2.4); } catch (e) {}
  try { if (wR1) api.setPosition(wR1, x + 2.35, y + 0.25, z - 2.4); } catch (e) {}
  try { if (wR2) api.setPosition(wR2, x + 2.35, y + 0.25, z - 0.8); } catch (e) {}
  try { if (wR3) api.setPosition(wR3, x + 2.35, y + 0.25, z + 0.8); } catch (e) {}
  try { if (wR4) api.setPosition(wR4, x + 2.35, y + 0.25, z + 2.4); } catch (e) {}
  try { if (turret) api.setPosition(turret, x, y + 1.95, z + 0.1); } catch (e) {}
  try { if (turretRing) api.setPosition(turretRing, x, y + 1.45, z + 0.1); } catch (e) {}
  try { if (turretTop) api.setPosition(turretTop, x, y + 2.55, z + 0.1); } catch (e) {}
  try { if (cupola) api.setPosition(cupola, x - 0.5, y + 2.8, z + 0.2); } catch (e) {}
  try { if (hatch) api.setPosition(hatch, x + 0.5, y + 2.7, z + 0.25); } catch (e) {}
  try { if (sight) api.setPosition(sight, x, y + 2.2, z - 1.2); } catch (e) {}
  try { if (mantlet) api.setPosition(mantlet, x, y + 1.95, z - 1.5); } catch (e) {}
  try { if (barrelBase) api.setPosition(barrelBase, x, y + 1.95, z - 2.2); } catch (e) {}
  try { if (barrel) api.setPosition(barrel, x, y + 1.95, z - 4.5); } catch (e) {}
  try { if (barrelTip) api.setPosition(barrelTip, x, y + 1.95, z - 6.7); } catch (e) {}
  try { if (muzzle) api.setPosition(muzzle, x, y + 1.95, z - 7.1); } catch (e) {}
  try { if (boxL) api.setPosition(boxL, x - 2.0, y + 1.45, z + 1.5); } catch (e) {}
  try { if (boxR) api.setPosition(boxR, x + 2.0, y + 1.45, z + 1.5); } catch (e) {}
  try { if (crateL) api.setPosition(crateL, x - 1.9, y + 1.4, z - 1.0); } catch (e) {}
  try { if (crateR) api.setPosition(crateR, x + 1.9, y + 1.4, z - 1.0); } catch (e) {}
  try { if (exhaustL) api.setPosition(exhaustL, x - 1.2, y + 1.7, z + 3.4); } catch (e) {}
  try { if (exhaustR) api.setPosition(exhaustR, x + 1.2, y + 1.7, z + 3.4); } catch (e) {}
  try { if (antenna) api.setPosition(antenna, x + 1.0, y + 3.3, z + 0.9); } catch (e) {}
  try { if (antenna2) api.setPosition(antenna2, x - 1.0, y + 3.1, z + 0.9); } catch (e) {}
  try { if (lightL) api.setPosition(lightL, x - 1.6, y + 1.05, z - 3.4); } catch (e) {}
  try { if (lightR) api.setPosition(lightR, x + 1.6, y + 1.05, z - 3.4); } catch (e) {}
  try { if (mg) api.setPosition(mg, x + 0.7, y + 2.5, z - 1.0); } catch (e) {}

  globalThis.tanks.push({
    body, lower, front, rear, engine, engineGrill,
    sideArmorL, sideArmorR, trackL, trackR, skirtL, skirtR,
    wL1, wL2, wL3, wL4, wR1, wR2, wR3, wR4,
    turret, turretRing, turretTop, cupola, hatch, sight,
    mantlet, barrelBase, barrel, barrelTip, muzzle,
    boxL, boxR, crateL, crateR, exhaustL, exhaustR,
    antenna, antenna2, lightL, lightR, mg,
    driver: null
  });
  return true;
}

function getNearestTank(playerId, maxDist) {
  const p = api.getPosition(playerId);
  if (!p || !globalThis.tanks) return null;
  let best = null;
  let bestDist = maxDist || 16;
  for (let i = 0; i < globalThis.tanks.length; i++) {
    const t = globalThis.tanks[i];
    if (!t || !t.body) continue;
    const bp = api.getPosition(t.body);
    if (!bp) continue;
    const d = Math.sqrt((bp[0] - p[0]) ** 2 + (bp[1] - p[1]) ** 2 + (bp[2] - p[2]) ** 2);
    if (d < bestDist) { bestDist = d; best = t; }
  }
  return best;
}

function enterTank(playerId, tank) {
  tank.driver = playerId;
  globalThis.tankDriver[playerId] = tank;
  api.setPlayerPose(playerId, "driving");
  api.setClientOption(playerId, "speedMultiplier", 1.6);
  api.sendMessage(playerId, "In tank | left click = fire | alt-click = exit", { color: "lime" });
}

function exitTank(playerId) {
  const tank = globalThis.tankDriver[playerId];
  if (!tank) return;
  tank.driver = null;
  delete globalThis.tankDriver[playerId];
  delete globalThis.tankRecoil[playerId];
  api.setPlayerPose(playerId, "standing");
  api.setClientOption(playerId, "speedMultiplier", 1);
  api.sendMessage(playerId, "Left tank", { color: "aqua" });
}

function tryToggleTank(playerId) {
  const now = api.now();
  if (globalThis.lastTankToggle[playerId] && now - globalThis.lastTankToggle[playerId] < 600) return;
  globalThis.lastTankToggle[playerId] = now;
  if (globalThis.tankDriver[playerId]) { exitTank(playerId); return; }
  const tank = getNearestTank(playerId, 16);
  if (!tank) { api.sendMessage(playerId, "No tank nearby — type spawntank", { color: "red" }); return; }
  if (tank.driver && tank.driver !== playerId) {
    api.sendMessage(playerId, "Tank already has a driver", { color: "red" });
    return;
  }
  enterTank(playerId, tank);
}

function spawnMuzzleFlash(x, y, z, fx, fy, fz) {
  try {
    api.playParticleEffect({
      pos1: [x - 0.4, y - 0.3, z - 0.4],
      pos2: [x + 0.4, y + 0.4, z + 0.4],
      dir1: [fx * 0.4 - 0.5, -0.2, fz * 0.4 - 0.5],
      dir2: [fx * 1.8 + 0.5, 1.2, fz * 1.8 + 0.5],
      texture: "soul_0",
      minLifeTime: 0.4, maxLifeTime: 1.3,
      minEmitPower: 4, maxEmitPower: 10,
      minSize: 0.2, maxSize: 0.65,
      manualEmitCount: 60,
      gravity: [0, 1.6, 0],
      colorGradients: [
        { timeFraction: 0, minColor: [40, 220, 255, 1], maxColor: [140, 255, 255, 1] },
        { timeFraction: 1, minColor: [10, 40, 80, 0], maxColor: [0, 20, 40, 0] }
      ],
      velocityGradients: [{ timeFraction: 0, factor: 1, factor2: 1 }],
      blendMode: 1
    });
  } catch (e) {}
  try {
    api.playParticleEffect({
      pos1: [x - 0.6, y - 0.3, z - 0.6],
      pos2: [x + 0.6, y + 0.8, z + 0.6],
      dir1: [-0.4, 0.3, -0.4],
      dir2: [0.4, 1.2, 0.4],
      texture: "square_particle",
      minLifeTime: 0.8, maxLifeTime: 2.2,
      minEmitPower: 1.5, maxEmitPower: 4,
      minSize: 0.25, maxSize: 0.7,
      manualEmitCount: 40,
      gravity: [0, 0.8, 0],
      colorGradients: [
        { timeFraction: 0, minColor: [160, 160, 160, 0.85], maxColor: [100, 100, 100, 0.7] },
        { timeFraction: 1, minColor: [50, 50, 50, 0], maxColor: [30, 30, 30, 0] }
      ],
      velocityGradients: [{ timeFraction: 0, factor: 1, factor2: 1 }],
      blendMode: 1
    });
  } catch (e) {}
  try {
    api.playParticleEffect({
      presetId: "orangeFirecrackerLarge",
      pos1: [x - 0.25, y - 0.2, z - 0.25],
      pos2: [x + 0.25, y + 0.25, z + 0.25]
    });
  } catch (e) {}
}

function killId(id, ownerId) {
  if (!id || id === ownerId) return;
  try { api.setHealth(id, 0); } catch (e) {}
  try { if (typeof api.applyHealthChange === "function") api.applyHealthChange(id, -99999); } catch (e) {}
  try { if (typeof api.isMob === "function" && api.isMob(id)) api.despawnMob(id); } catch (e) {}
  try { if (typeof api.despawnMob === "function") api.despawnMob(id); } catch (e) {}
}

function rpgBlast(x, y, z, ownerId) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const r = BLAST_RADIUS;

  try {
    api.playParticleEffect({
      presetId: "orangeFirecrackerLarge",
      pos1: [x - 1, y - 1, z - 1],
      pos2: [x + 1, y + 1, z + 1]
    });
  } catch (e) {}

  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dz = -r; dz <= r; dz++) {
        if (dx * dx + dy * dy + dz * dz > r * r + 1) continue;
        const bx = ix + dx, by = iy + dy, bz = iz + dz;
        let name = "Air";
        try { name = api.getBlock(bx, by, bz); } catch (e) {}
        if (!name || name === "Air") continue;
        if (HARD_BLOCKS.indexOf(name) !== -1) continue;
        try { api.setBlock(bx, by, bz, "Air"); } catch (e) {}
      }
    }
  }

  try {
    const ents = api.getEntities();
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      const eid = e && (e.id != null ? e.id : e);
      if (eid == null || eid === ownerId) continue;
      const ep = api.getPosition(eid);
      if (!ep) continue;
      const d = Math.abs(ep[0] - x) + Math.abs(ep[1] - y) + Math.abs(ep[2] - z);
      if (d > r + 3) continue;
      killId(eid, ownerId);
    }
  } catch (e) {}

  try {
    const pids = api.getPlayerIds();
    for (let i = 0; i < pids.length; i++) {
      const pid = pids[i];
      if (pid === ownerId) continue;
      const pp = api.getPosition(pid);
      if (!pp) continue;
      const d = Math.abs(pp[0] - x) + Math.abs(pp[1] - y) + Math.abs(pp[2] - z);
      if (d > r + 3) continue;
      killId(pid, ownerId);
    }
  } catch (e) {}
}

function fireTank(playerId) {
  const now = api.now();
  if (globalThis.tankCooldown[playerId] && now - globalThis.tankCooldown[playerId] < 1400) {
    api.sendMessage(playerId, "Reloading...", { color: "yellow" });
    return;
  }
  globalThis.tankCooldown[playerId] = now;

  const p = api.getPosition(playerId);
  const facing = api.getPlayerFacingInfo(playerId);
  if (!p || !facing || !facing.dir) return;

  const fx = facing.dir[0];
  const fy = facing.dir[1] || 0;
  const fz = facing.dir[2];

  globalThis.tankRecoil[playerId] = { amount: 2.8, until: now + 380 };

  const mx = p[0] + fx * 7.1;
  const my = p[1] + 0.35 + 1.95;
  const mz = p[2] + fz * 7.1;

  spawnMuzzleFlash(mx, my, mz, fx, fy, fz);

  const shot = box(0.22, 0.22, 0.7, [255, 210, 50]);
  if (shot) {
    try { api.setPosition(shot, mx, my, mz); } catch (e) {}
    globalThis.tankShots.push({
      id: shot, vx: fx * 1.7, vy: fy * 1.7, vz: fz * 1.7, life: 28, owner: playerId
    });
  } else {
    rpgBlast(mx + fx * 8, my + fy * 8, mz + fz * 8, playerId);
  }

  api.playSound(playerId, "cannonFire1", 1, 1);
}

function spawnTankNearPlayer(playerId) {
  const p = api.getPosition(playerId);
  if (!p) return;
  const ok = spawnDetailedTankAt(p[0], p[1], p[2] + 6);
  if (ok) api.sendMessage(playerId, "Tank spawned — alt-click to enter", { color: "lime" });
  else api.sendMessage(playerId, "Spawn failed (mesh limit). Rejoin and try again.", { color: "red" });
}

onPlayerJoin = (playerId) => {
  api.sendMessage(playerId, "spawntank · alt-click enter/exit · left-click fire", { color: "aqua" });
};

onPlayerClick = (playerId, wasAltClick) => {
  if (wasAltClick) { tryToggleTank(playerId); return; }
  if (globalThis.tankDriver[playerId]) fireTank(playerId);
};

onPlayerChat = (playerId, message) => {
  const lower = (message || "").toLowerCase().trim();
  if (lower === "spawntank" || lower === "!spawntank") {
    spawnTankNearPlayer(playerId);
    return false;
  }
  return true;
};

playerCommand = (playerId, command) => {
  if (command === "spawntank") {
    spawnTankNearPlayer(playerId);
    return false;
  }
  return false;
};

onPlayerLeave = (playerId) => {
  if (globalThis.tankDriver[playerId]) exitTank(playerId);
};

tick = () => {
  const now = api.now();

  for (const playerId in globalThis.tankDriver) {
    const t = globalThis.tankDriver[playerId];
    if (!t || !t.body) continue;
    const p = api.getPosition(playerId);
    if (!p) continue;

    let fx = 0, fz = 1, heading = 0;
    const facing = api.getPlayerFacingInfo(playerId);
    if (facing && facing.dir) {
      fx = facing.dir[0];
      fz = facing.dir[2];
      heading = Math.atan2(fx, fz);
    }
    try { api.setEntityHeading(playerId, heading); } catch (e) {}

    const px = p[0], py = p[1] + 0.35, pz = p[2];
    const rx = -fz, rz = fx;

    let recoil = 0;
    const rec = globalThis.tankRecoil[playerId];
    if (rec && now < rec.until) recoil = rec.amount * ((rec.until - now) / 380);
    else if (rec) delete globalThis.tankRecoil[playerId];

    function move(id, x, y, z) {
      if (id == null) return;
      try { api.setPosition(id, x, y, z); } catch (e) {}
    }
    function face(id) {
      if (id == null) return;
      try { api.setEntityHeading(id, heading); } catch (e) {}
    }

    move(t.body, px, py + 0.9, pz);
    move(t.lower, px, py + 0.25, pz);
    move(t.rear, px + fx * -3.1, py + 0.95, pz + fz * -3.1);
    move(t.engine, px + fx * -2.8, py + 1.45, pz + fz * -2.8);
    move(t.engineGrill, px + fx * -2.8, py + 1.9, pz + fz * -2.8);
    move(t.front, px, py - 40, pz);
    move(t.lightL, px, py - 40, pz);
    move(t.lightR, px, py - 40, pz);
    move(t.sideArmorL, px + rx * 2.35, py + 1.0, pz + rz * 2.35);
    move(t.sideArmorR, px + rx * -2.35, py + 1.0, pz + rz * -2.35);
    move(t.trackL, px + rx * 2.35, py + 0.3, pz + rz * 2.35);
    move(t.trackR, px + rx * -2.35, py + 0.3, pz + rz * -2.35);
    move(t.skirtL, px + rx * 2.35, py + 0.85, pz + rz * 2.35);
    move(t.skirtR, px + rx * -2.35, py + 0.85, pz + rz * -2.35);
    move(t.wL1, px + rx * 2.35 + fx * 2.4, py + 0.25, pz + rz * 2.35 + fz * 2.4);
    move(t.wL2, px + rx * 2.35 + fx * 0.8, py + 0.25, pz + rz * 2.35 + fz * 0.8);
    move(t.wL3, px + rx * 2.35 + fx * -0.8, py + 0.25, pz + rz * 2.35 + fz * -0.8);
    move(t.wL4, px + rx * 2.35 + fx * -2.4, py + 0.25, pz + rz * 2.35 + fz * -2.4);
    move(t.wR1, px + rx * -2.35 + fx * 2.4, py + 0.25, pz + rz * -2.35 + fz * 2.4);
    move(t.wR2, px + rx * -2.35 + fx * 0.8, py + 0.25, pz + rz * -2.35 + fz * 0.8);
    move(t.wR3, px + rx * -2.35 + fx * -0.8, py + 0.25, pz + rz * -2.35 + fz * -0.8);
    move(t.wR4, px + rx * -2.35 + fx * -2.4, py + 0.25, pz + rz * -2.35 + fz * -2.4);
    move(t.turret, px, py + 1.95, pz + fz * 0.1);
    move(t.turretRing, px, py + 1.45, pz + fz * 0.1);
    move(t.turretTop, px, py + 2.55, pz + fz * 0.1);
    move(t.cupola, px + rx * 0.5, py + 2.8, pz + fz * 0.2);
    move(t.hatch, px + rx * -0.5, py + 2.7, pz + fz * 0.25);
    move(t.sight, px + fx * 1.2, py + 2.2, pz + fz * 1.2);
    move(t.mantlet, px + fx * (1.5 - recoil), py + 1.95, pz + fz * (1.5 - recoil));
    move(t.barrelBase, px + fx * (2.2 - recoil), py + 1.95, pz + fz * (2.2 - recoil));
    move(t.barrel, px + fx * (4.5 - recoil), py + 1.95, pz + fz * (4.5 - recoil));
    move(t.barrelTip, px + fx * (6.7 - recoil), py + 1.95, pz + fz * (6.7 - recoil));
    move(t.muzzle, px + fx * (7.1 - recoil), py + 1.95, pz + fz * (7.1 - recoil));
    move(t.mg, px + rx * -0.7 + fx * 1.0, py + 2.5, pz + rz * -0.7 + fz * 1.0);
    move(t.boxL, px + rx * 2.0 + fx * -1.5, py + 1.45, pz + rz * 2.0 + fz * -1.5);
    move(t.boxR, px + rx * -2.0 + fx * -1.5, py + 1.45, pz + rz * -2.0 + fz * -1.5);
    move(t.crateL, px + rx * 1.9 + fx * 1.0, py + 1.4, pz + rz * 1.9 + fz * 1.0);
    move(t.crateR, px + rx * -1.9 + fx * 1.0, py + 1.4, pz + rz * -1.9 + fz * 1.0);
    move(t.exhaustL, px + rx * 1.2 + fx * -3.4, py + 1.7, pz + rz * 1.2 + fz * -3.4);
    move(t.exhaustR, px + rx * -1.2 + fx * -3.4, py + 1.7, pz + rz * -1.2 + fz * -3.4);
    move(t.antenna, px + rx * -1.0 + fx * -0.9, py + 3.3, pz + rz * -1.0 + fz * -0.9);
    move(t.antenna2, px + rx * 1.0 + fx * -0.9, py + 3.1, pz + rz * 1.0 + fz * -0.9);

    const all = [
      t.body, t.lower, t.rear, t.engine, t.engineGrill,
      t.sideArmorL, t.sideArmorR, t.trackL, t.trackR, t.skirtL, t.skirtR,
      t.wL1, t.wL2, t.wL3, t.wL4, t.wR1, t.wR2, t.wR3, t.wR4,
      t.turret, t.turretRing, t.turretTop, t.cupola, t.hatch, t.sight,
      t.mantlet, t.barrelBase, t.barrel, t.barrelTip, t.muzzle, t.mg,
      t.boxL, t.boxR, t.crateL, t.crateR, t.exhaustL, t.exhaustR, t.antenna, t.antenna2
    ];
    for (let i = 0; i < all.length; i++) face(all[i]);
  }

  if (globalThis.tankShots && globalThis.tankShots.length) {
    const still = [];
    for (let i = 0; i < globalThis.tankShots.length; i++) {
      const s = globalThis.tankShots[i];
      if (!s || s.id == null) continue;
      s.life--;
      const pos = api.getPosition(s.id);
      if (!pos || s.life <= 0) {
        if (pos) rpgBlast(pos[0], pos[1], pos[2], s.owner);
        try { api.deleteMeshEntity(s.id); } catch (e) {}
        continue;
      }
      const nx = pos[0] + s.vx;
      const ny = pos[1] + s.vy;
      const nz = pos[2] + s.vz;
      let hit = false;
      try {
        const b = api.getBlock(Math.floor(nx), Math.floor(ny), Math.floor(nz));
        if (b && b !== "Air") hit = true;
      } catch (e) {}
      try { api.setPosition(s.id, nx, ny, nz); } catch (e) {}
      if (hit) {
        rpgBlast(nx, ny, nz, s.owner);
        try { api.deleteMeshEntity(s.id); } catch (e) {}
        continue;
      }
      still.push(s);
    }
    globalThis.tankShots = still;
  }
};
