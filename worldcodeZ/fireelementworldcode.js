let burningTargets = {};
let burstCooldowns = {};
let jumpCooldowns = {};
let lastJumpTrigger = {};

const getCustomName = (item) => {
  if (!item) return "";
  return (item.attributes && item.attributes.customDisplayName) || item.customDisplayName || item.displayName || item.name || "";
};

onPlayerDamagingOtherPlayer = (playerId, targetId, damageDealt) => {
  const heldItem = api.getHeldItem(playerId);
  if (heldItem && heldItem.name === "Gold Sword" && getCustomName(heldItem).toLowerCase().trim() === "fire sword") {
    api.applyEffect(targetId, "Burning", 3000, {
      displayName: "Burning",
      icon: "Lava"
    });
    api.applyHealthChange(targetId, -5, playerId);
    burningTargets[targetId] = {
      id: targetId,
      isMob: false,
      attackerId: playerId,
      ticksLeft: 60,
      nextDamageTick: 12
    };
  }
}

onPlayerDamagingMob = (playerId, mobId, damageDealt) => {
  const heldItem = api.getHeldItem(playerId);
  if (heldItem && heldItem.name === "Gold Sword" && getCustomName(heldItem).toLowerCase().trim() === "fire sword") {
    api.applyEffect(mobId, "Burning", 3000, {
      displayName: "Burning",
      icon: "Lava"
    });
    api.applyHealthChange(mobId, -6, playerId);
    burningTargets[mobId] = {
      id: mobId,
      isMob: true,
      attackerId: playerId,
      ticksLeft: 60,
      nextDamageTick: 12
    };
  }
}

const triggerFireBurst = (playerId) => {
  const heldItem = api.getHeldItem(playerId);
  if (heldItem && heldItem.name === "Orange Paintball" && getCustomName(heldItem).toLowerCase().trim() === "fire burst") {
    const now = Date.now();
    const lastUsed = burstCooldowns[playerId] || 0;
    if (now - lastUsed < 10000) {
      const remaining = ((10000 - (now - lastUsed)) / 1000).toFixed(1);
      api.sendMessage(playerId, "🔥 Fire Burst is on cooldown! (" + remaining + "s remaining)", { color: "red" });
      return;
    }

    const pos = api.getPosition(playerId);
    if (pos) {
      burstCooldowns[playerId] = now;
      api.applyEffect(playerId, "BurstCooldown", 10000, {
        displayName: "Cooldown: Fire Burst",
        icon: "Magma"
      });

      api.playParticleEffect({
        dir1: [-1.2, 0.3, -1.2],
        dir2: [1.2, 0.9, 1.2],
        pos1: [pos[0] - 3.0, pos[1], pos[2] - 3.0],
        pos2: [pos[0] + 3.0, pos[1] + 2.0, pos[2] + 3.0],
        texture: "drift",
        minLifeTime: 0.6,
        maxLifeTime: 1.4,
        minEmitPower: 0.4,
        maxEmitPower: 1.2,
        minSize: 0.15,
        maxSize: 0.45,
        manualEmitCount: 30,
        gravity: [0.1, 0.4, 0.1],
        colorGradients: [
          { timeFraction: 0, minColor: [255, 120, 0, 1], maxColor: [255, 220, 0, 1] },
          { timeFraction: 0.5, minColor: [255, 200, 0, 0.8], maxColor: [255, 255, 0, 0.8] },
          { timeFraction: 1, minColor: [255, 255, 150, 0], maxColor: [255, 255, 255, 0] }
        ],
        velocityGradients: [{ timeFraction: 0, factor: 1, factor2: 1 }],
        blendMode: 1
      });

      let targets = [];

      if (typeof api.getPlayerIds === "function") {
        const playerIds = api.getPlayerIds();
        if (Array.isArray(playerIds)) {
          for (let i = 0; i < playerIds.length; i++) {
            const pid = playerIds[i];
            if (pid && pid !== playerId) {
              targets.push({ id: pid, isMob: false });
            }
          }
        }
      } else if (typeof api.getPlayers === "function") {
        const players = api.getPlayers();
        if (Array.isArray(players)) {
          for (let i = 0; i < players.length; i++) {
            const pid = players[i];
            if (pid && pid !== playerId) {
              targets.push({ id: pid, isMob: false });
            }
          }
        }
      }

      if (typeof api.getMobIds === "function") {
        const mobIds = api.getMobIds();
        if (Array.isArray(mobIds)) {
          for (let i = 0; i < mobIds.length; i++) {
            const mid = mobIds[i];
            if (mid) {
              targets.push({ id: mid, isMob: true });
            }
          }
        }
      }

      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        let targetPos;
        try { targetPos = api.getPosition(target.id); } catch(e) { continue; }

        if (targetPos) {
          const dx = pos[0] - targetPos[0];
          const dy = pos[1] - targetPos[1];
          const dz = pos[2] - targetPos[2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

          if (dist <= 10.0) {
            api.applyEffect(target.id, "Burning", 3000, {
              displayName: "Burning",
              icon: "Lava"
            });
            api.applyHealthChange(target.id, -5, playerId);
            burningTargets[target.id] = {
              id: target.id,
              isMob: target.isMob,
              attackerId: playerId,
              ticksLeft: 60,
              nextDamageTick: 12
            };
          }
        }
      }
    }
  }
}

