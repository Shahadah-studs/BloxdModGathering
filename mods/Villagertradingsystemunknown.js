let smithId = null;
let chefId = null;
let farmerId = null;
let mysticId = null;

onPlayerJoin = (playerId) => {
    if (!smithId) {
        smithId = api.attemptSpawnMob("NPC", 10, 5, 10, { name: "Blacksmith (Tools)" });
        if (smithId) { api.setMobSetting(smithId, "baseWalkingSpeed", 0); api.setMobSetting(smithId, "maxHealth", 9999); };
    }
    if (!chefId) {
        chefId = api.attemptSpawnMob("NPC", 15, 5, 10, { name: "Chef (Food)" });
        if (chefId) { api.setMobSetting(chefId, "baseWalkingSpeed", 0); api.setMobSetting(chefId, "maxHealth", 9999); };
    }
    if (!farmerId) {
        farmerId = api.attemptSpawnMob("NPC", 20, 5, 10, { name: "Farmer (Buy Raw Food)" });
        if (farmerId) { api.setMobSetting(farmerId, "baseWalkingSpeed", 0); api.setMobSetting(farmerId, "maxHealth", 9999); };
    }
    if (!mysticId) {
        mysticId = api.attemptSpawnMob("NPC", 25, 5, 10, { name: "Mystic (High Tier)" });
        if (mysticId) { api.setMobSetting(mysticId, "baseWalkingSpeed", 0); api.setMobSetting(mysticId, "maxHealth", 9999); };
    }
};

onPlayerAltAction = (playerId, x, y, z, block, targetEId) => {
    let held = api.getHeldItem(playerId);

    if (targetEId === smithId) {
        if (!held || held.name !== "Iron Bar") {
            api.sendMessage(playerId, "--- BLACKSMITH: Hold Iron Bars to trade ---", { color: "orange" });
            api.sendMessage(playerId, "Iron Pickaxe: 3 Bars | Iron Sword: 2 Bars | Iron Chestplate: 8 Bars | Diamond Pick: 12 Bars", { color: "white" });
            return "preventAction";
        }
        if (held.amount >= 12) { api.removeItemName(playerId, "Iron Bar", 12); api.giveItem(playerId, "Diamond Pickaxe", 1); api.sendMessage(playerId, "Bought Diamond Pickaxe!", {color: "lime"}); }
        else if (held.amount >= 8) { api.removeItemName(playerId, "Iron Bar", 8); api.giveItem(playerId, "Iron Chestplate", 1); api.sendMessage(playerId, "Bought Iron Chestplate!", {color: "lime"}); }
        else if (held.amount >= 3) { api.removeItemName(playerId, "Iron Bar", 3); api.giveItem(playerId, "Iron Pickaxe", 1); api.sendMessage(playerId, "Bought Iron Pickaxe!", {color: "lime"}); }
        else if (held.amount >= 2) { api.removeItemName(playerId, "Iron Bar", 2); api.giveItem(playerId, "Iron Sword", 1); api.sendMessage(playerId, "Bought Iron Sword!", {color: "lime"}); }
        return "preventAction";
    }

    if (targetEId === chefId) {
        if (!held || held.name !== "Gold Bar") {
            api.sendMessage(playerId, "--- CHEF: Hold Gold Bars to trade ---", { color: "yellow" });
            api.sendMessage(playerId, "10 Apples: 1 Bar | 5 Cooked Porkchop: 1 Bar | Medkit: 2 Bars", { color: "white" });
            return "preventAction";
        }
        if (held.amount >= 2) { api.removeItemName(playerId, "Gold Bar", 2); api.giveItem(playerId, "Medkit", 1); api.sendMessage(playerId, "Bought Medkit!", {color: "lime"}); }
        else if (held.amount >= 1) { 
            api.removeItemName(playerId, "Gold Bar", 1); 
            api.giveItem(playerId, "Apple", 10); 
            api.sendMessage(playerId, "Bought 10 Apples!", {color: "lime"}); 
        }
        return "preventAction";
    }

    if (targetEId === farmerId) {
        if (!held) {
            api.sendMessage(playerId, "--- FARMER: I buy Raw Food for Iron Bars ---", { color: "lime" });
            api.sendMessage(playerId, "I give 1 Iron Bar for: 5 Raw Beef OR 5 Raw Porkchop OR 10 Wheat", { color: "white" });
            return "preventAction";
        }
        if (held.name === "Raw Beef" && held.amount >= 5) { api.removeItemName(playerId, "Raw Beef", 5); api.giveItem(playerId, "Iron Bar", 1); api.sendMessage(playerId, "Traded Beef for 1 Iron Bar!", {color: "lime"}); }
        else if (held.name === "Raw Porkchop" && held.amount >= 5) { api.removeItemName(playerId, "Raw Porkchop", 5); api.giveItem(playerId, "Iron Bar", 1); api.sendMessage(playerId, "Traded Pork for 1 Iron Bar!", {color: "lime"}); }
        else if (held.name === "Wheat" && held.amount >= 10) { api.removeItemName(playerId, "Wheat", 10); api.giveItem(playerId, "Iron Bar", 1); api.sendMessage(playerId, "Traded Wheat for 1 Iron Bar!", {color: "lime"}); }
        else { api.sendMessage(playerId, "Hold 5 Raw Beef, 5 Raw Pork, or 10 Wheat!", {color: "red"}); }
        return "preventAction";
    }

    if (targetEId === mysticId) {
        if (!held || held.name !== "Gold Bar") {
            api.sendMessage(playerId, "--- MYSTIC: Hold Gold Bars for Rare Items ---", { color: "purple" });
            api.sendMessage(playerId, "Moonstone Orb: 10 Bars | Diamond Chestplate: 20 Bars | Diamond Boots: 10 Bars", { color: "white" });
            return "preventAction";
        }
        if (held.amount >= 20) { api.removeItemName(playerId, "Gold Bar", 20); api.giveItem(playerId, "Diamond Chestplate", 1); api.sendMessage(playerId, "Bought Diamond Chestplate!", {color: "lime"}); }
        else if (held.amount >= 10) { 
            api.removeItemName(playerId, "Gold Bar", 10); 
            api.giveItem(playerId, "Moonstone Orb", 1); 
            api.sendMessage(playerId, "Bought Moonstone Orb!", {color: "lime"}); 
        }
        return "preventAction";
    }
};
