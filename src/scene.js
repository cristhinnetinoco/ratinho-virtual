/* ===== A toca: cena principal, menu de icones e animacoes ===== */
const W = 144, H = 160;
const FLOOR_Y = 112;         /* linha do chao */
const RAT_Y = 132;           /* pes do rato */
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
  sel:-1,              /* icone selecionado (-1 = nenhum) */
  ratX:72, dir:1, walkT:0, targetX:72,
  anim:null,           /* {type, until, data} */
  hearts:[], bubbles:[], crumbs:[],
  blinkAt:0, blinking:false,
  poopPos:[[30, 128], [110, 130], [52, 136]],
  fx:[]
};

function iconRect(i){
  const col = i % 4, row = Math.floor(i / 4);
  const x = 4 + col * 36 + 8, y = row === 0 ? 2 : H - 14;
  return {x, y, w:12, h:12};
}

/* --- papel de parede --- */
function drawWall(ctx, night){
  const base = night ? '#4a3f7a' : '#f1d7c2';
  const dot  = night ? '#5a4f8c' : '#e8c3ab';
  rect(ctx, 0, 16, W, FLOOR_Y - 16, base);
  const p = S.paper;
  if (p === 'papel_listras'){
    for (let x = 0; x < W; x += 12) rect(ctx, x, 16, 6, FLOOR_Y - 16, night ? '#54488a' : '#f6e3d4');
  } else if (p === 'papel_bolinhas'){
    for (let y = 22; y < FLOOR_Y - 4; y += 12) for (let x = ((y / 12) % 2) ? 6 : 0; x < W; x += 12){
      rect(ctx, x + 2, y, 3, 3, night ? '#6b5fa8' : '#f4a7c0'); px(ctx, x + 3, y + 1, night ? '#8a7ec9' : '#fff');
    }
  } else if (p === 'papel_coracoes'){
    for (let y = 20; y < FLOOR_Y - 6; y += 14) for (let x = ((y / 14) % 2) ? 8 : 0; x < W; x += 16){
      const c = night ? '#7a5fa8' : '#ff8fa3';
      px(ctx, x + 1, y, c); px(ctx, x + 3, y, c); rect(ctx, x, y + 1, 5, 1, c); rect(ctx, x + 1, y + 2, 3, 1, c); px(ctx, x + 2, y + 3, c);
    }
  } else {
    for (let y = 22; y < FLOOR_Y - 4; y += 10) for (let x = ((y / 10) % 2) ? 5 : 0; x < W; x += 10) px(ctx, x + 2, y, dot);
  }
  /* rodape */
  rect(ctx, 0, FLOOR_Y - 4, W, 4, night ? '#3a3060' : '#d9b98a');
  rect(ctx, 0, FLOOR_Y - 4, W, 1, night ? '#2a2140' : '#b8955f');
  /* buraco da toca (entrada na parede, canto direito) */
  const hx = 122, hy = FLOOR_Y - 5;
  fillEllipse(ctx, hx, hy, 12, 15, PAL.k);
  fillEllipse(ctx, hx, hy + 1, 10, 13, night ? '#1a1430' : '#2a2140');
  rect(ctx, hx - 12, hy + 1, 24, 14, base);
  rect(ctx, hx - 12, FLOOR_Y - 4, 24, 4, night ? '#3a3060' : '#d9b98a');
}
function drawFloor(ctx, night){
  rect(ctx, 0, FLOOR_Y, W, H - FLOOR_Y, night ? '#5a4a3a' : '#c8945c');
  for (let y = FLOOR_Y + 2; y < H; y += 8) rect(ctx, 0, y, W, 1, night ? '#4d3f31' : '#b8834c');
  for (let x = 0; x < W; x += 24) rect(ctx, x + ((Math.floor((x / 24)) % 2) ? 12 : 0), FLOOR_Y + 2, 1, H - FLOOR_Y, night ? '#4d3f31' : '#b8834c');
  if (S.decor.includes('tapete')){
    rect(ctx, 44, 126, 56, 14, PAL.k); rect(ctx, 45, 127, 54, 12, '#e05a4e');
    rect(ctx, 47, 129, 50, 8, '#f5943c'); rect(ctx, 49, 131, 46, 4, '#ffd23f');
  }
}
function drawFurniture(ctx, night){
  if (S.decor.includes('poster')) drawSpr(ctx, 'poster', 14, 30);
  if (S.decor.includes('planta')) drawSpr(ctx, 'planta', 4, FLOOR_Y - 11);
  if (S.decor.includes('carretel')) drawSpr(ctx, 'carretel', 18, FLOOR_Y - 8);
  if (S.decor.includes('lampada')){
    drawSpr(ctx, 'lampada', 38, FLOOR_Y - 14);
    if (!S.sleeping && night){ ctx.save(); ctx.globalAlpha = 0.25; fillEllipse(ctx, 43, FLOOR_Y - 3, 14, 8, '#ffd23f'); ctx.restore(); }
  }
  if (S.decor.includes('cama')) drawSpr(ctx, 'cama', 90, FLOOR_Y - 7);
  if (S.decor.includes('roda')) drawSpr(ctx, 'roda', 60, FLOOR_Y - 26);
}
function drawIcons(ctx){
  ICONS.forEach((ic, i) => {
    const r = iconRect(i);
    if (SCENE.sel === i){ rect(ctx, r.x - 2, r.y - 2, 16, 16, PAL.y); rect(ctx, r.x - 1, r.y - 1, 14, 14, PAL.w); }
    drawSpr(ctx, ic.spr, r.x + 1, r.y + 1);
  });
  /* moedas no canto */
}
function drawNeedsHint(ctx, t){
  const n = needs();
  if (!n.length) return;
  const i = Math.floor(t / 1400) % n.length;
  const k = n[i];
  const x = SCENE.ratX + (S.stage === 'adult' ? 14 : 12), y = ratTop(S.stage, RAT_Y) - 8;
  box(ctx, x - 1, y - 1, 10, 10, PAL.w, PAL.k);
  const spr = {hunger:'queijo', energy:'zzz', hygiene:'sabonete', fun:'coracao', sick:'termometro'}[k];
  drawSpr(ctx, spr, x, y);
  if (Math.floor(t / 350) % 2) px(ctx, x + 3, y + 9, PAL.k);
}

