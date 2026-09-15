const loadingPlayers = {};
const loadingBayCenter = [1000, 1000, 1000];
const spawnPoint = [0, 5, 0];
const minLoadingTime = 3000;
const loadingBoxBlock = "Black Concrete";

const welcomeTextStyle = { color: "#00FFFF", fontWeight: "bold" };
const loadingTextStyle = { color: "#FFFFFF", fontWeight: "normal" };

function endLoadingScreen(playerId) {
    if (!loadingPlayers[playerId]) return;

    api.setClientOptions(playerId, {
        cameraTint: null,
        middleTextUpper: "",
        middleTextLower: ""
    });
    api.setClientOptionToDefault(playerId, "speedMultiplier");
    api.setClientOptionToDefault(playerId, "jumpAmount");
    
    api.setPosition(playerId, spawnPoint[0], spawnPoint[1], spawnPoint[2]);
    api.setPlayerOpacity(playerId, 1);

    const playerName = api.getEntityName(playerId);
    api.sendMessage(playerId, "Welcome, " + playerName + "!", { color: "lime" });
    
    const boxMin = [loadingBayCenter[0] - 2, loadingBayCenter[1] - 2, loadingBayCenter[2] - 2];
    const boxMax = [loadingBayCenter[0] + 2, loadingBayCenter[1] + 2, loadingBayCenter[2] + 2];
    api.setBlockRect(boxMin, boxMax, "Air");
    
    delete loadingPlayers[playerId];
}

onPlayerJoin = (playerId) => {
    const boxMin = [loadingBayCenter[0] - 2, loadingBayCenter[1] - 2, loadingBayCenter[2] - 2];
    const boxMax = [loadingBayCenter[0] + 2, loadingBayCenter[1] + 2, loadingBayCenter[2] + 2];
    
    api.setBlockRect(boxMin, boxMax, loadingBoxBlock);
    
    api.setPosition(playerId, loadingBayCenter[0], loadingBayCenter[1], loadingBayCenter[2]);
    api.setPlayerOpacity(playerId, 0);
    
    const playerName = api.getEntityName(playerId);
    
    api.setClientOptions(playerId, {
        speedMultiplier: 0,
        jumpAmount: 0,
        cameraTint: [0, 0, 0, 1],
        middleTextUpper: [{ str: "WELCOME", style: welcomeTextStyle }],
        middleTextLower: [{ str: playerName, style: loadingTextStyle }]
    });
    
    loadingPlayers[playerId] = { joinTime: api.now(), stage: 0 };
};

tick = () => {
    const allPlayerIds = Object.keys(loadingPlayers);
    
    for (const playerId of allPlayerIds) {
        const data = loadingPlayers[playerId];
        const elapsed = api.now() - data.joinTime;

        if (data.stage === 0 && elapsed >= 2000) {
            api.setClientOption(playerId, "middleTextUpper", [{ str: "Loading World...", style: welcomeTextStyle }]);
            data.stage = 1;
        } else if (data.stage === 1) {
            const dots = ".".repeat(Math.floor(elapsed / 400) % 4);
            api.setClientOption(playerId, "middleTextLower", [{ str: dots, style: loadingTextStyle }]);
            
            if (elapsed >= minLoadingTime) {
                api.setClientOptions(playerId, {
                    middleTextUpper: [{ str: "World Ready", style: {color: "lime", fontWeight: "bold"} }],
                    middleTextLower: [{ str: "Click to Continue", style: loadingTextStyle }]
                });
                data.stage = 2;
            }
        }
    }
};

onPlayerClick = (playerId) => {
    if (loadingPlayers[playerId] && loadingPlayers[playerId].stage === 2) {
        endLoadingScreen(playerId);
    }
};
