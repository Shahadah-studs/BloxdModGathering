var queuedCodeSnippets=[],queuedBlock=[];
var permutationTable=[];
for(let i=0;i<256;i++){permutationTable.push(i)}
//perlin by FWJ7 / L16_F51620
seedNum = 0; //set a seed here.
blockScale=12;
heightScaleDiv=36;
heightScale=1; //heightScaleDiv/heightScale
caveScale=4;
caveHeightScaleDiv=4;
caveHeightScale=3;

gradientTable=[
    [1,0,],
    [-1,0,],
    [0,1],
    [0,-1],
    [1,1,],
    [-1,1,],
    [1,-1,],
    [-1,-1,],

];

gradientTable3=[
    [1,1,0],
    [-1,1,0],
    [1,-1,0],
    [-1,-1,0],

    [0,1,1,],
    [0,-1,1,],
    [0,1,-1,],
    [0,-1,-1,],

    [1,0,1,],
    [1,0,-1,],
    [-1,0,1,],
    [-1,0,-1,],
];
 caveThreshold = 0.77, leniency = 0.066;
 dot = (a,b0,b1) => (a[0]*b0)+(a[1]*b1);
dot3 = (a,b0,b1,b2) => (a[0]*b0)+(a[1]*b1)+(a[2]*b2);
fade = x => 6*(x**5) - 15*(x**4) + 10*(x**3);
lerp = (a, b, n) => a + ((b - a)*n);
smoothstep=(a,b,n)=>{
    let t = Math.max(0,Math.min(1,(n-a)/(b-a)));
    return 6*(t**5) - 15*(t**4) + 10*(t**3);
}
rgba_hex=rgba=>{
    let hex="#";
    for(let i of rgba.map(h=>Math.floor(h))){
        let checkedV=i.toString(16);
        if(checkedV.length<2)checkedV=`0${checkedV}`;
        hex=`${hex}${checkedV}`;
    }
    return hex;
}

generateHash=str=>{
    let hash=2166136261;
    for(let i=0;i<str.length;i++){
        hash^=(str[i].charCodeAt());
        hash = Math.imul(hash,16777619);
    }
    
    return hash;
}

randomS=s=>{
    s^=(s<<13);
    s^=(s>>>17);
    s^=(s<<5); 
    return ((s>>>0)/4294967295)
}

angleGen = (x, y,seed) => {
    let hash=Math.floor(8*randomS(Math.abs(generateHash(`${x},${y}|${seed??seedNum}`))));
    return gradientTable[hash & 7];
}

angleGen3 = (x, y, z,seed) => {
    let hash=Math.floor(12*randomS(Math.abs(generateHash(`${x},${y},${z}|${seed??seedNum}`))));
    return gradientTable3[hash % 12];
}

perlin = (x, y, seed) => {
    
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1; 
    let frx=x-x_0;
    let fry=y-y_0;
    let u = fade(frx), v = fade(fry); 
    let s_00 = dot(angleGen(x_0,y_0, seed??seedNum),frx, fry), s_10 = dot(angleGen(x_1,y_0, seed??seedNum),frx-1, fry, seed??seedNum);
    let s_01 = dot(angleGen(x_0,y_1, seed??seedNum),frx, fry-1, seed??seedNum), s_11 = dot(angleGen(x_1,y_1, seed??seedNum),frx-1, fry-1, seed??seedNum); 
    let lx0 = lerp(s_00,s_10,u), lx1 = lerp(s_01,s_11,u); 
    let value = lerp(lx0,lx1,v);
    return value;
}

perlin3 = (x, y, z, seed) => {
    
    let x_0 = Math.floor(x), x_1 = x_0+1, y_0 = Math.floor(y), y_1 = y_0+1, z_0 = Math.floor(z), z_1 = z_0+1; 
    let frx=x-x_0;
    let fry=y-y_0;
    let frz=z-z_0;
    let u = fade(frx), v = fade(fry), w = fade(frz);
    let s_000 = dot3(angleGen3(x_0,y_0,z_0,seed??seedNum),frx, fry, frz, ), s_100 = dot3(angleGen3(x_1,y_0,z_0,seed??seedNum),frx-1, fry, frz, seed??seedNum);
    let s_010 = dot3(angleGen3(x_0,y_1,z_0,seed??seedNum),frx, fry-1, frz, seed??seedNum), s_110 = dot3(angleGen3(x_1,y_1,z_0,seed??seedNum),frx-1, fry-1, frz, seed??seedNum); 
    let s_001 = dot3(angleGen3(x_0,y_0,z_1,seed??seedNum),frx, fry, frz-1, seed??seedNum), s_101 = dot3(angleGen3(x_1,y_0,z_1,seed??seedNum),frx-1, fry, frz-1, seed??seedNum);
    let s_011 = dot3(angleGen3(x_0,y_1,z_1,seed??seedNum),frx, fry-1, frz-1, seed??seedNum), s_111 = dot3(angleGen3(x_1,y_1,z_1,seed??seedNum),frx-1, fry-1, frz-1, seed??seedNum); 
    let lx0 = lerp(s_000,s_100,u), lx1 = lerp(s_010,s_110,u); 
    let lx2 = lerp(s_001,s_101,u), lx3 = lerp(s_011,s_111,u); 
    let ly0 = lerp(lx0,lx1,v), ly1 = lerp(lx2,lx3,v);
    let value = lerp(ly0,ly1,w);
    return value;
}
evalPerlinWithFBM_cave=(x,y,z)=>{
    let k=x/caveScale,l=y/caveScale,m=z/caveScale;
    return (perlin3(k/16,l/16,m/16)*(caveHeightScaleDiv/caveHeightScale)/1)
    +(perlin3(k/ 8,l/ 8,m/ 8)*(caveHeightScaleDiv/caveHeightScale)/2)
    +(perlin3(k/ 3,l/ 3,m/ 3)*(caveHeightScaleDiv/caveHeightScale)/4)
    +(perlin3(k/ 1,l/ 1,m/ 1)*(caveHeightScaleDiv/caveHeightScale)/8);
}


