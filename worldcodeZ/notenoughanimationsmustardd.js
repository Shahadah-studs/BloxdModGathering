playerStates = {};

/* --- COMBAT & CONSUME EVENTS --- */

onPlayerClick = (id, wasAlt) => {
    var now = api.now();
    if (!playerStates[id]) playerStates[id] = {};
    playerStates[id].mode = "none"; /* Refresh trigger */

    var held = api.getHeldItem(id);
    if (held && held.name.includes("Spear") && !wasAlt) {
        playerStates[id].animLock = now + 700;
        playerStates[id].mode = "combat";
        api.animateEntity(id, {
            animationDurationMs: 600, loop: false,
            nodeAnimations: {
                TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [-0.2, 0, 0] } }, { timeFraction: 0.3, rotation: { point: [1.0, 0, 0] } }, { timeFraction: 1, rotation: { point: [0, 0, 0] } }] },
                ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.8, 0, -0.07] } }, { timeFraction: 0.3, rotation: { point: [-2.0, 0, -0.07] } }, { timeFraction: 1, rotation: { point: [0, 0, -0.07] } }] },
                ArmLeftMesh: { timeline: [{ timeFraction: 0.3, rotation: { point: [0.8, 0, 0.07] } }, { timeFraction: 1, rotation: { point: [0, 0, 0.07] } }] }
            }
        }, 0, 1.0);
    }
};

onPlayerStartChargingItem = (id, itemName) => {
    if (!playerStates[id]) playerStates[id] = {};
    var isPotion = itemName.includes("Potion") || itemName.includes("Bottle") || itemName.includes("Milk");
    playerStates[id].isEating = true;

    if (isPotion) {
        api.animateEntity(id, {
            animationDurationMs: 400, loop: true,
            nodeAnimations: {
                TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [-0.3, 0, 0] } }] },
                HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.7, 0, 0] } }, { timeFraction: 0.5, rotation: { point: [-0.9, 0, 0] } }, { timeFraction: 1, rotation: { point: [-0.7, 0, 0] } }]},
                ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-2.2, 0, 0.6] } }, { timeFraction: 0.5, rotation: { point: [-2.5, 0, 0.8] } }, { timeFraction: 1, rotation: { point: [-2.2, 0, 0.6] } }]}
            }
        });
    } else {
        api.animateEntity(id, {
            animationDurationMs: 350, loop: true,
            nodeAnimations: {
                TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0.15, 0, 0] } }] },
                HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.3, 0, 0] } }, { timeFraction: 0.5, rotation: { point: [0.45, 0, 0] } }, { timeFraction: 1, rotation: { point: [0.3, 0, 0] } }]},
                ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-1.4, 0, 0.7] } }, { timeFraction: 0.5, rotation: { point: [-1.6, 0, 0.9] } }, { timeFraction: 1, rotation: { point: [-1.4, 0, 0.7] } }]}
            }
        });
    }
};

onPlayerFinishChargingItem = (id) => {
    if (playerStates[id]) { playerStates[id].isEating = false; playerStates[id].mode = "none"; }
};

/* --- MAIN TICK LOOP --- */

