/*  🍗  Hunger System – Made by Great Jake  
     (steady Slowness, slower decay, edible foods, micro-decay every 10 ticks, eat on alt-action)  */

const MAX_HUNGER       = 100;
const DECAY_EVERY_TICK = 20 * 20;   // drain once per minute
const JUMP_COST        = 0.1;
const STARVE_THRESH    = 4;         // Slowness kicks in at 4 or less

// ── food values ─────────────────────────────────────────────
const FOOD_VALUES = {
  "Apple": 4, "Bread": 5, "Cornbread": 10, "Bowl of Rice": 7,
  "Mushroom Soup": 5, "Cooked Porkchop": 7, "Steak": 7, "Cooked Mutton": 6,
  "Cooked Venison": 7, "Plum": 5, "Pumpkin Pie": 10, "Pear": 6, "Banana": 8,
  "Corn": 6, "Bowl of Cranberries": 2, "Watermelon Slice": 6, "Melon Slice": 6,
  "Gold Watermelon Slice": 9, "Gold Melon Slice": 9, "Cherry": 5, "Chili Pepper": 3,
  "Cracked Coconut": 6, "Carrot": 5, "Potato": 2, "Baked Potato": 4, "Beetroot": 5,
  "Rotten Brain": 1, "Oats": 4, "Caught Fish": 3, "Cheese": 6, "Yoghurt": 5,
  "Porridge": 6, "Fish Fillet": 7,
};

/* ── shared state ─────────────────────────────────────────── */
globalThis.data ??= {};   // { hunger, t, microTick, slow }

function setHunger(id, newH) {
  const d = data[id]; if (!d) return;

  // round to 0.01 for visible progress bar updates
  d.hunger = Math.max(0, Math.min(MAX_HUNGER, Math.round(newH * 100) / 100));
  api.progressBarUpdate(id, d.hunger / MAX_HUNGER, 200);

  /* --- steady Slowness handling --- */
  if (d.hunger <= STARVE_THRESH) {
    if (!d.slow) {
      api.applyEffect(id, "Slowness", null, {});
      api.applyEffect(id, "Poisoned", null, {});
      d.slow = true;
    }
  } else if (d.slow) {
    api.removeEffect(id, "Slowness");
    api.removeEffect(id, "Poisoned");
    d.slow = false;
  }
}

/* ── callbacks ────────────────────────────────────────────── */
onPlayerJoin = id => {
  data[id] = { hunger: MAX_HUNGER, t: 0, microTick: 0, slow: false };
  api.progressBarUpdate(id, 1, 0);
};

onPlayerLeave = id => delete data[id];

tick = () => {
  for (const id of api.getPlayerIds()) {
    const d = data[id]; if (!d) continue;

    // --- slow decay once per DECAY_EVERY_TICK ---
    if (++d.t >= DECAY_EVERY_TICK) { d.t = 0; setHunger(id, d.hunger - 1); }

    // --- micro-decay every 10 ticks ---
    if (++d.microTick >= 10) { d.microTick = 0; setHunger(id, d.hunger - 0.01); }
  }
};

onPlayerJump = id => setHunger(id, data[id].hunger - JUMP_COST);

/* --- eat on alt-action --- */
onPlayerAttemptAltAction = id => {
  const held = api.getHeldItem(id);                     // {name, amount}
  const gain = FOOD_VALUES[held?.name];
  if (!gain || data[id].hunger >= MAX_HUNGER) return;

  const slot = api.getSelectedInventorySlotI(id);
  const left = held.amount - 1;
  if (left <= 0)  api.setItemSlot(id, slot, "Air");     // remove item
  else            api.setItemSlot(id, slot, held.name, left);

  setHunger(id, data[id].hunger + gain);
};
