let x = 892.50;
let y = 1
let z = 367.50
var entityId1 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: .50
})
api.setPosition(entityId1, x,y,z)
var entityId2 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: [.30, 1.50, .30]
})
api.setPosition(entityId2, x,y + .50,z)
var entityId3 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Yellow Neon",
    size: [.50, .50, .50]
})
api.setPosition(entityId3, x,y + 2.1,z)
var entityId4 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: [.60, .20, .60]
})
api.setPosition(entityId4, x,y + 2,z)
var entityId5 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: [.60, .20, .60]
})
api.setPosition(entityId5, x,y + 2.50,z)
var entityId6 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Black Glass",
    size: [.51, .50, .51]
})
api.setPosition(entityId6, x,y + 2.1,z)
var entityId7 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: [.40, .20, .40]
})
api.setPosition(entityId7, x,y + 1.90,z)
api.setPosition(entityId6, x,y + 2.1,z)
var entityId8 = api.attemptCreateMeshEntity("BloxdBlock", {
    blockName: "Smooth Stone",
    size: [.40, .20, .40]
})
api.setPosition(entityId8, x,y + 2.60,z)