function updateScene(dt, t){
  /* caminhar devagar quando ocioso */
  if (!S.sleeping && !SCENE.anim && S.started && mood() !== 'sick'){
    SCENE.walkT -= dt;
    if (SCENE.walkT <= 0){
      SCENE.walkT = 2500 + Math.random() * 5000;
      if (Math.random() < 0.6) SCENE.targetX = 30 + Math.random() * 84;
    }
    const d = SCENE.targetX - SCENE.ratX;
    if (Math.abs(d) > 0.5){
      const v = 12 * dt / 1000;
      SCENE.ratX += Math.sign(d) * Math.min(Math.abs(d), v);
      SCENE.dir = d < 0 ? -1 : 1;
    }
  }
  /* piscar */
  if (t > SCENE.blinkAt){
    SCENE.blinking = !SCENE.blinking;
    SCENE.blinkAt = t + (SCENE.blinking ? 120 : 2200 + Math.random() * 2500);
  }
  if (SCENE.anim && t > SCENE.anim.until) SCENE.anim = null;
  SCENE.fx = SCENE.fx.filter(f => t < f.until);
}

function drawScene(ctx, t){
  const night = S.sleeping;
  drawWall(ctx, night);
  drawFloor(ctx, night);
  drawFurniture(ctx, night);
  /* cocos */
  for (let i = 0; i < S.poops; i++){ const p = SCENE.poopPos[i]; drawSpr(ctx, 'coco', p[0], p[1] - 8); }
  /* rato */
  const a = SCENE.anim;
  const m = mood();
  let face = m === 'sick' ? 'sick' : m === 'sad' ? 'sad' : m === 'happy' ? (SCENE.blinking ? 'blink' : 'normal') : (SCENE.blinking ? 'blink' : 'normal');
  let holding = null, flip = SCENE.dir < 0;
  let ry = RAT_Y;
  if (a){
    if (a.type === 'eat'){ face = 'eat'; holding = a.food; flip = false; }
    else if (a.type === 'happy'){ face = 'happy'; ry = RAT_Y - (Math.floor(t / 160) % 2) * 3; }
    else if (a.type === 'pet'){ face = 'pet'; }
    else if (a.type === 'bath'){ face = 'happy'; }
    else if (a.type === 'med'){ face = 'wow'; }
    else if (a.type === 'no'){ face = 'sad'; flip = Math.floor(t / 150) % 2 === 0; }
    else if (a.type === 'evolve'){ face = 'wow'; }
  }
  if (S.sleeping) face = 'sleep';
  drawRat(ctx, SCENE.ratX, ry, {
    stage:S.stage, form:S.form, skin:S.skin, hat:S.hat, face, t, flip, sleeping:S.sleeping, holding
  });
  /* efeitos */
  if (a && a.type === 'bath'){
    for (let i = 0; i < 7; i++){
      const ph = (t / 400 + i * 0.7) % 1;
      const bx = SCENE.ratX - 14 + ((i * 37) % 28), by = ratTop(S.stage, RAT_Y) + 26 - ph * 30;
      oEllipse(ctx, bx, by, 2, 2, '#dff3ff', '#5aa9e6');
    }
  }
  if (a && a.type === 'evolve'){
    for (let i = 0; i < 6; i++){
      const ph = (t / 500 + i * 0.37) % 1;
      drawSpr(ctx, 'brilho', SCENE.ratX - 20 + ((i * 53) % 40), ratTop(S.stage, RAT_Y) - 4 + ph * 30 - 10);
    }
  }
  for (const f of SCENE.fx){
    const p = 1 - (f.until - t) / f.dur;
    if (f.kind === 'heart') drawSpr(ctx, 'coracao', f.x, f.y - p * 18, {alpha:1 - p});
    else if (f.kind === 'crumb') px(ctx, f.x + p * f.vx, f.y + p * 10, PAL.Y);
    else if (f.kind === 'brilho') drawSpr(ctx, 'brilho', f.x, f.y - p * 6, {alpha:1 - p});
  }
  if (!S.sleeping && !a) drawNeedsHint(ctx, t);
  /* noite */
  if (night){
    ctx.save(); ctx.globalAlpha = 0.45; rect(ctx, 0, 16, W, H - 32, '#1b1233'); ctx.restore();
    if (Math.floor(t / 900) % 2) px(ctx, 20, 26, PAL.w); px(ctx, 60, 22, PAL.w); px(ctx, 100, 30, PAL.w);
  }
  drawIcons(ctx);
}
function addHearts(n){
  const t = performance.now();
  for (let i = 0; i < n; i++) SCENE.fx.push({kind:'heart', x:SCENE.ratX - 10 + Math.random() * 20, y:ratTop(S.stage, RAT_Y) - 4, until:t + 900 + i * 200, dur:900 + i * 200});
}
function addCrumbs(){
  const t = performance.now();
  for (let i = 0; i < 6; i++) SCENE.fx.push({kind:'crumb', x:SCENE.ratX - 2 + Math.random() * 4, y:RAT_Y - 12, vx:(Math.random() - 0.5) * 16, until:t + 500 + Math.random() * 300, dur:700});
}
function setAnim(type, ms, data){
  SCENE.anim = Object.assign({type, until:performance.now() + ms}, data || {});
}
