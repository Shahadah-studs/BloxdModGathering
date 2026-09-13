yutyrannus = {}
pending = []

onPlayerJoin = p => {
    api.giveItem(p, "Arrow of Poison", 16)
    api.giveItem(p, "Wood Bow")
    api.sendMessage(p, "Shoot the ground with the bow to spawn the T-Rex!")
}

onPlayerThrowableHitTerrain = (p, tn, ti) => {
    if (tn !== "Arrow of Poison") return

    const pos = api.getPosition(ti)

    const m = api.attemptSpawnMob(
        "Draugr Reaver",
        pos[0],
        pos[1],
        pos[2],
        { name: "T-Rex" }
    )

    if (!api.checkValid(m)) return

    api.setMobSetting(m, "attackDamage", 50)
    api.setMobSetting(m, "baseRunningSpeed", 8)

    api.setMobSetting(m, "tameInfo", {
        tameItemName: [
            "Raw Porkchop",
            "Raw Beef",
            "Raw Mutton",
            "Raw Venison",
            "Cooked Porkchop",
            "Steak",
            "Cooked Mutton",
            "Cooked Venison",
            "Saddle"
        ],

        probabilityOfTame: 0.32,

        isSaddleable: true,

        foodItemNames: [
            "Raw Porkchop",
            "Raw Beef",
            "Raw Mutton",
            "Raw Venison",
            "Cooked Porkchop",
            "Steak",
            "Cooked Mutton",
            "Cooked Venison",
            "Saddle"
        ],

        foodItemsWithEffects: [
            {
                itemName: "Catnip",
                effects: [
                    {
                        name: "Speed",
                        duration: 30000,
                        level: 1
                    },
                    {
                        name: "Damage",
                        duration: 30000,
                        level: 1
                    }
                ]
            }
        ]
    })

    yutyrannus[m] = true
    pending.push({ m: m, t: 0 })
}

function makeYutyrannus(m) {

    api.setTargetedPlayerSettingForEveryone(
        m,
        "opacity",
        0.01,
        true
    )

    api.updateEntityNodeMeshAttachment(
        m,
        "HeadMesh",
        "BloxdBlock",
        {
            blockName: "Jungle Log",
            size: [0.75, 1.0, 1.25]
        },
        [0, 0.35, 0.55],
        [0, 0, 0]
    )

    api.updateEntityNodeMeshAttachment(
        m,
        "TorsoNode",
        "BloxdBlock",
        {
            blockName: "Jungle Log",
            size: [0.65, 1.15, 2.7]
        },
        [0, 0.2, -1.05],
        [0, 0, 0]
    )

    api.updateEntityNodeMeshAttachment(
        m,
        "LegLeftMesh",
        "BloxdBlock",
        {
            blockName: "Jungle Log",
            size: [0.65, 1.1, 0.75]
        },
        [0.4, -0.7, 0],
        [0, 0, 0]
    )

    api.updateEntityNodeMeshAttachment(
        m,
        "LegRightMesh",
        "BloxdBlock",
        {
            blockName: "Jungle Log",
            size: [0.65, 1.1, 0.75]
        },
        [-0.4, -0.7, 0],
        [0, 0, 0]
    )
}

tick = () => {

    for (let i = 0; i < pending.length; i++) {

        const p = pending[i]

        if (!api.checkValid(p.m)) {
            pending.splice(i--, 1)
            continue
        }

        p.t++

        if (p.t < 2) continue

        makeYutyrannus(p.m)

        pending.splice(i--, 1)
    }

    for (const m in yutyrannus) {

        if (!api.checkValid(m)) {
            delete yutyrannus[m]
        }
    }
}
