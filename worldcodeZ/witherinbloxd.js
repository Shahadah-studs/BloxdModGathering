//Code creator: Planterus
//Wither 4.0
//Tip to kill Wither (in survival): Enchanted diamond armor (ideally with HP and Protection), bread (or HP potions), good bow (with arrows) and good sword
var s=null;
var sj=0;
var clearPos=null;
var lastAiUpdate=0;
var lastSkinUpdate=0;
var witherSpeed=20.0;
var spawnX=0;
var spawnY=0;
var spawnZ=0;
var currentTargetId=null;
var targetLockedUntil=0;
var lastWaypointUpdate=0;
var waypointX=0;
var waypointZ=0;
var currentVx=0;
var currentVy=0;
var currentVz=0;
var lastHp=3000;
var lastGruntTime=0;
var lastAttackTime=0;
var lastMobScanTime=0;
var spawnTime=0;
var isAiConfigured=false;
var phase2Triggered=false;
var witherParts=[];
var witherBodyYaw=0;
var headAngles={
headMain:{rx:0,ry:0},
headLeft:{rx:0,ry:0},
headRight:{rx:0,ry:0}
};
var headWorldPositions={
headMain:[0,0,0],
headLeft:[0,0,0],
headRight:[0,0,0]
};
var assignedTargets=[];
var pendingShots=[];
var currentWitherType = "default"; 
var mobSearchRadius = 25;
var mobScanInterval = 85;
var maxVerticalSpeed = 30.0; 
var verticalSpeedMulti = 7;
var idleHoverHeight = 3.5;
var spawnHoverHeight = -0.5;
var headLookRadius = 8.0;



function getSafePos(id){
if(!id)return null;
try{return api.getPosition(id);}catch(e){return null;}
}
function v(i){
return getSafePos(i)!==null;
}

function getClosestPlayerAnyMode(pos, maxRadius) {
    if (!pos) return null;
    let closestId = null;
    let minDist = maxRadius;
    try {
        let pIds = api.getPlayerIds();
        for (let i = 0; i < pIds.length; i++) {
            let pId = pIds[i];
            let pPos = getSafePos(pId);
            if (pPos) {
                let dx = pPos[0] - pos[0], dy = pPos[1] - pos[1], dz = pPos[2] - pos[2];
                let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                if (dist <= minDist) {
                    minDist = dist;
                    closestId = pId;
                }
            }
        }
    } catch (e) {}
    return closestId;
}

function isAlive(id){
if(!id)return false;
try{
let p=api.getPlayerIds();
if(p&&p.includes(id)){
try{
let gm=String(api.getPlayerSetting(id,"gamemode")||api.getPlayerSetting(id,"gameMode")||"").toLowerCase();
if(gm.includes("creat"))return false;
if(api.getPlayerSetting(id,"canFly")===true||api.getPlayerSetting(id,"flying")===true)return false;
if(api.getPlayerSetting(id,"invincible")===true||api.getPlayerSetting(id,"god")===true)return false;
}catch(err){}
let hp=0;
try{hp=api.getHealth(id);}catch(e){}
return(hp||0)>0;
}
let m=api.getMobIds();
if(m&&m.includes(id)){
let hp=0;
try{hp=api.getHealth(id);}catch(e){}
return(hp||0)>0;
}
}catch(e){}
return false;
}
function lerpAngle(cur,tar,f){
let d=(tar-cur)%(Math.PI*2);
if(d<-Math.PI)d+=Math.PI*2;
if(d>Math.PI)d-=Math.PI*2;
return cur+d*f;
}

function checkStructureAtCenter(cx,cy,cz,axis,headBlock,bodyBlock,px,py,pz,placedBlock){
function getB(bx,by,bz){
if(bx===px&&by===py&&bz===pz)return placedBlock;
return api.getBlock([bx,by,bz]);
}
try{
if(axis==="x"){
return(
String(getB(cx-1,cy,cz)).includes(headBlock)&&
String(getB(cx,cy,cz)).includes(headBlock)&&
String(getB(cx+1,cy,cz)).includes(headBlock)&&
String(getB(cx-1,cy-1,cz)).includes(bodyBlock)&&
String(getB(cx,cy-1,cz)).includes(bodyBlock)&&
String(getB(cx+1,cy-1,cz)).includes(bodyBlock)&&
String(getB(cx,cy-2,cz)).includes(bodyBlock)
);
}else{
return(
String(getB(cx,cy,cz-1)).includes(headBlock)&&
String(getB(cx,cy,cz)).includes(headBlock)&&
String(getB(cx,cy,cz+1)).includes(headBlock)&&
String(getB(cx,cy-1,cz-1)).includes(bodyBlock)&&
String(getB(cx,cy-1,cz)).includes(bodyBlock)&&
String(getB(cx,cy-1,cz+1)).includes(bodyBlock)&&
String(getB(cx,cy-2,cz)).includes(bodyBlock)
);
}
}catch(e){
return false;
}
}

