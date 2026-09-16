/* ===== A toca: comodos, cena principal, interativos e barra de icones ===== */
let W = 125, H = 270, SCALE = 3;
const LAY = {
  top:14, bar:26,
  get floorH(){ return Math.round((H - this.top - this.bar) * 0.45); },
  get floorY(){ return H - this.bar - this.floorH; },
  get walkTop(){ return this.floorY + 22; },
  get walkBottom(){ return H - this.bar - 6; },
  get ratY(){ return this.floorY + 40; }
};
const ICONS = [
  {id:'comer',   spr:'ic_comer',   label:'Comer'},
  {id:'luz',     spr:'ic_luz',     label:'Luz'},
  {id:'brincar', spr:'ic_brincar', label:'Brincar'},
  {id:'remedio', spr:'ic_remedio', label:'Remédio'},
  {id:'banho',   spr:'ic_banho',   label:'Banho'},
  {id:'status',  spr:'ic_status',  label:'Status'},
  {id:'loja',    spr:'ic_loja',    label:'Loja'},
  {id:'config',  spr:'ic_config',  label:'Ajustes'}
];
const SCENE = {
  room:0, sel:-1,
  ratX:60, ratY:200, dir:1, walkT:0, targetX:60, targetY:200,
  anim:null, fx:[],
  blinkAt:0, blinking:false,
  trans:null,
  riding:false, wheelAng:0, rideDist:0,
  active:{}          /* efeitos visuais ligados: {tv:{until}, radio:{until}, ...} */
};
const WHEEL_R = 15;

function iconRect(i){
  const sw = W / ICONS.length;
  return {x:Math.round(i * sw + (sw - 10) / 2), y:H - LAY.bar + 8, w:10, h:10};
}
function slotX(key){ return Math.round(FURN[key].x * W); }
function furnBottom(){ return LAY.floorY + 10; }
function furnRect(key){ const d = furnDef(key); return {x:slotX(key), y:furnBottom() - d.h, w:d.w, h:d.h}; }
function floorMid(){ return LAY.floorY + Math.round(LAY.floorH * 0.62); }
/* retangulo de uma decoracao (para desenhar e para o toque) */
function decorRect(key){
  const d = DECOR[key], def = decorDef(key);
  const w = def.w || 10, h = def.h || 10;
  if (d.wall) return {x:Math.round(d.x * W), y:LAY.top + d.y, w, h};
  if (d.kind === 'rug') return {x:Math.round((W - w) / 2), y:LAY.floorY + Math.round(LAY.floorH * (d.ry || 0.42)), w, h};
  if (d.onTub){ const t = furnRect('banheira'); return {x:t.x + 5, y:t.y - h + 4, w, h}; }
  if (d.onFurn){ const f = furnRect(d.onFurn); return {x:f.x + (d.dx || 0), y:f.y - h, w, h}; }
  return {x:Math.round(d.x * W) - Math.round(w / 2), y:floorMid() - h + (d.dy || 0), w, h};
}
function bedSpot(){ const d = furnDef('cama'); return {x:slotX('cama') + d.sleep.dx, y:furnBottom() - d.h + d.sleep.dy}; }
function tableSpot(){ const d = furnDef('mesa'); return {x:slotX('mesa') + Math.round(d.w / 2) - 6, y:furnBottom() + 16}; }
function tubSpot(){ const d = furnDef('banheira'); return {x:slotX('banheira') + Math.round(d.w / 2), y:furnBottom() - Math.round(d.h * 0.35)}; }
function poopSpot(i){
  const rooms = ['sala', 'banheiro', 'cozinha'], xs = [0.3, 0.55, 0.75], ys = [0.35, 0.7, 0.5];
  return {room:roomIndex(rooms[i % 3]), x:Math.round(xs[i % 3] * W), y:Math.round(LAY.walkTop + ys[i % 3] * (LAY.walkBottom - LAY.walkTop))};
}
function randomWalkTarget(){
  SCENE.targetX = 16 + Math.random() * (W - 32);
  SCENE.targetY = LAY.walkTop + Math.random() * (LAY.walkBottom - LAY.walkTop);
}
function wheelRect(){ return decorRect('roda'); }
function startRide(){
  const r = wheelRect();
  SCENE.riding = true; SCENE.anim = null; SCENE.rideDist = 0;
  SCENE.ratX = r.x + Math.round(r.w / 2); SCENE.ratY = Math.min(LAY.walkBottom, Math.max(LAY.walkTop, r.y + r.h - 4));
  SCENE.targetX = SCENE.ratX; SCENE.targetY = SCENE.ratY;
}
function stopRide(){
  if (!SCENE.riding) return;
  SCENE.riding = false;
  SCENE.ratX = Math.min(W - 16, SCENE.ratX + 20); SCENE.targetX = SCENE.ratX; SCENE.targetY = SCENE.ratY;
  SCENE.walkT = 2500;
}

