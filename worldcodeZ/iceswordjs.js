function onPlayerDamagingOtherPlayer(attacker, damaged, damage, item) {
  const held = api.getHeldItem(attacker);
  if (!held || !held.attributes || !held.attributes.customDisplayName) return;
  const name = held.attributes.customDisplayName;
  const rand = Math.random();
  if (name === "Ice Sword") {
    api.applyEffect(damaged, "Frozen", 1000, { icon: "Iceball" });
    api.applyEffect(damaged, "Slowness", 2000, { icon: "Iceball" });
  }
