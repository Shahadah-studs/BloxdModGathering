//freecam code by Master_hamster

let freecam = {};
let meshEntity = {};

tick = () => {

    for (let id of api.getPlayerIds()) {

        let held = api.getHeldItem(id);


        let usingCamera =
            held &&
            held.name === "Invisible Solid" &&
            held.attributes &&
            held.attributes.customDisplayName === "CAMERA";

        // =====================================
        // ENABLE FREECAM
        // =====================================

        if (usingCamera && !freecam[id]) {

            freecam[id] = true;

            let pos = api.getPosition(id);
            let rot = api.getEntityHeading(id)
            let physicsType = api.getPlayerPhysicsState(id).type


            api.setCameraZoom(id, 10);

            let name = `${api.getEntityName(id)}`;
            let back = api.getPlayerCosmetic(id, "back");
            let body = api.getPlayerCosmetic(id, "body");
            let cape = api.getPlayerCosmetic(id, "cape");
            let eyebrows = api.getPlayerCosmetic(id, "eyebrows");
            let eyes = api.getPlayerCosmetic(id, "eyes");
            let hat = api.getPlayerCosmetic(id, "hat");
            let head = api.getPlayerCosmetic(id, "head");
            let legs = api.getPlayerCosmetic(id, "legs");
            let nameColor = api.getPlayerCosmetic(id, "nameColour");
            let shoes = api.getPlayerCosmetic(id, "shoes");
            let skin = api.getPlayerCosmetic(id, "skin");
            let npc = api.attemptCreateMeshEntity("Person", {textures: {body: body, eyebrows: eyebrows, eyes: eyes, head: head, legs: legs, shoes: shoes, skin:skin} }, name);

            meshEntity[id] = npc;

            // Freeze NPC
            if (npc) {
                api.setPosition(npc, pos)
                api.setEntityHeading(npc, rot)
            }


            api.setPlayerOpacity(id, 0);

            api.sendMessage(
                id,
                "📸 Freecam Enabled",
                { color: "cyan" }
            );
        }

        // =====================================
        // DISABLE FREECAM
        // =====================================

        if (!usingCamera && freecam[id]) {

            freecam[id] = false;


            api.setCameraZoom(id, 0);

            api.setPlayerOpacity(id, 1,);


            if (meshEntity[id]) {

                api.deleteMeshEntity(meshEntity[id]);
                delete meshEntity[id];
            }

            api.sendMessage(
                id,
                "📸 Freecam Disabled",
                { color: "orange" }
            );
        }


        if (freecam[id]) {


            api.setCameraZoom(id, 10);


            api.applyImpulse(id, 0, 0.03, 0);
        }
    }
};
