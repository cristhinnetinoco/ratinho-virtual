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
  sorvete: {name:'Sorvete',  price:7,  hunger:12, fun:16, w:4,  desc:'Geladinho de morango.'},
  // energéticas: também enchem a barra de energia
  banana:  {name:'Banana',   price:3,  hunger:18, fun:2,  w:2,  energy:12, desc:'Potássio pra rodinha.'},
  suco:    {name:'Suco de laranja', price:5, hunger:10, fun:4, w:1, energy:20, hygiene:2, desc:'Geladinho e vitaminado.'},
  cafe:    {name:'Cafezinho', price:6, hunger:5,  fun:5,  w:1,  energy:30, desc:'Um golinho e já era o sono.'},
  castanhas:{name:'Castanhas', price:7, hunger:20, fun:3, w:3,  energy:22, desc:'Mix crocante. Dá gás.'},
  mel:     {name:'Pote de mel', price:9, hunger:15, fun:8, w:4, energy:30, desc:'Doce e dá pique.'},
  acai:    {name:'Açaí',     price:12, hunger:25, fun:15, w:5,  energy:35, desc:'Tigela roxa. Energia total.'}
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
    stats:{fed:0, played:0, baths:0, meds:0, pets:0, evolutions:0, uses:0, ride:0},
    best:{}, sound:true, pending:[],
    fav:'', hate:'', favKnown:false, hateKnown:false,
    tricks:{}, ach:{}, streak:0, lastDay:'', tutorialDone:false
  };
}
const FOOD_KEYS = () => Object.keys(FOODS);
function pickFoods(){
  const keys = FOOD_KEYS();
  S.fav = keys[Math.floor(Math.random() * keys.length)];
  do { S.hate = keys[Math.floor(Math.random() * keys.length)]; } while (S.hate === S.fav);
}
/* ---- truques: aprendidos por repeticao ---- */
const TRICKS = {
  girar:   {name:'Girar',            how:'15 carinhos',   stat:'pets',   need:15},
  tchau:   {name:'Dar tchau',        how:'10 brinquedos', stat:'uses',   need:10},
  morto:   {name:'Fingir de morto',  how:'10 banhos',     stat:'baths',  need:10},
  pulinho: {name:'Pulinho',          how:'10 mini-jogos', stat:'played', need:10}
};
function checkTricks(){
  S.tricks = S.tricks || {};
  for (const k of Object.keys(TRICKS)){
    const t = TRICKS[k];
    if (!S.tricks[k] && (S.stats[t.stat] || 0) >= t.need){ S.tricks[k] = Date.now(); addXp(10); S.pending.push('trick:' + k); }
  }
}
function knownTricks(){ return Object.keys(TRICKS).filter(k => S.tricks && S.tricks[k]); }
/* ---- conquistas ---- */
const ACHIEVEMENTS = [
  {id:'chef',         name:'Chef de queijo', desc:'50 refeições',                test:() => S.stats.fed >= 50},
  {id:'limpinho',     name:'Limpinho',       desc:'25 banhos',                   test:() => S.stats.baths >= 25},
  {id:'maratonista',  name:'Maratonista',    desc:'Correu 1 km na rodinha',      test:() => (S.stats.ride || 0) >= 1000},
  {id:'jogador',      name:'Jogador',        desc:'30 mini-jogos',               test:() => S.stats.played >= 30},
  {id:'colecionador', name:'Colecionador',   desc:'Todos os móveis melhorados',  test:() => Object.keys(FURN).every(k => hasUpgrade(k))},
  {id:'fashion',      name:'Fashionista',    desc:'10 roupas ou acessórios',     test:() => S.hats.length + S.outfits.length >= 10},
  {id:'brincalhao',   name:'Brincalhão',     desc:'50 usos de brinquedos',       test:() => (S.stats.uses || 0) >= 50},
  {id:'crescido',     name:'Crescido',       desc:'Virou adulto',                test:() => S.stage === 'adult'},
  {id:'rico',         name:'Rico',           desc:'500 moedas de uma vez',       test:() => S.coins >= 500},
  {id:'veterano',     name:'Veterano',       desc:'Chegou ao nível 10',          test:() => S.level >= 10},
  {id:'artista',      name:'Artista',        desc:'Aprendeu os 4 truques',       test:() => Object.keys(TRICKS).every(k => S.tricks && S.tricks[k])},
  {id:'fiel',         name:'Fiel',           desc:'7 dias seguidos',             test:() => (S.streak || 0) >= 7}
];
function checkAchievements(){
  if (!S.started) return;
  S.ach = S.ach || {};
  for (const a of ACHIEVEMENTS){
    if (!S.ach[a.id] && a.test()){ S.ach[a.id] = Date.now(); S.coins += 20; addXp(15); S.pending.push('ach:' + a.id); }
  }
}
/* ---- dias seguidos ---- */
const STREAK_REWARDS = [
  {coins:10, text:'10 moedas'},
  {coins:15, text:'15 moedas'},
  {food:'queijo', n:2, text:'2 queijos'},
  {coins:25, text:'25 moedas'},
  {food:'bolo', n:1, text:'1 bolo'},
  {coins:40, text:'40 moedas'},
  {rare:true, text:'um presente raro'}
];
function dayKey(d){ d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
/* devolve {day, text} se hoje ainda nao foi contado */
function checkStreak(){
  if (!S.started) return null;
  const today = dayKey();
  if (S.lastDay === today) return null;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.streak = (S.lastDay === dayKey(y)) ? (S.streak || 0) + 1 : 1;
  S.lastDay = today;
  const r = STREAK_REWARDS[Math.min(S.streak, 7) - 1];
  let text = r.text;
  if (r.coins) S.coins += r.coins;
  if (r.food) S.inv[r.food] = (S.inv[r.food] || 0) + r.n;
  if (r.rare){
    const pool = Object.keys(HATS).filter(k => !S.hats.includes(k) && (HATS[k].stage || 'baby') === 'baby').concat(Object.keys(OUTFITS).filter(k => !S.outfits.includes(k) && (OUTFITS[k].stage || 'baby') === 'baby'));
    if (pool.length){ const k = pool[Math.floor(Math.random() * pool.length)]; if (HATS[k]){ S.hats.push(k); text = HATS[k].name; } else { S.outfits.push(k); text = OUTFITS[k].name; } }
    else { S.coins += 100; text = '100 moedas'; }
  }
  addXp(5);
  save();
  return {day:S.streak, text};
}
/* ---- eventos por data e clima do dia ---- */
function currentEvent(){
  const d = new Date(), m = d.getMonth() + 1, day = d.getDate();
  if (m === 6) return {id:'junina', name:'Festa Junina'};
  if ((m === 10 && day >= 15) || (m === 11 && day <= 2)) return {id:'halloween', name:'Halloween'};
  if (m === 12 || (m === 1 && day <= 6)) return {id:'natal', name:'Natal'};
  return null;
}
function todayWeather(){
  const d = new Date(), m = d.getMonth() + 1;
  let h = 0; const s = dayKey(d); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const r = h % 10;
  if ((m === 7 || m === 8) && r < 3) return 'neve';
  return r < 5 ? 'sol' : r < 8 ? 'nuvens' : 'chuva';
}
/* ---- vender ---- */
function sell(cat, key){
  let refund = 0;
  if (cat === 'hat'){ if (!S.hats.includes(key)) return {ok:false}; refund = Math.floor(HATS[key].price / 2); S.hats = S.hats.filter(k => k !== key); if (S.hat === key) S.hat = ''; }
  else if (cat === 'outfit'){ if (!S.outfits.includes(key)) return {ok:false}; refund = Math.floor(OUTFITS[key].price / 2); S.outfits = S.outfits.filter(k => k !== key); if (S.outfit === key) S.outfit = ''; }
  else if (cat === 'decor'){
    if (!S.decor.includes(key)) return {ok:false};
    const d = DECOR[key]; refund = Math.floor((d.tiers ? d.tiers[decorTier(key)].price : d.price) / 2);
    S.decor = S.decor.filter(k => k !== key); delete S.decorTier[key]; if (S.paper === key) S.paper = '';
    if (key === 'casinha') S.hidden = false;
  }
  else if (cat === 'furn'){ if (!hasUpgrade(key)) return {ok:false}; refund = Math.floor(FURN[key].tiers[1].price / 2); S.furn[key] = 0; }
  else if (cat === 'skin'){ if (!S.skins.includes(key) || key === 'bege') return {ok:false}; refund = Math.floor(SKINS[key].price / 2); S.skins = S.skins.filter(k => k !== key); if (S.skin === key) S.skin = 'bege'; }
  S.coins += refund; save();
  return {ok:true, msg:'Vendido por ' + refund + ' moedas.'};
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
    /* quem comprou antes de existir a versao barata fica com a melhor */
    for (const k of S.decor){ if (DECOR[k] && DECOR[k].tiers && S.decorTier[k] == null) S.decorTier[k] = 1; }
    S.uses = d.uses || {}; S.bank = d.bank || 0; S.hidden = !!d.hidden;
    if (S.paper && !DECOR[S.paper]) S.paper = '';
    S.room = Math.min(ROOMS.length - 1, Math.max(0, d.room || 0));
    if (!S.fav || !FOODS[S.fav]) pickFoods();
    S.tricks = d.tricks || {}; S.ach = d.ach || {};
    if (d.tutorialDone == null) S.tutorialDone = true;
    if (!S.lastDay){ S.lastDay = dayKey(); S.streak = 1; }
    if (d.xp == null){
      const st = S.stats || {};
      S.xp = Math.floor(S.age || 0) + (st.fed || 0) * 4 + (st.played || 0) * 10 + (st.baths || 0) * 5;
      if (S.stage === 'young') S.xp = Math.max(S.xp, xpForLevel(STAGES.young.level));
      if (S.stage === 'adult') S.xp = Math.max(S.xp, xpForLevel(STAGES.adult.level));
      S.level = levelFromXp(S.xp); S.xpAcc = 0;
    }
    S.pending = [];
    // v11.2: crescer ficou mais lento (adolescente 15, adulto 30); a fase volta a bater com o nível
    const stNow = stageForLevel(S.level);
    if (S.started && stageRank(S.stage) > stageRank(stNow)){
      S.stage = stNow;
      S.pending.push('info:Crescer agora demora mais: adolescente no nível 15 e adulto no 30. ' + S.name + ' voltou a ser ' + STAGES[stNow].name.toLowerCase() + '!');
    }
    return true;
  } catch (e) { return false; }
}
/* ---- niveis ---- */
function xpNeed(l){ return 30 + (l - 1) * 15; }
function xpForLevel(l){ let s = 0; for (let i = 1; i < l; i++) s += xpNeed(i); return s; }
function levelFromXp(xp){ let l = 1; while (l < 99 && xp >= xpForLevel(l + 1)) l++; return l; }
function stageForLevel(l){ return l >= STAGES.adult.level ? 'adult' : l >= STAGES.young.level ? 'young' : 'baby'; }
function levelProgress(){ if (S.level >= 99) return {cur:0, need:0, pct:1}; const a = xpForLevel(S.level), b = xpForLevel(S.level + 1); return {cur:S.xp - a, need:b - a, pct:Math.max(0, Math.min(1, (S.xp - a) / (b - a)))}; }
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
    /* enche do zero em 3 h na caixa de fosforo e em 1 h 30 na cama de boneca */
    S.energy = clamp(S.energy + (hasUpgrade('cama') ? 100 / 1.5 : 100 / 3) * h);
    if (S.energy >= 100){ S.sleeping = false; S.pending.push('woke'); addXp(8); }
  } else {
    S.energy = clamp(S.energy - 4 * h);
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
  let fun = (f.fun || 0) + (hasUpgrade('mesa') ? 5 : 0), msg = 'Nhac nhac!', mood = 'ok';
  if (key === S.fav){ fun = fun * 2 + 10; msg = 'Minha comida favorita!'; mood = 'fav'; S.favKnown = true; }
  else if (key === S.hate){ fun = -3; msg = 'Eca... isso não!'; mood = 'hate'; S.hateKnown = true; }
  S.fun = clamp(S.fun + fun);
  if (f.energy) S.energy = clamp(S.energy + f.energy * (hasUpgrade('fogao') ? 2 : 1));
  if (f.hygiene) S.hygiene = clamp(S.hygiene + f.hygiene);
  S.weight = clamp(S.weight + f.w, 20, 200);
  S.stats.fed++;
  addXp(4);
  save();
  return {ok:true, msg, mood};
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
/* kind: 'head' (carinho), 'belly' (cocegas), 'ear' (orelha), 'cuddle' (cafune longo) */
function petRat(kind){
  if (S.sleeping) return {ok:false, msg:'Zzz...'};
  const now = Date.now();
  if (now - _lastPet > 8000){
    S.fun = clamp(S.fun + (kind === 'cuddle' ? 5 : 3) + (hasUpgrade('sofa') ? 2 : 0));
    S.stats.pets++; _lastPet = now; addXp(1); save();
  }
  return {ok:true, msg:''};
}
function finishGame(id, score, coins){
  if (hasUpgrade('estante')) coins += 1;
  S.coins += coins;
  addXp(8 + Math.min(12, coins));
  S.fun = clamp(S.fun + 25);
  S.energy = clamp(S.energy - 2);
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
  pickFoods();
  S.lastDay = dayKey(); S.streak = 1;
  save();
}
