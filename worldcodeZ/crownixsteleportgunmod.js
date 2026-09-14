var item = "Aura XP Fragment";
var maxDist = 600;

onPlayerJoin = (playerId) => {
if (!api.hasItem(playerId, item)) {
api.setItemSlot(playerId, 0, item, 1, {
customDisplayName: "Long Range Teleporter",
customDescription: "Click on any block within 600 blocks to teleport to it!"
});
}
};

onPlayerClick = (playerId) => {
var held = api.getHeldItem(playerId);
if (!held || held.name !== item) return;
var pos = api.getPosition(playerId);
var face = api.getPlayerFacingInfo(playerId);
if (!face) return;
var step = 2.0;
var maxSteps = Math.min(maxDist / step, 240);
var targetX, targetY, targetZ;
var found = false;
var lastAirX, lastAirY, lastAirZ;
for (var i = 1; i <= maxSteps; i++) {
var x = pos[0] + face.dir[0] * i * step;
var y = pos[1] + face.dir[1] * i * step;
var z = pos[2] + face.dir[2] * i * step;
var bx = Math.floor(x);
var by = Math.floor(y);
var bz = Math.floor(z);
if (!api.isBlockInLoadedChunk(bx, by, bz)) continue;
if (i > 150 && i % 2 === 0) continue;
var solid = api.getBlockSolidity(bx, by, bz);
if (solid) {
if (lastAirX !== undefined) {
targetX = lastAirX + 0.5;
targetY = lastAirY + 1;
targetZ = lastAirZ + 0.5;
found = true;
}
break;
} else {
lastAirX = bx;
lastAirY = by;
lastAirZ = bz;
}
}
if (!found) {
api.sendFlyingMiddleMessage(playerId, ["No blocks found within range"], 0);
return;
}
var safe = null;
var radius = 4;
for (var r = 0; r <= radius && !safe; r++) {
for (var dx = -r; dx <= r && !safe; dx++) {
for (var dz = -r; dz <= r && !safe; dz++) {
if (r > 0 && Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
for (var dy = 0; dy <= 2; dy++) {
var tx = Math.floor(targetX) + dx + 0.5;
var ty = Math.floor(targetY) + dy + 1;
var tz = Math.floor(targetZ) + dz + 0.5;
var feetSolid = api.getBlockSolidity(Math.floor(tx), Math.floor(ty), Math.floor(tz));
var headSolid = api.getBlockSolidity(Math.floor(tx), Math.floor(ty) + 1, Math.floor(tz));
if (!feetSolid && !headSolid) {
safe = [tx, ty, tz];
break;
}
}
}
}
}
if (!safe) return;
api.setPosition(playerId, safe[0], safe[1], safe[2]);
var dist = Math.sqrt((targetX - pos[0]) ** 2 + (targetY - pos[1]) ** 2 + (targetZ - pos[2]) ** 2);
api.sendFlyingMiddleMessage(playerId, ["Teleported! Distance: " + Math.round(dist) + " blocks"], 0);
};
