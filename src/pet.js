/* ===== Estado do bichinho, economia e simulacao ===== */
const FOODS = {
  queijo:  {name:'Queijo',   price:4,  hunger:30, fun:0,  w:3,  desc:'O clássico. Mata a fome.'},
  semente: {name:'Semente',  price:2,  hunger:15, fun:0,  w:1,  desc:'Lanchinho leve e barato.'},
  biscoito:{name:'Biscoito', price:5,  hunger:20, fun:8,  w:4,  desc:'Crocante. Ele adora.'},
  morango: {name:'Morango',  price:6,  hunger:20, fun:5,  w:2,  hygiene:3, desc:'Doce e fresquinho.'},
  bolo:    {name:'Bolo',     price:12, hunger:45, fun:20, w:8,  desc:'Festa! Mas engorda.'},
  sopa:    {name:'Sopa',     price:8,  hunger:25, fun:0,  w:2,  energy:15, desc:'Quentinha. Dá energia.'}
};
const SAVE_KEY = 'ratinho-virtual.save.v1';
const HOUR = 3600000;
const clamp = (v, lo, hi) => Math.max(lo == null ? 0 : lo, Math.min(hi == null ? 100 : hi, v));

function newState(){
  return {
    v:1, name:'', started:false, born:0, last:Date.now(),
    hunger:80, energy:80, hygiene:80, fun:80,
    sick:false, sickAcc:0, sleeping:false,
    poops:0, nextPoop:6, weight:30, coins:20, age:0,
    stage:'baby', form:'', care:{hunger:0, energy:0, hygiene:0, fun:0, t:0},
    inv:{queijo:3, semente:3},
    hats:[], hat:'', outfits:[], outfit:'',
    furn:{}, decor:[], paper:'', skins:['bege'], skin:'bege', room:0,
    stats:{fed:0, played:0, baths:0, meds:0, pets:0, evolutions:0},
    best:{}, sound:true, pending:[]
  };
}
let S = newState();

function save(){
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}
function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (!d || d.v !== 1) return false;
    S = Object.assign(newState(), d);
    S.care = Object.assign({hunger:0, energy:0, hygiene:0, fun:0, t:0}, d.care || {});
    S.stats = Object.assign(newState().stats, d.stats || {});
    S.inv = d.inv || {};
    S.furn = d.furn || {};
    S.outfits = d.outfits || []; S.outfit = d.outfit || '';
    S.decor = (d.decor || []).filter(k => DECOR[k]);
    if (S.paper && !DECOR[S.paper]) S.paper = '';
    S.room = Math.min(2, Math.max(0, d.room || 0));
    S.pending = [];
    return true;
  } catch (e) { return false; }
}
function exportCode(){
  return btoa(unescape(encodeURIComponent(JSON.stringify(S))));
}
function importCode(code){
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!d || d.v !== 1 || typeof d.hunger !== 'number') return false;
    S = Object.assign(newState(), d);
    S.furn = d.furn || {}; S.outfits = d.outfits || []; S.decor = (d.decor || []).filter(k => DECOR[k]);
    S.pending = [];
    save();
    return true;
  } catch (e) { return false; }
}

function stageFor(age){
  return age >= STAGES.adult.hours ? 'adult' : age >= STAGES.young.hours ? 'young' : 'baby';
}
function computeForm(){
  const c = S.care, t = c.t || 1;
  const avg = {hunger:c.hunger / t, energy:c.energy / t, hygiene:c.hygiene / t, fun:c.fun / t};
  if (S.weight >= 90) return 'bolota';
  const vals = Object.values(avg);
  const mean = vals.reduce((a, b) => a + b, 0) / 4;
  if (vals.every(v => v >= 75)) return 'rei';
  if (mean < 40) return 'comum';
  const best = Object.entries(avg).sort((a, b) => b[1] - a[1])[0][0];
  return {hunger:'chef', fun:'atleta', energy:'dorminhoco', hygiene:'limpinho'}[best];
}
function evolveTo(stage){
  S.stage = stage;
  if (stage === 'adult' && !S.form) S.form = computeForm();
  S.stats.evolutions++;
  S.pending.push('evolve:' + stage);
}