function addPart(type,opts,ox,oy,oz,group){
let id=api.attemptCreateMeshEntity(type,opts);
if(id){
witherParts.push({id:id,ox:ox,oy:oy,oz:oz,group:group});
}
}
function clearMeshParts(){
for(let p of witherParts){
if(p.id)try{api.deleteMeshEntity(p.id);}catch(e){}
}
witherParts=[];
}

function onPlayerDamagingMob(playerId,mobId,damageDealt,withItem){
if(mobId===s){
if(isAlive(playerId)){
currentTargetId=playerId;
targetLockedUntil=api.now()+15000;
}
let timeSinceSpawn=api.now()-spawnTime;
if(spawnTime!==0&&timeSinceSpawn<10000){
return "preventDamage";
}

let item=String(withItem).toLowerCase();

if(item.includes("rpg")||item.includes("rocket")||item.includes("explosion")||item.includes("projectile")){
return "preventDamage";
}
if(currentWitherType === "jungle" && (item.includes("toxin") || item.includes("toxic") || item.includes("poison") || item.includes("gift"))) {
return "preventDamage";
}
if(currentWitherType === "frost" && (item.includes("ice") || item.includes("frost"))) {
return "preventDamage";
}

let currentHp=3000;
try{currentHp=api.getHealth(s);}catch(e){}
if(currentHp<1500){
let isSword=item.includes("sword");
if(!isSword)return "preventDamage";
}
let wPos=getSafePos(s);
if(wPos){
let randomPitch=0.75+Math.random()*0.5;
let hurtSound=Math.random()<0.5?"warperGrunt5":"wraithGrunt2";
try{
api.broadcastSound(hurtSound,1.0,randomPitch,{
playerIdOrPos:wPos,
maxHearDist:40,
refDistance:10
});
}catch(e){}
}
}
}

function onMobDamagingOtherMob(attackingMob,damagedMob,damageDealt,withItem){
if(damagedMob===s){
let timeSinceSpawn=api.now()-spawnTime;
if(spawnTime!==0&&timeSinceSpawn<10000)return "preventDamage";
if(attackingMob===s)return "preventDamage";

let item=String(withItem).toLowerCase();

if(item.includes("rpg")||item.includes("rocket")||item.includes("explosion")||item.includes("projectile")){
return "preventDamage";
}
if(currentWitherType === "jungle" && (item.includes("toxin") || item.includes("toxic") || item.includes("poison") || item.includes("gift"))) {
return "preventDamage";
}
if(currentWitherType === "frost" && (item.includes("ice") || item.includes("frost"))) {
return "preventDamage";
}

let isPlayer=api.getPlayerIds().includes(attackingMob);
if(isPlayer||!isAlive(currentTargetId)||api.now()>targetLockedUntil){
currentTargetId=attackingMob;
targetLockedUntil=api.now()+10000;
}
let currentHp=3000;
try{currentHp=api.getHealth(s);}catch(e){}
if(currentHp<1500){
let isSword=item.includes("sword");
if(!isSword)return "preventDamage";
}
}
}

function onPlayerKilledMob(playerId,mobId,damageDealt,withItem){
if(mobId===s){
try{
let currentLevel=api.getAuraInfo(playerId).level;
api.setAuraLevel(playerId,currentLevel+250);
}catch(e){
try{api.applyAuraChange(playerId,25000);}catch(err){}
}
try{api.broadcastSound("warperPhase2",1,0.65);}catch(e){}
try{
if(currentWitherType === "jungle") {
    api.broadcastMessage([{str:"✨The Jungle has calmed down✨",style:{color:"lime"}}]);
} else if (currentWitherType === "frost") {
    api.broadcastMessage([{str:"✨The Frost has melted away✨",style:{color:"cyan"}}]);
} else {
    api.broadcastMessage([{str:"✨Souls and Wrath have been killed✨",style:{color:"orange"}}]);
}
}catch(e){}
clearMeshParts();
}
}