temperature=(x,z)=>(perlin(x/48,z/48,`temperature${seedNum}`))/Math.sqrt(2);
hillyness=(x,z)=>((perlin(x/48,z/48,`hillyness${seedNum}`)/Math.sqrt(2))+0.5)
humidity=(x,z)=>(perlin(x/36,z/36,`humidity${seedNum}`))/Math.sqrt(2);

shouldBeCaveAir = (x, y, z) => {
    const sx=1,sy=1,sz=1;
    let cV=evalPerlinWithFBM_cave(x*sx,y*sy,z*sz);
    cV+=15/16
    cV/=15/8;
    const t=lerp(caveThreshold-leniency,caveThreshold+leniency,cV)
    let k=x/caveScale,l=y/caveScale,m=z/caveScale;
    return t>0.815
}

     

tick=i=>{
    if(queuedCodeSnippets.length>0){
        //for(let i=0;i<2;i++){
            //if(queuedCodeSnippets.length<1)break;
            let f=queuedCodeSnippets[0];
            f[0](...f[1]);
            queuedCodeSnippets.splice(0,1);
        //}
    }
    if(queuedBlock.length>0){
        for(let i=0;i<4;i++){
            if(queuedBlock.length<1)break;
            let f=queuedBlock[0];
            api.setBlock(...f);
            queuedBlock.splice(0,1)
        }
    }
    
    for(let j=0;j<6;j++){
        let f=api.createItemDrop(-281.5,-65,-217.5,Math.random()<0.3?"Block of Diamond":"Diamond",Math.ceil(Math.random()*6),!1,{},20000);
        if(f){
            api.setLifeformScale(f,7)
            api.setVelocity(f,(Math.random()*16)-8,Math.random()*16,(Math.random()*16)-8)
        }
    }
    
}