/* ---------- interativos ---------- */
const USES = {
  bebedouro:{cool:[10, 7],  anim:'drink',  ms:2400, msg:'Glup glup glup!',       fx(t){ S.energy = clamp(S.energy + (t ? 6 : 4)); S.hygiene = clamp(S.hygiene + (t ? 3 : 2)); }},
  pote:     {cool:[240, 240], anim:'snack', ms:2600, msg:'Um biscoito caiu!',    fx(t){ S.hunger = clamp(S.hunger + (t ? 6 : 5)); S.fun = clamp(S.fun + (t ? 4 : 3)); }},
  rede:     {cool:[20, 15], anim:'nap',    ms:15000, msg:'Cochilo na rede...',   fx(t){ S.energy = clamp(S.energy + (t ? 7 : 5)); }},
  roer:     {cool:[5, 4],   anim:'gnaw',   ms:2600, msg:'Nhec nhec nhec!',       fx(t){ S.fun = clamp(S.fun + (t ? 4 : 3)); }},
  tv:       {cool:[10, 8],  anim:'watch',  ms:20000, msg:'Hora do programa!',    fx(t){ S.fun = clamp(S.fun + (t ? 5 : 4) + (hasUpgrade('mesinha') ? 2 : 0)); }},
  radio:    {cool:[3, 2],   anim:'dance',  ms:6500, msg:'Toca o som!',           fx(t){ S.fun = clamp(S.fun + (t ? 3 : 2)); }},
  janela:   {cool:[5, 4],   anim:'look',   ms:4000, msg:'',                      fx(t){ S.fun = clamp(S.fun + (t ? 3 : 2)); }},
  chuveiro: {cool:[30, 20], anim:'shower', ms:3500, msg:'Chuvinha rápida!',      fx(t){ S.hygiene = clamp(S.hygiene + (t ? 8 : 5)); }},
  espelho:  {cool:[3, 3],   anim:'mirror', ms:2200, msg:'Que ratinho lindo!',    fx(t){ S.fun = clamp(S.fun + (t ? 3 : 2)); }},
  casinha:  {cool:[0, 0]},
  cofre:    {cool:[0, 0]},
  roda:     {cool:[0, 0]}
};
function useCooldown(key){
  const u = USES[key]; if (!u || !u.cool[0]) return 0;
  const last = (S.uses && S.uses[key]) || 0;
  const cool = u.cool[key === 'espelho' ? (hasUpgrade('pia') ? 1 : 0) : decorTier(key)] * 60000;
  return Math.max(0, last + cool - Date.now());
}
function coinsInBank(){
  if (!hasDecor('cofre')) return 0;
  return Math.min(decorTier('cofre') ? 24 : 12, Math.floor(S.bank || 0));
}
/* usa um interativo; devolve {ok, msg} */
function useItem(key){
  const u = USES[key]; if (!u) return {ok:false};
  if (S.sleeping) return {ok:false, msg:'Shh... ' + S.name + ' está dormindo.'};
  if (key === 'casinha'){
    if (S.hidden){ S.hidden = false; const r = decorRect('casinha'); SCENE.ratX = r.x + r.w + 10; SCENE.ratY = Math.max(LAY.walkTop, r.y + r.h); randomWalkTarget(); save(); return {ok:true, msg:S.name + ' saiu da casinha.'}; }
    S.hidden = true; SCENE.anim = null; stopRide(); save(); return {ok:true, msg:S.name + ' se escondeu. Toque na casinha para ele sair.'};
  }
  if (S.hidden) return {ok:false, msg:S.name + ' está escondido na casinha.'};
  if (key === 'cofre'){
    const c = coinsInBank();
    if (c <= 0) return {ok:false, msg:'O cofrinho ainda está vazio. Ele guarda 1 moeda por hora.'};
    S.coins += c; S.bank -= c; save(); SFX.play('buy');
    const r = decorRect('cofre'); const t = performance.now();
    for (let i = 0; i < Math.min(6, c); i++) SCENE.fx.push({kind:'coin', x:r.x + Math.random() * r.w, y:r.y, until:t + 700 + i * 120, dur:700 + i * 120});
    return {ok:true, msg:'+' + c + ' moedas do cofrinho!'};
  }
  const left = useCooldown(key);
  if (left > 0){ const m = Math.ceil(left / 60000); return {ok:false, msg:'Ainda descansando: ' + (m >= 60 ? Math.ceil(m / 60) + 'h' : m + ' min') + '.'}; }
  stopRide();
  S.uses = S.uses || {}; S.uses[key] = Date.now();
  u.fx(key === 'espelho' ? (hasUpgrade('pia') ? 1 : 0) : decorTier(key));
  S.stats.uses = (S.stats.uses || 0) + 1;
  addXp(3);
  const r = key === 'espelho' ? furnRect('pia') : decorRect(key);
  const data = {key};
  if (key === 'janela'){ data.cat = Math.random() < 0.25; }
  if (key === 'snack' || key === 'pote'){ data.food = 'biscoito'; }
  setAnim(u.anim, u.ms, data);
  SCENE.active[key] = {until:performance.now() + u.ms, cat:data.cat};
  /* posicao do rato para a animacao */
  if (key === 'bebedouro'){ SCENE.ratX = r.x + r.w / 2 + 2; SCENE.ratY = LAY.walkTop; }
  else if (key === 'pote'){ SCENE.ratX = r.x + r.w / 2; SCENE.ratY = LAY.walkTop + 4; }
  else if (key === 'roer'){ SCENE.ratX = r.x + r.w / 2 - 8; SCENE.ratY = r.y + r.h + 2; }
  else if (key === 'tv'){ SCENE.ratX = r.x + r.w + 18; SCENE.ratY = r.y + r.h + 6; SCENE.dir = -1; }
  else if (key === 'radio'){ SCENE.ratX = r.x - 14; SCENE.ratY = r.y + r.h + 2; }
  else if (key === 'janela'){ SCENE.ratX = r.x + r.w / 2; SCENE.ratY = LAY.walkTop; }
  else if (key === 'chuveiro'){ SCENE.ratX = r.x + r.w / 2 + 2; SCENE.ratY = LAY.walkTop + 2; }
  else if (key === 'espelho'){ const p = furnRect('pia'); SCENE.ratX = p.x + p.w / 2; SCENE.ratY = LAY.walkTop + 2; }
  SCENE.targetX = SCENE.ratX; SCENE.targetY = SCENE.ratY;
  SFX.play(key === 'radio' ? 'happy' : key === 'chuveiro' ? 'flip' : 'ok');
  if (key === 'radio') playJingle();
  return {ok:true, msg:data.cat ? 'Um gato na janela!' : u.msg};
}
function playJingle(){
  const seq = [523, 659, 784, 659, 523, 587, 698, 587, 523, 659, 784, 1046];
  seq.forEach((f, i) => setTimeout(() => { if (SCENE.active.radio) SFX.note(f, 0.18, 0.05); }, i * 450));
}
/* toque em algum interativo do comodo atual? devolve a chave */
function interactiveAt(x, y){
  const room = ROOMS[SCENE.room];
  for (const key of Object.keys(DECOR)){
    const d = DECOR[key];
    if (!d.use || d.room !== room.id || !hasDecor(key)) continue;
    const r = decorRect(key);
    if (x >= r.x - 3 && x <= r.x + r.w + 3 && y >= r.y - 3 && y <= r.y + r.h + 3) return key;
  }
  if (room.id === 'banheiro'){ const p = furnRect('pia'); if (x >= p.x - 2 && x <= p.x + p.w + 2 && y >= p.y - 2 && y <= p.y + p.h) return 'espelho'; }
  return null;
}

