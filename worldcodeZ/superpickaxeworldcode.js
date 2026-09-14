onPlayerChangeBlock = (playerId, x, y, z, fromBlock, toBlock) => {
    if (toBlock === "Air") {
        const heldItem = api.getHeldItem(playerId);
        
        if (heldItem && heldItem.name === "Moonstone Pickaxe" && heldItem.attributes && heldItem.attributes.customDisplayName === "Super Pickaxe") {
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        
                        const tx = x + dx;
                        const ty = y + dy;
                        const tz = z + dz;
                        const targetBlock = api.getBlock(tx, ty, tz);

                        if (targetBlock !== "Air" && targetBlock !== "Bedrock" && targetBlock !== "Invisible Solid") {
                            
                            api.setBlock(tx, ty, tz, "Air");
                            api.createItemDrop(tx + 0.5, ty + 0.5, tz + 0.5, targetBlock, 1, false, {});

                            api.playParticleEffect({
                                texture: "square_particle",
                                pos1: [tx, ty, tz],
                                pos2: [tx + 1, ty + 1, tz + 1],
                                dir1: [-1, -1, -1],
                                dir2: [1, 1, 1],
                                minEmitPower: 1,
                                maxEmitPower: 2,
                                minLifeTime: 0.4,
                                maxLifeTime: 0.8,
                                minSize: 0.1,
                                maxSize: 0.3,
                                manualEmitCount: 8,
                                gravity: [0, -4, 0],
                                blendMode: 1,
                                hideDist: 40,
                                velocityGradients: [{
                                    timeFraction: 0,
                                    factor: 1,
                                    factor2: 1
                                }],
                                colorGradients: [{
                                    timeFraction: 0,
                                    minColor: [180, 0, 255, 0.1],
                                    maxColor: [220, 50, 255, 0.9]
                                }]
                            });
                        }
                    }
                }
            }
        }
    }
}
