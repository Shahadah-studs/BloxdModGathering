onPlayerDamagingOtherPlayer=(a,v,d,w)=>{
const held=api.getHeldItem(a)?.attributes?.customDisplayName
if(held&&held==="Fire Sword"&&!api.getEffects(v).includes("On fire")){api.applyEffect(v,"On fire",5000,{icon:"Lava Bucket"})}
}
pC={}
tick=()=>{
for(const p of api.getPlayerIds()){
if(api.getEffects(p).includes("On fire")&&api.isAlive(p)){
api.playParticleEffect({dir1:[0.5,1,0.5],dir2: [-0.5,1,-0.5],pos1:api.getPosition(p),pos2:api.getPosition(p),texture:"square_particle",minLifeTime:0.1,maxLifeTime:0.3,minEmitPower:2,maxEmitPower:4,minSize:0.1,maxSize: 0.3,manualEmitCount:20,gravity:[0,10,0],colorGradients:[{timeFraction:0,minColor:[255,150,0,0.5],maxColor:[255,0,0,1]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode: 1
});
if(pC[p]===undefined){
pC[p]=0
}
pC[p]++
if(pC[p]%20==0&&api.getHealth(p)&&!api.getEffects(p).includes("Heat Resistance")){
api.applyHealthChange(p,-5)
}
}else{
if(pC[p]!==undefined){
delete pC[p]
}
}
}
}

onPlayerJoin=(p)=>{api.giveItem(p,"Gold Sword",1,{customDisplayName: "Fire Sword",customDescription:"Sets a player on fire!",customAttributes:{enchantmentTier:"Tier 5"}})}