/* --- fundos dos comodos --- */
function drawRoomBg(ctx, r, night){
  const fy = LAY.floorY, top = LAY.top, bottom = H - LAY.bar;
  const id = ROOMS[r].id;
  if (id === 'sala'){
    const base = night ? '#4a3f7a' : '#f1d7c2', dot = night ? '#5a4f8c' : '#e8c3ab';
    rect(ctx, 0, top, W, fy - top, base);
    const p = S.paper;
    if (p === 'papel_listras'){
      for (let x = 0; x < W; x += 12) rect(ctx, x, top, 6, fy - top, night ? '#54488a' : '#f6e3d4');
    } else if (p === 'papel_bolinhas'){
      for (let y = top + 6; y < fy - 6; y += 12) for (let x = (Math.floor(y / 12) % 2) ? 6 : 0; x < W; x += 12){
        rect(ctx, x + 2, y, 3, 3, night ? '#6b5fa8' : '#f4a7c0'); px(ctx, x + 3, y + 1, night ? '#8a7ec9' : '#fff');
      }
    } else if (p === 'papel_coracoes'){
      for (let y = top + 6; y < fy - 8; y += 14) for (let x = (Math.floor(y / 14) % 2) ? 8 : 0; x < W; x += 16){
        const c = night ? '#7a5fa8' : '#ff8fa3';
        px(ctx, x + 1, y, c); px(ctx, x + 3, y, c); rect(ctx, x, y + 1, 5, 1, c); rect(ctx, x + 1, y + 2, 3, 1, c); px(ctx, x + 2, y + 3, c);
      }
    } else {
      for (let y = top + 6; y < fy - 4; y += 10) for (let x = (Math.floor(y / 10) % 2) ? 5 : 0; x < W; x += 10) px(ctx, x + 2, y, dot);
    }
    rect(ctx, 0, fy - 5, W, 5, night ? '#3a3060' : '#d9b98a'); rect(ctx, 0, fy - 5, W, 1, night ? '#2a2140' : '#b8955f');
    rect(ctx, 0, fy, W, bottom - fy, night ? '#5a4a3a' : '#c8945c');
    for (let y = fy + 4; y < bottom; y += 10) rect(ctx, 0, y, W, 1, night ? '#4d3f31' : '#b8834c');
    for (let x = 0; x < W + 28; x += 28) rect(ctx, x + ((Math.floor(x / 28) % 2) ? 14 : 0) - 14, fy + 4, 1, bottom - fy - 4, night ? '#4d3f31' : '#b8834c');
    const hx = W - 9, hy = fy - 7;
    fillEllipse(ctx, hx, hy, 11, 15, PAL.k);
    fillEllipse(ctx, hx, hy + 1, 9, 13, night ? '#1a1430' : '#2a2140');
    rect(ctx, hx - 12, hy + 1, 24, 20, base);
    rect(ctx, hx - 12, fy - 5, 24, 5, night ? '#3a3060' : '#d9b98a');
  } else if (id === 'cozinha'){
    const wall = night ? '#3f5560' : '#e8f0d6', tileA = night ? '#4a6572' : '#fffaf0', tileB = night ? '#3c5361' : '#cfe3c9';
    rect(ctx, 0, top, W, fy - top, wall);
    const ty = fy - 24;
    for (let y = ty; y < fy - 4; y += 8) for (let x = 0; x < W; x += 8){
      rect(ctx, x, y, 8, 8, ((x / 8 + (y - ty) / 8) % 2) ? tileB : tileA); rect(ctx, x, y, 8, 1, night ? '#33474f' : '#b9d0b3'); rect(ctx, x, y, 1, 8, night ? '#33474f' : '#b9d0b3');
    }
    rect(ctx, 0, fy - 4, W, 4, night ? '#2f4149' : '#a3b89d');
    for (let y = fy; y < bottom; y += 10) for (let x = 0; x < W; x += 10)
      rect(ctx, x, y, 10, Math.min(10, bottom - y), ((x / 10 + (y - fy) / 10) % 2) ? (night ? '#5d5346' : '#e9dfc9') : (night ? '#4d4439' : '#d1bf96'));
    const wx = Math.round(W * 0.56), wy = top + 10;
    box(ctx, wx, wy, 26, 20, night ? '#1b1233' : '#bfe6ff', PAL.k); rect(ctx, wx + 12, wy + 1, 2, 18, PAL.k); rect(ctx, wx + 1, wy + 9, 24, 2, PAL.k);
    if (night){ px(ctx, wx + 5, wy + 4, PAL.w); px(ctx, wx + 20, wy + 6, PAL.w); px(ctx, wx + 8, wy + 14, PAL.w); }
    else { fillEllipse(ctx, wx + 19, wy + 5, 3, 3, '#ffd23f'); }
  } else if (id === 'banheiro'){
    const wall = night ? '#33455a' : '#d6ecf3', line = night ? '#2c3d50' : '#b9d7e2';
    rect(ctx, 0, top, W, fy - top, wall);
    for (let y = top + 8; y < fy - 4; y += 12) rect(ctx, 0, y, W, 1, line);
    for (let x = 8; x < W; x += 16) rect(ctx, x, top, 1, fy - top, line);
    rect(ctx, 0, fy - 4, W, 4, night ? '#2a3a4c' : '#9ec4d4');
    for (let y = fy; y < bottom; y += 10) for (let x = 0; x < W; x += 10)
      rect(ctx, x, y, 10, Math.min(10, bottom - y), ((x / 10 + (y - fy) / 10) % 2) ? (night ? '#4a5e70' : '#eaf6fa') : (night ? '#3d4f5f' : '#bfd9e6'));
  } else {
    const wall = night ? '#3d3160' : '#e8dcf5', star = night ? '#6b5fa8' : '#fffaf0';
    rect(ctx, 0, top, W, fy - top, wall);
    for (let y = top + 8; y < fy - 6; y += 14) for (let x = (Math.floor(y / 14) % 2) ? 9 : 2; x < W; x += 18){ px(ctx, x, y, star); px(ctx, x - 1, y + 1, star); px(ctx, x + 1, y + 1, star); px(ctx, x, y + 2, star); }
    rect(ctx, 0, fy - 5, W, 5, night ? '#2f2650' : '#c9b8e0'); rect(ctx, 0, fy - 5, W, 1, night ? '#241c40' : '#a998c9');
    rect(ctx, 0, fy, W, bottom - fy, night ? '#4a3f66' : '#cdb9e6');
    for (let y = fy + 3; y < bottom; y += 8) for (let x = ((Math.floor((y - fy) / 8)) % 2) ? 4 : 0; x < W; x += 8) px(ctx, x, y, night ? '#54487a' : '#dccdf5');
  }
}
function drawRoomItems(ctx, r, night, t){
  const room = ROOMS[r], fb = furnBottom();
  const opts = key => { const a = SCENE.active[key]; return {night, t, active:!!a, on:!!a, cat:a && a.cat, hidden:key === 'casinha' && S.hidden, coins:key === 'cofre' && coinsInBank() > 0}; };
  /* tapetes (embaixo de tudo) e parede */
  for (const k of S.decor){
    const d = DECOR[k]; if (!d || d.room !== room.id || d.kind !== 'rug') continue;
    const rr = decorRect(k), def = decorDef(k);
    drawFurn(ctx, def.draw, rr.x, rr.y, rr.w, rr.h, opts(k));
  }
  for (const k of S.decor){
    const d = DECOR[k]; if (!d || d.room !== room.id || !d.wall) continue;
    const rr = decorRect(k), def = decorDef(k);
    drawFurn(ctx, def.draw, rr.x, rr.y, rr.w, rr.h, opts(k));
  }
  /* moveis */
  for (const key of room.slots){
    const d = furnDef(key), x = slotX(key), y = fb - d.h;
    drawFurn(ctx, d.draw, x, y, d.w, d.h, {night, t});
    if (key === 'luminaria' && night && !S.sleeping){ ctx.save(); ctx.globalAlpha = 0.25; fillEllipse(ctx, x + d.w / 2, fb + 2, hasUpgrade('luminaria') ? 24 : 16, 8, '#ffd23f'); ctx.restore(); }
  }
  /* em cima de moveis, banheira e chao */
  for (const k of S.decor){
    const d = DECOR[k]; if (!d || d.room !== room.id || d.wall || d.kind) continue;
    if (k === 'roda' && SCENE.riding) continue;
    const rr = decorRect(k), def = decorDef(k);
    drawFurn(ctx, def.draw, rr.x, rr.y, rr.w, rr.h, opts(k));
  }
}
function drawIcons(ctx){
  rect(ctx, 0, H - LAY.bar, W, LAY.bar, '#3a2a4a');
  rect(ctx, 0, H - LAY.bar, W, 1, '#6b5a86');
  ICONS.forEach((ic, i) => {
    const r = iconRect(i);
    if (SCENE.sel === i){ rect(ctx, r.x - 3, r.y - 3, 16, 16, PAL.y); rect(ctx, r.x - 2, r.y - 2, 14, 14, PAL.w); }
    drawSpr(ctx, ic.spr, r.x, r.y);
  });
}
function drawNeedsHint(ctx, t, rx, ry){
  const n = needs();
  if (!n.length) return;
  const i = Math.floor(t / 1400) % n.length;
  const k = n[i];
  const x = rx + (S.stage === 'adult' ? 14 : 12), y = ratTop(S.stage, ry) - 8;
  box(ctx, x - 1, y - 1, 10, 10, PAL.w, PAL.k);
  const spr = {hunger:'queijo', energy:'zzz', hygiene:'sabonete', fun:'coracao', sick:'termometro'}[k];
  drawSpr(ctx, spr, x, y);
  if (Math.floor(t / 350) % 2) px(ctx, x + 3, y + 9, PAL.k);
}

