spawnPos = [6,2,-24] // Change these coordinates!



function spawnEndRod(x,y,z){
    var baseId = api.attemptCreateMeshEntity("BloxdBlock", {
        blockName: "White Concrete",
        size: [.30, 0.1, .30]
    })
    var rodId = api.attemptCreateMeshEntity("BloxdBlock", {
        blockName: "White Neon",
        size: [.15, 1, .15]
    })
    if (baseId) {
        api.setPosition(baseId,[x+.5,y,z+.5])
    }
    if (rodId) {
        api.setPosition(rodId,[x+.5,y,z+.5])
    }
    api.setBlock(x,y,z,"Invisible Solid")
}

spawnEndRod(spawnPos[0], spawnPos[1], spawnPos[2])
api.sendMessage(myId, "Spawned!", {color: "lightblue"})

