// Extra surprise: Don't add if you don't want anything else

let playerCooldowns = {};
const COOLDOWN_SECONDS = 3;

onBlockStand = (playerId, x,y,z,block) => {

    if (block !== "Invisible Solid") {
        return;
    }

    const now = Date.now();
    if (!playerCooldowns[playerId]) playerCooldowns[playerId] = 0;
    if (now < playerCooldowns[playerId]) {
        return;
    }

    api.giveItem(playerId, "Poop", 999, { customDisplayName: "Your Poop", customDescription: "Obtain by standing on an end rod!" });
    api.sendTopRightHelper(
        playerId,
        "check",
        "Subscribe to Noob_Coder on bloxdhub.io to get code!",
        {
            duration: 3,
            width: 250,
            height: 85,
            color: "#FF0000",
            iconSizeMult: 3,
            textAndIconColor: "#FFFFFF",
            fontSize: "15px"
        }
    );

    playerCooldowns[playerId] = now + (COOLDOWN_SECONDS * 1000);
};