function goRoom(idx, dir){
  const n = ROOMS.length;
  idx = ((idx % n) + n) % n;
  if (idx === SCENE.room) return;
  const d = dir || (idx > SCENE.room ? 1 : -1);
  SCENE.trans = {from:SCENE.room, to:idx, start:performance.now(), dir:d};
  SCENE.riding = false;
  if (SCENE.anim && SCENE.anim.type !== 'evolve') SCENE.anim = null;
  SCENE.room = idx; S.room = idx;
  SCENE.ratX = d > 0 ? W + 16 : -16;
  SCENE.ratY = Math.min(Math.max(SCENE.ratY, LAY.walkTop), LAY.walkBottom);
  SCENE.targetX = Math.round(W * (0.3 + Math.random() * 0.4));
  SCENE.targetY = SCENE.ratY;
  SCENE.walkT = 3000;
}

function updateScene(dt, t){
  if (SCENE.trans && t - SCENE.trans.start > 280) SCENE.trans = null;
  for (const k of Object.keys(SCENE.active)) if (t > SCENE.active[k].until) delete SCENE.active[k];
  if (SCENE.riding){
    const dx = SCENE.targetX - SCENE.ratX, dy = SCENE.targetY - SCENE.ratY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.5){
      const v = 58 * dt / 1000, k = Math.min(1, v / dist), mv = dist * k;
      SCENE.ratX += dx * k; SCENE.ratY += dy * k;
      if (Math.abs(dx) > 1) SCENE.dir = dx < 0 ? -1 : 1;
      SCENE.wheelAng += (dx < 0 ? -1 : 1) * mv / WHEEL_R;
      SCENE.rideDist += mv; S.stats.ride = (S.stats.ride || 0) + mv;
      if (SCENE.rideDist > 40){ SCENE.rideDist = 0; S.fun = clamp(S.fun + 1); S.energy = clamp(S.energy - 0.3); if (Math.random() < 0.3) addHearts(1); }
    }
  } else if (S.started && !S.sleeping && !S.hidden && !SCENE.anim && mood() !== 'sick'){
    SCENE.walkT -= dt;
    if (SCENE.walkT <= 0){
      SCENE.walkT = 2500 + Math.random() * 5000;
      if (Math.random() < 0.65) randomWalkTarget();
    }
    SCENE.idleT = (SCENE.idleT == null ? 6000 : SCENE.idleT) - dt;
    if (SCENE.idleT <= 0){ SCENE.idleT = 9000 + Math.random() * 14000; startIdle(); }
    const dx = SCENE.targetX - SCENE.ratX, dy = SCENE.targetY - SCENE.ratY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.5){
      const v = (dist > 40 ? 32 : 13) * dt / 1000;
      const k = Math.min(1, v / dist);
      SCENE.ratX += dx * k; SCENE.ratY += dy * k;
      if (Math.abs(dx) > 1) SCENE.dir = dx < 0 ? -1 : 1;
    }
  }
  if (t > SCENE.blinkAt){
    SCENE.blinking = !SCENE.blinking;
    SCENE.blinkAt = t + (SCENE.blinking ? 120 : 2200 + Math.random() * 2500);
  }
  if (SCENE.anim && t > SCENE.anim.until) SCENE.anim = null;
  SCENE.fx = SCENE.fx.filter(f => t < f.until);
}