/* um passo de simulacao de "ms" milissegundos */
function tick(ms){
  if (!S.started) return;
  const h = ms / HOUR;
  const sm = S.sleeping ? 0.5 : 1;
  S.hunger  = clamp(S.hunger - 2.2 * h * sm);
  S.fun     = clamp(S.fun - (2.5 + (S.sick ? 1.5 : 0)) * h * sm);
  S.hygiene = clamp(S.hygiene - (1.6 + S.poops * 0.7) * h * (hasUpgrade('pia') ? 0.7 : 1));
  if (S.sleeping){
    S.energy = clamp(S.energy + (hasUpgrade('cama') ? 18 : 14) * h);
    if (S.energy >= 100){ S.sleeping = false; S.pending.push('woke'); }
  } else {
    S.energy = clamp(S.energy - 2.8 * h);
    if (S.energy <= 10){ S.sleeping = true; S.pending.push('autosleep'); }
  }
  S.age += h;
  if (S.stage === 'young'){
    S.care.hunger += S.hunger * h; S.care.energy += S.energy * h;
    S.care.hygiene += S.hygiene * h; S.care.fun += S.fun * h; S.care.t += h;
  }
  if (!S.sleeping && S.hunger > 5){
    S.nextPoop -= h;
    if (S.nextPoop <= 0){
      if (S.poops < 3){ S.poops++; S.pending.push('poop'); }
      S.nextPoop = (7 + Math.random() * 5) * (hasUpgrade('privada') ? 1.5 : 1);
    }
  }
  if (!S.sick){
    S.sickAcc += h;
    while (S.sickAcc >= 1){
      S.sickAcc -= 1;
      let risk = 0;
      if (S.hygiene < 15) risk += 0.05;
      if (S.hunger < 10) risk += 0.04;
      if (S.poops >= 3) risk += 0.05;
      if (S.energy < 5) risk += 0.02;
      if (risk > 0 && Math.random() < risk){ S.sick = true; S.pending.push('sick'); break; }
    }
  }
  const st = stageFor(S.age);
  if (st !== S.stage) evolveTo(st);
}
function simulate(ms){
  let left = Math.max(0, ms);
  const step = 10 * 60000;
  while (left > 0){ const d = Math.min(step, left); left -= d; tick(d); }
}

function mood(){
  if (S.sick) return 'sick';
  if (S.sleeping) return 'sleep';
  const lo = Math.min(S.hunger, S.energy, S.hygiene, S.fun);
  if (lo < 20) return 'sad';
  const avg = (S.hunger + S.energy + S.hygiene + S.fun) / 4;
  if (avg > 70) return 'happy';
  return 'ok';
}
function needs(){
  const n = [];
  if (S.hunger < 30) n.push('hunger');
  if (S.energy < 25 && !S.sleeping) n.push('energy');
  if (S.hygiene < 30 || S.poops > 0) n.push('hygiene');
  if (S.fun < 30) n.push('fun');
  if (S.sick) n.push('sick');
  return n;
}
function foodPrice(key){ return Math.max(1, FOODS[key].price - (hasUpgrade('geladeira') ? 1 : 0)); }

