function onPlayerAttemptAltAction(id){

	if (api.getHeldItem(id)?.name == "Gold Spade" &&
		api.getHeldItem(id)?.attributes.customDisplayName == "Totem Of Undying"  		 &&	api.getEffects(id).includes ("Totem") == false){
	       /* ---apply totem effect--- */
		api.applyEffect(id, "Totem", null, {icon: "Gold Spade"})
		slot = api.getSelectedInventorySlotI(id)
		api.setItemSlot(id, slot, "Air")
	}
}

function onPlayerDamagingOtherPlayer(attacker, victim, dmg) {

  if (api.getHeldItem(victim)?.attributes.customDisplayName ==="Totem Of Undying" && api.getHealth(victim) - dmg < 5 || api.getEffects(victim).includes('Totem')
      && api.getHealth(victim) - dmg < 5) {
	/* ---TOTEM WORK--- */
    const pos = api.getPosition(victim);
    api.applyEffect(victim, 'Health Regen', 5000, {inbuiltLevel: 1});
	api.applyEffect(victim, "Heat Resistance", 10000, {inbuiltLevel: 1})
	api.applyEffect(victim, "Damage Reduction", 5000, {inbuiltLevel: 1})
	api.setHealth(victim, 30)
    api.setShieldAmount(victim, 30);
    particle(pos[0], pos[1], pos[2]);
    if (api.getHeldItem(victim)?.attributes.customDisplayName ==="Totem Of Undying"){
	slot = api.getSelectedInventorySlotI(victim)
	api.setItemSlot(victim, slot, "Air")}
	else {api.removeEffect(victim, 'Totem');}
  }
}

function onMobDamagingPlayer(attacker, victim, dmg) {

  if (api.getHeldItem(victim)?.attributes.customDisplayName ==="Totem Of Undying" && api.getHealth(victim) - dmg < 5 || api.getEffects(victim).includes('Totem')
      && api.getHealth(victim) - dmg < 5) {
	/* ---TOTEM WORK--- */
    const pos = api.getPosition(victim);
    api.applyEffect(victim, 'Health Regen', 5000, {inbuiltLevel: 1});
	api.applyEffect(victim, "Heat Resistance", 10000, {inbuiltLevel: 1})
	api.applyEffect(victim, "Damage Reduction", 5000, {inbuiltLevel: 1})
	api.setHealth(victim, 30)
    api.setShieldAmount(victim, 30);
    particle(pos[0], pos[1], pos[2]);
    if (api.getHeldItem(victim)?.attributes.customDisplayName ==="Totem Of Undying"){
	slot = api.getSelectedInventorySlotI(victim)
	api.setItemSlot(victim, slot, "Air")}
	else {api.removeEffect(victim, 'Totem');}
  }
}

function particle(x, y, z){ 
y += 1
api.playParticleEffect({
 		dir1: [-1, -1, -1],
 		dir2: [1, 1, 1],
  		pos1: [x + 2, y + 1.5, z + 2],
    	pos2: [x - 2, y - 1.5, z - 2],
    	texture: "glint",
    	minLifeTime: 0.5,
    	maxLifeTime: 2,
    	minEmitPower: 4,
    	maxEmitPower: 6,
    	minSize: 0.1,
   		maxSize: 0.5,
    	manualEmitCount: 85,
    	gravity: [0, -10, 0],
    	colorGradients: [
   	    {
   	        timeFraction: 0,
            minColor: [211, 214, 0, 0.5],
            maxColor: [0, 255, 0, 0.8],
        },
    	],
    	velocityGradients: [
        {
            timeFraction: 1,
            factor: 0.2,
            factor2: 1,
        },
    	],
    	blendMode: 1,
	})
}