/* ---------- comportamentos ociosos, falas e truques ---------- */
const IDLES = {yawn:1600, stretch:1400, scratch:1200, sniff:1800, groom:2200, sofa:9000, lookwin:5000};
function startIdle(){
  const room = ROOMS[SCENE.room].id;
  const opts = ['yawn', 'stretch', 'scratch', 'sniff', 'groom'];
  if (room === 'sala') opts.push('sofa', 'sofa');
  if (room === 'quarto' && hasDecor('janela')) opts.push('lookwin');
  const sub = opts[Math.floor(Math.random() * opts.length)];
  if (sub === 'sofa'){ const f = furnRect('sofa'); SCENE.ratX = f.x + Math.round(f.w / 2); SCENE.ratY = f.y + f.h - 3; SCENE.dir = 1; }
  if (sub === 'lookwin'){ const r = decorRect('janela'); SCENE.ratX = r.x + Math.round(r.w / 2); SCENE.ratY = LAY.walkTop; }
  SCENE.targetX = SCENE.ratX; SCENE.targetY = SCENE.ratY;
  setAnim('idle', IDLES[sub], {sub});
}
const LINES = {
  baby:  ['Uii!', 'De novo, de novo!', 'Cadê o queijo?', 'Brinca comigo?', 'Squeak!', 'Colo?'],
  young: ['Tá, tá...', 'Tô ocupado.', 'Cadê meu fone?', 'Só mais 5 minutos.', 'Tô lindo, né?', 'Que tédio.'],
  adult: ['Bom dia. Café?', 'Isso é sério.', 'Um queijo cairia bem.', 'Obrigado pela visita.', 'Tudo em ordem.', 'Elegante, eu sei.'],
  sick:  ['Cof cof...', 'Não tô bem...', 'Remédio, por favor.'],
  sad:   ['Tô triste...', 'Ninguém liga pra mim.', 'Suspiro.'],
  hungry:['Fome!', 'Queijo. Agora.', 'Minha barriga roncou.'],
  sleepy:['Tô com sono...', 'Bocejo.', 'Cama?'],
  happy: ['Melhor dia!', 'Te amo!', 'Feliz demais!'],
  tickle:['Hahaha!', 'Para, para!', 'Cócegas não!', 'Hihihi!'],
  ear:   ['Ei, a orelha!', 'Isso faz cócegas.', 'Hmm...'],
  cuddle:['Aaah...', 'Cafuné bom.', 'Não para.', 'Zzz... ops.']
};
function ratLine(kind){
  let pool;
  if (kind) pool = LINES[kind];
  else if (S.sick) pool = LINES.sick;
  else if (S.hunger < 25) pool = LINES.hungry;
  else if (S.energy < 25) pool = LINES.sleepy;
  else if (mood() === 'sad') pool = LINES.sad;
  else if (mood() === 'happy' && Math.random() < 0.4) pool = LINES.happy;
  else pool = LINES[S.stage] || LINES.baby;
  return pool[Math.floor(Math.random() * pool.length)];
}
function doTrick(){
  const known = knownTricks();
  if (!known.length) return false;
  const k = known[Math.floor(Math.random() * known.length)];
  setAnim('trick', k === 'morto' ? 2000 : 1400, {sub:k});
  S.fun = clamp(S.fun + 2);
  SFX.play(k === 'morto' ? 'sad' : 'happy');
  return true;
}
function drawEventAmbient(ctx, night, t){
  const ev = currentEvent(); if (!ev) return;
  const top = LAY.top;
  if (ev.id === 'junina'){
    const cols = [PAL.r, PAL.y, PAL.b, PAL.e, PAL.p, PAL.o];
    rect(ctx, 0, top + 6, W, 1, PAL.k);
    for (let x = 2, i = 0; x < W; x += 9, i++){ for (let r = 0; r < 5; r++) rect(ctx, x + r, top + 7 + r, 7 - r * 2, 1, cols[i % cols.length]); }
  } else if (ev.id === 'halloween'){
    for (let i = 0; i < 7; i++){ px(ctx, i * 3, top + 2 + i * 2, PAL.g); px(ctx, 2 + i * 2, top + i * 3, PAL.g); }
    for (let i = 1; i < 5; i++){ rect(ctx, 0, top + i * 4, i * 5, 1, PAL.g); rect(ctx, i * 4, top, 1, i * 5, PAL.g); }
    const bx = W - 30 + Math.round(Math.sin(t / 500) * 6), by = top + 12 + Math.round(Math.cos(t / 700) * 3);
    px(ctx, bx - 3, by - 1, PAL.k); px(ctx, bx - 2, by, PAL.k); px(ctx, bx - 1, by, PAL.k); px(ctx, bx, by + 1, PAL.k); px(ctx, bx + 1, by, PAL.k); px(ctx, bx + 2, by, PAL.k); px(ctx, bx + 3, by - 1, PAL.k);
  } else if (ev.id === 'natal'){
    const cols = [PAL.r, PAL.y, PAL.e, PAL.b];
    for (let x = 0; x < W; x += 2) px(ctx, x, top + 5 + Math.round(Math.sin(x / 8) * 2), PAL.E);
    for (let x = 3, i = 0; x < W; x += 8, i++){ const on = (i + Math.floor(t / 400)) % 2 === 0; rect(ctx, x, top + 7 + Math.round(Math.sin(x / 8) * 2), 2, 3, on ? cols[i % 4] : PAL.G); }
  }
}

