// created by _Balance_HT3
let CR=14,BB=12,ES=Math.PI*5/180,EV=Math.PI*18/180,ET=Math.PI*.18/180,MIN=0,MAX=Math.PI*45/180,DEF=Math.PI*8/180,BR=.5,GR=.09,BD=.44,TT=.5,TD=.025,RR=1.01,SC=.98,GO=-.08,PX=0,PY=1.62,PZ=.46,ARC=Math.PI*18/180,MR=10,RELOAD=6500,AR=3000,SCAN=500,YS=Math.PI*55/180,YT=Math.PI*1.25/180;
let RP=[{max:75,speed:42,elevation:8},{max:150,speed:50,elevation:14},{max:275,speed:60,elevation:20},{max:425,speed:72,elevation:27},{max:600,speed:84,elevation:34},{max:800,speed:96,elevation:42},{max:1200,speed:115,elevation:43},{max:1800,speed:135,elevation:44},{max:2400,speed:155,elevation:44.5},{max:3000,speed:175,elevation:44.8}];
let XR=14.5,XMAX=165,XMIN=25,XKB=18,XBR=6.8,BPT=90,G={},IDS=[],HC={},BQ=[],FQ=[],SQ=[],DQ=[],DS={},NI=1;
let C={t:[17,19,16],ta:[27,29,25],vd:[32,39,29],d:[42,51,37],g:[57,67,48],l:[71,81,59],e:[87,95,73],m:[90,94,85],ml:[130,134,123],b:[13,15,13],h:[58,63,54],sb:[92,101,70],sg:[174,141,66],st:[53,59,45]};