function getVoxelID(x, y, z,height,data) {
    let amount = Math.round(height);
    let dx=x&15,dy=y&15,dz=z&15;
    if (y < -864) return "Air";
    if (y === -864) return "Bedrock";
    if(shouldBeCaveAir(x,y,z)&&y<amount)return "Air";
    //console.log(data.get(dx,dy,dz), isStone);
    //if(shouldBeTest(x,y,z,0.7,0.012,0.709)&&(y<amount-6&&y<=144))return BLOCK_TO_ID["coal_ore"];
    if(y>amount&&y>=-3)return "Air";
    let getTemp=temperature(x/blockScale,z/blockScale),getHumid=humidity(x/blockScale,z/blockScale);
    let variationTemp=(0.0036*randomS(generateHash(`${x},${y},${z}|tempvar`)))-0.0018
    let variationHumid=(0.0036*randomS(generateHash(`${x},${y},${z}|tempvar`)))-0.0018
    let Ybm0=
        getTemp>0.16 + variationTemp
        ? (
            getHumid > 0.16 + variationHumid
            ? "Overgrown Jungle Grass Block"
            : "Sand"
        )
        :   getTemp < -0.16 + variationTemp
            ? "Snow" 
            : "Overgrown Grass Block";
    let Ybm1=
        getTemp > 0.16 + variationTemp
        ? (
            getHumid > 0.16 + variationHumid
            ? "Jungle Grass Block"
            : "Sand"
        )
        :   getTemp < -0.16 + variationTemp
            ? "Dirt"
            : "Grass Block";
    let Ybm2 = 
        getTemp > 0.16 + variationTemp
        ? (
            getHumid > 0.16 + variationHumid
            ? "Dirt"
            : "Sand"
        )
        :   y > 64
            ? "Rocky Dirt"
            : "Dirt";
    let Ybm6 = 
        getTemp > 0.16 + variationTemp
        ? (
            getHumid > 0.16 + variationHumid
            ? "Stone"
            : "Sandstone"
        )
        : "Stone";
    /*for(let I of Object.keys(gens)){
        let J = gens[I]; // [min, max, chancePerBlock]
        let oreI=I.replaceAll(/gen/g,"ore");
        if(Math.abs(generateHash(`${x},${y},${z}|${seedNum}|${I}`))%16384<=J[2]*4&&(y>=J[0]&&y<=J[1])){
            /\*return y<(-256 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_stone`)%3) )?BLOCK_TO_ID[`underworld_stone_${I}`]:
            y<(-128 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3) )?BLOCK_TO_ID[`depthstone_${I}`]:
            BLOCK_TO_ID[I];*\/
            return genFunc(x,y,z,checkStoneT(x,y,z,...gei[I]),I);
        };
    }*/
    if (y < -480 + (generateHash(`${x},${y},${z}|${seedNum}|underworld_rock`)%3))return "Dark Red Stone";
    if (y < -192 + (generateHash(`${x},${y},${z}|${seedNum}|depthstone`)%3))return "Black Chalk"
    
    if (y < amount-21) return y>144?"Snow":"Stone";
    if (y < amount-6) return y>144?"Snow":Ybm6;
    if (y < amount-2) return y>144?"Snow":y>112?"Stone":Ybm2
    if (y < amount-1) return y>144?"Snow":y>112?"Stone":Ybm1;
    if (y < amount) return y>144?"Snow":y>112?"Stone":y>-3?Ybm0:y===-3?"Sand":Ybm2;
    if (y >= amount && y < -3 )return "Water";
    /*let  treeX=Math.round(randomS(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|sapling_oak,x`))*8);
    let treeZ=Math.round(randomS(generateHash(`${Math.floor(x/16)},${Math.floor(y/16)},${Math.floor(z/16)}|sapling_oak,z`))*8);
    if(y<amount+1&&Math.floor(x/16)+treeX===x&&Math.floor(z/16)+treeZ===z&&under!==0)return sapling_oak_auto_genID;
    */
     return "Air";// signifying empty space
}
generateTerrain=(pos1,pos2)=>{
    if(!Array.isArray(pos1))throw new TypeError("generateTerrainError: Parameter pos1 must be an array of numbers!")
    if(!Array.isArray(pos2))throw new TypeError("generateTerrainError: Parameter pos2 must be an array of numbers!")
    
    for(let i of pos1){
        if(typeof i !== "number")throw new TypeError("generateTerrainError: Parameter pos1 must be an array of numbers!")
        if(Math.abs(i)>399999)throw new TypeError("generateTerrainError: Numbers in parameter pos1 must be within the world border!")
    }
    for(let i of pos2){
        if(typeof i !== "number")throw new TypeError("generateTerrainError: Parameter pos2 must be an array of numbers!")
        if(Math.abs(i)>399999)throw new TypeError("generateTerrainError: Numbers in parameter pos2 must be within the world border!")
    }
    let [x1,y1,z1]=pos1,[x2,y2,z2]=pos2;
    let rectD=[
        1+Math.abs(x2-x1),
        1+Math.abs(y2-y1),
        1+Math.abs(z2-z1)
    ];
    console.log(rectD)
    let startingPos=[
        Math.min(x2,x1),
        Math.min(y2,y1),
        Math.min(z2,z1),
    ]
    if(rectD[0]>64)throw new Error(`generateTerrainError: X value too high! (This safeguard prevents code preparation errors)`)
    if(rectD[1]>64)throw new Error(`generateTerrainError: Y value too high! (This safeguard prevents code preparation errors)`)
    if(rectD[2]>64)throw new Error(`generateTerrainError: Z value too high! (This safeguard prevents code preparation errors)`)
    let [x,y,z]=startingPos;
    //modified from fenomas/noa github repo, code is at src/hello-world
    for (var i = 0; i < rectD[0]; i++) {

        for (var k = 0; k < rectD[2]; k++) {
            queuedCodeSnippets.push([
                (x,y,z,i,k,rectD)=>{
                    
                        let l=(x+i)/blockScale, m=(z+k)/blockScale;
                        let getHilly=hillyness(l,m);
                        let heightMult=1;
                        let fbm=1.5;
                        if(getHilly>0.7){
                            heightMult=1+(20*(getHilly-0.7));
                        }
                        let height=((perlin(l/64,m/64)*(heightScaleDiv/heightScale))
                        +(perlin(l/32,m/32)*(heightScaleDiv/heightScale)/1.5)
                        +(perlin(l/16,m/16)*(heightScaleDiv/heightScale)/(fbm**2))
                        +(perlin(l/8,m/8)*(heightScaleDiv/heightScale)/(fbm**3))
                        +(perlin(l/4,m/4)*(heightScaleDiv/heightScale)/(fbm**4))
                        +(perlin(l/2,m/2)*(heightScaleDiv/heightScale)/(fbm**5))
                        +(perlin(l/1,m/1)*(heightScaleDiv/heightScale)/(fbm**6)))*heightMult;
                        for (var j = 0; j < rectD[1]; j++) {
                            var voxelID = getVoxelID(x + i, y + j, z + k,height);
                            if(api.getBlock(x+i,y+j,z+k)===voxelID)continue;
                            api.setBlock(x+i, y+j, z+k, voxelID);
                        }
                },[...startingPos,i,k,rectD]
            ])
        }
    }
    return `Process started! Note: "InternalError: interrupted" errors are common and usually happen all the time, so don't go complaining about it.`
}
