function rd(a, b) {
    const prime1 = 2654435761;
    const prime2 = 2246822519;
    const prime3 = 3266489917;
    const prime4 = 668265263;
    const prime5 = 374761393;
    const mixed = a ^ ((b << 16) | (b >>> 16));
    let hash1 = mixed;
    hash1 = (hash1 ^ (hash1 >>> 16)) * prime1;
    hash1 = (hash1 ^ (hash1 >>> 13)) * prime2;
    hash1 = hash1 ^ (hash1 >>> 16);
    let hash2 = (a + prime3) ^ (b * prime4);
    hash2 = (hash2 >>> 16) | (hash2 << 16);
    hash2 = hash2 * prime5;
    hash2 = hash2 ^ (hash2 >>> 24);
    let h = hash1 ^ hash2;
    h = h ^ (h << 13);
    h = h ^ (h >>> 17);
    h = h ^ (h << 5);
    return h;
}
var agb = api.getBlock;
var agbd = api.getBlockId;
var isvb = api.isBlockInLoadedChunk;
var asbrA = new Array();
var asbA = new Array();
var taskA = new Array();
var rotp, rot;
var asbr = (p1, p2, b, Rot = rot, Rotp = rotp) => {
    let [ox, oy, oz] = Rotp, [x1, y1, z1] = p1, [x2, y2, z2] = p2;
    x1 -= ox, x2 -= ox, z1 -= oz, z2 -= oz;
    for (let i = 0; i < Rot; i++) { let t = -x1; x1 = z1, z1 = t; t = -x2, x2 = z2, z2 = t; }
    if (agbd(x1 + ox, y1, z1 + oz) != -1 && agbd(x2 + ox, y2, z2 + oz) != -1)
        api.setBlockRect([x1 + ox, y1, z1 + oz], [x2 + ox, y2, z2 + oz], b);
    else {
        agb(x1 + ox, y1, z1 + oz); agb(x2 + ox, y2, z2 + oz);
        asbrA.push({ p1: p1, p2: p2, b: b, r: Rot, rp: Rotp });
    }
}
var rotbn = (s, Rot = rot) => {
    const regex = /\|meta\|rot(\d+)/;
    const match = s.match(regex);
    if (!match) {
        return s;
    }
    const i = parseInt(match[1], 10);
    const newI = ((i - 1 + Rot) % 4) + 1;
    return s.replace(regex, `|meta|rot${newI}`);
}
var asb = (x, y, z, b, Rot = rot, Rotp = rotp) => {
    if (Rot != 0) b = rotbn(b, Rot);
    let [ox, oy, oz] = Rotp;
    x -= ox, z -= oz;
    for (let i = 0; i < Rot; i++) { let t = -x; x = z, z = t; }
    if (agbd(x + ox, y, z + oz) != 1)
        api.setBlock(x + ox, y, z + oz, b);
    else {
        asbA.push({ p: [x, y, z], b: b, r: Rot, rp: Rotp });
    }
}
var ssci = api.setStandardChestItemSlot;
var sch = (pos, i, im, n, Rot = rot, Rotp = rotp) => {
    const pl = api.getPlayerIds()[0];
    let [ox, oy, oz] = rotp, [x, y, z] = pos;
    x -= ox, z -= oz;
    for (let i = 0; i < rot; i++) { let t = -x; x = z, z = t; }
    if (agbd(...pos) != 1)
        ssci([x + ox, y, z + oz], i, im, n, pl);
    else {
        taskA.push(`sch([${[x + ox, y, z + oz]}],${i},"${im}",${n},0,[0,0,0])`);
    }
}
var mapS = new Map();
var regS = (id, data) => {
    mapS.set(id, data);
}
var Pid = (ids, re = -1) => {
    if (re == -1)
        re = Math.random();
    let p = 0;
    for (const es of ids) {
        if (re >= p && re < p + es.p) {
            return es.id;
        }
        p += es.p;
    }
    return null;
}
var Pchest = (pos, ite) => {
    for (let i = 0; i < 36; i++) {
        let d = Pid(ite);
        if (d != null)
            sch(pos, i, d, 1);
    }
}
// Village
var villichest = (pos) => {
    Pchest(pos, [{ id: "Bread", p: 0.15 }, { id: "Apple", p: 0.15 }, { id: "Iron Bar", p: 0.1 }, { id: "Diamond", p: 0.02 }]);
}
var geroad = (x, y, z, X, Z) => {
    for (let i = -X; i <= X; i++)
        for (let j = -Z; j <= Z; j++) {
            let k = findsf(x + i, y - 16, z + j);
            if (k != -10000) asb(x + i, k, z + j, "Messy Dirt");
        }
}
const hstr = [`asbr([x-3,y+1,z-4],[x+3,y+5,z+3],"Air");
asbr([x-2,y,z-3],[x+2,y+3,z+3],bs);
asbr([x-1,y+1,z-2],[x+1,y+2,z+2],"Air");
asbr([x-2,y+1,z],[x-2,y+2,z],"Air");
asbr([x+2,y+2,z-1],[x+2,y+2,z+1],"Glass");
asbr([x-3,y+4,z-4],[x+3,y+4,z+4],bf);
asbr([x-2,y+5,z-3],[x+2,y+5,z+3],bf);
asbr([x-1,y+6,z-2],[x+1,y+6,z+2],bf);
asb(x+1,y+1,z-1,cb+" Bed|meta|rot1");
asb(x-1,y+1,z-2,"Chest");
asb(x,y+1,z-2,"Workbench");
villichest([x-1,y+1,z-2]);`,
    `asbr([x-2,y+6,z-3],[x+3,y+6,z+3],bf);
asbr([x-1,y,z-2],[x+2,y+6,z+2],bs);
asbr([x-1,y+7,z-2],[x+2,y+7,z+2],bf);
asbr([x,y+1,z-1],[x,y+2,z+1],"Air");
asbr([x+1,y+3,z-1],[x+1,y+6,z-1],"Air");
asbr([x+1,y+2,z],[x+1,y+6,z],"Air");
asbr([x+1,y+1,z+1],[x+1,y+6,z+1],"Air");
asbr([x,y+4,z-1],[x,y+6,z+1],"Air");
asbr([x-1,y+1,z-1],[x-1,y+2,z-1],"Air");
asbr([x+2,y+1,z+1],[x+2,y+2,z+1],"Air");
asbr([x-1,y+4,z-1],[x-1,y+5,z+1],"Glass");
asbr([x,y+2,z+2],[x+1,y+2,z+2],"Glass");
asb(x,y+4,z-1,cb+" Bed|meta|rot3");
asb(x,y+4,z+1,"Chest");
villichest([x,y+4,z+1]);`,
    `asbr([x-2,y,z-2],[x+2,y+12,z+2],bs);
asbr([x-1,y+1,z-1],[x+1,y+10,z+1],"Air");
asbr([x+1,y+1,z],[x+1,y+11,z],"Iron Ladder|meta|rot4");
asbr([x-1,y+1,z],[x-2,y+2,z],"Air");
asbr([x-2,y+12,z+1],[x+2,y+12,z+1],"Air");
asbr([x-2,y+12,z-1],[x+2,y+12,z-1],"Air");
asbr([x+1,y+12,z-2],[x+1,y+12,z+2],"Air");
asbr([x-1,y+12,z-2],[x-1,y+12,z+2],"Air");
asb(x,y+12,z,"Chest");
villichest([x,y+12,z]);`,
    `asbr([x-2,y+1,z-2],[x+3,y+1,z+3],bs);
asbr([x-1,y+2,z-1],[x+2,y+2,z+2],bs);
asbr([x-1,y+5,z-1],[x+2,y+5,z+2],bs);
asbr([x-1,y+3,z-1],[x-1,y+4,z-1],"Dangling Rope");
asbr([x-1,y+3,z+2],[x-1,y+4,z+2],"Dangling Rope");
asbr([x+2,y+3,z+2],[x+2,y+4,z+2],"Dangling Rope");
asbr([x+2,y+3,z-1],[x+2,y+4,z-1],"Dangling Rope");
asbr([x-1,y-8,z-1],[x+2,y,z+2],bs);
asbr([x,y-7,z],[x+1,y+1,z+1],"Water");
asbr([x,y+2,z],[x+1,y+2,z+1],"Air");`];
const hst = [`let bf="Maple Wood Planks",bs="Stone Bricks",cb="Yellow";`,
    `let bf="Engraved Sandstone",bs="Red Sandstone Bricks",cb="Orange";`,
    `let bf="Snow",bs="Ice Bricks",cb="Purple";`,
    `let bf="Jungle Wood Planks",bs="Mango Wood Planks",cb="Green";`,
    `let bf="Pine Wood Planks",bs="Stone Bricks",cb="Blue";`];
