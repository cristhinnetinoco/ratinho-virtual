/* ===== A toca: comodos, cena principal, barra de icones ===== */
let W = 125, H = 270, SCALE = 3;
const LAY = {
  top:14, bar:26,
  get floorH(){ return Math.round((H - this.top - this.bar) * 0.45); },
  get floorY(){ return H - this.bar - this.floorH; },        /* parede encontra o chao */
  get walkTop(){ return this.floorY + 22; },                  /* area onde o rato anda (pes) */
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
  riding:false, wheelAng:0, rideDist:0
};
const WHEEL_R = 15;
function wheelRect(){
  const d = DECOR.roda, c = {w:d.w, h:d.h};
  const x = Math.round(d.x * W) - Math.round(c.w / 2), y = LAY.floorY + Math.round(LAY.floorH * 0.62) - c.h;
  return {x, y, w:c.w, h:c.h};
}
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

function iconRect(i){
  const sw = W / ICONS.length;
  return {x:Math.round(i * sw + (sw - 10) / 2), y:H - LAY.bar + 8, w:10, h:10};
}
function slotX(key){ return Math.round(FURN[key].x * W); }
function furnBottom(){ return LAY.floorY + 10; }
function bedSpot(){ const d = furnDef('cama'); return {x:slotX('cama') + d.sleep.dx, y:furnBottom() - d.h + d.sleep.dy}; }
function tableSpot(){ const d = furnDef('mesa'); return {x:slotX('mesa') + Math.round(d.w / 2) - 6, y:furnBottom() + 16}; }
function tubSpot(){ const d = furnDef('banheira'); return {x:slotX('banheira') + Math.round(d.w / 2), y:furnBottom() - Math.round(d.h * 0.35)}; }
function poopSpot(i){
  const rooms = [0, 2, 1], xs = [0.3, 0.55, 0.75], ys = [0.35, 0.7, 0.5];
  return {room:rooms[i % 3], x:Math.round(xs[i % 3] * W), y:Math.round(LAY.walkTop + ys[i % 3] * (LAY.walkBottom - LAY.walkTop))};
}
function randomWalkTarget(){
  SCENE.targetX = 16 + Math.random() * (W - 32);
  SCENE.targetY = LAY.walkTop + Math.random() * (LAY.walkBottom - LAY.walkTop);
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
    /* buraco da toca (entrada) */
    const hx = W - 9, hy = fy - 7;
    fillEllipse(ctx, hx, hy, 11, 15, PAL.k);
    fillEllipse(ctx, hx, hy + 1, 9, 13, night ? '#1a1430' : '#2a2140');
    rect(ctx, hx - 12, hy + 1, 24, 20, base);
    rect(ctx, hx - 12, fy - 5, 24, 5, night ? '#3a3060' : '#d9b98a');
    if (S.decor.includes('tapete')){
      const rw = Math.round(W * 0.46), rh = Math.round(LAY.floorH * 0.3), rx = Math.round((W - rw) / 2), ry = fy + Math.round(LAY.floorH * 0.42);
      rect(ctx, rx, ry, rw, rh, PAL.k); rect(ctx, rx + 1, ry + 1, rw - 2, rh - 2, '#e05a4e');
      rect(ctx, rx + 3, ry + 3, rw - 6, rh - 6, '#f5943c'); rect(ctx, rx + 5, ry + 5, rw - 10, rh - 10, '#ffd23f');
    }
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
  } else {
    const wall = night ? '#33455a' : '#d6ecf3', line = night ? '#2c3d50' : '#b9d7e2';
    rect(ctx, 0, top, W, fy - top, wall);
    for (let y = top + 8; y < fy - 4; y += 12) rect(ctx, 0, y, W, 1, line);
    for (let x = 8; x < W; x += 16) rect(ctx, x, top, 1, fy - top, line);
    rect(ctx, 0, fy - 4, W, 4, night ? '#2a3a4c' : '#9ec4d4');
    for (let y = fy; y < bottom; y += 10) for (let x = 0; x < W; x += 10)
      rect(ctx, x, y, 10, Math.min(10, bottom - y), ((x / 10 + (y - fy) / 10) % 2) ? (night ? '#4a5e70' : '#eaf6fa') : (night ? '#3d4f5f' : '#bfd9e6'));
    if (S.decor.includes('tapete_banho')){
      const rw = Math.round(W * 0.36), rx = Math.round((W - rw) / 2), ry = fy + Math.round(LAY.floorH * 0.5);
      rect(ctx, rx, ry, rw, 12, PAL.k); rect(ctx, rx + 1, ry + 1, rw - 2, 10, '#5aa9e6'); rect(ctx, rx + 3, ry + 3, rw - 6, 6, '#9ad4f5');
    }
  }
}
function drawRoomItems(ctx, r, night){
  const room = ROOMS[r], fb = furnBottom();
  for (const k of S.decor){
    const d = DECOR[k]; if (!d || d.room !== room.id || !d.wall) continue;
    if (d.draw) drawFurn(ctx, d.draw, Math.round(d.x * W), LAY.top + d.y, d.w, d.h, night);
    else drawSpr(ctx, d.spr || k, Math.round(d.x * W), LAY.top + d.y);
  }
  for (const key of room.slots){
    const d = furnDef(key), x = slotX(key), y = fb - d.h;
    drawFurn(ctx, d.draw, x, y, d.w, d.h, night);
    if (key === 'luminaria' && night && !S.sleeping){ ctx.save(); ctx.globalAlpha = 0.25; fillEllipse(ctx, x + d.w / 2, fb + 2, hasUpgrade('luminaria') ? 24 : 16, 8, '#ffd23f'); ctx.restore(); }
  }
  for (const k of S.decor){
    const d = DECOR[k]; if (!d || d.room !== room.id || !(d.floor || d.onTub)) continue;
    if (d.draw){
      if (k === 'roda' && SCENE.riding) continue;
      const r = wheelRect(); drawFurn(ctx, d.draw, r.x, r.y, r.w, r.h, night); continue;
    }
    const spr = d.spr || k, c = spriteCanvas(spr); if (!c) continue;
    if (d.onTub){ const t = furnDef('banheira'); drawSpr(ctx, spr, slotX('banheira') + 5, fb - t.h - c.height + 4); }
    else drawSpr(ctx, spr, Math.round(d.x * W) - Math.round(c.width / 2), LAY.floorY + Math.round(LAY.floorH * 0.62) - c.height);
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
  idx = ((idx % 3) + 3) % 3;
  if (idx === SCENE.room) return;
  const d = dir || (idx > SCENE.room ? 1 : -1);
  SCENE.trans = {from:SCENE.room, to:idx, start:performance.now(), dir:d};
  SCENE.riding = false;
  SCENE.room = idx; S.room = idx;
  SCENE.ratX = d > 0 ? W + 16 : -16;
  SCENE.ratY = Math.min(Math.max(SCENE.ratY, LAY.walkTop), LAY.walkBottom);
  SCENE.targetX = Math.round(W * (0.3 + Math.random() * 0.4));
  SCENE.targetY = SCENE.ratY;
  SCENE.walkT = 3000;
}

function updateScene(dt, t){
  if (SCENE.trans && t - SCENE.trans.start > 280) SCENE.trans = null;
  if (SCENE.riding){
    const dx = SCENE.targetX - SCENE.ratX, dy = SCENE.targetY - SCENE.ratY;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.5){
      const v = 58 * dt / 1000, k = Math.min(1, v / dist), mv = dist * k;
      SCENE.ratX += dx * k; SCENE.ratY += dy * k;
      if (Math.abs(dx) > 1) SCENE.dir = dx < 0 ? -1 : 1;
      SCENE.wheelAng += (dx < 0 ? -1 : 1) * mv / WHEEL_R;
      SCENE.rideDist += mv;
      if (SCENE.rideDist > 40){ SCENE.rideDist = 0; S.fun = clamp(S.fun + 1); S.energy = clamp(S.energy - 0.3); if (Math.random() < 0.3) addHearts(1); }
    }
  } else if (S.started && !S.sleeping && !SCENE.anim && mood() !== 'sick'){
    SCENE.walkT -= dt;
    if (SCENE.walkT <= 0){
      SCENE.walkT = 2500 + Math.random() * 5000;
      if (Math.random() < 0.65) randomWalkTarget();
    }
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

function drawRoom(ctx, r, ox, night, withRat, t){
  ctx.save(); ctx.translate(ox, 0);
  drawRoomBg(ctx, r, night);
  drawRoomItems(ctx, r, night);
  for (let i = 0; i < S.poops; i++){ const p = poopSpot(i); if (p.room === r) drawSpr(ctx, 'coco', p.x - 4, p.y - 8); }
  if (withRat) drawRatInRoom(ctx, r, t);
  ctx.restore();
}
function ratPos(roomId){
  const a = SCENE.anim;
  if (S.sleeping){ if (roomId !== 'sala') return null; const b = bedSpot(); return {x:b.x, y:b.y}; }
  if (a && a.type === 'eat' && roomId === 'cozinha'){ const s = tableSpot(); return {x:s.x, y:s.y}; }
  if (a && a.type === 'bath' && roomId === 'banheiro'){ const s = tubSpot(); return {x:s.x, y:s.y}; }
  return {x:SCENE.ratX, y:SCENE.ratY};
}
function drawRatInRoom(ctx, r, t){
  const a = SCENE.anim, m = mood();
  const roomId = ROOMS[r].id;
  const pos = ratPos(roomId); if (!pos) return;
  let face = m === 'sick' ? 'sick' : m === 'sad' ? 'sad' : (SCENE.blinking ? 'blink' : 'normal');
  let holding = null, flip = SCENE.dir < 0;
  let rx = pos.x, ry = pos.y;
  if (S.sleeping) flip = false;
  if (a){
    if (a.type === 'eat'){ face = 'eat'; holding = a.food; flip = false; }
    else if (a.type === 'happy'){ face = 'happy'; ry -= (Math.floor(t / 160) % 2) * 3; }
    else if (a.type === 'pet'){ face = 'pet'; }
    else if (a.type === 'bath'){ face = 'happy'; flip = false; }
    else if (a.type === 'med'){ face = 'wow'; }
    else if (a.type === 'no'){ face = 'sad'; flip = Math.floor(t / 150) % 2 === 0; }
    else if (a.type === 'evolve'){ face = 'wow'; }
  }
  const riding = SCENE.riding && roomId === 'sala';
  if (riding){
    face = 'happy';
    const moving = Math.hypot(SCENE.targetX - SCENE.ratX, SCENE.targetY - SCENE.ratY) > 1;
    drawWheelBack(ctx, rx, ry - WHEEL_R + 2, WHEEL_R);
    ry = ry - 4 + (moving ? (Math.floor(t / 120) % 2) : 0);
  }
  drawRat(ctx, rx, ry, {
    stage:S.stage, form:S.form, skin:S.skin, hat:S.hat, outfit:S.outfit, face, t, flip, sleeping:S.sleeping, holding
  });
  if (riding) drawWheelFront(ctx, rx, pos.y - WHEEL_R + 2, WHEEL_R, SCENE.wheelAng, 0.55);
  if (a && a.type === 'bath'){
    for (let i = 0; i < 8; i++){
      const ph = (t / 400 + i * 0.7) % 1;
      const bx = rx - 16 + ((i * 37) % 32), by = ratTop(S.stage, ry) + 28 - ph * 34;
      oEllipse(ctx, bx, by, 2, 2, '#dff3ff', '#5aa9e6');
    }
  }
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
  }
  if (!S.sleeping && !a) drawNeedsHint(ctx, t, rx, ry);
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