function msg(p,t,c){try{api.sendMessage(p,t,{color:c||"white"})}catch{}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function ss(t){t=clamp(t,0,1);return t*t*(3-2*t)}
function na(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}
function ad(a,b){return na(a-b)}
function gun(id){return G[id]||null}

tick=()=>{
 try{
  if(BQ.length)buildQ();
  autoTargets();yawTick();elevTick();reloadTick();autoFire();
  if(FQ.length)fireAnim();
  if(SQ.length)shotTick();
  if(DQ.length)blockTick();
 }catch{}
};

onPlayerChat=(p,m)=>{
 try{
  if(typeof m!="string")return;
  let r=m.trim(),s=r.toLowerCase().trim();
  if(s==="!help"){help(p);return false}
  if(s==="!artillery"){
   let n=replaceSlabs(p,"none");
   msg(p,"2A65 Msta-B slabs received: "+n,"green");
   msg(p,"!fire = effect only | !fire X Y Z = live round","yellow");
   msg(p,"Use !help for the full artillery tutorial.","yellow");
   return false
  }
  if(s==="!auto artillery"||s==="!auto artillery all"){giveAuto(p,"all");return false}
  if(s==="!auto artillery player"){giveAuto(p,"player");return false}
  if(s==="!auto artillery mob"){giveAuto(p,"mob");return false}
  if(s==="!auto artillery player training"||s==="!auto artillery player np"||s==="!auto artillery training"){giveAuto(p,"playerTraining");return false}
  if(s==="!fire"){
   let g=nearest(p,CR);
   if(!g)msg(p,"No 2A65 Msta-B within 14 blocks","red");
   else visualFire(g,p);
   return false
  }
  if(s.indexOf("!fire ")===0){
   let t=parseFire(r);
   if(!t){msg(p,"Use !fire X Y Z or !fire at X, Y, Z","yellow");msg(p,"Example: !fire at 122, 1, 334","yellow");return false}
   let g=nearest(p,CR);
   if(!g){msg(p,"No 2A65 Msta-B within 14 blocks","red");return false}
   let q=queueFire(g,p,t);
   if(q==="wrongDirection")msg(p,"Wrong direction! Cannon is not facing the target.","red");
   else if(q==="range")msg(p,"Target is outside artillery range.","red");
   else if(q==="reload")msg(p,"Reloading | "+Math.max(0,(g.reloadUntil-api.now())/1000).toFixed(1)+"s","orange");
   else if(q==="building")msg(p,"Artillery is still assembling.","orange");
   else if(q==="busy")msg(p,"Artillery is already aiming.","orange");
   else if(q==="close")msg(p,"Target is too close.","red");
   return false
  }
  if(s==="!up"||s==="!down"){
   let g=nearest(p,CR);
   if(!g){msg(p,"No 2A65 Msta-B within 14 blocks","red");return false}
   g.pendingFire=null;
   g.targetElevation=clamp(g.targetElevation+(s==="!up"?ES:-ES),MIN,MAX);
   msg(p,"Elevation target: "+Math.round(g.targetElevation*180/Math.PI)+" degrees","yellow");
   return false
  }
 }catch{}
};

function parseFire(r){
 let a=r.replace(/,/g," ").trim().split(/\s+/),i=a[1]&&a[1].toLowerCase()==="at"?2:1;
 if(a.length!==i+3)return null;
 let x=Number(a[i]),y=Number(a[i+1]),z=Number(a[i+2]);
 return isFinite(x)&&isFinite(y)&&isFinite(z)?[x,y,z]:null
}

function help(p){
 [
  ["===== 2A65 Msta-B ARTILLERY TUTORIAL =====","yellow"],
  ["NORMAL ARTILLERY","green"],
  ["!artillery gives you 10 normal 2A65 Msta-B deployment slabs.","green"],
  ["Choosing another artillery mode replaces your previous artillery slabs.","green"],
  ["Place the slab while facing the direction you want the cannon to face.","white"],
  ["Manual controls work while you are within 14 blocks of the gun.","white"],
  ["===== FIRING =====","orange"],
  ["!fire fires the cannon with sound muzzle flash recoil and reload but causes NO physical damage.","yellow"],
  ["!fire X Y Z fires a real artillery round at those coordinates.","orange"],
  ["Example: !fire 250 4 -500","yellow"],
  ["!fire at X, Y, Z also fires a real round at those coordinates.","orange"],
  ["Example: !fire at 250, 4, -500","yellow"],
  ["Commas are optional. !fire at 250 4 -500 also works.","white"],
  ["Real coordinate shots damage nearby players and mobs apply knockback and destroy terrain.","red"],
  ["Targets must be at least 10 blocks away and within 3000 blocks.","white"],
  ["Normal artillery must already be facing roughly toward the coordinate target.","white"],
  ["!up raises the barrel target by 5 degrees.","yellow"],
  ["!down lowers the barrel target by 5 degrees.","yellow"],
  ["===== AUTOMATIC ARTILLERY =====","aqua"],
  ["!Auto Artillery Player targets players only.","aqua"],
  ["!Auto Artillery Mob targets mobs only.","aqua"],
  ["!Auto Artillery or !Auto Artillery All targets both players and mobs.","aqua"],
  ["Automatic artillery searches up to 3000 blocks away turns toward targets adjusts elevation and fires automatically.","white"],
  ["Your own automatic artillery will not target you.","green"],
  ["Automatic artillery continues operating even when you leave the area.","green"],
  ["===== PLAYER TRAINING MODE =====","lime"],
  ["!Auto Artillery Player Training gives automatic player targeting without physical damage.","lime"],
  ["!Auto Artillery Player NP is an alias for the same training mode.","lime"],
  ["Training mode still aims fires recoils reloads and creates the visual impact.","white"],
  ["Training mode causes NO health damage NO knockback and NO terrain destruction.","lime"],
  ["===== RELOADING =====","orange"],
  ["Every shot starts a 6.5 second reload cycle.","orange"],
  ["The barrel recoils and the carriage shifts backward slightly from the shot.","white"],
  ["The breech opens the loader moves the rammer retracts and a visible 152mm shell appears.","white"],
  ["The rammer pushes the shell into the breech before the mechanism returns to firing position.","white"],
  ["The gun cannot fire again until the reload is complete.","white"],
  ["Type !help whenever you want to see this tutorial again.","yellow"]
 ].forEach(x=>msg(p,x[0],x[1]))
}

onPlayerSelectInventorySlot=(p,s)=>{
 try{
  let i=api.getItemSlot(p,s);
  HC[p]={isArtillery:isArt(i),autoMode:itemMode(i),time:api.now()}
 }catch{}
};

onPlayerChangeBlock=(p,x,y,z,f,t)=>{
 try{
  if(f==="Green Concrete Slab"&&t!=="Green Concrete Slab")removeAt(x,y,z);
  if(f!=="Air"||t!=="Green Concrete Slab")return;
  let h=null;
  try{h=api.getHeldItem(p)}catch{}
  let ok=isArt(h),mode=itemMode(h);
  if(!ok){
   let c=HC[p];
   if(c&&c.isArtillery&&api.now()-c.time<650){ok=true;mode=c.autoMode||"none"}
  }
  if(!ok)return;
  let q=null;
  try{q=api.getPlayerFacingInfo(p)}catch{}
  let fx=0,fz=1;
  if(q&&q.dir){fx=q.dir[0];fz=q.dir[2]}
  let l=Math.sqrt(fx*fx+fz*fz);
  if(l<.05){fx=0;fz=1;l=1}
  createGun(p,x,y,z,fx/l,fz/l,mode);
  HC[p]={isArtillery:true,autoMode:mode,time:api.now()}
 }catch{}
};

onWorldChangeBlock=(x,y,z,f,t)=>{
 try{if(f==="Green Concrete Slab"&&t!=="Green Concrete Slab")removeAt(x,y,z)}catch{}
};

onPlayerLeave=p=>{delete HC[p]};

function giveAuto(p,m){
 let l=m==="player"?"PLAYER":m==="mob"?"MOB":m==="playerTraining"?"PLAYER TRAINING":"ALL",n=replaceSlabs(p,m);
 msg(p,"AUTO Msta-B ["+l+"] slabs received: "+n,m==="playerTraining"?"lime":"green");
 msg(p,"Automatic target range: "+AR+" blocks","yellow");
 if(m==="playerTraining")msg(p,"TRAINING MODE | No health damage knockback or terrain damage.","lime")
}

function replaceSlabs(p,m){
 let a=attrs(m),slot=-1;
 for(let s=0;s<=45;s++){
  let i=null;
  try{i=api.getItemSlot(p,s)}catch{}
  if(!isArt(i))continue;
  if(slot<0){
   slot=s;
   try{api.setItemSlot(p,s,"Green Concrete Slab",10,a,true)}catch{}
  }else{
   try{api.setItemSlot(p,s,"Air",null,{},true)}catch{}
  }
 }
 let n=10;
 if(slot<0)try{n=api.giveItem(p,"Green Concrete Slab",10,a)}catch{n=0}
 HC[p]={isArtillery:true,autoMode:m,time:api.now()};
 return n
}

function attrs(m){
 if(m==="player")return{customDisplayName:"Auto 2A65 Msta-B [PLAYERS]",customDescription:"Automatically targets and attacks players",customAttributes:{is2A65MstaB:true,auto2A65Mode:"player"}};
 if(m==="playerTraining")return{customDisplayName:"Auto 2A65 Msta-B [PLAYER TRAINING]",customDescription:"Automatically targets players with non-damaging training rounds",customAttributes:{is2A65MstaB:true,auto2A65Mode:"playerTraining"}};
 if(m==="mob")return{customDisplayName:"Auto 2A65 Msta-B [MOBS]",customDescription:"Automatically targets mobs",customAttributes:{is2A65MstaB:true,auto2A65Mode:"mob"}};
 if(m==="all")return{customDisplayName:"Auto 2A65 Msta-B [ALL]",customDescription:"Automatically targets players and mobs",customAttributes:{is2A65MstaB:true,auto2A65Mode:"all"}};
 return{customDisplayName:"152mm 2A65 Msta-B",customDescription:"Place this slab to deploy a modeled 152mm 2A65 Msta-B howitzer",customAttributes:{is2A65MstaB:true,auto2A65Mode:"none"}}
}

function isArt(i){
 if(!i||i.name!=="Green Concrete Slab")return false;
 try{
  if(i.attributes&&i.attributes.customAttributes&&i.attributes.customAttributes.is2A65MstaB===true)return true;
  let n=i.attributes&&i.attributes.customDisplayName;
  return n==="152mm 2A65 Msta-B"||n==="Auto 2A65 Msta-B [PLAYERS]"||n==="Auto 2A65 Msta-B [PLAYER TRAINING]"||n==="Auto 2A65 Msta-B [MOBS]"||n==="Auto 2A65 Msta-B [ALL]"
 }catch{return false}
}

function itemMode(i){
 if(!i)return"none";
 try{
  let a=i.attributes;
  if(a&&a.customAttributes&&typeof a.customAttributes.auto2A65Mode==="string")return a.customAttributes.auto2A65Mode;
  let n=a&&a.customDisplayName;
  if(n==="Auto 2A65 Msta-B [PLAYERS]")return"player";
  if(n==="Auto 2A65 Msta-B [PLAYER TRAINING]")return"playerTraining";
  if(n==="Auto 2A65 Msta-B [MOBS]")return"mob";
  if(n==="Auto 2A65 Msta-B [ALL]")return"all"
 }catch{}
 return"none"
}

function createGun(owner,x,y,z,fx,fz,mode){
 let id=NI++,now=api.now(),yaw=Math.atan2(fx,fz),m=mode||"none";
 let g={id,ownerId:owner,autoMode:m,auto:m!=="none",autoTargetId:null,autoTargetType:null,nextAutoScanAt:now,block:[x,y,z],origin:[x+.5,y+GO,z+.5],forward:[fx,fz],right:[fz,-fx],yaw,targetYaw:yaw,lastYawTime:now,elevation:DEF,targetElevation:DEF,lastElevationTime:now,pendingFire:null,recoil:0,groundRecoil:0,breechDrop:0,trayTravel:0,trayDrop:0,rammerTravel:0,shellVisible:false,shellForward:0,reloadStart:0,fireTick:0,reloadUntil:0,parts:[],buildIndex:0};
 model(g);G[id]=g;IDS.push(id);BQ.push(id);
 let l=m==="playerTraining"?"PLAYER TRAINING":m.toUpperCase();
 msg(owner,(g.auto?"AUTO ":"")+"2A65 Msta-B"+(g.auto?" ["+l+"]":"")+" deployed | "+g.parts.length+" meshes","green")
}

function push(g,p){g.parts.push(p)}
function S(g,x,y,z,w,h,d,c,rx=0,ry=0,rz=0){push(g,{group:"static",x,y,z,width:w,height:h,depth:d,color:c,rx,ry,rz,meshId:null})}
function B(g,x1,y1,z1,x2,y2,z2,w,h,c){let x=x2-x1,y=y2-y1,z=z2-z1;push(g,{group:"beam",x1,y1,z1,x2,y2,z2,width:w,height:h,depth:Math.sqrt(x*x+y*y+z*z),color:c,meshId:null})}
function E(g,x,y,d,w,h,z,c,r=0,k="none"){push(g,{group:"elevating",x,y,distance:d,width:w,height:h,depth:z,color:c,recoilFactor:r,reloadKind:k,meshId:null})}

function buildQ(){
 let g=gun(BQ[0]);
 if(!g){BQ.shift();return}
 let n=0;
 while(g.buildIndex<g.parts.length&&n<BB){
  if(makeMesh(g,g.buildIndex)){g.buildIndex++;n++}
  else{BQ.shift();msg(g.ownerId,"Bloxd mesh budget stopped creation at "+g.buildIndex+"/"+g.parts.length,"orange");return}
 }
 if(g.buildIndex>=g.parts.length){BQ.shift();msg(g.ownerId,"2A65 Msta-B complete | "+g.parts.length+" meshes","green")}
}

function makeMesh(g,i){
 let p=g.parts[i],e=null;
 if(!p)return false;
 try{e=api.attemptCreateMeshEntity("Box",{width:p.width,height:p.height,depth:p.depth,diffuseColor:p.color,backFaceCulling:true},"")}catch{}
 if(!e)return false;
 p.meshId=e;place(g,p);return true
}

function place(g,p){
 if(!p.meshId)return;
 if(p.group==="elevating"){placeE(g,p);return}
 if(p.group==="beam"){placeB(g,p);return}
 let w=world(g,p.x,p.y,p.z);
 try{api.setPosition(p.meshId,w[0],w[1],w[2]);api.setEntityRotation(p.meshId,p.rx,g.yaw+p.ry,p.rz)}catch{}
}

function placeB(g,p){
 let a=world(g,p.x1,p.y1,p.z1),b=world(g,p.x2,p.y2,p.z2),x=b[0]-a[0],y=b[1]-a[1],z=b[2]-a[2],h=Math.sqrt(x*x+z*z);
 try{api.setPosition(p.meshId,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);api.setEntityRotation(p.meshId,-Math.atan2(y,h),Math.atan2(x,z),0)}catch{}
}

function placeE(g,p){
 let d=p.distance-g.recoil*p.recoilFactor,y=p.y,k=p.reloadKind;
 if(k==="breech")y-=g.breechDrop;
 if(k==="tray"){d-=g.trayTravel;y-=g.trayDrop}
 if(k==="rammer"){d-=g.trayTravel+g.rammerTravel;y-=g.trayDrop}
 if(k==="carrier"){d-=g.trayTravel+g.rammerTravel*.3;y-=g.trayDrop*.75}
 if(k==="shell"){
  if(!g.shellVisible)y-=8;
  else{d-=g.trayTravel;d+=g.shellForward;y-=g.trayDrop}
 }
 let ce=Math.cos(g.elevation),se=Math.sin(g.elevation),q=world(g,PX,PY,PZ),ax=g.forward[0]*ce,ay=se,az=g.forward[1]*ce,ux=-g.forward[0]*se,uy=ce,uz=-g.forward[1]*se;
 let x=q[0]+ax*d+g.right[0]*p.x+ux*y,wy=q[1]+ay*d+uy*y,z=q[2]+az*d+g.right[1]*p.x+uz*y;
 try{api.setPosition(p.meshId,x,wy,z);api.setEntityRotation(p.meshId,Math.atan2(ay,Math.sqrt(ax*ax+az*az)),Math.atan2(ax,az),0)}catch{}
}

function updateE(g){for(let p of g.parts)if(p.group==="elevating"&&p.meshId)placeE(g,p)}
function updateAll(g){for(let p of g.parts)if(p.meshId)place(g,p)}
function world(g,x,y,z){return[g.origin[0]-g.forward[0]*g.groundRecoil+g.right[0]*x+g.forward[0]*z,g.origin[1]+y,g.origin[2]-g.forward[1]*g.groundRecoil+g.right[1]*x+g.forward[1]*z]}

function setYaw(g,y){
 g.yaw=na(y);g.forward[0]=Math.sin(g.yaw);g.forward[1]=Math.cos(g.yaw);g.right[0]=Math.cos(g.yaw);g.right[1]=-Math.sin(g.yaw)
}

function yawTick(){
 let n=api.now();
 for(let id of IDS){
  let g=G[id];if(!g||!g.auto)continue;
  let dt=clamp((n-g.lastYawTime)/1000,0,.1);g.lastYawTime=n;
  let d=ad(g.targetYaw,g.yaw);if(Math.abs(d)<.0001)continue;
  let m=YS*dt;
  setYaw(g,Math.abs(d)<=m?g.targetYaw:g.yaw+(d>0?m:-m));updateAll(g)
 }
}

function elevTick(){
 let n=api.now();
 for(let id of IDS){
  let g=G[id];if(!g)continue;
  let dt=clamp((n-g.lastElevationTime)/1000,0,.1);g.lastElevationTime=n;
  let d=g.targetElevation-g.elevation;
  if(Math.abs(d)>.00001){
   let m=EV*dt;
   g.elevation=Math.abs(d)<=m?g.targetElevation:g.elevation+(d>0?m:-m);
   updateE(g)
  }
  if(g.pendingFire&&Math.abs(g.targetElevation-g.elevation)<=ET&&g.fireTick===0&&n>=g.reloadUntil){
   let p=g.pendingFire;g.pendingFire=null;execute(g,p)
  }
 }
}

function reloadTick(){
 let n=api.now();
 for(let id of IDS){
  let g=G[id];if(!g||g.reloadStart<=0)continue;
  let e=n-g.reloadStart,b=0,t=0,dy=0,r=0,sv=false,sf=0;
  if(e<500){}
  else if(e<1050)b=BD*ss((e-500)/550);
  else if(e<1650){b=BD;let q=ss((e-1050)/600);t=TT*q;dy=TD*q}
  else if(e<2200){b=BD;t=TT;dy=TD;r=RR*ss((e-1650)/550)}
  else if(e<3050){b=BD;t=TT;dy=TD;sv=true;sf=SC*ss((e-2200)/850);r=Math.max(0,RR-sf)}
  else if(e<3300){b=BD;t=TT;dy=TD;sv=true;sf=SC;r=Math.max(0,RR-SC)}
  else if(e<3800){b=BD;t=TT;dy=TD;r=Math.max(0,RR-SC)}
  else if(e<4550){b=BD;let q=ss((e-3800)/750);t=TT*(1-q);dy=TD*(1-q);r=Math.max(0,(RR-SC)*(1-q))}
  else if(e<5200)b=BD*(1-ss((e-4550)/650));
  let ch=Math.abs(b-g.breechDrop)>.001||Math.abs(t-g.trayTravel)>.001||Math.abs(dy-g.trayDrop)>.001||Math.abs(r-g.rammerTravel)>.001||Math.abs(sf-g.shellForward)>.001||sv!==g.shellVisible;
  if(ch){g.breechDrop=b;g.trayTravel=t;g.trayDrop=dy;g.rammerTravel=r;g.shellVisible=sv;g.shellForward=sf;updateE(g)}
  if(e>=RELOAD){g.reloadStart=0;g.breechDrop=g.trayTravel=g.trayDrop=g.rammerTravel=g.shellForward=0;g.shellVisible=false;updateE(g)}
 }
}

function nearest(p,r){
 let q=null;try{q=api.getPosition(p)}catch{}if(!q)return null;
 let best=null,bd=r;
 for(let id of IDS){
  let g=G[id];if(!g)continue;
  let x=q[0]-g.origin[0],y=q[1]-g.origin[1],z=q[2]-g.origin[2],d=Math.sqrt(x*x+y*y+z*z);
  if(d<=bd){bd=d;best=g}
 }
 return best
}

function profile(d){for(let i=0;i<RP.length;i++)if(d<=RP[i].max)return{rangeNo:i+1,max:RP[i].max,speed:RP[i].speed,elevation:RP[i].elevation};return null}

function smoothElev(d){
 let a=RP,f=a[0];
 if(d<=f.max){let t=ss((d-MR)/(f.max-MR));return 5+(f.elevation-5)*t}
 for(let i=1;i<a.length;i++)if(d<=a[i].max){let p=a[i-1],c=a[i],t=ss((d-p.max)/(c.max-p.max));return p.elevation+(c.elevation-p.elevation)*t}
 return a[a.length-1].elevation
}

function calcElev(g,t,d){
 let p=world(g,PX,PY,PZ),h=t[1]-p[1],e=smoothElev(d)*Math.PI/180+Math.atan2(h,Math.max(1,d))*.82;
 return clamp(e,MIN,MAX)
}

function queueFire(g,p,t){
 let n=api.now();
 if(g.buildIndex<g.parts.length)return"building";
 if(g.pendingFire)return"busy";
 if(g.fireTick>0||n<g.reloadUntil)return"reload";
 let x=t[0]-g.origin[0],z=t[2]-g.origin[2],d=Math.sqrt(x*x+z*z);
 if(d<MR)return"close";
 let pr=profile(d);if(!pr)return"range";
 let dot=clamp(g.forward[0]*x/d+g.forward[1]*z/d,-1,1);
 if(Math.acos(dot)>ARC)return"wrongDirection";
 let e=calcElev(g,t,d);g.targetElevation=e;
 g.pendingFire={playerId:p,attackerId:p,target:[...t],profile:pr,distance:d,nonPhysical:false,silent:false};
 msg(p,"Aiming | "+Math.round(e*180/Math.PI)+" degrees","yellow");
 return"queued"
}

function begin(g){
 let n=api.now();
 g.fireTick=1;g.recoil=g.groundRecoil=g.breechDrop=g.trayTravel=g.trayDrop=g.rammerTravel=g.shellForward=0;g.shellVisible=false;g.reloadStart=n;g.reloadUntil=n+RELOAD;
 if(FQ.indexOf(g.id)<0)FQ.push(g.id);
 muzzle(g);cannonSound(g)
}

function visualFire(g,p){
 let n=api.now();
 if(g.buildIndex<g.parts.length){msg(p,"Artillery is still assembling.","orange");return}
 if(g.pendingFire){msg(p,"Artillery is already aiming.","orange");return}
 if(g.fireTick>0||n<g.reloadUntil){msg(p,"Artillery is reloading.","orange");return}
 begin(g)
}

function execute(g,p){
 begin(g);schedule(g,p);
 if(!p.silent)msg(p.playerId,"FIRE | "+Math.round(p.distance)+" blocks | Impact in "+(p.distance/p.profile.speed).toFixed(1)+"s | Reload 6.5s","yellow")
}

function cannonSound(g){
 let o={playerIdOrPos:g.origin,maxHearDist:500,refDistance:70};
 try{api.broadcastSound("cannonFire1",1,.69,o)}catch{}
 try{api.broadcastSound("cannonFire2",1,.82,o)}catch{}
 try{api.broadcastSound("cannonFire3",1,.62,o)}catch{}
}

function schedule(g,p){
 SQ.push({gunId:g.id,attackerId:p.attackerId,nonPhysical:p.nonPhysical===true,target:[...p.target],impactAt:api.now()+Math.max(300,p.distance/p.profile.speed*1000)})
}

function fireAnim(){
 for(let i=FQ.length-1;i>=0;i--){
  let g=gun(FQ[i]);if(!g){FQ.splice(i,1);continue}
  let t=g.fireTick;
  g.recoil=t<=3?BR*t/3:t<=15?BR*(1-(t-3)/12):0;
  let old=g.groundRecoil,n=0;
  if(t<=2)n=GR*t/2;else if(t<=4)n=GR;else if(t<=12)n=GR*(1-(t-4)/8);
  n=Math.round(n*1000)/1000;g.groundRecoil=n;
  if(Math.abs(old-n)>.002)updateAll(g);else updateE(g);
  if(++g.fireTick>17){g.fireTick=0;g.recoil=g.groundRecoil=0;updateAll(g);FQ.splice(i,1)}
 }
}

function muzzlePos(g){
 let d=6.31-g.recoil,c=Math.cos(g.elevation),s=Math.sin(g.elevation),p=world(g,PX,PY,PZ),x=g.forward[0]*c,z=g.forward[1]*c;
 return{pos:[p[0]+x*d,p[1]+s*d,p[2]+z*d],dir:[x,s,z]}
}

function part(o){try{api.playParticleEffect(o)}catch{}}

function muzzle(g){
 let q=muzzlePos(g),p=q.pos,d=q.dir,r=[g.right[0],0,g.right[1]];
 part({texture:"critical_hit",pos1:[p[0]-.12,p[1]-.12,p[2]-.12],pos2:[p[0]+.12,p[1]+.12,p[2]+.12],dir1:[d[0]*3-r[0]*1.15,d[1]*3-.25,d[2]*3-r[2]*1.15],dir2:[d[0]*7.2+r[0]*1.15,d[1]*7.2+1.4,d[2]*7.2+r[2]*1.15],minLifeTime:.04,maxLifeTime:.19,minEmitPower:2.8,maxEmitPower:7,minSize:.2,maxSize:.92,manualEmitCount:58,gravity:[0,-1.8,0],colorGradients:[{timeFraction:0,minColor:[255,255,215,1],maxColor:[255,250,150,1]},{timeFraction:.22,minColor:[255,225,60,1],maxColor:[255,180,25,1]},{timeFraction:.55,minColor:[255,75,5,.92],maxColor:[255,135,15,.88]},{timeFraction:1,minColor:[120,35,5,0],maxColor:[180,60,8,0]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1.65}],blendMode:1,hideDist:220});
 part({texture:"square_particle",pos1:[p[0]-.18,p[1]-.18,p[2]-.18],pos2:[p[0]+.18,p[1]+.18,p[2]+.18],dir1:[-2.8,-1.6,-2.8],dir2:[2.8,2.2,2.8],minLifeTime:.025,maxLifeTime:.085,minEmitPower:3,maxEmitPower:6.5,minSize:.28,maxSize:1.25,manualEmitCount:22,gravity:[0,0,0],colorGradients:[{timeFraction:0,minColor:[255,255,235,1],maxColor:[255,245,150,1]},{timeFraction:.55,minColor:[255,180,40,.75],maxColor:[255,120,15,.65]},{timeFraction:1,minColor:[255,80,5,0],maxColor:[255,120,10,0]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1.3}],blendMode:1,hideDist:220});
 part({texture:"soul_0",pos1:[p[0]-.17,p[1]-.1,p[2]-.17],pos2:[p[0]+.17,p[1]+.2,p[2]+.17],dir1:[d[0]*.7-r[0]*.7,.35,d[2]*.7-r[2]*.7],dir2:[d[0]*2.5+r[0]*.7,1.8,d[2]*2.5+r[2]*.7],minLifeTime:.14,maxLifeTime:.42,minEmitPower:.5,maxEmitPower:1.8,minSize:.24,maxSize:.72,manualEmitCount:20,gravity:[0,.65,0],colorGradients:[{timeFraction:0,minColor:[165,160,145,.78],maxColor:[205,195,170,.72]},{timeFraction:.5,minColor:[90,88,82,.45],maxColor:[130,125,110,.38]},{timeFraction:1,minColor:[45,45,45,0],maxColor:[70,70,65,0]}],velocityGradients:[{timeFraction:0,factor:.65,factor2:1}],blendMode:1,hideDist:220})
}

function alive(e){try{return api.getHealth(e)>0}catch{return false}}

function targetData(g,e,type){
 if(e==null||(type==="player"&&e===g.ownerId)||!alive(e))return null;
 let p=null;try{p=api.getPosition(e)}catch{}if(!p)return null;
 let x=p[0]-g.origin[0],y=p[1]-g.origin[1],z=p[2]-g.origin[2],h=Math.sqrt(x*x+z*z);
 if(h<MR||h>AR)return null;
 let pr=profile(h);if(!pr)return null;
 return{id:e,type,pos:[...p],distance:Math.sqrt(x*x+y*y+z*z),horizontalDistance:h,profile:pr,elevation:calcElev(g,p,h),yaw:Math.atan2(x,z)}
}

function findTarget(g){
 let best=null,dist=AR+1;
 if(g.autoMode==="player"||g.autoMode==="playerTraining"||g.autoMode==="all"){
  let a=[];try{a=api.getPlayerIds()}catch{}
  for(let e of a){if(e===g.ownerId)continue;let d=targetData(g,e,"player");if(d&&d.distance<dist){best=d;dist=d.distance}}
 }
 if(g.autoMode==="mob"||g.autoMode==="all"){
  let a=[];try{a=api.getMobIds()}catch{}
  for(let e of a){let d=targetData(g,e,"mob");if(d&&d.distance<dist){best=d;dist=d.distance}}
 }
 return best
}

function autoTargets(){
 let n=api.now();
 for(let id of IDS){
  let g=G[id];if(!g||!g.auto)continue;
  if(n>=g.nextAutoScanAt){let t=findTarget(g);g.autoTargetId=t?t.id:null;g.autoTargetType=t?t.type:null;g.nextAutoScanAt=n+SCAN}
  if(g.autoTargetId==null||!g.autoTargetType)continue;
  let d=targetData(g,g.autoTargetId,g.autoTargetType);
  if(!d){g.autoTargetId=g.autoTargetType=null;g.nextAutoScanAt=n;continue}
  g.targetYaw=d.yaw;g.targetElevation=d.elevation
 }
}

function autoFire(){
 let n=api.now();
 for(let id of IDS){
  let g=G[id];
  if(!g||!g.auto||g.autoTargetId==null||!g.autoTargetType)continue;
  if(g.buildIndex<g.parts.length||g.pendingFire||g.fireTick>0||n<g.reloadUntil)continue;
  let d=targetData(g,g.autoTargetId,g.autoTargetType);
  if(!d){g.autoTargetId=g.autoTargetType=null;g.nextAutoScanAt=n;continue}
  g.targetYaw=d.yaw;g.targetElevation=d.elevation;
  if(Math.abs(ad(g.targetYaw,g.yaw))>YT||Math.abs(g.targetElevation-g.elevation)>ET)continue;
  execute(g,{playerId:g.ownerId,attackerId:g.ownerId,target:[...d.pos],profile:d.profile,distance:d.horizontalDistance,nonPhysical:g.autoMode==="playerTraining",silent:true})
 }
}

function shotTick(){
 let n=api.now();
 for(let i=SQ.length-1;i>=0;i--){
  let s=SQ[i];if(!s||!gun(s.gunId)){SQ.splice(i,1);continue}
  if(n<s.impactAt)continue;
  explode(s);SQ.splice(i,1)
 }
}

function explode(s){
 explosionFX(s.target);
 if(s.nonPhysical)return;
 damage(s,s.target);crater(s.target)
}

function explosionFX(p){
 try{api.broadcastSound("cannonFire2",1,.58,{playerIdOrPos:p,maxHearDist:260,refDistance:36})}catch{}
 part({texture:"critical_hit",pos1:[p[0]-2,p[1]-1,p[2]-2],pos2:[p[0]+2,p[1]+2,p[2]+2],dir1:[-9,-1,-9],dir2:[9,10,9],minLifeTime:.035,maxLifeTime:.18,minEmitPower:2.5,maxEmitPower:8,minSize:.42,maxSize:2.7,manualEmitCount:96,gravity:[0,-3.8,0],colorGradients:[{timeFraction:0,minColor:[255,255,220,1],maxColor:[255,250,150,1]},{timeFraction:.18,minColor:[255,215,60,1],maxColor:[255,175,25,1]},{timeFraction:.42,minColor:[255,110,8,.97],maxColor:[255,155,15,.95]},{timeFraction:.68,minColor:[210,55,6,.75],maxColor:[255,80,8,.72]},{timeFraction:1,minColor:[55,25,15,0],maxColor:[90,35,15,0]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1.55}],blendMode:1,hideDist:220})
}

function damage(s,p){
 let a=[];try{a=api.getPlayerIds().concat(api.getMobIds())}catch{}
 let who=null;
 try{if(api.getPlayerIds().indexOf(s.attackerId)!==-1)who={lifeformId:s.attackerId,withItem:"Super RPG"}}catch{}
 for(let e of a){
  let q=null;try{q=api.getPosition(e)}catch{}if(!q)continue;
  let x=q[0]-p[0],y=q[1]-p[1],z=q[2]-p[2],d=Math.sqrt(x*x+y*y+z*z);if(d>XR)continue;
  let f=Math.sqrt(Math.max(0,1-d/XR)),dm=Math.round(XMIN+(XMAX-XMIN)*f);
  try{api.applyHealthChange(e,-dm,who,true)}catch{continue}
  let sd=Math.max(.5,d),k=XKB*f;
  try{api.applyImpulse(e,x/sd*k,y/sd*k+k*.48,z/sd*k)}catch{}
 }
}

function crater(p){
 let r=XBR,n=Math.ceil(r),cx=Math.floor(p[0]),cy=Math.floor(p[1]-1),cz=Math.floor(p[2]);
 for(let x=-n;x<=n;x++)for(let y=-n;y<=n;y++)for(let z=-n;z<=n;z++){
  let yy=y*1.17,d=Math.sqrt(x*x+yy*yy+z*z);if(d>r)continue;
  if(d>r*.76){let e=(r-d)/(r*.24);if(Math.random()>.38+e*.62)continue}
  let X=cx+x,Y=cy+y,Z=cz+z,k=X+","+Y+","+Z;if(DS[k])continue;
  DS[k]=true;DQ.push({x:X,y:Y,z:Z,key:k})
 }
}

function blockTick(){
 let n=0;
 while(DQ.length&&n<BPT){
  let e=DQ.pop();if(!e)continue;delete DS[e.key];
  let b=null;try{b=api.getBlock(e.x,e.y,e.z)}catch{}
  if(!b||b==="Air"||b==="Bedrock")continue;
  if(b==="Green Concrete Slab")removeAt(e.x,e.y,e.z);
  try{api.setBlock(e.x,e.y,e.z,"Air");n++}catch{}
 }
}

function wheel(g,s){
 let x=s*1.92,y=.76,z=0,N=12,r=.57,t=.2,l=2*r*Math.sin(Math.PI/N)*.94;
 for(let i=0;i<N;i++){let a=Math.PI*2*i/N;S(g,x,y+Math.cos(a)*r,z+Math.sin(a)*r,.5,t,l,i%2?C.ta:C.t,a)}
 N=8;r=.29;t=.13;l=2*r*Math.sin(Math.PI/N)*.92;
 for(let i=0;i<N;i++){let a=Math.PI*2*i/N;S(g,x,y+Math.cos(a)*r,z+Math.sin(a)*r,.47,t,l,C.vd,a)}
 S(g,x+s*.29,y,z,.08,.23,.23,C.h);S(g,x+s*.34,y,z,.06,.12,.12,C.ml)
}

function trail(g,s){
 B(g,s*.52,.59,-.46,s*.98,.4,-2.18,.35,.24,C.g);
 B(g,s*.98,.4,-2.18,s*1.52,.24,-3.94,.37,.24,C.d);
 B(g,s*1.52,.24,-3.94,s*1.94,.13,-5.02,.4,.25,C.g);
 B(g,s*.67,.78,-1.1,s*1.48,.44,-3.7,.11,.09,C.l);
 S(g,s*.6,.6,-.57,.48,.39,.55,C.d);
 S(g,s*2.01,.06,-5.3,1.02,.17,.68,C.d,.05);
 for(let i=-1;i<=1;i++)S(g,s*2.01+i*.28,-.03,-5.65,.16,.27,.28,C.m,.25)
}

function hand(g,x,y,z,r){
 for(let i=0;i<6;i++){let a=Math.PI*2*i/6;S(g,x,y+Math.cos(a)*r,z+Math.sin(a)*r,.09,.09,.23,C.m,a)}
 S(g,x,y,z,.22,.22,.22,C.d)
}

function model(g){
 S(g,0,.66,0,4.02,.23,.3,C.d);S(g,0,.83,.07,1.82,.38,1.12,C.g);S(g,0,1.07,.27,1.31,.38,.94,C.l);S(g,0,1.3,.37,.92,.36,.78,C.d);
 S(g,-.59,1.28,.36,.22,.55,.7,C.g);S(g,.59,1.28,.36,.22,.55,.7,C.g);
 S(g,0,.44,-.37,2.02,.17,.38,C.d);S(g,0,.55,.71,2.92,.17,.3,C.g);
 S(g,-1.46,.85,0,.38,.55,.68,C.d);S(g,1.46,.85,0,.38,.55,.68,C.d);
 wheel(g,-1);wheel(g,1);
 S(g,-.68,1.98,.93,1.04,1.36,.11,C.g);S(g,.68,1.98,.93,1.04,1.36,.11,C.g);
 S(g,-1.53,1.91,.91,.65,1.2,.11,C.l,0,-.07);S(g,1.53,1.91,.91,.65,1.2,.11,C.l,0,.07);
 S(g,-1.92,1.67,.91,.17,.58,.11,C.d);S(g,1.92,1.67,.91,.17,.58,.11,C.d);
 S(g,-.76,1.58,.69,.28,.92,.36,C.d);S(g,.76,1.58,.69,.28,.92,.36,C.d);
 S(g,0,1.1,.53,1.68,.22,.42,C.d);S(g,0,1.35,.7,1.72,.18,.28,C.vd);
 trail(g,-1);trail(g,1);
 B(g,-.73,.4,-1.16,.73,.4,-1.16,.14,.12,C.d);B(g,-1.18,.24,-3.18,1.18,.24,-3.18,.11,.1,C.d);
 S(g,-.41,1.68,.42,.18,.31,1.09,C.l);S(g,.41,1.68,.42,.18,.31,1.09,C.l);
 S(g,-.41,1.52,.42,.11,.15,.96,C.m);S(g,.41,1.52,.42,.11,.15,.96,C.m);
 S(g,-.86,1.36,.03,.14,.14,.66,C.d);S(g,.86,1.36,.03,.14,.14,.66,C.d);
 hand(g,-.93,1.56,-.1,.35);hand(g,.93,1.47,-.12,.31);
 S(g,-.7,.45,.75,.22,.22,.57,C.d);S(g,.7,.45,.75,.22,.22,.57,C.d);
 E(g,0,0,-.74,.76,.6,.72,C.d,1);
 E(g,0,0,-1.15,.5,.46,.18,C.m,1,"breech");
 E(g,0,0,-.27,.64,.52,.3,C.g,1);
 E(g,0,.26,-.52,.48,.14,.54,C.l,1);
 E(g,0,-.25,-.52,.46,.13,.54,C.m,1);
 E(g,0,-.08,-1.47,.62,.08,.95,C.m,0,"tray");
 E(g,-.23,-.13,-1.66,.08,.1,1.22,C.d,0,"tray");
 E(g,.23,-.13,-1.66,.08,.1,1.22,C.d,0,"tray");
 E(g,0,.08,-1.7,.1,.1,1.2,C.ml,0,"rammer");
 E(g,0,.08,-1.12,.32,.3,.16,C.m,0,"rammer");
 E(g,0,-.04,-2.15,.48,.34,.32,C.d,0,"carrier");
 E(g,0,.13,-1.72,.24,.24,.54,C.sb,0,"shell");
 E(g,0,.13,-1.405,.27,.27,.09,C.sg,0,"shell");
 E(g,0,.13,-1.3,.17,.17,.16,C.st,0,"shell");
 E(g,-.31,.29,.43,.15,.15,1.42,C.l);E(g,.31,.29,.43,.15,.15,1.42,C.l);
 E(g,-.31,.08,.43,.1,.1,1.34,C.m);E(g,.31,.08,.43,.1,.1,1.34,C.m);
 E(g,0,0,.42,.48,.48,1.22,C.g,1);E(g,0,0,1.08,.58,.58,.14,C.e,1);
 E(g,0,0,1.88,.32,.32,1.48,C.d,1);E(g,0,0,2.65,.4,.4,.14,C.e,1);
 E(g,0,0,3.6,.28,.28,1.76,C.d,1);E(g,0,0,4.52,.36,.36,.14,C.e,1);
 E(g,0,0,4.95,.26,.26,.74,C.d,1);E(g,0,0,5.34,.4,.4,.16,C.g,1);
 E(g,0,0,5.78,.56,.42,.74,C.d,1);E(g,0,0,6.17,.6,.44,.1,C.m,1)
}

function removeAt(x,y,z){
 for(let i=IDS.length-1;i>=0;i--){
  let id=IDS[i],g=G[id];if(!g)continue;
  if(g.block[0]===x&&g.block[1]===y&&g.block[2]===z){delGun(g);IDS.splice(i,1);delete G[id]}
 }
}

function delGun(g){
 g.pendingFire=g.autoTargetId=g.autoTargetType=null;
 for(let p of g.parts)if(p.meshId){try{api.deleteMeshEntity(p.meshId)}catch{}p.meshId=null}
 for(let i=SQ.length-1;i>=0;i--)if(SQ[i].gunId===g.id)SQ.splice(i,1);
 for(let i=BQ.length-1;i>=0;i--)if(BQ[i]===g.id)BQ.splice(i,1);
 for(let i=FQ.length-1;i>=0;i--)if(FQ[i]===g.id)FQ.splice(i,1)
}