mapS.set("rx", "geroad(x,y,z,3,1)");
mapS.set("rz", "geroad(x,y,z,1,3)");
mapS.set("ro", "geroad(x,y,z,3,3)");

var exPr = (x, y, z, r, t, w) => {
    const dirc = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    if (t * t / 81 > Math.random()) return;
    if (r <= 0) {
        let ty = findsf(x, y - 16, z);
        api.setBlock(x, ty, z, "Messy Dirt");
        taskA.push(`sets([${[x, y, z]}],"ro")`);
        if (r == 0) taskA.push(`sets([${[x, y, z]}],"h${w}|3")`);
        for (let i = 1; i <= 4; i++) {
            if (i == -r) continue;
            exPr(x + dirc[i - 1][0] * 7, y, z + dirc[i - 1][1] * 7, i, t + 1, w);
        }
    }
    if (r > 0) {
        let ty = findsf(x, y - 16, z);
        api.setBlock(x, ty, z, "Messy Dirt");
        taskA.push(`sets([${[x, y, z]}],"${r % 2 === 0 ? "rx" : "rz"}");`)
        if (Math.random() < 0.7)
            exPr(x + dirc[r - 1][0] * 7, y, z + dirc[r - 1][1] * 7, r, t + 1, w);
        else
            exPr(x + dirc[r - 1][0] * 7, y, z + dirc[r - 1][1] * 7, -(r + 1) % 4 - 1, t + 1, w);
        if (Math.random() < 0.2) {
            let tx = x + dirc[r % 4][0] * 7, tz = z + dirc[r % 4][1] * 7, ty = findsf(tx, y - 16, tz);
            if (ty != -10000)
                api.setBlock(tx, ty, tz, "Messy Dirt");
            let d = Pid([{ id: 0, p: 0.5 }, { id: 1, p: 0.3 }, { id: 2, p: 0.2 }]);
            taskA.push(`sets([${[tx, ty, tz]}],"h${w}|${d}",${r - 1})`);
        }
        if (Math.random() < 0.2) {
            let tx = x + dirc[(r + 2) % 4][0] * 7, tz = z + dirc[(r + 2) % 4][1] * 7, ty = findsf(tx, y - 16, tz);
            if (ty != -10000)
                api.setBlock(tx, ty, tz, "Messy Dirt");
            let d = Pid([{ id: 0, p: 0.5 }, { id: 1, p: 0.3 }, { id: 2, p: 0.2 }]);
            taskA.push(`sets([${[tx, ty, tz]}],"h${w}|${d}",${(r + 1) % 4})`);
        }
    }
}
var gevilli = (x, y, z, w) => {
    exPr(x, y, z, 0, 0, w)
}
for (let i = 0; i < 5; i++) {
    mapS.set(`v${i}`, `gevilli(x,y,z,${i})`);
    for (let j = 0; j < 4; j++) {
        mapS.set(`h${i}|${j}`, hst[i] + hstr[j]);
    }
}
// Nether Portal
var portchest = (pos) => {
    Pchest(pos, [{ id: "Fireball", p: 0.1 }, { id: "Gold Bar", p: 0.02 }, { id: "Gold Sword", p: 0.02 }, { id: "Gold Axe", p: 0.02 }, { id: "Gold Helmet", p: 0.02 }]);
}
var setSpt = (x, y, z) => {
    asbr([x - 3, y + 2, z - 2], [x + 3, y + 10, z + 2], "Air");
    for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
            if (Math.random() + (i * i + j * j) / 100 < 0.9) {
                asb(x + i, y, z + j, "Dark Red Stone");
            }
            if (Math.random() + (i * i + j * j) / 40 < 0.9) {
                if (Math.random() < 0.6)
                    asb(x + i, y + 1, z + j, "Dark Red Stone");
                else
                    asb(x + i, y + 1, z + j, "Magma");
            }
        }
    }
    asbr([x - 2, y + 2, z], [x + 1, y + 6, z], "Obsidian");
    asbr([x - 1, y + 3, z], [x, y + 5, z], "Air");
    asb(x + 1, y + 3, z, "Air");
    asbr([x + 3, y, z], [x + 3, y + 9, z], "Mossy Stone Bricks");
    asbr([x - 3, y + 9, z], [x + 2, y + 9, z], "Mossy Stone Bricks");
    asbr([x - 2, y + 10, z], [x, y + 10, z], "Stone Bricks");
    asbr([x, y + 7, z], [x, y + 8, z], `Iron Ladder|meta|rot${(0 + rot) % 4 + 1}`);
    asb(x - 1, y + 9, z, "Block of Gold");
    asb(x - 3, y + 1, z + 1, "Chest");
    portchest([x - 3, y + 1, z + 1]);
}
mapS.set("pt", `setSpt(x,y,z);`);

