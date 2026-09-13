// ======================================================================
// SHAHADAH STUDIOS ELITE // VOIDSENT SMP EVENT NODE: NULL_AGGRESSION_V2
// ======================================================================

let targetPlayer = null; // Stocke la cible actuelle de NULL

function initializeNullBoss(room) {
  // Coordonnées de départ dans le Lobby (Lobby Vector Base)
  let nullPos = { x: 0.0, y: 5.0, z: 0.0 };
  const hyperSpeed = 1.2; // Multiplicateur de vélocité ultra-rapide

  console.log("// SHS SECURITY: NULL AGGRESSION PROTOCOL ENGAGED.");

  // Étape 1 : Spawner NULL avec une épée en fer (Iron Sword Asset ID)
  const nullEntity = room.spawnNPC({
    id: "entity_null_999",
    name: "NULL",
    x: nullPos.x,
    y: nullPos.y,
    z: nullPos.z,
    appearance: {
      skinUrl: "", // Forcer le bug du skin noir absolu
      colorHex: "#000000",
      heldItem: "iron_sword", // NULL tient désormais une épée en fer visible par tous
      scale: { x: 1.1, y: 2.1, z: 1.1 } // Légèrement plus grand pour être imposant
    },
    isSolid: true
  });

  // Étape 2 : Le Déclencheur - Si un joueur fabrique une épée
  room.onPlayerCraft((player, itemCrafted) => {
    // Si l'objet fabriqué contient le mot-clé "sword" (bois, pierre, fer, diamant...)
    if (itemCrafted.includes("sword") && !player.isDead) {
      targetPlayer = player; // NULL verrouille sa cible !
      room.broadcastMessage(`[⚠️ ENTITY ALERT]: NULL has locked onto ${player.name} for breaking the peace!`);
    }
  });

  // Étape 3 : Boucle de Traque Ultra-Rapide (Frame-by-Frame System Tick)
  room.onTick(() => {
    // Si NULL n'a pas de cible, il reste calme dans son salon
    if (!targetPlayer || targetPlayer.isDead) {
      targetPlayer = null;
      return; 
    }

    // Calcul de la direction vers le joueur (3D Targeting Vectors)
    let dx = targetPlayer.x - nullPos.x;
    let dy = targetPlayer.y - nullPos.y;
    let dz = targetPlayer.z - nullPos.z;
    let distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (distance > 0.5) {
      // Calcul des pas de vélocité pour la super vitesse
      nullPos.x += (dx / distance) * hyperSpeed;
      nullPos.y += (dy / distance) * hyperSpeed;
      nullPos.z += (dz / distance) * hyperSpeed;

      // Déplacement instantané de l'entité sur la carte
      nullEntity.setPosition(nullPos.x, nullPos.y, nullPos.z);
    }

    // Étape 4 : Le Coup de Grâce (Kill Zone)
    // Si NULL arrive au contact du joueur (moins de 1.5 bloc de distance)
    if (distance <= 1.5) {
      targetPlayer.damage(100); // Inflige 100 points de dégâts (One-Shot Instantané)
      targetPlayer.sendMessage("[SYSTEM FAILURE]: YOU CANNOT DEFY NULL.");
      
      // Réinitialisation de NULL : il retourne instantanément au centre du lobby après son crime
      nullPos = { x: 0.0, y: 5.0, z: 0.0 };
      nullEntity.setPosition(nullPos.x, nullPos.y, nullPos.z);
      targetPlayer = null; // En attente de la prochaine cible
    }
  });
}