function onPlayerChangeBlock(p,x,y,z,f,t){
if(s!==null&&v(s))return;

let witherConfigs = [
    { type: "default", headReq: "Carved Pumpkin", bodyReq: "Messy Dirt", meshHead: "Jack o'Lantern", meshBody: "Cedar Ladder" },
    { type: "jungle", headReq: "Mango Block", bodyReq: "Messy Dirt", meshHead: "Green Paintball Explosive", meshBody: "Cedar Ladder" },
    { type: "frost", headReq: "Carved Messy Stone", bodyReq: "Packed Snow", meshHead: "Cyan Paintball Explosive", meshBody: "Spectral Ladder" }
];

let foundCenter = null;
let foundAxis = null;
let matchedConfig = null;

let blockStr = String(t);

for (let config of witherConfigs) {
    if(blockStr.includes(config.headReq) || blockStr.includes(config.bodyReq)) {
        let xCandidates = [[x,y,z],[x+1,y,z],[x-1,y,z],[x+1,y+1,z],[x,y+1,z],[x-1,y+1,z],[x,y+2,z]];
        for(let cand of xCandidates){
            if(checkStructureAtCenter(cand[0],cand[1],cand[2],"x",config.headReq,config.bodyReq, x,y,z,t)){
                foundCenter=cand; foundAxis="x"; matchedConfig=config; break;
            }
        }
        if(!foundCenter){
            let zCandidates = [[x,y,z],[x,y,z+1],[x,y,z-1],[x,y+1,z+1],[x,y+1,z],[x,y+1,z-1],[x,y+2,z]];
            for(let cand of zCandidates){
                if(checkStructureAtCenter(cand[0],cand[1],cand[2],"z",config.headReq,config.bodyReq, x,y,z,t)){
                    foundCenter=cand; foundAxis="z"; matchedConfig=config; break;
                }
            }
        }
    }
    if(foundCenter) break;
}

if(foundCenter){
let cx=foundCenter[0];
let cy=foundCenter[1];
let cz=foundCenter[2];
clearMeshParts();

currentWitherType = matchedConfig.type; 
let wName = "Wither";
if(currentWitherType === "jungle") wName = "Jungle Wither";
if(currentWitherType === "frost") wName = "Frost Wither";

s=api.attemptSpawnMob(
"Bobino Musculino",
cx,cy,cz,
{name:wName}
);

api.setTargetedPlayerSettingForEveryone(s,"canSee",true,true);
sj=api.now();
spawnTime=api.now();
isAiConfigured=false;
phase2Triggered=false;
try{
if(currentWitherType === "jungle") {
    api.broadcastMessage([{str:" 💀🌿Jungle Wither gathers his souls and his power🌿💀",style:{color:"green"}}]);
} else if (currentWitherType === "frost") {
    api.broadcastMessage([{str:" 💀🧊Frost Wither gathers his souls and his power🧊💀",style:{color:"blue"}}]);
} else {
    api.broadcastMessage([{str:" 💀🔲Wither gathers his souls and his power🔲💀",style:{color:"purple"}}]);
}
}catch(e){}

clearPos={center:[cx,cy,cz],axis:foundAxis};
spawnX=cx;
spawnY=cy;
spawnZ=cz;
currentTargetId=null;
lastWaypointUpdate=0;
waypointX=0;
waypointZ=0;
currentVx=0;
currentVz=0;
lastHp=3000;
lastAttackTime=0;
pendingShots=[];
witherBodyYaw=0;

try{
let pPos = api.getPosition(p);
if(pPos){
let dx = pPos[0] - cx;
let dz = pPos[2] - cz;
let angleToPlayer = Math.atan2(dx, dz);
witherBodyYaw = Math.round(angleToPlayer / (Math.PI / 2)) * (Math.PI / 2);
}
}catch(e){}

headAngles={
headMain:{rx:0,ry:witherBodyYaw+Math.PI},
headLeft:{rx:0,ry:witherBodyYaw+Math.PI},
headRight:{rx:0,ry:witherBodyYaw+Math.PI}
};

addPart("BloxdBlock",{blockName:matchedConfig.meshBody,size:1.1},0,0.3,0,"ladder");
addPart("BloxdBlock",{blockName:matchedConfig.meshHead,size:1.2},0,1.85,0,"headMain");
addPart("BloxdBlock",{blockName:matchedConfig.meshHead,size:0.95},-1.3,1.8,0,"headLeft");
addPart("BloxdBlock",{blockName:matchedConfig.meshHead,size:0.95},1.3,1.8,0,"headRight");
}
}

