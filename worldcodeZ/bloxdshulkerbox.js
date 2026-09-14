const shulkerbox = [84,104,105,115,32,87,111,114,108,100,32,73,115,32,76,111,97,100,101,100,32,87,105,116,104,32,120,95,68,114,120,116,104,39,115,32,83,104,117,108,107,101,114,32,66,111,120,32,67,111,100,101,33];

function onPlayerJoin(e){
  api.editItemCraftingRecipes(e,"Chest",[{requires:[{items:["Iron Bar"],amt:9},{items:["Chest"],amt:1},{items:["Knight Heart"],amt:2}],produces:1,station:"Workbench"}]);
  api.sendMessage(e,[{str: String.fromCharCode(...shulkerbox) + " Craft It Using 9 Iron Bar, 1 Chest & 2 Knight Heart!",style:{color:"white",fontWeight:"bold"}},{str:"\n\nInfo:",style:{fontWeight:"bold",color:"yellow",fontSize:"18px"}},{str:"\nHave Fun, Craft It then put items then break it to save your items",style:{color:"gold"}}]);
}

function shulkerTooltip(n){
  if (!Array.isArray(n)) return "Empty";
  const l = n.filter((x => null != x));
  const t = n.filter((x => "empty" == x)).length > 0 || n.filter((x => null == x)).length >= 36;
  const e = l.map((x => (null == x.amount ? 1 : x.amount) + "x " + x.name)).splice(0,5);
  const o = l.length - e.length;
  return t ? "Empty" : l.length > 5 ? e.join("\n") + "\nAnd " + o + " more." : e.join("\n");
}

function onPlayerChangeBlock(t,e,s,i,r,a,o,n,c){
  if("Air" != r && r.includes("Chest")) {
    let blockData = api.getBlockData(e,s,i);
    let chestItems = ["empty"];
    
    if (blockData && blockData.persisted && blockData.persisted.chestStr) {
      try {
        chestItems = typeof blockData.persisted.chestStr === "string" 
          ? JSON.parse(blockData.persisted.chestStr) 
          : blockData.persisted.chestStr;
      } catch(err) {
        chestItems = ["empty"];
      }
    }

    api.createItemDrop(e+.5, s+.5, i+.5, "White Paintball", 1, !1, {
      customAttributes: blockData,
      customDescription: shulkerTooltip(chestItems),
      customDisplayName: "Chest"
    });

    const emptyArray = Array(36).fill(null);
    api.setBlockData(e, s, i, {
      persisted: {
        chestStr: JSON.stringify(emptyArray)
      }
    });

    return "preventDrop";
  }

  if("Air" != a && a.includes("Chest")) {
    let heldItem = api.getHeldItem(t);
    if (heldItem && heldItem.attributes && heldItem.attributes.customAttributes) {
      api.setBlockData(e, s, i, { persisted: heldItem.attributes.customAttributes.persisted });
    }
  }
}

function onPlayerAttemptOpenChest(e,t,s,a,p,i){
  let data = api.getBlockData(t,s,a);
  if(i && data && data.persisted && 0 != data.persisted.passkey) {
    api.setBlockData(t,s,a,{persisted:{passkey:0}});
  }
}

function onPlayerAttemptAltAction(t,e,a,i,l){
  let heldItem = api.getHeldItem(t);
  if(null != heldItem && "White Paintball" == heldItem.name && api.getPlayerTargetInfo(t)){
    let target = api.getPlayerTargetInfo(t);
    api.setBlock(...target.adjacent, "Chest");
    if (heldItem.attributes && heldItem.attributes.customAttributes) {
      api.setBlockData(target.adjacent[0], target.adjacent[1], target.adjacent[2], {
        persisted: heldItem.attributes.customAttributes.persisted
      });
    }
    api.setItemSlot(t, api.getSelectedInventorySlotI(t), "Air");
  }
}