const triggerFlameJump = (playerId) => {
  const now = Date.now();
  const lastTriggered = lastJumpTrigger[playerId] || 0;
  if (now - lastTriggered < 200) {
    return;
  }
  lastJumpTrigger[playerId] = now;

  const heldItem = api.getHeldItem(playerId);
  if (heldItem && heldItem.name === "Orange Paintball") {
    const name = getCustomName(heldItem).toLowerCase().trim();
    if (name === "" || name.includes("jump") || name.includes("flame") || name === "orange paintball") {
      const lastUsed = jumpCooldowns[playerId] || 0;
      if (now - lastUsed < 5000) {
        const remaining = ((5000 - (now - lastUsed)) / 1000).toFixed(1);
        api.sendMessage(playerId, "🔥 Flame Jump is on cooldown! (" + remaining + "s remaining)", { color: "red" });
        return;
      }

      const pos = api.getPosition(playerId);
      if (pos) {
        jumpCooldowns[playerId] = now;
        try {
          api.applyEffect(playerId, "JumpCooldown", 5000, {
            displayName: "Cooldown: Flame Jump",
            icon: "Lava"
          });
        } catch (e) {}

        try { api.setVelocity(playerId, 0, 15, 0); } catch (e) {}
        try { api.applyImpulse(playerId, 0, 15, 0); } catch (e) {}
        try { api.playSound(playerId, "exp_levelup", 1.0, 1.5); } catch (e) {}

        try {
          api.playParticleEffect({
            dir1: [-2.0, -0.5, -2.0],
            dir2: [2.0, 1.5, 2.0],
            pos1: [pos[0] - 1.5, pos[1] - 0.5, pos[2] - 1.5],
            pos2: [pos[0] + 1.5, pos[1] + 1.0, pos[2] + 1.5],
            texture: "drift",
            minLifeTime: 0.5,
            maxLifeTime: 1.2,
            minEmitPower: 0.8,
            maxEmitPower: 2.0,
            minSize: 0.2,
            maxSize: 0.5,
            manualEmitCount: 40,
            gravity: [0, -0.2, 0],
            colorGradients: [
              { timeFraction: 0, minColor: [255, 80, 0, 1], maxColor: [255, 150, 0, 1] },
              { timeFraction: 0.5, minColor: [255, 200, 0, 0.8], maxColor: [255, 255, 0, 0.8] },
              { timeFraction: 1, minColor: [100, 100, 100, 0], maxColor: [150, 150, 150, 0] }
            ],
            velocityGradients: [{ timeFraction: 0, factor: 1.5, factor2: 1.5 }],
            blendMode: 1
          });
        } catch (e) {}
      }
    }
  }
}

onPlayerClick = (playerId, wasAltClick) => {
  triggerFireBurst(playerId);
  triggerFlameJump(playerId);
}

onPlayerAttemptAltAction = (playerId, x, y, z, block, targetEId) => {
  triggerFireBurst(playerId);
  triggerFlameJump(playerId);
}

tick = (ms) => {
  for (const key in burningTargets) {
    const data = burningTargets[key];
    data.ticksLeft = data.ticksLeft - 1;
    data.nextDamageTick = data.nextDamageTick - 1;

    let pos;
    try {
      pos = api.getPosition(data.id || key);
    } catch (e) {
      delete burningTargets[key];
      continue;
    }

    if (!pos) {
      delete burningTargets[key];
      continue;
    }

    if (data.nextDamageTick <= 0) {
      data.nextDamageTick = 12;
      const dmg = data.isMob ? -3 : -2;
      try {
        api.applyHealthChange(data.id || key, dmg, data.attackerId);
      } catch (e) {
        delete burningTargets[key];
        continue;
      }
    }

    if (data.ticksLeft <= 0) {
      delete burningTargets[key];
    }
  }
}