function shootFromHead(headName,tId,basePos){
let tPos=getSafePos(tId);
if(!tPos)return;
let shootPos=headWorldPositions[headName]||[basePos[0],basePos[1]+1.85,basePos[2]];
let dir=[tPos[0]-shootPos[0],(tPos[1]+0.8)-shootPos[1],tPos[2]-shootPos[2]];
let len=Math.sqrt(dir[0]*dir[0]+dir[1]*dir[1]+dir[2]*dir[2]);
if(len>0)dir=[dir[0]/len,dir[1]/len,dir[2]/len];

let weapon = "RPG";
if(currentWitherType === "jungle") {
    weapon = Math.random() < 0.5 ? "Toxin Ball" : "RPG";
} else if (currentWitherType === "frost") {
    weapon = Math.random() < 0.5 ? "Grenade Launcher" : "Iceball";
} else {
    weapon = Math.random() < 0.05 ? "Super RPG" : "RPG";
}

try{
api.attemptCreateThrowable(s,weapon,shootPos,dir,1.3,1.0,1.0);
if(currentWitherType === "frost") {
    api.broadcastSound("iceHit",1.0,1.0,{playerIdOrPos:shootPos,maxHearDist:40});
} else {
    api.broadcastSound("fireBurn",1.0,1.0,{playerIdOrPos:shootPos,maxHearDist:40});
}
}catch(e){}
}

