// Please give AnantGamerYT(@anantgamerzgg on youtube) credit, thanks

let explosions = [];

onPlayerAttemptAltAction = (playerId, x, y, z, blockName) => {
if (JSON.stringify(api.getHeldItem(playerId)).includes("Torch")) {
    let [px, py, pz] = api.getPosition(playerId);

    let r = 0;
    let speed = 0;
    let name = "";

    // 🔥 TNT TYPES
    if (blockName === "Red Neon") {
        r = 30; speed = 260; name = "Red";
    }
    else if (blockName === "Blue Neon") {
        r = 20; speed = 180; name = "Blue";
    }
    else if (blockName === "Green Neon") {
        r = 12; speed = 120; name = "Green";
    }
    else if (blockName === "Yellow Neon") {
        r = 40; speed = 220; name = "Nuke";
		api.broadcastMessage(api.getEntityName(playerId) + " has activated ☢ Nuke!", {color:"red"})
    }
    else if (blockName === "Purple Neon") {
        r = 25; speed = 300; name = "Hyper";
    }
    else if (blockName === "Black Neon") {
        r = 50; speed = 200; name = "Void";
    }
    else if (blockName === "White Neon") {
        r = 9; speed = 540; name = "Flash";
    }
    else if (blockName === "Cyan Neon") {
        r = 22; speed = 200; name = "Wave";
    }
    else if (blockName === "Orange Neon") {
        r = 28; speed = 240; name = "Blaze";
    }
    else if (blockName === "Pink Neon") {
        r = 16; speed = 160; name = "Mini";
    }
    else if (blockName === "Lime Neon") {
        r = 14; speed = 170; name = "Toxic";
    }
    else if (blockName === "Magenta Neon") {
        r = 26; speed = 260; name = "Chaos";
    }
    else if (blockName === "Light Blue Neon") {
        r = 24; speed = 210; name = "Frost";
    }
    else if (blockName === "Gray Neon") {
        r = 20; speed = 150; name = "Dust";
    }
    else if (blockName === "Light Gray Neon") {
        r = 22; speed = 170; name = "Miner";
    }
    else if (blockName === "Brown Neon") {
        r = 18; speed = 130; name = "Earth";
    }
    else {
        return;
    }

    // 💬 MESSAGE
    api.sendMessage(playerId, "💣 " + name + " TNT Activated!", {color: "#FF0000"});

    explosions.push({
        type: blockName, // 🔥 IMPORTANT (for Miner TNT)
        x: Math.floor(px),
        y: Math.floor(py),
        z: Math.floor(pz),
        r: r,
        speed: speed,
        ox: -r,
        oy: -r,
        oz: -r,
        done: false
    });

    return "preventDefault";
	}
};

tick = () => {
    for (let exp of explosions) {

        if (exp.done) continue;

        let {x, y, z, r, speed} = exp;

        for (let n = 0; n < speed; n++) {

            if (exp.ox > r) {
                exp.done = true;
                break;
            }

            let ox = exp.ox;
            let oy = exp.oy;
            let oz = exp.oz;

            let distSq = ox*ox + oy*oy + oz*oz;

            if (distSq <= r*r) {

                let bx = x + ox;
                let by = y + oy;
                let bz = z + oz;

                let block = api.getBlock(bx, by, bz);

                // ⛏️ MINER TNT (Light Gray Neon)
                if (exp.type === "Light Gray Neon") {

                    if (
                        block === "Stone" ||
                        block === "Messy Stone" ||
                        block === "Andesite" ||
                        block === "Diorite" ||
                        block === "Granite" ||
                        block === "Sandstone" ||
                        block === "Red Sandstone"
                    ) {
                        api.setBlock(bx, by, bz, "Air");
                    }

                } else {
                    // 💣 NORMAL TNT
                    api.setBlock(bx, by, bz, "Air");
                }
            }

            exp.oz++;
            if (exp.oz > r) {
                exp.oz = -r;
                exp.oy++;
            }
            if (exp.oy > r) {
                exp.oy = -r;
                exp.ox++;
            }
        }
    }

    explosions = explosions.filter(e => !e.done);
};