// Common helpers for structure generation
const bsc = [1955, 1694, 4, 5, 650, 6, 8, 139, 32, 34, 36, 1629, 126];
var mck = new Array();
var ctc = new Array();
onChunkLoaded = (chunkId, chunk, wpc) => {
    if (!wpc) {
        mck.push(chunkId);
    }
}
function sf(b) {
    return (b == "Air" || b.includes("Leaves"))
}
function isac(x, y, z) {
    let i = false;
    return sf(agb(x + 31, y + 31, z)) ||
        sf(agb(x, y + 31, z + 31)) ||
        sf(agb(x + 31, y + 31, z + 31)) ||
        sf(agb(x, y + 31, z));
}
function findsf(x, y, z) {
    for (let i = y + 31; i >= y; i--) {
        const bn = agbd(x, i, z);
        if (bsc.includes(bn)) {
            return i;
        }
        if (bn == 3)
            return -10000;
    }
    return -10000;
}
function citblc(text) {
    const [x, y, z] = text.split("|").map(Number);
    return [x * 32, y * 32, z * 32];
}
var unrot = ["htp", "rx", "rz", "ro"];
var broad = ["htp", "hpt", "v0", "v1", "v2", "v3", "v4", "jp", "pr"]
var sets = (pos, id, R = -1) => {
    if (R == -1) {
        if (unrot.includes(id)) rot = 0;
        else rot = Math.floor(Math.random() * 4);
    } else rot = R;
    rotp = pos;
    if (broad.includes(id))
        api.broadcastMessage(`there is a ${id} generated at ${pos}`);
    let code = mapS.get(id);
    code = `const [x,y,z]=[${pos}];\n` + code;
    eval(code);
}
var Pset = (pos, re, s) => {
    let d = Pid(s, re);
    if (d != null) {
        sets(pos, d);
    }
}
var nt = 0;
tick = () => {
    nt++;
    if (nt % 10 == 0 && ctc.length) {
        const [x, y, z] = ctc.pop();
        const sx = x + 16 + Math.floor(16 * rd(x / 32 * 2, z / 32 * 2) % 10007 / 1007);
        const sz = z + 16 + Math.floor(16 * rd(x / 32 * 3, z / 32 * 3) % 10007 / 1007);
        const sy = findsf(sx, y, sz);
        const re = (rd(x / 32, z / 32) % 10007 + 10006) / 20013;
        if (sy != -10000) {
            const i = agbd(sx, sy, sz);
            switch (i) {
                case 4:
                    Pset([sx, sy, sz], re, [{ id: "v0", p: 0.02 }]);
                    break;
                case 5:
                    Pset([sx, sy, sz], re, [{ id: "v1", p: 0.02 }, { id: "pt", p: 0.01 }]);
                    break;
                case 650:
                    Pset([sx, sy, sz], re, [{ id: "pt", p: 0.01 }]);
                    break;
                case 1629:
                    Pset([sx, sy, sz], re, [{ id: "v2", p: 0.02 }]);
                    break;
                case 1955:
                    Pset([sx, sy, sz], re, [{ id: "v3", p: 0.02 }]);
                    break;
                case 1694:
                    Pset([sx, sy, sz], re, [{ id: "v4", p: 0.02 }]);
                    break;
            }
        }
    } else if (mck.length) {
        const ckId = mck.pop();
        const [x, y, z] = citblc(ckId);
        if (isac(x, y, z))
            ctc.push([x, y, z]);
    }
    if (asbA.length) {
        const b = asbA.pop();
        asb(...b.p, b.b, b.r, b.rp);
    } else if (asbrA.length) {
        const b = asbrA.pop();
        asbr(b.p1, b.p2, b.b, b.r, b.rp);
    } else if (nt % 5 == 0 && taskA.length) {
        eval(taskA.shift());
    }
}

onPlayerKilledOtherPlayer = () => { return "keepInventory" }
onMobKilledPlayer = () => { return "keepInventory" }