/* ---- acoes ---- */
function feed(key){
  const f = FOODS[key];
  if (!f) return {ok:false, msg:'Hmm?'};
  if (S.sleeping) return {ok:false, msg:'Shh... ' + S.name + ' está dormindo.'};
  if ((S.inv[key] || 0) <= 0) return {ok:false, msg:'Acabou. Compre mais na loja.'};
  if (S.hunger >= 95 && f.fun === 0) return {ok:false, msg:S.name + ' está cheio!'};
  S.inv[key]--;
  S.hunger = clamp(S.hunger + f.hunger);
  S.fun = clamp(S.fun + (f.fun || 0) + (hasUpgrade('mesa') ? 5 : 0));
  if (f.energy) S.energy = clamp(S.energy + f.energy * (hasUpgrade('fogao') ? 2 : 1));
  if (f.hygiene) S.hygiene = clamp(S.hygiene + f.hygiene);
  S.weight = clamp(S.weight + f.w, 20, 200);
  S.stats.fed++;
  save();
  return {ok:true, msg:'Nhac nhac!'};
}
function toggleLight(){
  if (S.sleeping){
    S.sleeping = false;
    if (S.energy < 100){ S.fun = clamp(S.fun - 5); save(); return {ok:true, msg:S.name + ' acordou rabugento...'}; }
    save(); return {ok:true, msg:'Bom dia, ' + S.name + '!'};
  }
  S.sleeping = true;
  save();
  return {ok:true, msg:'Boa noite, ' + S.name + '...'};
}
function bath(){
  if (S.sleeping) return {ok:false, msg:'Shh... ' + S.name + ' está dormindo.'};
  const had = S.poops > 0 || S.hygiene < 100;
  S.hygiene = 100; S.poops = 0; S.stats.baths++;
  if (hasUpgrade('banheira')) S.fun = clamp(S.fun + 5);
  save();
  return {ok:true, msg:had ? 'Splish splash! Limpinho.' : 'Já estava limpinho!'};
}
function cleanPoop(){
  if (S.poops <= 0) return {ok:false};
  S.poops--; S.hygiene = clamp(S.hygiene + 5); save();
  return {ok:true, msg:'Eca! Limpou.'};
}
function medicine(){
  if (!S.sick) return {ok:false, msg:S.name + ' está saudável!'};
  S.sick = false; S.sickAcc = 0; S.energy = clamp(S.energy - 5); S.stats.meds++;
  save();
  return {ok:true, msg:'Blergh... mas melhorou!'};
}
let _lastPet = 0;
function petRat(){
  if (S.sleeping) return {ok:false, msg:'Zzz...'};
  const now = Date.now();
  if (now - _lastPet > 8000){ S.fun = clamp(S.fun + (hasUpgrade('sofa') ? 5 : 3)); S.stats.pets++; _lastPet = now; save(); }
  return {ok:true, msg:''};
}
function finishGame(id, score, coins){
  S.coins += coins;
  S.fun = clamp(S.fun + 25);
  S.energy = clamp(S.energy - 4);
  S.weight = clamp(S.weight - 2, 20, 200);
  S.stats.played++;
  if (!S.best[id] || score > S.best[id]) S.best[id] = score;
  save();
}
function buy(cat, key){
  let price, owned = false;
  if (cat === 'food'){ price = foodPrice(key); }
  else if (cat === 'hat'){ price = HATS[key].price; owned = S.hats.includes(key); }
  else if (cat === 'outfit'){ price = OUTFITS[key].price; owned = S.outfits.includes(key); }
  else if (cat === 'decor'){ price = DECOR[key].price; owned = S.decor.includes(key); }
  else if (cat === 'furn'){ price = FURN[key].tiers[1].price; owned = hasUpgrade(key); }
  else if (cat === 'skin'){ price = SKINS[key].price; owned = S.skins.includes(key); }
  if (owned) return {ok:false, msg:'Você já tem esse.'};
  if (S.coins < price) return {ok:false, msg:'Faltam ' + (price - S.coins) + ' moedas.'};
  S.coins -= price;
  if (cat === 'food'){ S.inv[key] = (S.inv[key] || 0) + 1; }
  else if (cat === 'hat'){ S.hats.push(key); S.hat = key; }
  else if (cat === 'outfit'){ S.outfits.push(key); S.outfit = key; }
  else if (cat === 'decor'){ S.decor.push(key); if (DECOR[key].kind === 'paper') S.paper = key; }
  else if (cat === 'furn'){ S.furn[key] = 1; }
  else if (cat === 'skin'){ S.skins.push(key); S.skin = key; }
  save();
  return {ok:true, msg:'Comprado!'};
}
function startNew(name){
  const keep = {sound:S.sound};
  S = newState();
  S.name = name; S.started = true; S.born = Date.now(); S.last = Date.now(); S.sound = keep.sound;
  save();
}
