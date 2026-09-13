let [x, y, z] = thisPos;
var k = api.attemptSpawnMob("NPC", x+0.5, y+0.5, z+0.5);

api.setMobSetting(k, "name", "villager");
api.setMobSetting(k, "baseRunningSpeed", 3.15);
api.setMobSetting(k, "baseWalkingSpeed", 2.25);
api.setMobSetting(k, "jumpMultiplier", 1);

api.setMobSetting(k, "initialHealth", 500000);
api.setMobSetting(k, "maxHealth", 500);
