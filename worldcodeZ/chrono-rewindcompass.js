/*
==================================
   CHRONO-JUMPER by _YellowPizza_
       (v1.0.0) 
==================================
*/

const REWIND_SECONDS = 5;
const REWIND_COOLDOWN_SECONDS = 20;
const REWIND_ITEM_NAME = "Compass";
const HISTORY_SAVE_INTERVAL_MS = 500;
const MAX_HISTORY_LENGTH = (REWIND_SECONDS * 1000) / HISTORY_SAVE_INTERVAL_MS;

let playerData = {};
let lastHistorySave = {};

/* Initialize player data when they join */
onPlayerJoin = (playerId) => {
    playerData[playerId] = {
        history: [],
        lastRewindTime: 0
    };
    lastHistorySave[playerId] = 0;

    api.giveItem(playerId, REWIND_ITEM_NAME, 1, {
        customDisplayName: "Chrono-Compass",
        customDescription: "Right-click to rewind time!"
    });
    api.sendMessage(playerId, "Use the Chrono-Compass to rewind your last 5 seconds.", { color: "lime" });
};

/* Clean up player data when they leave */
onPlayerLeave = (playerId) => {
    delete playerData[playerId];
    delete lastHistorySave[playerId];
};

/* The main game loop */
tick = (ms) => {
    const allPlayers = api.getPlayerIds();
    const now = api.now();

    for (const playerId of allPlayers) {
        if (!playerData[playerId]) continue;

        if (now - lastHistorySave[playerId] >= HISTORY_SAVE_INTERVAL_MS) {
            const playerPos = api.getPosition(playerId);
            const playerHealth = api.getHealth(playerId);

            playerData[playerId].history.push({
                pos: playerPos,
                health: playerHealth,
                time: now
            });
            
            if (playerData[playerId].history.length > MAX_HISTORY_LENGTH) {
                playerData[playerId].history.shift();
            }

            lastHistorySave[playerId] = now;
        }
    }
};

/* Handle the rewind ability activation */
onPlayerAttemptAltAction = (playerId, x, y, z, block, targetEId) => {
    const heldItem = api.getHeldItem(playerId);
    
    if (heldItem && heldItem.name === REWIND_ITEM_NAME) {
        const now = api.now();
        const playerDataForPlayer = playerData[playerId];

        if (!playerDataForPlayer) return "preventAction";

        const timeSinceLastRewind = now - playerDataForPlayer.lastRewindTime;

        if (timeSinceLastRewind < REWIND_COOLDOWN_SECONDS * 1000) {
            const timeLeft = Math.ceil((REWIND_COOLDOWN_SECONDS * 1000 - timeSinceLastRewind) / 1000);
            api.sendMessage(playerId, `Ability on cooldown! Wait ${timeLeft} more seconds.`, { color: "red" });
            return "preventAction";
        }

        if (playerDataForPlayer.history.length < MAX_HISTORY_LENGTH) {
            api.sendMessage(playerId, "Not enough time has passed to rewind!", { color: "yellow" });
            return "preventAction";
        }
        
        const rewindState = playerDataForPlayer.history[0];
        const currentPos = api.getPosition(playerId);

        api.setPosition(playerId, rewindState.pos[0], rewindState.pos[1], rewindState.pos[2]);
        api.setHealth(playerId, rewindState.health);
        
        playerDataForPlayer.lastRewindTime = now;
        playerDataForPlayer.history = [];

        /* Sound effects for rewinding */
        api.playSound(playerId, "doorOpen-bloxd", 1, 1.5, { playerIdOrPos: currentPos });
        api.playSound(playerId, "exp_collect", 1, 0.8, { playerIdOrPos: rewindState.pos });

        api.sendMessage(playerId, "Rewound 5 seconds!", { color: "cyan" });

        return "preventAction";
    }
};
