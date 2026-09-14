buildQueue = [];
lastMoveTime = {};
modAnnounced = false;

/* Structure builder - 5 layers high, flush spacing */
buildFloorStructure = (x, y, z) => {
    api.setBlockWalls([x - 2, y - 1, z - 2], [x + 2, y - 1, z + 2], "Smooth Andesite", true, false);
    api.setBlockRect([x - 1, y - 1, z - 1], [x + 1, y - 1, z + 1], "Block of Moonstone");
    for (var h = 0; h <= 2; h++) {
        var curY = y + h;
        api.setBlock(x - 2, curY, z - 2, "Maple Log");
        api.setBlock(x - 2, curY, z + 2, "Maple Log");
        api.setBlock(x + 2, curY, z - 2, "Maple Log");
        api.setBlock(x + 2, curY, z + 2, "Maple Log");
        api.setBlockRect([x - 2, curY, z - 1], [x - 2, curY, z + 1], "Barkless Aspen Log");
        api.setBlockRect([x + 2, curY, z - 1], [x + 2, curY, z + 1], "Barkless Aspen Log");
        api.setBlockRect([x - 1, curY, z + 2], [x + 1, curY, z + 2], "Barkless Aspen Log");
        api.setBlock(x - 1, curY, z - 2, "Glass"); 
        api.setBlock(x + 1, curY, z - 2, "Glass"); 
        if (h < 2) api.setBlock(x, curY, z - 2, "Air");
        else api.setBlock(x, curY, z - 2, "Glass");
    }
    api.setBlockRect([x - 2, y + 3, z - 2], [x + 2, y + 3, z + 2], "Palm Wood Planks");
};

/* Smart Scanner: Finds the center of the elevator even if standing on the edge */
getElevatorInfo = (px, py, pz) => {
    var ix = Math.floor(px);
    var iy = Math.floor(py);
    var iz = Math.floor(pz);
    var centerX = 0;
    var centerZ = 0;
    var foundCenter = false;

    /* Check 3x3 area around player to find which Moonstone block is the center */
    for (var dx = -1; dx <= 1; dx++) {
        for (var dz = -1; dz <= 1; dz++) {
            var tx = ix + dx;
            var tz = iz + dz;
            /* Center is defined by having Andesite at [tx-2, tz-2] */
            if (api.getBlock(tx, iy - 1, tz) === "Block of Moonstone") {
                if (api.getBlock(tx - 2, iy - 1, tz - 2) === "Smooth Andesite") {
                    centerX = tx;
                    centerZ = tz;
                    foundCenter = true;
                    break;
                }
            }
        }
        if (foundCenter) break;
    }

    if (!foundCenter) return { current: 0, list: [] };

    var floors = [];
    var currentNum = 0;
    /* Scan shaft vertically at the found center */
    for (var sy = iy - 50; sy < iy + 50; sy++) {
        if (api.getBlock(centerX, sy - 1, centerZ) === "Block of Moonstone") {
            if (api.getBlock(centerX - 2, sy - 1, centerZ - 2) === "Smooth Andesite") {
};