function drawRoom(ctx, r, ox, night, withRat, t){
  ctx.save(); ctx.translate(ox, 0);
  drawRoomBg(ctx, r, night);
  if (ROOMS[r].id === 'sala') drawEventAmbient(ctx, night, t);
  drawRoomItems(ctx, r, night, t);
  for (let i = 0; i < S.poops; i++){ const p = poopSpot(i); if (p.room === r) drawSpr(ctx, 'coco', p.x - 4, p.y - 8); }
  if (withRat) drawRatInRoom(ctx, r, t);
  ctx.restore();
}
function ratPos(roomId){
  const a = SCENE.anim;
  if (S.sleeping){ if (roomId !== 'quarto') return null; const b = bedSpot(); return {x:b.x, y:b.y}; }
  if (S.hidden){ return null; }
  if (a && a.type === 'eat' && roomId === 'cozinha'){ const s = tableSpot(); return {x:s.x, y:s.y}; }
  if (a && a.type === 'bath' && roomId === 'banheiro'){ const s = tubSpot(); return {x:s.x, y:s.y}; }
  if (a && a.type === 'nap' && roomId === 'quarto'){ const r = decorRect('rede'); return {x:r.x + Math.round(r.w / 2), y:r.y + r.h - 2}; }
  return {x:SCENE.ratX, y:SCENE.ratY};
}
function drawRatInRoom(ctx, r, t){
  const a = SCENE.anim, m = mood();
  const roomId = ROOMS[r].id;
  const pos = ratPos(roomId); if (!pos) return;
  let face = m === 'sick' ? 'sick' : m === 'sad' ? 'sad' : (SCENE.blinking ? 'blink' : 'normal');
  let holding = null, flip = SCENE.dir < 0, sleeping = S.sleeping, armsUp = false;
  let rx = pos.x, ry = pos.y;
  if (S.sleeping) flip = false;
  if (a && a.type === 'idle'){
    const ph = t - (a.until - IDLES[a.sub]);
    if (a.sub === 'yawn'){ face = 'wow'; }
    else if (a.sub === 'stretch'){ armsUp = true; face = 'blink'; ry -= 1; }
    else if (a.sub === 'scratch'){ flip = Math.floor(t / 120) % 2 === 0; face = 'blink'; }
    else if (a.sub === 'sniff'){ face = 'normal'; const k = Math.floor(ph / 300) % 3; px(ctx, rx + (flip ? -1 : 1) * (9 + k * 2), ratTop(S.stage, ry) + 12 - k, PAL.G); }
    else if (a.sub === 'groom'){ face = 'blink'; armsUp = Math.floor(t / 300) % 2 === 0; }
    else if (a.sub === 'sofa'){ face = 'happy'; }
    else if (a.sub === 'lookwin'){ face = 'wow'; }
  } else if (a && a.type === 'trick'){
    const ph = t - (a.until - (a.sub === 'morto' ? 2000 : 1400));
    if (a.sub === 'girar'){ flip = Math.floor(t / 90) % 2 === 0; face = 'happy'; }
    else if (a.sub === 'tchau'){ armsUp = Math.floor(t / 250) % 2 === 0; face = 'happy'; }
    else if (a.sub === 'morto'){ face = 'dead'; ry += 2; }
    else if (a.sub === 'pulinho'){ face = 'happy'; ry -= Math.round(Math.abs(Math.sin(ph / 220)) * 10); }
  } else if (a && a.type === 'tickle'){ face = 'laugh'; ry -= (Math.floor(t / 110) % 2) * 2; flip = Math.floor(t / 400) % 2 === 0; }
  else if (a && a.type === 'ear'){ face = 'blink'; flip = Math.floor(t / 150) % 2 === 0; }
  else if (a && a.type === 'cuddle'){ face = 'pet'; ry += (Math.floor(t / 500) % 2); }
  else if (a){
    if (a.type === 'eat'){ face = 'eat'; holding = a.food; flip = false; }
    else if (a.type === 'snack'){ const ph = t - (a.until - 2600); if (ph > 700){ face = 'eat'; holding = 'biscoito'; } else face = 'wow'; flip = false; }
    else if (a.type === 'drink'){ face = Math.floor(t / 250) % 2 ? 'eat' : 'wow'; flip = false; ry -= 2; }
    else if (a.type === 'happy'){ face = 'happy'; ry -= (Math.floor(t / 160) % 2) * 3; }
    else if (a.type === 'pet' || a.type === 'mirror'){ face = 'pet'; }
    else if (a.type === 'bath' || a.type === 'shower'){ face = 'happy'; flip = false; }
    else if (a.type === 'med'){ face = 'wow'; }
    else if (a.type === 'no'){ face = 'sad'; flip = Math.floor(t / 150) % 2 === 0; }
    else if (a.type === 'evolve'){ face = 'wow'; }
    else if (a.type === 'nap'){ sleeping = true; }
    else if (a.type === 'gnaw'){ face = 'eat'; holding = decorTier('roer') ? null : null; }
    else if (a.type === 'watch'){ face = 'happy'; flip = true; }
    else if (a.type === 'dance'){ face = 'happy'; flip = Math.floor(t / 300) % 2 === 0; ry -= (Math.floor(t / 150) % 2) * 2; }
    else if (a.type === 'look'){ const cat = a.cat && (a.until - t) < 2500; face = cat ? 'sad' : 'wow'; if (cat){ rx += Math.min(24, (2500 - (a.until - t)) / 40); } flip = false; }
  }
  const riding = SCENE.riding && roomId === 'sala';
  if (riding){
    face = 'happy';
    const moving = Math.hypot(SCENE.targetX - SCENE.ratX, SCENE.targetY - SCENE.ratY) > 1;
    drawWheelBack(ctx, rx, ry - WHEEL_R + 2, WHEEL_R, WHEEL_COLORS[decorTier('roda')]);
    ry = ry - 4 + (moving ? (Math.floor(t / 120) % 2) : 0);
  }
  drawRat(ctx, rx, ry, {
    stage:S.stage, form:S.form, skin:S.skin, hat:S.hat, outfit:S.outfit, face, t, flip, sleeping, holding, armsUp
  });
  if (riding) drawWheelFront(ctx, rx, pos.y - WHEEL_R + 2, WHEEL_R, SCENE.wheelAng, 0.55, WHEEL_COLORS[decorTier('roda')]);
  if (a && a.type === 'nap'){ const rr = decorRect('rede'); const def = decorDef('rede'); ctx.save(); ctx.globalAlpha = 0.85; rect(ctx, rr.x + Math.round(rr.w / 2) - 11, rr.y + rr.h - 6, 22, 5, decorTier('rede') ? PAL.p : PAL.g); rect(ctx, rr.x + Math.round(rr.w / 2) - 11, rr.y + rr.h - 2, 22, 1, PAL.k); ctx.restore(); }
  if (a && (a.type === 'bath' || a.type === 'shower')){
    for (let i = 0; i < 8; i++){
      const ph = (t / 400 + i * 0.7) % 1;
      const bx = rx - 16 + ((i * 37) % 32), by = ratTop(S.stage, ry) + 28 - ph * 34;
      oEllipse(ctx, bx, by, 2, 2, '#dff3ff', '#5aa9e6');
    }
  }
  if (a && a.type === 'gnaw'){ for (let i = 0; i < 3; i++){ const ph = (t / 300 + i * 0.33) % 1; px(ctx, rx - 6 + i * 6 + Math.round(ph * 4), ry - 8 + Math.round(ph * 8), PAL.n); } }
  if (a && a.type === 'evolve'){
    for (let i = 0; i < 6; i++){
      const ph = (t / 500 + i * 0.37) % 1;
      drawSpr(ctx, 'brilho', rx - 20 + ((i * 53) % 40), ratTop(S.stage, ry) - 4 + ph * 30 - 10);
    }
  }
  for (const f of SCENE.fx){
    const p = 1 - (f.until - t) / f.dur;
    if (f.kind === 'heart') drawSpr(ctx, 'coracao', f.x, f.y - p * 18, {alpha:1 - p});
    else if (f.kind === 'crumb') px(ctx, f.x + p * f.vx, f.y + p * 10, PAL.Y);
    else if (f.kind === 'brilho') drawSpr(ctx, 'brilho', f.x, f.y - p * 6, {alpha:1 - p});
    else if (f.kind === 'coin') drawSpr(ctx, 'moeda', f.x, f.y - p * 22, {alpha:1 - p});
  }
  if (!S.sleeping && (!a || a.type === 'idle')) drawNeedsHint(ctx, t, rx, ry);
}
/* zona tocada no rato: 'ear' | 'belly' | 'head' */
function ratZone(x, y){
  const pos = ratPos(ROOMS[SCENE.room].id); if (!pos) return null;
  const top = ratTop(S.stage, pos.y);
  if (Math.abs(x - pos.x) > 18 || y < top - 6 || y > pos.y + 6) return null;
  if (y < top + 7 && Math.abs(x - pos.x) > 3) return 'ear';
  if (y > pos.y - (S.stage === 'adult' ? 14 : 10)) return 'belly';
  return 'head';
}