tick = (ms) => {
    var ids = api.getPlayerIds();
    var now = api.now();

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        if (!playerStates[id]) playerStates[id] = { mode: "none", fallStartTime: 0, wasHighFall: false, landLock: 0, animLock: 0, isEating: false };
        var s = playerStates[id];

        /* Priority Locks: If eating, landing, or fighting, skip movement anims */
        if (s.isEating || now < s.landLock || now < s.animLock) continue;

        var vel = api.getVelocity(id);
        var horizSpeed = vel[0] * vel[0] + vel[2] * vel[2];
        var totalSpeed = horizSpeed + vel[1] * vel[1];
        var standingOn = api.getBlockCoordinatesPlayerStandingOn(id);
        var inAir = (standingOn && standingOn.length === 0);

        /* Environment Checks */
        var units = api.getUnitCoordinatesLifeformWithin(id);
        var onLadder = false, inWater = false;
        for (var u = 0; u < units.length; u++) {
            var b = api.getBlock(units[u][0], units[u][1], units[u][2]);
            if (b.includes("Ladder")) onLadder = true;
            if (b.includes("Water")) inWater = true;
        }

        /* --- 1. SWIMMING (BREASTSTROKE) --- */
        if (inWater) {
            api.setPlayerPose(id, "standing");
            if (totalSpeed > 0.1) {
                if (s.mode !== "swimming") {
                    api.animateEntity(id, {
                        animationDurationMs: 1400, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, 0] } }] },
                            HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-1.57, 0, 0] } }] },
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.6, 0, -0.6] } }, { timeFraction: 0.3, rotation: { point: [0.2, 0, -1.8] } }, { timeFraction: 0.6, rotation: { point: [-1.2, 0, -0.6] } }, { timeFraction: 1, rotation: { point: [1.6, 0, -0.6] } }] },
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.6, 0, 0.6] } }, { timeFraction: 0.3, rotation: { point: [0.2, 0, 1.8] } }, { timeFraction: 0.6, rotation: { point: [-1.2, 0, 0.6] } }, { timeFraction: 1, rotation: { point: [1.6, 0, 0.6] } }] },
                            LegRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, -0.1] } }, { timeFraction: 0.5, rotation: { point: [1.8, 0, -0.4] } }, { timeFraction: 0.8, rotation: { point: [1.57, 0, -0.1] } }]},
                            LegLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, 0.1] } }, { timeFraction: 0.5, rotation: { point: [1.8, 0, 0.4] } }, { timeFraction: 0.8, rotation: { point: [1.57, 0, 0.1] } }]}
                        }
                    }, 0.1, 1.0); s.mode = "swimming";
                }
            } else {
                if (s.mode !== "swim_idle") {
                    api.animateEntity(id, { animationDurationMs: 200, loop: false, nodeAnimations: { 
                        TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, 0] } }] },
                        HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-1.57, 0, 0] } }] },
                        ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.0, 0, -0.6] } }] },
                        ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.0, 0, 0.6] } }] },
                        LegRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, -0.15] } }] },
                        LegLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.57, 0, 0.15] } }] }
                    }}, 0.1, 1.0); s.mode = "swim_idle";
                }
            }
            continue;
        }

        /* --- 2. CLIMBING --- */
        if (onLadder) {
            api.setPlayerPose(id, "standing");
            if (totalSpeed > 0.1) {
                if (s.mode !== "climbing") {
                    api.animateEntity(id, {
                        animationDurationMs: 600, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0.3, 0, 0] } }] },
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-1.8, 0, 0.2] } }, { timeFraction: 0.5, rotation: { point: [-0.5, 0, 0.2] } }, { timeFraction: 1, rotation: { point: [-1.8, 0, 0.2] } }] },
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.5, 0, -0.2] } }, { timeFraction: 0.5, rotation: { point: [-1.8, 0, -0.2] } }, { timeFraction: 1, rotation: { point: [-0.5, 0, -0.2] } }] }
                        }
                    }, 0.1, 1.0); s.mode = "climbing";
                }
            } else {
                if (s.mode !== "climb_idle") {
                    api.animateEntity(id, { animationDurationMs: 200, loop: false, nodeAnimations: { 
                        TorsoNode: { timeline: [{ timeFraction: 1, rotation: { point: [0.3, 0, 0] } }] },
                        ArmRightMesh: { timeline: [{ timeFraction: 1, rotation: { point: [-1.2, 0, 0.2] } }] },
                        ArmLeftMesh: { timeline: [{ timeFraction: 1, rotation: { point: [-1.2, 0, -0.2] } }] }
                    }}, 0.1, 1.0); s.mode = "climb_idle";
                }
            }
            continue;
        }

        /* --- 3. FALLING & LANDING --- */
        if (inAir) {
            if (vel[1] > 0) s.fallStartTime = 0; else if (s.fallStartTime === 0) s.fallStartTime = now;
            if (now - s.fallStartTime > 800 && vel[1] < -0.1) {
                if (s.mode !== "falling") {
                    api.animateEntity(id, {
                        animationDurationMs: 400, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [-0.4, 0, 0] } }] },
                            HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.3, 0, 0] } }] },
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-3.1, 0, -0.07] } }] },
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-3.1, 0, 0.07] } }] }
                        }
                    }, 0.05, 1.0); s.mode = "falling"; s.wasHighFall = true;
                }
            }
        } else {
            if (s.wasHighFall) {
                api.animateEntity(id, {
                    animationDurationMs: 250, loop: false,
                    nodeAnimations: {
                        TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0.6, 0, 0] } }, { timeFraction: 1, rotation: { point: [0, 0, 0] } }] },
                        ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.4, 0, -0.07] } }, { timeFraction: 1, rotation: { point: [0, 0, -0.07] } }] },
                        ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.4, 0, 0.07] } }, { timeFraction: 1, rotation: { point: [0, 0, 0.07] } }] }
                    }
                }, 0, 1.0);
                s.landLock = now + 250; s.wasHighFall = false; s.mode = "none";
            } else if (horizSpeed > 42) {
                /* --- 4. NINJA RUN --- */
                if (s.mode !== "ninja") {
                    api.setPlayerPose(id, "standing");
                    api.animateEntity(id, {
                        animationDurationMs: 350, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0.9, 0, 0] } }, { timeFraction: 0.25, rotation: { point: [0.95, 0, 0.15] } }, { timeFraction: 0.5, rotation: { point: [0.9, 0, 0] } }, { timeFraction: 0.75, rotation: { point: [0.95, 0, -0.15] } }, { timeFraction: 1.0, rotation: { point: [0.9, 0, 0] } }]},
                            HeadMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.5, 0, 0] } }] },
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.0, 0, -0.07] } }] },
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [1.0, 0, 0.07] } }] },
                            LegRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.9, 0, -0.05] } }, { timeFraction: 0.5, rotation: { point: [0.9, 0, -0.05] } }, { timeFraction: 1.0, rotation: { point: [-0.9, 0, -0.05] } }]},
                            LegLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.9, 0, 0.05] } }, { timeFraction: 0.5, rotation: { point: [-0.9, 0, 0.05] } }, { timeFraction: 1.0, rotation: { point: [0.9, 0, 0.05] } }]}
                        }
                    }, 0, 1.0); s.mode = "ninja";
                }
            } else if (horizSpeed > 0.01) {
                /* --- 5. EXPRESSIVE WALK --- */
                if (s.mode !== "walk") {
                    api.setPlayerPose(id, "standing");
                    api.animateEntity(id, {
                        animationDurationMs: 800, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0.1, 0, -0.05] } }, { timeFraction: 0.5, rotation: { point: [0.1, 0, 0.05] } }, { timeFraction: 1, rotation: { point: [0.1, 0, -0.05] } }]},
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.5, 0, -0.07] } }, { timeFraction: 0.5, rotation: { point: [-0.5, 0, -0.07] } }, { timeFraction: 1, rotation: { point: [0.5, 0, -0.07] } }]},
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.5, 0, 0.07] } }, { timeFraction: 0.5, rotation: { point: [0.5, 0, 0.07] } }, { timeFraction: 1, rotation: { point: [-0.5, 0, 0.07] } }]},
                            LegRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [-0.6, 0, -0.05] } }, { timeFraction: 0.5, rotation: { point: [0.6, 0, -0.05] } }, { timeFraction: 1, rotation: { point: [-0.6, 0, -0.05] } }]},
                            LegLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0.6, 0, 0.05] } }, { timeFraction: 0.5, rotation: { point: [-0.6, 0, 0.05] } }, { timeFraction: 1, rotation: { point: [0.6, 0, 0.05] } }]}
                        }
                    }, 0, 1.0); s.mode = "walk";
                }
            } else {
                /* --- 6. BREATHING (IDLE) --- */
                if (s.mode !== "idle") {
                    api.animateEntity(id, {
                        animationDurationMs: 2500, loop: true,
                        nodeAnimations: {
                            TorsoNode: { timeline: [{ timeFraction: 0, rotation: { point: [0, 0, 0] } }, { timeFraction: 0.5, rotation: { point: [-0.06, 0, 0] } }, { timeFraction: 1, rotation: { point: [0, 0, 0] } }]},
                            HeadMesh: { timeline: [{ timeFraction: 0.5, rotation: { point: [0.04, 0, 0] } }]},
                            ArmRightMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0, 0, -0.07] } }, { timeFraction: 0.5, rotation: { point: [0, 0, -0.16] } }, { timeFraction: 1, rotation: { point: [0, 0, -0.07] } }]},
                            ArmLeftMesh: { timeline: [{ timeFraction: 0, rotation: { point: [0, 0, 0.07] } }, { timeFraction: 0.5, rotation: { point: [0, 0, 0.16] } }, { timeFraction: 1, rotation: { point: [0, 0, 0.07] } }]}
                        }
                    }, 0.1, 1.0); s.mode = "idle";
                }
            }
            s.fallStartTime = 0;
        }
    }
};

onPlayerLeave = (id) => { delete playerStates[id]; };
