/* ===== Estado do bichinho, economia e simulacao ===== */
const FOODS = {
  queijo:  {name:'Queijo',   price:4,  hunger:30, fun:0,  w:3,  desc:'O clássico. Mata a fome.'},
  semente: {name:'Semente',  price:2,  hunger:15, fun:0,  w:1,  desc:'Lanchinho leve e barato.'},
  biscoito:{name:'Biscoito', price:5,  hunger:20, fun:8,  w:4,  desc:'Crocante. Ele adora.'},
  morango: {name:'Morango',  price:6,  hunger:20, fun:5,  w:2,  hygiene:3, desc:'Doce e fresquinho.'},
  bolo:    {name:'Bolo',     price:12, hunger:45, fun:20, w:8,  desc:'Festa! Mas engorda.'},
  sopa:    {name:'Sopa',     price:8,  hunger:25, fun:0,  w:2,  energy:15, desc:'Quentinha. Dá energia.'},
  pao:     {name:'Pãozinho', price:3,  hunger:22, fun:2,  w:3,  desc:'Casquinha crocante.'},
  cenoura: {name:'Cenoura',  price:3,  hunger:15, fun:0,  w:1,  hygiene:2, desc:'Saudável. Ele faz careta.'},
  uva:     {name:'Uvas',     price:5,  hunger:15, fun:6,  w:1,  desc:'Docinhas e pequenas.'},
  pipoca:  {name:'Pipoca',   price:4,  hunger:18, fun:8,  w:3,  desc:'Pra ver TV.'},
  leite:   {name:'Leite',    price:4,  hunger:15, fun:0,  w:2,  energy:8, desc:'Um copinho antes de dormir.'},
  pizza:   {name:'Pizza',    price:10, hunger:40, fun:15, w:7,  desc:'Fatia de queijo. Óbvio.'},
  brigadeiro:{name:'Brigadeiro', price:6, hunger:10, fun:18, w:5, desc:'Festa brasileira. Engorda.'},
  sorvete: {name:'Sorvete',  price:7,  hunger:12, fun:16, w:4,  desc:'Geladinho de morango.'}
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
    xp:0, level:1, xpAcc:0,
    stage:'baby', form:'', care:{hunger:0, energy:0, hygiene:0, fun:0, t:0},
    inv:{queijo:3, semente:3},
    hats:[], hat:'', outfits:[], outfit:'',
    furn:{}, decor:[], decorTier:{}, paper:'', skins:['bege'], skin:'bege', room:0,
    uses:{}, bank:0, hidden:false,
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
    S.decorTier = d.decorTier || {};
    if (!d.decorTier){ if (S.decor.includes('tv')) S.decorTier.tv = 1; if (S.decor.includes('roda')) S.decorTier.roda = 1; }
    S.uses = d.uses || {}; S.bank = d.bank || 0; S.hidden = !!d.hidden;
    if (S.paper && !DECOR[S.paper]) S.paper = '';
    S.room = Math.min(ROOMS.length - 1, Math.max(0, d.room || 0));
    if (d.xp == null){
      const st = S.stats || {};
      S.xp = Math.floor(S.age || 0) + (st.fed || 0) * 4 + (st.played || 0) * 10 + (st.baths || 0) * 5;
      if (S.stage === 'young') S.xp = Math.max(S.xp, xpForLevel(STAGES.young.level));
      if (S.stage === 'adult') S.xp = Math.max(S.xp, xpForLevel(STAGES.adult.level));
      S.level = levelFromXp(S.xp); S.xpAcc = 0;
    }
    S.pending = [];
    return true;
  } catch (e) { return false; }
}
/* ---- niveis ---- */
function xpNeed(l){ return 30 + (l - 1) * 15; }
function xpForLevel(l){ let s = 0; for (let i = 1; i < l; i++) s += xpNeed(i); return s; }
function levelFromXp(xp){ let l = 1; while (l < 99 && xp >= xpForLevel(l + 1)) l++; return l; }
function stageForLevel(l){ return l >= STAGES.adult.level ? 'adult' : l >= STAGES.young.level ? 'young' : 'baby'; }
function levelProgress(){ const a = xpForLevel(S.level), b = xpForLevel(S.level + 1); return {cur:S.xp - a, need:b - a, pct:Math.max(0, Math.min(1, (S.xp - a) / (b - a)))}; }
function addXp(n){
  if (!S.started || n <= 0) return;
  S.xp += n;
  const nl = levelFromXp(S.xp);
  while (S.level < nl){
    S.level++; S.coins += 5;
    S.pending.push('level:' + S.level);
    const st = stageForLevel(S.level);
    if (stageRank(st) > stageRank(S.stage)) evolveTo(st);
  }
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
    S.decorTier = d.decorTier || {}; S.uses = d.uses || {}; S.bank = d.bank || 0; S.hidden = !!d.hidden;
    S.pending = [];
    save();
    return true;
  } catch (e) { return false; }
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
  /* ritmo: da para manter tudo em dia entrando 3 vezes por dia */
  S.hunger  = clamp(S.hunger - 5 * h * sm);
  S.fun     = clamp(S.fun - (5 + (S.sick ? 1.5 : 0)) * h * sm * (S.hidden ? 0.5 : 1));
  if (S.decor.includes('cofre')) S.bank = Math.min(S.decorTier && S.decorTier.cofre ? 24 : 12, (S.bank || 0) + h);
  S.hygiene = clamp(S.hygiene - (3.5 + S.poops * 0.7) * h * (hasUpgrade('pia') ? 0.7 : 1));
  if (S.sleeping){
    S.energy = clamp(S.energy + (hasUpgrade('cama') ? 32 : 25) * h);
    if (S.energy >= 100){ S.sleeping = false; S.pending.push('woke'); addXp(8); }
  } else {
    S.energy = clamp(S.energy - 6 * h);
    if (S.energy <= 10){ S.sleeping = true; S.pending.push('autosleep'); }
  }
  S.age += h;
  S.xpAcc = (S.xpAcc || 0) + h;
  while (S.xpAcc >= 1){ S.xpAcc -= 1; addXp(1); }
  if (S.stage === 'young'){
    S.care.hunger += S.hunger * h; S.care.energy += S.energy * h;
    S.care.hygiene += S.hygiene * h; S.care.fun += S.fun * h; S.care.t += h;
  }
  if (!S.sleeping && S.hunger > 5){
    S.nextPoop -= h;
    if (S.nextPoop <= 0){
      if (S.poops < 3){ S.poops++; S.pending.push('poop'); }
      S.nextPoop = (4 + Math.random() * 3) * (hasUpgrade('privada') ? 1.5 : 1);
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
  addXp(4);
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
  if (had) addXp(5);
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
  addXp(2);
  save();
  return {ok:true, msg:'Blergh... mas melhorou!'};
}
let _lastPet = 0;
function petRat(){
  if (S.sleeping) return {ok:false, msg:'Zzz...'};
  const now = Date.now();
  if (now - _lastPet > 8000){ S.fun = clamp(S.fun + (hasUpgrade('sofa') ? 5 : 3)); S.stats.pets++; _lastPet = now; addXp(1); save(); }
  return {ok:true, msg:''};
}
function finishGame(id, score, coins){
  if (hasUpgrade('estante')) coins += 1;
  S.coins += coins;
  addXp(8 + Math.min(12, coins));
  S.fun = clamp(S.fun + 25);
  S.energy = clamp(S.energy - 4);
  S.weight = clamp(S.weight - 2, 20, 200);
  S.stats.played++;
  if (!S.best[id] || score > S.best[id]) S.best[id] = score;
  save();
}
function outfitPrice(key){ return Math.max(5, OUTFITS[key].price - (hasUpgrade('comoda') ? 5 : 0)); }
/* cat: food | hat | outfit | decor | furn | skin ; tier: para decoracoes com duas versoes (0 barata, 1 pet shop) */
function buy(cat, key, tier){
  let price, owned = false;
  if (cat === 'food'){ price = foodPrice(key); }
  else if (cat === 'hat'){ price = HATS[key].price; owned = S.hats.includes(key); if (stageRank(HATS[key].stage || 'baby') > stageRank(S.stage)) return {ok:false, msg:'Libera na fase ' + STAGES[HATS[key].stage].name + '.'}; }
  else if (cat === 'outfit'){ price = outfitPrice(key); owned = S.outfits.includes(key); if (stageRank(OUTFITS[key].stage || 'baby') > stageRank(S.stage)) return {ok:false, msg:'Libera na fase ' + STAGES[OUTFITS[key].stage].name + '.'}; }
  else if (cat === 'decor'){
    const d = DECOR[key];
    if (d.tiers){ tier = tier || 0; price = d.tiers[tier].price; owned = S.decor.includes(key) && decorTier(key) >= tier; }
    else { price = d.price; owned = S.decor.includes(key); }
  }
  else if (cat === 'furn'){ price = FURN[key].tiers[1].price; owned = hasUpgrade(key); }
  else if (cat === 'skin'){ price = SKINS[key].price; owned = S.skins.includes(key); }
  if (owned) return {ok:false, msg:'Você já tem esse.'};
  if (S.coins < price) return {ok:false, msg:'Faltam ' + (price - S.coins) + ' moedas.'};
  S.coins -= price;
  if (cat === 'food'){ S.inv[key] = (S.inv[key] || 0) + 1; }
  else if (cat === 'hat'){ S.hats.push(key); S.hat = key; }
  else if (cat === 'outfit'){ S.outfits.push(key); S.outfit = key; }
  else if (cat === 'decor'){
    if (!S.decor.includes(key)) S.decor.push(key);
    if (DECOR[key].tiers){ S.decorTier[key] = tier || 0; }
    if (DECOR[key].kind === 'paper') S.paper = key;
  }
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
