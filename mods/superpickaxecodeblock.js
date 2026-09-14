api.giveItem(myId, "Moonstone Pickaxe", 1, {
    customDisplayName: "Super Pickaxe",
    customAttributes: {
        enchantmentTier: "Tier 4"
    }
});
api.sendMessage(myId, "You received the Super Pickaxe!", { color: "purple" });
