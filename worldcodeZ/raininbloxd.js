// ============================================
// 🌧️ GLOBAL RAIN MOD FOR BLOXD.IO
// 12 MIN DAY + 8 MIN NIGHT
// 15% CHANCE OF RAIN EACH 20-MINUTE CYCLE
// ============================================

const CYCLE_LENGTH = 20 * 60 * 1000;
const RAIN_LENGTH = 4 * 60 * 1000;
const RAIN_CHANCE = 0.15;

let cycleNumber = -1;
let raining = false;
let rainEndTime = 0;

let nextRainParticles = 0;
let nextMobSpawn = 0;


// ============================================
// ☁️ GRAY RAINY SKY
// ============================================

function setRainSky(playerId, rain) {

    if (rain) {

        api.setClientOptions(playerId, {
            fogColourOverride: "#555b61",
            fogChunkDistanceOverride: 7,
            skyLightColourOverride: "#555b61",
            ambientLightColourOverride: "#4f555b"
        });

    } else {

        api.setClientOptionToDefault(
            playerId,
            "fogColourOverride"
        );

        api.setClientOptionToDefault(
            playerId,
            "fogChunkDistanceOverride"
        );

        api.setClientOptionToDefault(
            playerId,
            "skyLightColourOverride"
        );

        api.setClientOptionToDefault(
            playerId,
            "ambientLightColourOverride"
        );
    }
}


// ============================================
// 🌧️ START RAIN
// ============================================

function startRain() {

    if (raining) return;

    raining = true;

    rainEndTime =
        Date.now() + RAIN_LENGTH;

    // EVERY PLAYER gets rain
    for (const playerId of api.getPlayerIds()) {

        setRainSky(playerId, true);

        api.sendMessage(
            playerId,
            "§b🌧️ RAIN HAS STARTED!"
        );
    }
}


// ============================================
// ☀️ STOP RAIN
// ============================================

function stopRain() {

    if (!raining) return;

    raining = false;

    for (const playerId of api.getPlayerIds()) {

        setRainSky(playerId, false);

        api.sendMessage(
            playerId,
            "§e☀️ The rain has stopped."
        );
    }
}


// ============================================
// 🌧️ VERY VISIBLE BLUE RAIN
// ============================================

function makeRain(playerId) {

    const pos = api.getPosition(playerId);

    if (!pos) return;

    const x = pos[0];
    const y = pos[1];
    const z = pos[2];

    api.playParticleEffect({

        // Falling straight down
        dir1: [-0.05, -1, -0.05],
        dir2: [0.05, -1, 0.05],

        // BIG area around the player
        pos1: [
            x - 25,
            y + 12,
            z - 25
        ],

        pos2: [
            x + 25,
            y + 28,
            z + 25
        ],

        texture: "square_particle",

        // Longer streaks
        minLifeTime: 0.7,
        maxLifeTime: 1.2,

        minEmitPower: 20,
        maxEmitPower: 30,

        // Bigger particles
        minSize: 0.07,
        maxSize: 0.12,

        // LOTS of rain
        manualEmitCount: 300,

        // Strong downward movement
        gravity: [0, -20, 0],

        // BLUE / WHITE RAIN
        colorGradients: [
            {
                timeFraction: 0,

                minColor: [
                    40,
                    130,
                    255,
                    0.85
                ],

                maxColor: [
                    120,
                    200,
                    255,
                    1
                ]
            }
        ],

        velocityGradients: [
            {
                timeFraction: 0,
                factor: 1,
                factor2: 1
            }
        ],

        blendMode: 1
    });
}


// ============================================
// 👹 HOSTILE MOBS DURING RAIN
// ============================================

function spawnRainMob(playerId) {

    const pos = api.getPosition(playerId);

    if (!pos) return;

    const x = pos[0];
    const y = pos[1];
    const z = pos[2];

    const angle =
        Math.random() * Math.PI * 2;

    const distance =
        12 + Math.random() * 15;

    const spawnX =
        Math.floor(
            x + Math.cos(angle) * distance
        );

    const spawnZ =
        Math.floor(
            z + Math.sin(angle) * distance
        );

    for (
        let spawnY = Math.floor(y + 8);
        spawnY >= Math.floor(y - 8);
        spawnY--
    ) {

        const block =
            api.getBlock(
                spawnX,
                spawnY,
                spawnZ
            );

        const above =
            api.getBlock(
                spawnX,
                spawnY + 1,
                spawnZ
            );

        if (
            block !== "Air" &&
            above === "Air"
        ) {

            const mobs = [
                "Zombie",
                "Skeleton"
            ];

            const mob =
                mobs[
                    Math.floor(
                        Math.random() *
                        mobs.length
                    )
                ];

            api.attemptSpawnMob(
                mob,
                spawnX + 0.5,
                spawnY + 1,
                spawnZ + 0.5,
                {
                    playSoundOnSpawn: true
                }
            );

            break;
        }
    }
}


// ============================================
// ⏱️ MAIN LOOP
// ============================================

tick = (ms) => {

    const now = Date.now();

    const currentCycle =
        Math.floor(
            now / CYCLE_LENGTH
        );


    // ========================================
    // NEW 20-MINUTE CYCLE
    // ========================================

    if (
        currentCycle !== cycleNumber
    ) {

        cycleNumber =
            currentCycle;

        // 15% chance
        if (
            Math.random() <
            RAIN_CHANCE
        ) {

            startRain();

        } else {

            stopRain();
        }
    }


    // ========================================
    // END RAIN
    // ========================================

    if (
        raining &&
        now >= rainEndTime
    ) {

        stopRain();
    }


    if (!raining) return;


    // ========================================
    // 🌧️ GLOBAL RAIN
    // ========================================

    if (
        now >= nextRainParticles
    ) {

        nextRainParticles =
            now + 120;

        // Every player gets rain
        for (
            const playerId
            of api.getPlayerIds()
        ) {

            makeRain(playerId);
        }
    }


    // ========================================
    // 👹 MOB SPAWNING
    // ========================================

    if (
        now >= nextMobSpawn
    ) {

        nextMobSpawn =
            now + 5000;

        for (
            const playerId
            of api.getPlayerIds()
        ) {

            if (
                Math.random() < 0.30
            ) {

                spawnRainMob(
                    playerId
                );
            }
        }
    }
};


// ============================================
// 👤 PLAYER JOINS DURING RAIN
// ============================================

onPlayerJoin = (playerId) => {

    setRainSky(
        playerId,
        raining
    );

    if (raining) {

        api.sendMessage(
            playerId,
            "§b🌧️ It is currently raining!"
        );
    }
};
