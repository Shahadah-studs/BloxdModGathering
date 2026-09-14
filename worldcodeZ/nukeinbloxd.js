const dealWarfareEffect = (centerX, centerY, centerZ, radius, amount, shooterId, type) => {
    const allPlayers = api.getPlayerIds();
    for (const tId of allPlayers) {
        const tPos = api.getPosition(tId);
        if (tPos) {
            const dist = Math.sqrt(
                Math.pow(tPos[0] - centerX, 2) +
                Math.pow(tPos[1] - centerY, 2) +
                Math.pow(tPos[2] - centerZ, 2)
            );
            if (dist <= radius) {
                api.applyHealthChange(tId, amount, { lifeformId: shooterId, withItem: type });
            }
        }
    }
    const allMobs = api.getMobIds();
    for (const mId of allMobs) {
        const mPos = api.getPosition(mId);
        if (mPos) {
            const dist = Math.sqrt(
                Math.pow(mPos[0] - centerX, 2) +
                Math.pow(mPos[1] - centerY, 2) +
                Math.pow(mPos[2] - centerZ, 2)
            );
            if (dist <= radius) {
                api.applyHealthChange(mId, amount, { lifeformId: shooterId, withItem: type });
            }
        }
    }
};

const applyNukeEffects = (centerX, centerY, centerZ, radius, shooterId) => {
    const allPlayers = api.getPlayerIds();
    for (const tId of allPlayers) {
        const tPos = api.getPosition(tId);
        if (tPos) {
            const dist = Math.sqrt(Math.pow(tPos[0] - centerX, 2) + Math.pow(tPos[1] - centerY, 2) + Math.pow(tPos[2] - centerZ, 2));
            if (dist <= radius) {
                api.sendMessage(tId, "☢ NUCLEAR STRIKE ☢\nYou are BLINDED, IRRADIATED AND FROZEN IN SHOCK!", { color: "dark_red" });
                api.applyEffect(tId, "Blindness", 15000, { inbuiltLevel: 1 });
                api.applyEffect(tId, "Poisoned", 20000, { inbuiltLevel: 2 });
                api.applyEffect(tId, "Frozen", 20000, { inbuiltLevel: 2 });
            }
        }
    }
};

const triggerNukeShockwave = (centerX, centerY, centerZ, shooterId) => {
    const shockwaveRadius = 35000;
    const shockwaveDamage = -75;
    if (typeof api.playSound === "function") {
        try {
            api.playSound(shooterId, "cannonFire1", 1, 1, { playerIdOrPos: [centerX, centerY, centerZ] });
        } catch (e) {}
    }
    if (typeof api.playParticleEffect === "function") {
        try {
            api.playParticleEffect({
                texture: "critical_hit",
                pos1: [centerX - 80, centerY - 20, centerZ - 80],
                pos2: [centerX + 80, centerY + 20, centerZ + 80],
                dir1: [-2, 0, -2],
                dir2: [2, 0, 2],
                minSize: 12,
                maxSize: 18,
                minLifeTime: 10,
                maxLifeTime: 20,
                manualEmitCount: 120,
                minEmitPower: 1,
                maxEmitPower: 2,
                gravity: [0, 0, 0],
                blendMode: 1
            });
        } catch (e) {
            try {
                api.playParticleEffect({
                    texture: "critical_hit",
                    pos1: [centerX - 40, centerY - 10, centerZ - 40],
                    pos2: [centerX + 40, centerY + 10, centerZ + 40],
                    dir1: [-1, 0, -1],
                    dir2: [1, 0, 1],
                    minSize: 6,
                    maxSize: 10,
                    minLifeTime: 5,
                    maxLifeTime: 10,
                    manualEmitCount: 60,
                    minEmitPower: 0.5,
                    maxEmitPower: 1,
                    gravity: [0, 0, 0]
                });
            } catch (err) {}
        }
    }
    try {
        dealWarfareEffect(centerX, centerY, centerZ, shockwaveRadius, shockwaveDamage, shooterId, "Shockwave");
    } catch (e) {}
};