function tick(){
if(clearPos){
let cx=clearPos.center[0];
let cy=clearPos.center[1];
let cz=clearPos.center[2];
let axis=clearPos.axis;
if(axis==="x"){
api.setBlock([cx-1,cy,cz],"Air");
api.setBlock([cx,cy,cz],"Air");
api.setBlock([cx+1,cy,cz],"Air");
api.setBlock([cx-1,cy-1,cz],"Air");
api.setBlock([cx,cy-1,cz],"Air");
api.setBlock([cx+1,cy-1,cz],"Air");
api.setBlock([cx,cy-2,cz],"Air");
}else{
api.setBlock([cx,cy,cz-1],"Air");
api.setBlock([cx,cy,cz],"Air");
api.setBlock([cx,cy,cz+1],"Air");
api.setBlock([cx,cy-1,cz-1],"Air");
api.setBlock([cx,cy-1,cz],"Air");
api.setBlock([cx,cy-1,cz+1],"Air");
api.setBlock([cx,cy-2,cz],"Air");
}
clearPos=null;
}
let wPos=getSafePos(s);
if(!wPos){
if(witherParts.length>0)clearMeshParts();
return;
}
let now=api.now();
for(let i=pendingShots.length-1;i>=0;i--){
let ps=pendingShots[i];
if(now>=ps.time){
shootFromHead(ps.head,ps.targetId,wPos);
pendingShots.splice(i,1);
}
}
if(now-lastGruntTime>10000){
lastGruntTime=now;
if(Math.random()<0.6){
let gruntSound=Math.random()<0.5?"warperGrunt5":"wraithGrunt2";
try{
let randomPitch=0.75+Math.random()*0.5;
api.broadcastSound(gruntSound,1.0,randomPitch,{
playerIdOrPos:wPos,
maxHearDist:40,
refDistance:10
});
}catch(e){}
}
}
try{api.animateEntity(s,null);}catch(e){}
if(now-lastAiUpdate>80){
lastAiUpdate=now;
try{
let timeSinceSpawn=now-spawnTime;
let isSpawning = (spawnTime !== 0 && timeSinceSpawn < 10000);

if(isSpawning){
let spawnFloatY = spawnY + spawnHoverHeight + Math.sin(now * 0.002) * 0.5;
let dyHeight = spawnFloatY - wPos[1];
let targetVy = Math.max(-maxVerticalSpeed, Math.min(maxVerticalSpeed, dyHeight * verticalSpeedMulti));
currentVy = targetVy; 
currentVx = currentVx * 0.85;
currentVz = currentVz * 0.85;
try{api.setVelocity(s, currentVx, currentVy, currentVz);}catch(err){}
} else {

if(!isAiConfigured&&spawnTime!==0){
isAiConfigured=true;
try{
if(currentWitherType === "jungle") {
    api.broadcastMessage([{str:"🌿🌴Jungle Wither has gathered the power of the jungles🌴🌿",style:{color:"lime"}}]);
} else if (currentWitherType === "frost") {
    api.broadcastMessage([{str:"❄️🧊Frost Wither has gathered the power of frost and badlands🧊❄️",style:{color:"cyan"}}]);
} else {
    api.broadcastMessage([{str:"💀🔲Wither has gathered its souls and its power🔲💀",style:{color:"magenta"}}]);
}
}catch(e){}
try{api.broadcastSound("warperPhase1",1,0.6);}catch(e){}
}
let currentHp=3000;
try{currentHp=api.getHealth(s)||3000;}catch(e){}
let isLowHp=(currentHp<1500);
if(!phase2Triggered&&isLowHp){
phase2Triggered=true;
try{
let wNameMsg = currentWitherType==="jungle" ? "Jungle Wither🌿" : currentWitherType==="frost" ? "Frost Wither🧊" : "Wither🔲";
let wColor = currentWitherType==="jungle" ? "lime" : currentWitherType==="frost" ? "cyan" : "pink";
api.broadcastMessage([
{str:"🔲Now only the sword can defeat the " + wNameMsg,style:{color:wColor}}
]);
}catch(e){}
}
let isTargetValid=false;
if(currentTargetId&&isAlive(currentTargetId)){
let curPos=getSafePos(currentTargetId);
if(curPos){
let cdx=curPos[0]-wPos[0],cdy=curPos[1]-wPos[1],cdz=curPos[2]-wPos[2];
let cDist=Math.sqrt(cdx*cdx+cdy*cdy+cdz*cdz);
let isPlayer=api.getPlayerIds().includes(currentTargetId);
let maxDistAllowed=isPlayer?40.0:25.0;
if(now<targetLockedUntil)maxDistAllowed=80.0;
if(cDist<=maxDistAllowed){
isTargetValid=true;
}
}
}
if(!isTargetValid){
currentTargetId=null;
let playerIds=api.getPlayerIds();
let closestP=null,minDistP=40.0;
for(let i=0;i<playerIds.length;i++){
let pId=playerIds[i];
if(isAlive(pId)){
let pPos=getSafePos(pId);
if(pPos){
let dx=pPos[0]-wPos[0],dy=pPos[1]-wPos[1],dz=pPos[2]-wPos[2];
let dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
if(dist<minDistP){minDistP=dist;closestP=pId;}
}
}
}
if(closestP){
currentTargetId=closestP;
}else{
if(now-lastMobScanTime>mobScanInterval){
lastMobScanTime=now;
let closestM=null,minDistM=mobSearchRadius;
try{
let mobIds=api.getMobIds();
for(let i=0;i<mobIds.length;i++){
let mId=mobIds[i];
if(mId!==s&&isAlive(mId)){
let mPos=getSafePos(mId);
if(mPos){
let dx=mPos[0]-wPos[0],dy=mPos[1]-wPos[1],dz=mPos[2]-wPos[2];
let dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
if(dist<minDistM){minDistM=dist;closestM=mId;}
}
}
}
}catch(e){}
if(closestM)currentTargetId=closestM;
}
}
}
assignedTargets=[];
if(currentTargetId&&isAlive(currentTargetId)){
assignedTargets.push(currentTargetId);
let pIds=api.getPlayerIds();
for(let i=0;i<pIds.length;i++){
let pId=pIds[i];
if(pId!==currentTargetId&&isAlive(pId)&&assignedTargets.length<3){
let pPos=getSafePos(pId);
if(pPos){
let dx=pPos[0]-wPos[0],dy=pPos[1]-wPos[1],dz=pPos[2]-wPos[2];
if(Math.sqrt(dx*dx+dy*dy+dz*dz)<35.0)assignedTargets.push(pId);
}
}
}
if(assignedTargets.length<3){
try{
let mIds=api.getMobIds();
for(let i=0;i<mIds.length;i++){
let mId=mIds[i];
if(mId!==s&&!assignedTargets.includes(mId)&&isAlive(mId)&&assignedTargets.length<3){
let mPos=getSafePos(mId);
if(mPos){
let dx=mPos[0]-wPos[0],dy=mPos[1]-wPos[1],dz=mPos[2]-wPos[2];
if(Math.sqrt(dx*dx+dy*dy+dz*dz)<mobSearchRadius)assignedTargets.push(mId);
}
}
}
}catch(e){}
}
}
let heightOffset=isLowHp?3.0:7.0;
let shouldFly=(currentTargetId!==null&&isAlive(currentTargetId));
if(shouldFly){
let pPos=getSafePos(currentTargetId);
if(pPos){
let targetX=pPos[0];
let targetZ=pPos[2];
let targetHoverY=pPos[1]+heightOffset;
if(!isLowHp){
if(now-lastWaypointUpdate>3000){
lastWaypointUpdate=now;
let randAngle=Math.random()*6.28318;
let radius=2.0;
waypointX=pPos[0]+Math.cos(randAngle)*radius;
waypointZ=pPos[2]+Math.sin(randAngle)*radius;
}
if(waypointX!==0&&waypointZ!==0){
targetX=waypointX;
targetZ=waypointZ;
}
}
let dx=targetX-wPos[0];
let dyHeight=targetHoverY-wPos[1];
let dz=targetZ-wPos[2];
let dist=Math.sqrt(dx*dx+dyHeight*dyHeight+dz*dz);
let length=Math.sqrt(dx*dx+dz*dz);
let targetVy=Math.max(-maxVerticalSpeed,Math.min(maxVerticalSpeed,dyHeight*1.8));
currentVy=currentVy*0.8+targetVy*0.2;
if(isLowHp&&dist<=3.0){
currentVx=currentVx*0.85;
currentVz=currentVz*0.85;
try{api.setVelocity(s,currentVx,currentVy,currentVz);}catch(err){}
}else{
if(length>0){
let stepX=(dx/length)*witherSpeed;
let stepZ=(dz/length)*witherSpeed;
currentVx=currentVx*0.85+stepX*0.15;
currentVz=currentVz*0.85+stepZ*0.15;
try{api.setVelocity(s,currentVx,currentVy,currentVz);}catch(err){}
}
}
}
}else{
let groundY = wPos[1] - 5; 
let foundGround = false;

try {
    let wx = Math.floor(wPos[0]);
    let wy = Math.floor(wPos[1]);
    let wz = Math.floor(wPos[2]);
    for (let y = wy; y > Math.max(0, wy - 100); y--) {
        let b = api.getBlock([wx, y, wz]);
        let bName = typeof b === "string" ? b : (b && b.name ? b.name : "");
        if (bName && bName !== "null" && bName !== "undefined" && !bName.includes("Air")) {
            groundY = y;
            foundGround = true;
            break;
        }
    }
} catch(e) {}

let idleFloatY = groundY + (foundGround ? idleHoverHeight : 0) + Math.sin(now * 0.002) * 0.5;
let dyHeight = idleFloatY - wPos[1];

let targetVy = Math.max(-maxVerticalSpeed, Math.min(maxVerticalSpeed, dyHeight * verticalSpeedMulti));
currentVy = targetVy; 

currentVx = currentVx * 0.85;
currentVz = currentVz * 0.85;

try { api.setVelocity(s, currentVx, currentVy, currentVz); } catch (err) {}
}

if(assignedTargets.length>0&&now-lastAttackTime>3000){
lastAttackTime=now;
let headsToShoot=[];
if(assignedTargets.length===1){
let pick=["headMain","headLeft","headRight"][Math.floor(Math.random()*3)];
headsToShoot.push({head:pick,tIdx:0});
}else if(assignedTargets.length===2){
headsToShoot.push({head:"headMain",tIdx:0});
headsToShoot.push({head:Math.random()<0.5?"headLeft":"headRight",tIdx:1});
}else{
headsToShoot.push({head:"headMain",tIdx:0});
headsToShoot.push({head:"headLeft",tIdx:1});
headsToShoot.push({head:"headRight",tIdx:2});
}
for(let hs of headsToShoot){
if(hs.head==="headMain"){
shootFromHead("headMain",assignedTargets[hs.tIdx],wPos);
}else{
pendingShots.push({head:hs.head,targetId:assignedTargets[hs.tIdx],time:now+400});
}
}
}
} 
}catch(aiError){
try{api.setVelocity(s,0,-3.0,0);}catch(err){}
}
}

if(witherParts.length>0){
let targetBodyYaw=witherBodyYaw;
if(currentTargetId){
let tPos=getSafePos(currentTargetId);
if(tPos){
let bdx=tPos[0]-wPos[0],bdz=tPos[2]-wPos[2];
if(bdx*bdx+bdz*bdz>0.1)targetBodyYaw=Math.atan2(bdx,bdz);
}
}
witherBodyYaw=lerpAngle(witherBodyYaw,targetBodyYaw,0.12);

try { api.setEntityRotation(s, 0, witherBodyYaw, 0); } catch(err) {}

const cosB=Math.cos(witherBodyYaw);
const sinB=Math.sin(witherBodyYaw);
let floatOffset=0;
if(currentTargetId===null){
let distA=Math.sqrt((wPos[0]-spawnX)*(wPos[0]-spawnX)+(wPos[2]-spawnZ)*(wPos[2]-spawnZ));
if(distA<2.0)floatOffset=Math.sin(now*0.003)*0.35;
}

function getHeadAim(hx,hy,hz,tId,defYawOffset){
let targetYaw=witherBodyYaw+defYawOffset+Math.PI;
let targetPitch=0;
if(tId){
let tPos=getSafePos(tId);
if(tPos){
let dx=tPos[0]-hx;
let dy=(tPos[1]+0.8)-hy;
let dz=tPos[2]-hz;
let distXZ=Math.sqrt(dx*dx+dz*dz);
targetYaw=Math.atan2(dx,dz)+Math.PI;
targetPitch=-Math.atan2(dy,distXZ);
if(targetPitch>0.785)targetPitch=0.785;
if(targetPitch<-0.785)targetPitch=-0.785;
}
}
return{pitch:targetPitch,yaw:targetYaw};
}

let tMain=(assignedTargets.length>0)?assignedTargets[0]:currentTargetId;
let tLeft=(assignedTargets.length>=2)?assignedTargets[1]:tMain;
let tRight=(assignedTargets.length>=3)?assignedTargets[2]:((assignedTargets.length>=2)?assignedTargets[1]:tMain);
let isSpawningMesh = (spawnTime !== 0 && (now - spawnTime) < 10000);
if (isSpawningMesh || currentTargetId === null) {
    let watcherId = getClosestPlayerAnyMode(wPos, headLookRadius); // <--- HIER SIND DIE 6 BLÖCKE!
    if (watcherId) {
        tMain = watcherId;
        tLeft = watcherId;
        tRight = watcherId;
    }
}

for(let p of witherParts){
if(!p.id)continue;
let wx=wPos[0]+(p.ox*cosB+p.oz*sinB);
let wz=wPos[2]+(p.oz*cosB-p.ox*sinB);
let wy=wPos[1]+p.oy+floatOffset;
if(p.group==="ladder"){
api.setPosition(p.id,[wx,wy,wz]);
api.setEntityRotation(p.id,0,witherBodyYaw,0);
}else{
headWorldPositions[p.group]=[wx,wy,wz];
let aim={pitch:0,yaw:witherBodyYaw+Math.PI};
if(p.group==="headMain")aim=getHeadAim(wx,wy,wz,tMain,0);
else if(p.group==="headLeft")aim=getHeadAim(wx,wy,wz,tLeft,0);
else if(p.group==="headRight")aim=getHeadAim(wx,wy,wz,tRight,0);
headAngles[p.group].ry=lerpAngle(headAngles[p.group].ry,aim.yaw,0.18);
headAngles[p.group].rx=headAngles[p.group].rx+(aim.pitch-headAngles[p.group].rx)*0.18;
api.setPosition(p.id,[wx,wy,wz]);
api.setEntityRotation(p.id,headAngles[p.group].rx,headAngles[p.group].ry,0);
}
}
}
if(now-lastSkinUpdate>1500){
lastSkinUpdate=now;
let currentHp=3000;
try{currentHp=api.getHealth(s);}catch(e){}
if(currentHp!==lastHp){
lastHp=currentHp;
try{
let tagColor = currentWitherType === "jungle" ? "green" : currentWitherType === "frost" ? "blue" : "purple";
let wName = currentWitherType === "jungle" ? " Jungle Wither " : currentWitherType === "frost" ? " Frost Wither " : " Wither ";

api.setTargetedPlayerSettingForEveryone(s,"nameTagInfo",{
content:[{str:wName,style:{color:tagColor,fontWeight:"bold",fontSize:"30px"}}],
subtitle:[{str:"❤️ "+currentHp+" / 3000",style:{color:"red",fontWeight:"bold",fontSize:"30px"}}],
backgroundColor:"rgba(0,0,0,0.6)"
},true);
}catch(e){}
}
}
if(sj!=="c"&&now-sj>250){
api.setTargetedPlayerSettingForEveryone(s,"canSee",true,true);
api.setTargetedPlayerSettingForEveryone(s,"killfeedColour","red",true);
api.setTargetedPlayerSettingForEveryone(
s,
"nameTagInfo",
{backgroundColor:"rgba(0,0,0,0.5)",content:[]},
true
);
api.setMobSetting(s,"baseWalkingSpeed",0);
api.setMobSetting(s,"baseRunningSpeed",0);
api.setMobSetting(s,"attackDamage",0);
api.setMobSetting(s,"attackItemName","Air");
api.setMobSetting(s,"idleSound",null);
api.setMobSetting(s,"hurtSound",null);
api.setMobSetting(s,"maxHealth",3000);
api.setMobSetting(s,"initialHealth",3000);
try{api.setHealth(s,3000);}catch(e){}
api.setMobSetting(s,"chaseRadius",0);
api.setMobSetting(s,"hostilityRadius",0);
api.setMobSetting(s,"territoryRadius",0);
api.setMobSetting(s,"attackRadius",0);
try{api.setPlayerOpacity(s,0.01);}catch(e){}
api.setMobSetting(s,"heldItemName","Air");

let wName = "Wither";
if(currentWitherType === "jungle") wName = "Jungle Wither";
if(currentWitherType === "frost") wName = "Frost Wither";
api.setMobSetting(s,"name", wName);

let specialDrop = {itemName:"Shadow Rose",probabilityOfDrop:1,dropMinAmount:1,dropMaxAmount:3};
if(currentWitherType === "jungle") specialDrop = {itemName:"Toxin Ball",probabilityOfDrop:1,dropMinAmount:15,dropMaxAmount:20};
if(currentWitherType === "frost") specialDrop = {itemName:"Iceball",probabilityOfDrop:1,dropMinAmount:15,dropMaxAmount:20};

api.setMobSetting(s,"onDeathItemDrops",[
{itemName:"Messy Dirt",probabilityOfDrop:1,dropMinAmount:1,dropMaxAmount:2},
specialDrop,
{itemName:"Aura XP Orb",probabilityOfDrop:1,dropMinAmount:40,dropMaxAmount:45},
{itemName:"Moonstone",probabilityOfDrop:1,dropMinAmount:40,dropMaxAmount:45},
{itemName:"Iron Bar",probabilityOfDrop:1,dropMinAmount:100,dropMaxAmount:115},
{itemName:"Diamond",probabilityOfDrop:1,dropMinAmount:55,dropMaxAmount:65},
{itemName:"Gold Bar",probabilityOfDrop:1,dropMinAmount:75,dropMaxAmount:85}
]);

api.setTargetedPlayerSettingForEveryone(s,"meshScaling",{"HeadMesh":[1,2.8,1]},true);
try{
let tagColor = currentWitherType === "jungle" ? "green" : currentWitherType === "frost" ? "blue" : "purple";
let tagStr = currentWitherType === "jungle" ? " Jungle Wither " : currentWitherType === "frost" ? " Frost Wither " : " Wither ";
api.setTargetedPlayerSettingForEveryone(s,"nameTagInfo",{
content:[{str:tagStr,style:{color:tagColor,fontWeight:"bold",fontSize:"30px"}}],
subtitle:[{str:"❤️ 3000 / 3000",style:{color:"red",fontWeight:"bold",fontSize:"30px"}}],
backgroundColor:"rgba(0,0,0,0.6)"
},true);
}catch(e){}
sj="c";
}
}