function drawScene(ctx, t){
  const night = S.sleeping;
  rect(ctx, 0, 0, W, H, '#f6ecd2');
  if (SCENE.trans){
    const p = Math.min(1, (t - SCENE.trans.start) / 280), d = SCENE.trans.dir;
    drawRoom(ctx, SCENE.trans.from, -p * d * W, night, false, t);
    drawRoom(ctx, SCENE.trans.to, (1 - p) * d * W, night, false, t);
  } else {
    drawRoom(ctx, SCENE.room, 0, night, true, t);
  }
  if (night){
    ctx.save(); ctx.globalAlpha = 0.42; rect(ctx, 0, LAY.top, W, H - LAY.bar - LAY.top, '#1b1233'); ctx.restore();
  }
  rect(ctx, 0, 0, W, LAY.top, '#3a2a4a'); rect(ctx, 0, LAY.top - 1, W, 1, '#6b5a86');
  drawIcons(ctx);
}
function addHearts(n){
  const t = performance.now();
  const p = ratPos(ROOMS[SCENE.room].id) || {x:SCENE.ratX, y:SCENE.ratY};
  for (let i = 0; i < n; i++) SCENE.fx.push({kind:'heart', x:p.x - 10 + Math.random() * 20, y:ratTop(S.stage, p.y) - 4, until:t + 900 + i * 200, dur:900 + i * 200});
}
function addCrumbs(){
  const t = performance.now();
  const p = ratPos(ROOMS[SCENE.room].id) || {x:SCENE.ratX, y:SCENE.ratY};
  for (let i = 0; i < 6; i++) SCENE.fx.push({kind:'crumb', x:p.x - 2 + Math.random() * 4, y:p.y - 12, vx:(Math.random() - 0.5) * 16, until:t + 500 + Math.random() * 300, dur:700});
}
function setAnim(type, ms, data){
  SCENE.anim = Object.assign({type, until:performance.now() + ms}, data || {});
}