const destroyGrassInRadius = (centerX, centerY, centerZ, radius) => {
    const r = Math.ceil(radius);
    for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dz = -r; dz <= r; dz++) {
                const dist2 = dx*dx + dy*dy + dz*dz;
                if (dist2 > radius * radius) continue;
                const bx = Math.round(centerX + dx);
                const by = Math.round(centerY + dy);
                const bz = Math.round(centerZ + dz);
                try {
                    if (!api.isBlockInLoadedChunk(bx, by, bz)) continue;
                    const b = api.getBlock(bx, by, bz);
                    if (!b || typeof b !== 'string') continue;
                    const name = b.split("|")[0];
                    if (name.toLowerCase().includes('grass')) {
                        api.setBlock(bx, by, bz, 'Air');
                    }
                } catch (e) {

                }
            }
        }
    }
};

const triggerNukeSecondaryShockwave = (centerX, centerY, centerZ, shooterId) => {
    const finalRadius = 12000;
    const pulses = 5;
    const pulseInterval = 600;
    const damagePerPulse = -30;

    for (let i = 1; i <= pulses; i++) {
        scheduleDelayed(i * pulseInterval, () => {
            const radius = Math.floor((finalRadius * i) / pulses);
            try {
                if (typeof api.playParticleEffect === 'function') {
                    api.playParticleEffect({
                        texture: 'critical_hit',
                        pos1: [centerX - radius/2, centerY - 10, centerZ - radius/2],
                        pos2: [centerX + radius/2, centerY + 10, centerZ + radius/2],
                        dir1: [-1, 0, -1], dir2: [1, 0, 1],
                        minSize: 8, maxSize: 14,
                        minLifeTime: 40, maxLifeTime: 80,
                        manualEmitCount: 200,
                        minEmitPower: 0.5, maxEmitPower: 1.2,
                        gravity: [0, 0, 0],
                        blendMode: 1
                    });
                }
            } catch (e) {}
            try { dealWarfareEffect(centerX, centerY, centerZ, radius * 10, damagePerPulse, shooterId, 'SecondaryShock'); } catch (e) {}

            if (i === pulses) {
                try { destroyGrassInRadius(centerX, centerY, centerZ, finalRadius); } catch (e) {}
            }
        });
    }
};

const scheduleDelayed = (delayMs, fn) => {
    try {
        if (typeof api.setTimeout === "function") return api.setTimeout(fn, delayMs);
    } catch (e) {}
    if (typeof setTimeout === "function") return setTimeout(fn, delayMs);
    fn();
    return null;
};

/* ====================== THROWABLES ====================== */
onPlayerThrowableHitTerrain = (playerId, throwableName, thrownEntityId) => {
    const pos = api.getPosition(thrownEntityId);
    if (!pos) return;
    const [x, y, z] = pos;
    if (throwableName === "Iceball") {
        api.playSound(playerId, "cannonFire1", 1, 0.75, { playerIdOrPos: [x, y, z] });
        try {
            api.playParticleEffect({ texture: "soul_0", pos1: [x - 60, y, z - 60], pos2: [x + 60, y + 5, z + 60], dir1: [-2, 8, -2], dir2: [2, 25, 2], minSize: 80, maxSize: 120, minLifeTime: 100, maxLifeTime: 120, manualEmitCount: 1000, minEmitPower: 1, maxEmitPower: 3, gravity: [0, -0.1, 0], blendMode: 1, hideDist: 6000, colorGradients: [{ timeFraction: 0, minColor: [30, 30, 30, 1], maxColor: [60, 60, 60, 1] }], velocityGradients: [{ timeFraction: 0, factor: 0.1, factor2: 0.1 }] });
        } catch (e) {}
        try {
            api.playParticleEffect({ texture: "soul_0", pos1: [x - 80, y, z - 80], pos2: [x + 80, y + 3, z + 80], dir1: [-0.5, 0, -0.5], dir2: [0.5, 0.1, 0.5], minSize: 90, maxSize: 130, minLifeTime: 110, maxLifeTime: 130, manualEmitCount: 2500, minEmitPower: 0.5, maxEmitPower: 2, gravity: [0, -0.05, 0], blendMode: 1, hideDist: 4000, colorGradients: [{ timeFraction: 0, minColor: [20, 20, 20, 1], maxColor: [40, 40, 40, 1] }], velocityGradients: [{ timeFraction: 0, factor: 0.05, factor2: 0.05 }] });
        } catch (e) {}
        try {
            api.playParticleEffect({ texture: "critical_hit", pos1: [x - 100, y, z - 100], pos2: [x + 100, y + 40, z + 100], dir1: [-15, 6, -15], dir2: [15, 32, 15], minSize: 400, maxSize: 400, minLifeTime: 500, maxLifeTime: 500, manualEmitCount: 1200, minEmitPower: 18, maxEmitPower: 38, gravity: [5, -3, 5], blendMode: 1, hideDist: 4000, colorGradients: [{ timeFraction: 0, minColor: [255, 255, 80, 1], maxColor: [255, 110, 30, 1] }, { timeFraction: 0.15, minColor: [255, 160, 40, 1], maxColor: [255, 70, 10, 1] }, { timeFraction: 0.45, minColor: [255, 80, 0, 1], maxColor: [220, 30, 0, 1] }, { timeFraction: 0.75, minColor: [180, 25, 0, 0.95], maxColor: [120, 10, 0, 0.9] }, { timeFraction: 0.92, minColor: [70, 8, 0, 0.45], maxColor: [40, 3, 0, 0.4] }, { timeFraction: 1, minColor: [20, 0, 0, 0], maxColor: [10, 0, 0, 0] }], velocityGradients: [{ timeFraction: 0, factor: 0.10, factor2: 0.10 }, { timeFraction: 0.6, factor: 0.10, factor2: 0.10 }, { timeFraction: 1, factor: 0.22, factor2: 0.22 }] });
        } catch (e) {}
        try {
            api.playParticleEffect({ texture: "soul_0", pos1: [x - 20, y, z - 20], pos2: [x + 20, y + 100, z + 20], dir1: [-1, 10, -1], dir2: [1, 25, 1], minSize: 50, maxSize: 90, minLifeTime: 60, maxLifeTime: 90, manualEmitCount: 800, minEmitPower: 15, maxEmitPower: 35, gravity: [0, 0, 0], blendMode: 1, hideDist: 4000, colorGradients: [{ timeFraction: 0, minColor: [15, 15, 15, 1], maxColor: [40, 40, 40, 1] }] });
        } catch (e) {}
        try {
            api.playParticleEffect({ texture: "soul_0", pos1: [x - 120, y + 100, z - 120], pos2: [x + 120, y + 150, z + 120], dir1: [-15, -2, -15], dir2: [15, 2, 15], minSize: 100, maxSize: 200, minLifeTime: 240, maxLifeTime: 330, manualEmitCount: 1000, minEmitPower: 5, maxEmitPower: 20, gravity: [0, -0.1, 0], blendMode: 1, hideDist: 4000, colorGradients: [{ timeFraction: 0, minColor: [25, 25, 25, 1], maxColor: [0, 0, 0, 1] }], velocityGradients: [{ timeFraction: 0, factor: 0.2, factor2: 0.2 }] });
        } catch (e) {}
        dealWarfareEffect(x, y, z, 2000, -200, playerId, "Nuke");
        applyNukeEffects(x, y, z, 10000, playerId);
        scheduleDelayed(400, () => {
            triggerNukeShockwave(x, y, z, playerId);
        });

        scheduleDelayed(5000, () => {
            triggerNukeSecondaryShockwave(x, y, z, playerId);
        });
    }
};
