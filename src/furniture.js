/* ===== Comodos, moveis (desenhados por codigo), decoracoes e interativos ===== */
Object.assign(SPR, {
  relogio_spr:[
  '...kkkk...',
  '..kwwwwk..',
  '.kwwkwwwk.',
  '.kwwkwwwk.',
  '.kwwkkkwk.',
  '.kwwwwwwk.',
  '..kwwwwk..',
  '...kkkk...'],
  patinho:[
  '..kkk...',
  '.kyykk..',
  '.kyykok.',
  '.kyyyk..',
  'kkyyyyk.',
  'kyyyyyyk',
  '.kkkkkk.']
});

const K = PAL.k;
function ringRows(ctx, cx, cy, rOut, rIn, color){
  ctx.fillStyle = color;
  cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -Math.round(rOut); dy <= Math.round(rOut); dy++){
    const t = dy / (rOut + 0.5); if (t < -1 || t > 1) continue;
    const ho = rOut * Math.sqrt(Math.max(0, 1 - t * t));
    const ti = dy / (rIn + 0.5);
    const hi = Math.abs(ti) < 1 ? rIn * Math.sqrt(1 - ti * ti) : 0;
    if (hi <= 0){ ctx.fillRect(Math.round(cx - ho), cy + dy, Math.round(cx + ho) - Math.round(cx - ho) + 1, 1); }
    else {
      ctx.fillRect(Math.round(cx - ho), cy + dy, Math.max(1, Math.round(cx - hi) - Math.round(cx - ho)), 1);
      ctx.fillRect(Math.round(cx + hi) + 1, cy + dy, Math.max(1, Math.round(cx + ho) - Math.round(cx + hi)), 1);
    }
  }
}
/* livros numa prateleira */
function books(ctx, x, y, w, h){
  const cols = [PAL.r, PAL.b, PAL.e, PAL.y, PAL.v, PAL.o];
  let xx = x, i = 0;
  while (xx < x + w - 2){ const bw = 2 + (i % 2); const bh = h - (i % 3 === 1 ? 2 : 0); rect(ctx, xx, y + h - bh, bw, bh, cols[i % cols.length]); px(ctx, xx, y + h - bh, K); xx += bw + 1; i++; }
}
/* vista da janela: ceu conforme a hora de verdade */
function drawWindowView(ctx, x, y, w, h, t, cat){
  const hr = new Date().getHours() + new Date().getMinutes() / 60;
  const night = hr < 6 || hr >= 19, dusk = !night && (hr < 7 || hr >= 17);
  rect(ctx, x, y, w, h, night ? '#1b1233' : dusk ? '#f5b06c' : '#9ad4f5');
  if (night){ px(ctx, x + 3, y + 3, PAL.w); px(ctx, x + w - 5, y + 5, PAL.w); px(ctx, x + w / 2, y + 2, PAL.w); fillEllipse(ctx, x + w - 6, y + 6, 3, 3, '#fff3b0'); }
  else { fillEllipse(ctx, x + w - 6, y + 5, 3, 3, dusk ? PAL.o : PAL.y); }
  rect(ctx, x, y + h - 4, w, 4, night ? '#2f4149' : '#6ccf7a'); rect(ctx, x, y + h - 4, w, 1, night ? '#3c5361' : '#3c9a4c');
  if (t != null){
    const bx = x + ((t / 40) % (w + 10)) - 5;
    if (!cat){ px(ctx, bx, y + 6, K); px(ctx, bx + 1, y + 5, K); px(ctx, bx + 2, y + 6, K); px(ctx, bx + 6, y + 9, K); px(ctx, bx + 7, y + 8, K); px(ctx, bx + 8, y + 9, K); }
  }
  if (cat){ const c = spriteCanvas('gato'); if (c) ctx.drawImage(c, x + Math.floor((w - 16) / 2), y + h - 4 - 12); }
}
/* rodinha: parte de tras e parte da frente, para o rato caber dentro */
function drawWheelBack(ctx, cx, cy, r, colors){
  fillEllipse(ctx, cx, cy, r + 1, r + 1, K);
  fillEllipse(ctx, cx, cy, r, r, (colors && colors.inner) || '#e3dff0');
}
function drawWheelFront(ctx, cx, cy, r, ang, alpha, colors){
  const rim = (colors && colors.rim) || PAL.g, spoke = (colors && colors.spoke) || PAL.G;
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ringRows(ctx, cx, cy, r + 1, r - 3, rim);
  ringRows(ctx, cx, cy, r + 1, r, K);
  ringRows(ctx, cx, cy, r - 2, r - 3, K);
  for (let i = 0; i < 6; i++){
    const a = ang + i * Math.PI / 3;
    const ex = cx + Math.cos(a) * (r - 3), ey = cy + Math.sin(a) * (r - 3);
    const n = Math.ceil(r);
    for (let s = 2; s <= n; s++){ const q = s / n; px(ctx, cx + (ex - cx) * q, cy + (ey - cy) * q, spoke); }
  }
  fillEllipse(ctx, cx, cy, 2, 2, K); px(ctx, cx, cy, rim);
  ctx.restore();
}
const WHEEL_COLORS = [null, {rim:PAL.b, spoke:PAL.y, inner:'#dff3ff', base:PAL.r}];

/* ---- desenho dos moveis: (ctx, x, y, w, h, o) ; x,y = canto superior esquerdo; o = {night, t, active, cat, on} ---- */
const FDRAW = {
  /* SALA */
  sofa_esponja(ctx, x, y, w, h){
    box(ctx, x, y, w, 7, PAL.E, K); rect(ctx, x + 1, y + 1, w - 2, 2, PAL.e);
    box(ctx, x, y + 6, w, h - 6, PAL.y, K); rect(ctx, x + 1, y + 7, w - 2, 1, '#fff3b0');
    for (let i = x + 3; i < x + w - 3; i += 5){ px(ctx, i, y + 10, PAL.Y); px(ctx, i + 2, y + 13, PAL.Y); }
    rect(ctx, x + Math.floor(w / 2), y + 7, 1, h - 8, PAL.Y);
  },
  sofa_mini(ctx, x, y, w, h){
    box(ctx, x + 3, y, w - 6, 9, PAL.r, K); rect(ctx, x + 4, y + 1, w - 8, 1, '#f08a7e');
    box(ctx, x, y + 5, 6, h - 7, PAL.R, K); box(ctx, x + w - 6, y + 5, 6, h - 7, PAL.R, K);
    box(ctx, x + 5, y + 8, w - 10, h - 10, PAL.r, K);
    rect(ctx, x + Math.floor(w / 2), y + 9, 1, h - 12, PAL.R); rect(ctx, x + 6, y + 9, w - 12, 1, '#f08a7e');
    rect(ctx, x + 2, y + h - 2, 3, 2, K); rect(ctx, x + w - 5, y + h - 2, 3, 2, K);
  },
  mesinha_tampa(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    box(ctx, cx - 3, y + 6, 7, h - 7, PAL.n, K);
    oEllipse(ctx, cx, y + 4, Math.floor(w / 2) - 1, 3, PAL.y, K); rect(ctx, cx - Math.floor(w / 2) + 3, y + 3, w - 8, 1, '#fff3b0');
    px(ctx, cx - 4, y + 5, PAL.Y); px(ctx, cx + 3, y + 5, PAL.Y);
  },
  mesinha_madeira(ctx, x, y, w, h){
    box(ctx, x, y + 3, w, 4, PAL.n, K); rect(ctx, x + 1, y + 4, w - 2, 1, '#d19a63');
    box(ctx, x + 2, y + 6, 3, h - 6, PAL.N, K); box(ctx, x + w - 5, y + 6, 3, h - 6, PAL.N, K);
    box(ctx, x + w - 10, y - 2, 5, 5, PAL.b, K); px(ctx, x + w - 9, y - 1, '#9ad4f5');
  },
  estante_fosforo(ctx, x, y, w, h){
    for (let i = 0; i < 3; i++){
      const yy = y + i * 10;
      box(ctx, x, yy, w, 10, PAL.o, K); rect(ctx, x + 1, yy + 1, w - 2, 1, '#f9b36c'); rect(ctx, x + 1, yy + 8, w - 2, 1, PAL.R);
      books(ctx, x + 2, yy + 2, w - 4, 6);
    }
  },
  estante_madeira(ctx, x, y, w, h){
    box(ctx, x, y, w, h, PAL.n, K); rect(ctx, x + 1, y + 1, 1, h - 2, '#d19a63');
    for (let i = 0; i < 3; i++){ const yy = y + 2 + i * 10; rect(ctx, x + 2, yy, w - 4, 8, PAL.N); books(ctx, x + 3, yy + 1, w - 6, 7); rect(ctx, x + 1, yy + 8, w - 2, 2, PAL.n); }
    rect(ctx, x + 1, y + h - 2, w - 2, 1, PAL.N);
  },
  /* QUARTO */
  cama_fosforo(ctx, x, y, w, h){
    box(ctx, x, y + 7, w, h - 7, PAL.o, K); rect(ctx, x + 1, y + 8, w - 2, 1, '#f9b36c');
    rect(ctx, x + 1, y + h - 4, w - 2, 2, PAL.R); for (let i = x + 2; i < x + w - 2; i += 3) px(ctx, i, y + h - 3, '#c94a3f');
    box(ctx, x + 2, y + 1, w - 4, 8, PAL.w, K);
    box(ctx, x + 15, y + 1, w - 17, 8, PAL.b, K); for (let i = y + 3; i < y + 8; i += 3) rect(ctx, x + 16, i, w - 19, 1, PAL.B);
    oEllipse(ctx, x + 8, y + 5, 5, 2, PAL.w, K); px(ctx, x + 6, y + 4, '#f6ecd2');
  },
  cama_boneca(ctx, x, y, w, h){
    box(ctx, x, y, 7, h - 4, PAL.n, K); rect(ctx, x + 2, y + 2, 3, h - 8, PAL.N);
    box(ctx, x + w - 5, y + 6, 5, h - 10, PAL.n, K);
    box(ctx, x + 6, y + 7, w - 10, 10, PAL.w, K);
    for (let yy = y + 8; yy < y + 16; yy += 4) for (let xx = x + 16; xx < x + w - 6; xx += 4){
      const on = (((xx - x - 16) / 4 + (yy - y - 8) / 4) % 2) === 0;
      rect(ctx, xx, yy, Math.min(4, x + w - 6 - xx), Math.min(4, y + 16 - yy), on ? PAL.p : PAL.y);
    }
    for (let xx = x + 16; xx < x + w - 6; xx += 4) rect(ctx, xx, y + 8, 1, 8, PAL.P);
    rect(ctx, x + 16, y + 12, w - 22, 1, PAL.P);
    oEllipse(ctx, x + 11, y + 11, 4, 3, PAL.w, K);
    rect(ctx, x + 6, y + 17, w - 10, 2, PAL.N);
    rect(ctx, x + 2, y + h - 4, 3, 4, K); rect(ctx, x + w - 5, y + h - 4, 3, 4, K);
  },
  comoda_caixa(ctx, x, y, w, h){
    box(ctx, x, y + 2, w, h - 2, '#e0c9a3', K); rect(ctx, x + 1, y + 3, w - 2, 1, '#f0dcbb'); rect(ctx, x + 1, y + 6, w - 2, 1, '#b8955f');
    box(ctx, x + 3, y + 8, w - 6, 5, '#e0c9a3', '#8a6a3f'); box(ctx, x + 3, y + 14, w - 6, 5, '#e0c9a3', '#8a6a3f');
    rect(ctx, x + Math.floor(w / 2) - 1, y + 10, 2, 1, K); rect(ctx, x + Math.floor(w / 2) - 1, y + 16, 2, 1, K);
  },
  comoda_madeira(ctx, x, y, w, h){
    box(ctx, x, y, w, h - 3, PAL.n, K); rect(ctx, x + 1, y + 1, w - 2, 1, '#d19a63');
    for (let i = 0; i < 3; i++){ const yy = y + 3 + i * 6; box(ctx, x + 2, yy, w - 4, 6, PAL.n, PAL.N); rect(ctx, x + Math.floor(w / 2) - 1, yy + 2, 2, 2, PAL.y); }
    rect(ctx, x + 2, y + h - 3, 3, 3, K); rect(ctx, x + w - 5, y + h - 3, 3, 3, K);
  },
  lum_tampinha(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    for (let r = 0; r < 10; r++){ const hw = 3 + Math.round(r * 0.45); rect(ctx, cx - hw - 1, y + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + r, hw * 2 + 1, 1, r < 2 ? '#fff3b0' : PAL.y); }
    rect(ctx, cx - 7, y + 10, 15, 1, K);
    rect(ctx, cx - 1, y + 11, 3, h - 17, K); rect(ctx, cx, y + 11, 1, h - 17, PAL.G);
    box(ctx, x + 1, y + h - 6, w - 2, 6, PAL.r, K); rect(ctx, x + 2, y + h - 5, w - 4, 1, '#f08a7e');
    for (let i = x + 2; i < x + w - 2; i += 2) px(ctx, i, y + h - 2, PAL.R);
  },
  lum_abajur(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    for (let r = 0; r < 12; r++){ const hw = 3 + Math.round(r * 0.36); rect(ctx, cx - hw - 1, y + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + r, hw * 2 + 1, 1, r < 2 ? '#fbd4e2' : PAL.p); }
    rect(ctx, cx - 8, y + 12, 17, 1, K); for (let i = cx - 7; i <= cx + 7; i += 2) px(ctx, i, y + 13, PAL.P);
    rect(ctx, cx - 1, y + 14, 3, h - 19, K); rect(ctx, cx, y + 14, 1, h - 19, PAL.G);
    oEllipse(ctx, cx, y + h - 3, 6, 2, PAL.n, K); rect(ctx, cx - 3, y + h - 4, 6, 1, '#d19a63');
  },
  /* COZINHA */
  gel_caixaleite(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    for (let r = 0; r < 6; r++){ const hw = 3 + r; rect(ctx, cx - hw - 1, y + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + r, hw * 2 + 1, 1, PAL.w); }
    rect(ctx, cx - 1, y + 1, 3, 1, K);
    box(ctx, x, y + 5, w, h - 5, PAL.w, K);
    rect(ctx, x + 1, y + 9, w - 2, 6, PAL.b); rect(ctx, x + 1, y + 10, w - 2, 1, '#8fc6ea');
    oEllipse(ctx, cx, y + 12, 3, 1, PAL.w, PAL.b);
    fillEllipse(ctx, x + 5, y + 20, 2, 1, K); fillEllipse(ctx, x + w - 6, y + 24, 2, 2, K);
    rect(ctx, x + 1, y + 16, w - 2, 1, K); rect(ctx, x + w - 4, y + 18, 1, 6, K);
  },
  gel_mini(ctx, x, y, w, h){
    box(ctx, x, y + 2, w, h - 4, '#bfe6d2', K);
    rect(ctx, x + 1, y + 3, 1, h - 6, '#e6f7ee');
    rect(ctx, x + 1, y + 13, w - 2, 1, K);
    box(ctx, x + w - 6, y + 5, 3, 6, PAL.G, K); box(ctx, x + w - 6, y + 16, 3, 10, PAL.G, K);
    drawSpr(ctx, 'queijo', x + 3, y + 19);
    rect(ctx, x + 2, y + h - 2, 3, 2, K); rect(ctx, x + w - 5, y + h - 2, 3, 2, K);
  },
  fogao_lata(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    box(ctx, x + 3, y + 9, w - 6, h - 9, PAL.g, K);
    for (let yy = y + 12; yy < y + h - 2; yy += 3) rect(ctx, x + 4, yy, w - 8, 1, PAL.G);
    rect(ctx, x + 4, y + 10, 1, h - 12, '#e3dff0');
    oEllipse(ctx, cx, y + 9, Math.floor((w - 6) / 2), 2, PAL.G, K);
    const fl = [[1, PAL.r], [1, PAL.o], [2, PAL.o], [2, PAL.y], [3, PAL.o], [3, PAL.y], [2, PAL.y], [1, PAL.y]];
    fl.forEach((f, i) => rect(ctx, cx - f[0], y + i, f[0] * 2 + 1, 1, f[1]));
    rect(ctx, cx - 3, y + 8, 7, 1, K);
  },
  fogao_mini(ctx, x, y, w, h){
    box(ctx, x + 2, y, w - 4, 5, PAL.w, K); rect(ctx, x + 4, y + 2, 3, 1, PAL.b); rect(ctx, x + w - 7, y + 2, 3, 1, PAL.b);
    box(ctx, x, y + 4, w, 6, PAL.x, K);
    fillEllipse(ctx, x + 7, y + 7, 3, 1, PAL.R); px(ctx, x + 7, y + 7, PAL.y); fillEllipse(ctx, x + w - 8, y + 7, 3, 1, PAL.R); px(ctx, x + w - 8, y + 7, PAL.y);
    box(ctx, x, y + 9, w, h - 9, PAL.w, K);
    for (let i = 0; i < 4; i++) rect(ctx, x + 3 + i * 4, y + 11, 2, 2, PAL.r);
    box(ctx, x + 2, y + 14, w - 4, h - 17, PAL.w, K); rect(ctx, x + 3, y + 15, w - 6, 1, PAL.G);
    box(ctx, x + 5, y + 17, w - 10, h - 22, PAL.b, K); px(ctx, x + 6, y + 18, '#9ad4f5');
    rect(ctx, x + 2, y + h - 2, 3, 2, K); rect(ctx, x + w - 5, y + h - 2, 3, 2, K);
  },
  mesa_carretel(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2), R = Math.floor(w / 2) - 1;
    oEllipse(ctx, cx, y + h - 4, R, 3, PAL.n, K);
    box(ctx, cx - 7, y + 11, 15, h - 16, PAL.n, K); for (let yy = y + 13; yy < y + h - 6; yy += 2) rect(ctx, cx - 6, yy, 13, 1, PAL.N);
    oEllipse(ctx, cx, y + 11, R, 3, PAL.n, K); rect(ctx, cx - R + 2, y + 10, R * 2 - 4, 1, '#d19a63');
    oEllipse(ctx, cx, y + 7, 6, 2, PAL.w, K); drawSpr(ctx, 'queijo', cx - 4, y);
  },
  mesa_madeira(ctx, x, y, w, h){
    box(ctx, x, y + 8, w, 6, '#e05a4e', K);
    for (let xx = x + 1; xx < x + w - 1; xx += 3) for (let yy = y + 9; yy < y + 13; yy += 3)
      if (((((xx - x - 1) / 3) + ((yy - y - 9) / 3)) % 2) === 0) rect(ctx, xx, yy, Math.min(3, x + w - 1 - xx), Math.min(3, y + 13 - yy), PAL.w);
    box(ctx, x + 3, y + 13, 4, h - 13, PAL.n, K); box(ctx, x + w - 7, y + 13, 4, h - 13, PAL.n, K);
    oEllipse(ctx, x + 13, y + 7, 7, 2, PAL.w, K); drawSpr(ctx, 'queijo', x + 9, y);
    box(ctx, x + w - 12, y + 2, 6, 6, PAL.b, K); rect(ctx, x + w - 11, y + 3, 1, 3, '#9ad4f5'); rect(ctx, x + w - 6, y + 4, 2, 2, K);
  },
  /* BANHEIRO */
  banheira_lata(ctx, x, y, w, h){
    box(ctx, x, y + 4, w, h - 4, PAL.g, K);
    rect(ctx, x + 2, y + 6, w - 4, 5, PAL.b); rect(ctx, x + 3, y + 7, 6, 1, '#9ad4f5'); px(ctx, x + w - 8, y + 8, '#9ad4f5');
    for (let xx = x + 6; xx < x + w - 4; xx += 7) rect(ctx, xx, y + 12, 1, h - 14, PAL.G);
    rect(ctx, x + 1, y + h - 3, w - 2, 1, PAL.G);
    oEllipse(ctx, x + w - 5, y + 3, 3, 3, PAL.G, K); px(ctx, x + w - 5, y + 3, PAL.g);
  },
  banheira_porcelana(ctx, x, y, w, h){
    box(ctx, x, y + 5, w, h - 9, PAL.w, K); rect(ctx, x + 1, y + 6, w - 2, 1, '#e3dff0');
    rect(ctx, x + 3, y + 8, w - 6, 5, PAL.b); rect(ctx, x + 4, y + 9, 8, 1, '#9ad4f5'); px(ctx, x + w - 9, y + 10, '#9ad4f5');
    box(ctx, x + 3, y + h - 4, 4, 4, PAL.Y, K); box(ctx, x + w - 7, y + h - 4, 4, 4, PAL.Y, K);
    box(ctx, x + w - 8, y, 4, 7, PAL.G, K); box(ctx, x + w - 12, y, 7, 3, PAL.G, K);
    rect(ctx, x + 5, y + 6, 5, 2, PAL.p);
  },
  pia_tampinha(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    oEllipse(ctx, cx, y + 5, 6, 5, PAL.b, K); px(ctx, cx - 3, y + 3, PAL.w); px(ctx, cx - 2, y + 2, PAL.w);
    oEllipse(ctx, cx, y + h - 2, 7, 2, PAL.n, K);
    box(ctx, cx - 3, y + 16, 7, h - 19, PAL.n, K); for (let yy = y + 18; yy < y + h - 4; yy += 2) rect(ctx, cx - 2, yy, 5, 1, PAL.N);
    oEllipse(ctx, cx, y + 15, 8, 3, PAL.r, K); fillEllipse(ctx, cx, y + 15, 5, 1, PAL.b); px(ctx, cx - 3, y + 15, '#9ad4f5');
    rect(ctx, cx + 5, y + 12, 4, 2, PAL.p);
  },
  pia_espelho(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    oEllipse(ctx, cx, y + 7, 9, 7, PAL.g, K); oEllipse(ctx, cx, y + 7, 7, 5, PAL.b, PAL.G);
    px(ctx, cx - 4, y + 4, PAL.w); px(ctx, cx - 3, y + 3, PAL.w);
    rect(ctx, cx - 1, y + 13, 2, 4, PAL.G); rect(ctx, cx - 1, y + 13, 4, 1, PAL.G);
    box(ctx, x + 1, y + 16, w - 2, 6, PAL.w, K); rect(ctx, x + 3, y + 18, w - 6, 2, PAL.b);
    box(ctx, x + 2, y + 22, w - 4, h - 22, PAL.g, K); rect(ctx, cx, y + 23, 1, h - 24, K);
    px(ctx, cx - 3, y + 26, K); px(ctx, cx + 3, y + 26, K);
  },
  penico_dedal(ctx, x, y, w, h){
    const cx = x + Math.floor(w / 2);
    for (let r = 0; r < h; r++){ const hw = 5 + Math.round(r * 2 / h); rect(ctx, cx - hw - 1, y + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + r, hw * 2 + 1, 1, r < 2 || r === h - 1 ? PAL.G : PAL.g); }
    for (let yy = y + 4; yy < y + h - 2; yy += 3) for (let xx = cx - 4 + (((yy - y - 4) / 3) % 2 ? 1 : 0); xx <= cx + 4; xx += 3) px(ctx, xx, yy, PAL.G);
  },
  privadinha(ctx, x, y, w, h){
    box(ctx, x, y, 9, 12, PAL.w, K); rect(ctx, x + 1, y + 2, 7, 1, PAL.g);
    rect(ctx, x + 9, y + 3, 2, 2, PAL.G);
    box(ctx, x + 8, y + 16, 9, h - 16, PAL.w, K);
    oEllipse(ctx, x + 12, y + 14, 7, 4, PAL.w, K); fillEllipse(ctx, x + 12, y + 14, 4, 2, PAL.b);
    rect(ctx, x + 6, y + h - 2, 13, 2, K);
  },
  /* ---- decoracoes de parede ---- */
  poster(ctx, x, y, w, h){
    box(ctx, x, y, w, h, PAL.w, K);
    rect(ctx, x + 2, y + 2, w - 4, h - 4, '#fff6e0'); rect(ctx, x + 2, y + 2, w - 4, 1, '#e3dff0'); rect(ctx, x + 2, y + 2, 1, h - 4, '#e3dff0');
    const c = spriteCanvas('queijo'); if (c){ ctx.drawImage(c, x + Math.floor((w - 16) / 2), y + 5, 16, 16); }
    rect(ctx, x + 3, y + h - 7, w - 6, 4, PAL.r);
    for (let i = x + 5; i < x + w - 5; i += 3) rect(ctx, i, y + h - 6, 2, 2, PAL.w);
    px(ctx, x + 1, y + 1, PAL.b); px(ctx, x + w - 2, y + 1, PAL.b); px(ctx, x + 1, y + h - 2, PAL.b); px(ctx, x + w - 2, y + h - 2, PAL.b);
  },
  quadro(ctx, x, y, w, h){
    box(ctx, x, y, w, h, PAL.N, K); rect(ctx, x + 1, y + 1, w - 2, 1, '#d19a63'); rect(ctx, x + 1, y + 1, 1, h - 2, '#d19a63');
    rect(ctx, x + 3, y + 3, w - 6, h - 6, PAL.b);
    fillEllipse(ctx, x + w - 8, y + 7, 3, 3, PAL.y);
    fillEllipse(ctx, x + 8, y + h - 5, 8, 4, PAL.e); fillEllipse(ctx, x + w - 9, y + h - 4, 9, 4, PAL.E);
    rect(ctx, x + 3, y + h - 5, w - 6, 2, PAL.E);
    px(ctx, x + 6, y + 6, PAL.w); px(ctx, x + 7, y + 6, PAL.w); px(ctx, x + 12, y + 8, PAL.w);
  },
  relogio(ctx, x, y, w, h){
    const r = Math.floor(Math.min(w, h) / 2) - 1, cx = x + r + 1, cy = y + r + 1;
    oEllipse(ctx, cx, cy, r, r, PAL.w, K); ringRows(ctx, cx, cy, r, r - 1, PAL.n);
    px(ctx, cx, cy - r + 2, K); px(ctx, cx, cy + r - 2, K); px(ctx, cx - r + 2, cy, K); px(ctx, cx + r - 2, cy, K);
    const d = new Date(), hm = (d.getHours() % 12) / 12 * Math.PI * 2 + d.getMinutes() / 60 * Math.PI / 6, mm = d.getMinutes() / 60 * Math.PI * 2;
    const hand = (a, len, col) => { for (let s = 0; s <= len; s++) px(ctx, cx + Math.sin(a) * s, cy - Math.cos(a) * s, col); };
    hand(hm, r - 4, K); hand(mm, r - 2, PAL.r); px(ctx, cx, cy, K);
  },
  prateleira(ctx, x, y, w, h){
    const jars = [[PAL.y, PAL.Y], [PAL.p, PAL.P], [PAL.e, PAL.E]];
    const jw = 7, gap = Math.floor((w - 2 - jars.length * jw) / (jars.length + 1));
    jars.forEach((c, i) => {
      const jx = x + 1 + gap + i * (jw + gap), jy = y;
      rect(ctx, jx + 1, jy, jw - 2, 2, K);
      box(ctx, jx, jy + 2, jw, h - 6, c[0], K); rect(ctx, jx + 1, jy + 4, 1, h - 9, '#fffaf0'); rect(ctx, jx + 2, jy + h - 6, jw - 4, 1, c[1]);
    });
    box(ctx, x, y + h - 4, w, 4, PAL.n, K); rect(ctx, x + 1, y + h - 2, w - 2, 1, PAL.N);
  },
  toalha(ctx, x, y, w, h){
    rect(ctx, x + Math.floor(w / 2) - 1, y, 3, 3, PAL.G); px(ctx, x + Math.floor(w / 2), y + 1, K);
    box(ctx, x, y + 3, w, h - 3, PAL.p, K);
    for (let yy = y + 6; yy < y + h - 2; yy += 4) rect(ctx, x + 1, yy, w - 2, 1, PAL.w);
    rect(ctx, x + 1, y + h - 3, w - 2, 1, PAL.P); rect(ctx, x + Math.floor(w / 2), y + 4, 1, h - 6, PAL.P);
  },
  planta(ctx, x, y, w, h){ const c = spriteCanvas('planta'); if (c) ctx.drawImage(c, x, y + h - c.height); },
  /* ---- interativos ---- */
  roda(ctx, x, y, w, h){
    const r = Math.floor(Math.min(w, h - 6) / 2) - 1, cx = x + Math.floor(w / 2), cy = y + r + 1;
    rect(ctx, cx - 1, cy, 3, h - 4 - (cy - y), PAL.N); rect(ctx, cx - 2, cy, 5, 1, K);
    drawWheelBack(ctx, cx, cy, r); drawWheelFront(ctx, cx, cy, r, 0.3);
    box(ctx, cx - 8, y + h - 5, 17, 5, PAL.N, K);
  },
  roda_petshop(ctx, x, y, w, h){
    const r = Math.floor(Math.min(w, h - 6) / 2) - 1, cx = x + Math.floor(w / 2), cy = y + r + 1, col = WHEEL_COLORS[1];
    rect(ctx, cx - 1, cy, 3, h - 4 - (cy - y), PAL.R); rect(ctx, cx - 2, cy, 5, 1, K);
    drawWheelBack(ctx, cx, cy, r, col); drawWheelFront(ctx, cx, cy, r, 0.3, null, col);
    box(ctx, cx - 8, y + h - 5, 17, 5, col.base, K);
  },
  bebedouro_pet(ctx, x, y, w, h, o){
    const cx = x + Math.floor(w / 2);
    rect(ctx, cx - 4, y, 9, 1, PAL.G); rect(ctx, cx, y, 1, 3, PAL.G);
    box(ctx, x + 1, y + 3, w - 2, h - 10, '#eaf6fa', K); rect(ctx, x + 2, y + 4, 1, h - 12, PAL.w);
    const lvl = o && o.active ? 0.55 : 0.7;
    rect(ctx, x + 2, y + 3 + Math.round((h - 10) * (1 - lvl)), w - 4, Math.round((h - 10) * lvl) - 1, PAL.b);
    if (o && o.active && o.t != null){ const bt = Math.floor(o.t / 200) % 4; px(ctx, cx - 1, y + h - 12 - bt * 3, '#dff3ff'); px(ctx, cx + 1, y + h - 8 - bt * 2, '#dff3ff'); }
    box(ctx, cx - 3, y + 2, 7, 3, PAL.b, K);
    rect(ctx, cx - 1, y + h - 7, 3, 7, K); rect(ctx, cx, y + h - 7, 1, 6, PAL.r);
  },
  bebedouro_petshop(ctx, x, y, w, h, o){
    const cx = x + Math.floor(w / 2);
    rect(ctx, cx - 5, y + 2, 11, 2, PAL.G); rect(ctx, cx - 5, y + 4, 2, 6, PAL.G);
    for (let r = 0; r < 4; r++){ const hw = 2 + r; rect(ctx, cx - hw - 1, y + 4 + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + 4 + r, hw * 2 + 1, 1, '#eaf6fa'); }
    box(ctx, x + 1, y + 8, w - 2, h - 15, '#eaf6fa', K); rect(ctx, x + 2, y + 9, 1, h - 17, PAL.w);
    const lvl = o && o.active ? 0.5 : 0.65;
    rect(ctx, x + 2, y + 8 + Math.round((h - 15) * (1 - lvl)), w - 4, Math.round((h - 15) * lvl) - 1, PAL.b);
    if (o && o.active && o.t != null){ const bt = Math.floor(o.t / 200) % 4; px(ctx, cx, y + h - 12 - bt * 3, '#dff3ff'); }
    box(ctx, cx - 3, y, 7, 4, PAL.r, K);
    rect(ctx, cx - 1, y + h - 7, 3, 7, K); rect(ctx, cx, y + h - 7, 1, 6, PAL.G);
  },
  pote_maionese(ctx, x, y, w, h){
    box(ctx, x, y + h - 4, w, 4, PAL.n, K);
    box(ctx, x + 2, y + 2, w - 4, h - 6, '#eaf6fa', K); rect(ctx, x + 3, y + 3, 1, h - 8, PAL.w);
    rect(ctx, x + 3, y + h - 10, w - 6, 5, PAL.y); px(ctx, x + 5, y + h - 9, PAL.Y); px(ctx, x + w - 6, y + h - 8, PAL.Y);
    box(ctx, x + 1, y, w - 2, 3, PAL.G, K);
  },
  pote_biscoito(ctx, x, y, w, h){
    box(ctx, x, y + h - 4, w, 4, PAL.n, K);
    box(ctx, x + 2, y + 3, w - 4, h - 7, PAL.p, K); rect(ctx, x + 3, y + 4, 1, h - 9, '#fbd4e2');
    rect(ctx, x + 4, y + 7, w - 8, 4, PAL.w); px(ctx, x + 6, y + 8, PAL.n); px(ctx, x + 8, y + 8, PAL.n); px(ctx, x + 7, y + 9, PAL.n);
    box(ctx, x + 1, y, w - 2, 4, PAL.P, K); px(ctx, x + Math.floor(w / 2), y - 1, K);
  },
  rede_meia(ctx, x, y, w, h, o){
    const sw = o && o.active ? Math.round(Math.sin((o.t || 0) / 400) * 2) : 0;
    rect(ctx, x, y, 2, 3, PAL.G); rect(ctx, x + w - 2, y, 2, 3, PAL.G);
    for (let i = 0; i <= 8; i++){ const q = i / 8; px(ctx, x + 1 + (w / 2 - 6 - 1) * q, y + 2 + 5 * q, K); px(ctx, x + w - 2 - (w / 2 - 6 - 1) * q, y + 2 + 5 * q, K); }
    const bx = x + Math.floor(w / 2) - 10 + sw, by = y + 6;
    box(ctx, bx, by, 20, h - 8, PAL.g, K); rect(ctx, bx + 1, by + 1, 18, 1, '#e3dff0');
    rect(ctx, bx + 2, by + h - 11, 16, 1, PAL.G); box(ctx, bx + 14, by + 2, 6, h - 10, PAL.w, K);
  },
  rede_pet(ctx, x, y, w, h, o){
    const sw = o && o.active ? Math.round(Math.sin((o.t || 0) / 400) * 2) : 0;
    rect(ctx, x, y, 2, 3, PAL.G); rect(ctx, x + w - 2, y, 2, 3, PAL.G);
    for (let i = 0; i <= 8; i++){ const q = i / 8; px(ctx, x + 1 + (w / 2 - 12) * q, y + 2 + 5 * q, PAL.N); px(ctx, x + w - 2 - (w / 2 - 12) * q, y + 2 + 5 * q, PAL.N); }
    const bx = x + Math.floor(w / 2) - 12 + sw, by = y + 6;
    for (let r = 0; r < h - 8; r++){ const hw = 12 - Math.round(r * 0.5); rect(ctx, bx + 12 - hw - 1, by + r, hw * 2 + 3, 1, K); rect(ctx, bx + 12 - hw, by + r, hw * 2 + 1, 1, (r % 3 === 1) ? PAL.w : PAL.p); }
  },
  casinha_sapato(ctx, x, y, w, h, o){
    box(ctx, x, y + 4, w, h - 4, '#e0c9a3', K); rect(ctx, x + 1, y + 5, w - 2, 1, '#f0dcbb');
    box(ctx, x - 1, y, w + 2, 5, '#c9ad80', K);
    fillEllipse(ctx, x + Math.floor(w / 2), y + h - 8, 6, 6, K); fillEllipse(ctx, x + Math.floor(w / 2), y + h - 8, 5, 5, '#2a2140');
    if (o && o.hidden){ const bl = Math.floor((o.t || 0) / 1500) % 5 === 0; if (!bl){ rect(ctx, x + Math.floor(w / 2) - 3, y + h - 9, 2, 2, PAL.w); rect(ctx, x + Math.floor(w / 2) + 2, y + h - 9, 2, 2, PAL.w); } }
  },
  casinha_madeira(ctx, x, y, w, h, o){
    const cx = x + Math.floor(w / 2);
    box(ctx, x + 2, y + 8, w - 4, h - 8, PAL.n, K); rect(ctx, x + 3, y + 9, 1, h - 10, '#d19a63');
    for (let r = 0; r < 9; r++){ const hw = Math.round((w / 2) * r / 8); rect(ctx, cx - hw - 1, y + r, hw * 2 + 3, 1, K); rect(ctx, cx - hw, y + r, hw * 2 + 1, 1, r % 2 ? PAL.R : PAL.r); }
    box(ctx, x + w - 9, y + 11, 5, 5, PAL.y, K); rect(ctx, x + w - 7, y + 11, 1, 5, K); rect(ctx, x + w - 9, y + 13, 5, 1, K);
    fillEllipse(ctx, cx - 3, y + h - 7, 6, 6, K); fillEllipse(ctx, cx - 3, y + h - 7, 5, 5, '#2a2140');
    if (o && o.hidden){ const bl = Math.floor((o.t || 0) / 1500) % 5 === 0; if (!bl){ rect(ctx, cx - 6, y + h - 8, 2, 2, PAL.w); rect(ctx, cx - 1, y + h - 8, 2, 2, PAL.w); } }
  },
  roer_rolha(ctx, x, y, w, h){
    box(ctx, x, y, w, h, PAL.n, K); rect(ctx, x + 1, y + 1, w - 2, 1, '#d19a63');
    rect(ctx, x + 1, y + 2, 1, h - 3, PAL.N); rect(ctx, x + w - 2, y + 2, 1, h - 3, PAL.N);
    px(ctx, x + 4, y + 3, PAL.N); px(ctx, x + 7, y + 5, PAL.N); px(ctx, x + 5, y + 6, PAL.N);
  },
  roer_osso(ctx, x, y, w, h){
    const cy = y + Math.floor(h / 2);
    oEllipse(ctx, x + 3, cy - 2, 2, 2, PAL.y, K); oEllipse(ctx, x + 3, cy + 2, 2, 2, PAL.y, K);
    oEllipse(ctx, x + w - 4, cy - 2, 2, 2, PAL.y, K); oEllipse(ctx, x + w - 4, cy + 2, 2, 2, PAL.y, K);
    box(ctx, x + 3, cy - 2, w - 6, 5, PAL.b, K); rect(ctx, x + 4, cy - 1, w - 8, 1, '#9ad4f5');
  },
  tv_papelao(ctx, x, y, w, h, o){
    rect(ctx, x + 3, y, 1, 4, PAL.G); rect(ctx, x + w - 4, y, 1, 4, PAL.G);
    box(ctx, x, y + 4, w, h - 4, '#e0c9a3', K); rect(ctx, x + 1, y + 5, w - 2, 1, '#f0dcbb');
    box(ctx, x + 2, y + 6, w - 7, h - 8, o && o.on ? '#1b1233' : PAL.w, K);
    if (o && o.on) tvShow(ctx, x + 3, y + 7, w - 9, h - 10, o.t || 0);
    px(ctx, x + w - 3, y + 8, K); px(ctx, x + w - 3, y + 11, K);
  },
  tv_mini(ctx, x, y, w, h, o){
    px(ctx, x + 4, y, K); px(ctx, x + 5, y + 1, K); px(ctx, x + 6, y + 2, K); px(ctx, x + w - 5, y, K); px(ctx, x + w - 6, y + 1, K); px(ctx, x + w - 7, y + 2, K);
    box(ctx, x, y + 3, w, h - 5, PAL.g, K); rect(ctx, x + 1, y + 4, w - 2, 1, '#e3dff0');
    box(ctx, x + 2, y + 5, w - 7, h - 9, o && o.on ? '#1b1233' : PAL.b, K);
    if (o && o.on) tvShow(ctx, x + 3, y + 6, w - 9, h - 11, o.t || 0); else px(ctx, x + 4, y + 7, PAL.w);
    px(ctx, x + w - 3, y + 7, PAL.r); px(ctx, x + w - 3, y + 10, PAL.G);
    rect(ctx, x + 3, y + h - 2, 2, 2, K); rect(ctx, x + w - 5, y + h - 2, 2, 2, K);
  },
  radio_fosforo(ctx, x, y, w, h, o){
    rect(ctx, x + w - 3, y, 1, 5, PAL.G); px(ctx, x + w - 3, y, K);
    box(ctx, x, y + 4, w, h - 4, PAL.o, K); rect(ctx, x + 1, y + 5, w - 2, 1, '#f9b36c'); rect(ctx, x + 1, y + h - 3, w - 2, 2, PAL.R);
    for (let yy = y + 7; yy < y + h - 4; yy += 2) for (let xx = x + 2; xx < x + w - 7; xx += 2) px(ctx, xx, yy, K);
    oEllipse(ctx, x + w - 5, y + 9, 2, 2, PAL.y, K);
    if (o && o.on) notes(ctx, x + w, y, o.t || 0);
  },
  radio_vitrola(ctx, x, y, w, h, o){
    box(ctx, x, y + 6, w, h - 6, PAL.n, K); rect(ctx, x + 1, y + 7, w - 2, 1, '#d19a63');
    const spin = o && o.on ? Math.floor((o.t || 0) / 150) % 4 : 0;
    oEllipse(ctx, x + 8, y + 6, 7, 3, PAL.x, K); px(ctx, x + 8 + (spin === 1 ? 2 : spin === 3 ? -2 : 0), y + 6 + (spin === 2 ? 1 : 0), PAL.r);
    rect(ctx, x + w - 5, y + 2, 1, 6, PAL.G); rect(ctx, x + w - 8, y + 2, 4, 1, PAL.G); px(ctx, x + w - 8, y + 3, K);
    for (let yy = y + 9; yy < y + h - 2; yy += 2) for (let xx = x + 3; xx < x + w - 3; xx += 2) px(ctx, xx, yy, PAL.N);
    if (o && o.on) notes(ctx, x + w, y, o.t || 0);
  },
  janela_buraco(ctx, x, y, w, h, o){
    fillEllipse(ctx, x + w / 2, y + h / 2, w / 2, h / 2, K);
    ctx.save(); ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); ctx.clip();
    drawWindowView(ctx, x, y, w, h, o && o.active ? o.t : null, o && o.cat);
    ctx.restore();
    px(ctx, x + 3, y + 2, K); px(ctx, x + w - 4, y + h - 3, K);
  },
  janela_moldura(ctx, x, y, w, h, o){
    box(ctx, x, y, w, h, PAL.w, K);
    drawWindowView(ctx, x + 3, y + 3, w - 6, h - 6, o && o.active ? o.t : null, o && o.cat);
    rect(ctx, x + Math.floor(w / 2), y + 3, 1, h - 6, K); rect(ctx, x + 3, y + Math.floor(h / 2), w - 6, 1, K);
    rect(ctx, x + 1, y + 1, 4, h - 2, PAL.p); rect(ctx, x + w - 5, y + 1, 4, h - 2, PAL.p);
    rect(ctx, x + 1, y + 1, w - 2, 1, PAL.P);
  },
  chuveiro_regador(ctx, x, y, w, h, o){
    rect(ctx, x + 2, y, w - 4, 2, PAL.G); rect(ctx, x + Math.floor(w / 2), y + 2, 1, 4, PAL.G);
    oEllipse(ctx, x + Math.floor(w / 2), y + 12, 6, 6, PAL.e, K); rect(ctx, x + Math.floor(w / 2) - 3, y + 8, 6, 1, '#a8e6b0');
    rect(ctx, x + Math.floor(w / 2) - 1, y + 3, 3, 5, K); rect(ctx, x + Math.floor(w / 2), y + 3, 1, 5, PAL.e);
    rect(ctx, x + Math.floor(w / 2) + 5, y + 14, 5, 2, K); rect(ctx, x + Math.floor(w / 2) + 9, y + 15, 2, 4, K); rect(ctx, x + Math.floor(w / 2) + 8, y + 19, 4, 2, PAL.E);
    if (o && o.active && o.t != null){ for (let i = 0; i < 5; i++){ const dy = ((o.t / 60) + i * 7) % 30; px(ctx, x + Math.floor(w / 2) + 7 + (i % 3), y + 21 + dy, PAL.b); } }
  },
  chuveiro_brinquedo(ctx, x, y, w, h, o){
    rect(ctx, x + Math.floor(w / 2) - 1, y, 3, 10, K); rect(ctx, x + Math.floor(w / 2), y, 1, 10, PAL.G);
    for (let r = 0; r < 5; r++){ const hw = 2 + r; rect(ctx, x + Math.floor(w / 2) - hw - 1, y + 9 + r, hw * 2 + 3, 1, K); rect(ctx, x + Math.floor(w / 2) - hw, y + 9 + r, hw * 2 + 1, 1, PAL.g); }
    for (let i = -4; i <= 4; i += 2) px(ctx, x + Math.floor(w / 2) + i, y + 14, PAL.G);
    if (o && o.active && o.t != null){ for (let i = 0; i < 7; i++){ const dy = ((o.t / 60) + i * 5) % 28; px(ctx, x + Math.floor(w / 2) - 5 + i * 2 - (i % 2), y + 15 + dy, PAL.b); } }
  },
  cofre_lata(ctx, x, y, w, h, o){
    box(ctx, x, y + 2, w, h - 2, PAL.g, K); rect(ctx, x + 1, y + 3, 1, h - 4, '#e3dff0');
    rect(ctx, x + 1, y + 5, w - 2, 5, PAL.b); rect(ctx, x + 2, y + 6, w - 4, 3, PAL.w); px(ctx, x + 4, y + 7, PAL.b); px(ctx, x + w - 5, y + 7, PAL.b);
    rect(ctx, x + Math.floor(w / 2) - 2, y + 1, 5, 1, K);
    if (o && o.coins) drawSpr(ctx, 'moeda', x + w - 4, y - 6);
  },
  cofre_porco(ctx, x, y, w, h, o){
    oEllipse(ctx, x + Math.floor(w / 2), y + Math.floor(h / 2) + 1, Math.floor(w / 2) - 1, Math.floor(h / 2) - 2, PAL.p, K);
    px(ctx, x + 3, y + 2, K); px(ctx, x + 4, y + 1, PAL.p); px(ctx, x + w - 5, y + 1, PAL.p); px(ctx, x + w - 4, y + 2, K);
    rect(ctx, x + Math.floor(w / 2) - 2, y + 2, 5, 1, K);
    box(ctx, x + w - 5, y + 5, 4, 3, PAL.P, K); px(ctx, x + 2, y + 5, K);
    rect(ctx, x + 3, y + h - 2, 2, 2, K); rect(ctx, x + w - 5, y + h - 2, 2, 2, K);
    if (o && o.coins) drawSpr(ctx, 'moeda', x + w - 3, y - 7);
  }
};
function tvShow(ctx, x, y, w, h, t){
  const f = Math.floor(t / 700) % 3;
  if (f === 0){ rect(ctx, x, y, w, h, '#9ad4f5'); const c = spriteCanvas('queijo'); if (c) ctx.drawImage(c, x + Math.floor((w - 8) / 2) + Math.round(Math.sin(t / 150) * 2), y + Math.floor((h - 8) / 2)); }
  else if (f === 1){ for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (((xx * 7 + yy * 13 + Math.floor(t / 80)) % 5) === 0) px(ctx, xx, yy, PAL.g); }
  else { rect(ctx, x, y, w, h, PAL.y); const c = spriteCanvas('ic_brincar'); if (c) ctx.drawImage(c, x + Math.floor((w - 10) / 2), y + Math.floor((h - 10) / 2)); }
}
function notes(ctx, x, y, t){
  for (let i = 0; i < 3; i++){ const ph = ((t / 700) + i * 0.33) % 1; drawSpr(ctx, 'nota', x - 2 + i * 4, y - 4 - ph * 14, {alpha:1 - ph, remap:{k:[PAL.r, PAL.b, PAL.y][i]}}); }
}
function drawFurn(ctx, name, x, y, w, h, o){ const f = FDRAW[name]; if (f) f(ctx, x, y, w, h, o || {}); }
const _furnIcons = new Map();
function furnIconURL(name, w, h){
  const key = name + w + 'x' + h;
  if (_furnIcons.has(key)) return _furnIcons.get(key);
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 4;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  drawFurn(g, name, 1, 3, w, h, {});
  const u = c.toDataURL(); _furnIcons.set(key, u); return u;
}

/* ---- comodos ---- */
const ROOMS = [
  {id:'sala',     name:'Sala',     slots:['sofa', 'mesinha', 'estante']},
  {id:'cozinha',  name:'Cozinha',  slots:['geladeira', 'fogao', 'mesa']},
  {id:'banheiro', name:'Banheiro', slots:['banheira', 'pia', 'privada']},
  {id:'quarto',   name:'Quarto',   slots:['cama', 'comoda', 'luminaria']}
];
const roomIndex = id => ROOMS.findIndex(r => r.id === id);
/* moveis padrao: nivel 0 gratis (improvisado), nivel 1 pago */
const FURN = {
  sofa:      {room:'sala',     label:'Sofá',      x:0.02, tiers:[{name:'Sofá de esponja',              draw:'sofa_esponja',       w:38, h:18},
                                                                {name:'Sofá miniatura',                draw:'sofa_mini',          w:40, h:20, price:90,  bonus:'Carinho vale mais.'}]},
  mesinha:   {room:'sala',     label:'Mesinha',   x:0.40, tiers:[{name:'Mesinha de tampa de pote',     draw:'mesinha_tampa',      w:24, h:12},
                                                                {name:'Mesinha de centro',             draw:'mesinha_madeira',    w:26, h:14, price:80,  bonus:'A TV diverte mais.'}]},
  estante:   {room:'sala',     label:'Estante',   x:0.72, tiers:[{name:'Estante de caixas de fósforo', draw:'estante_fosforo',    w:22, h:30},
                                                                {name:'Estante de madeira',            draw:'estante_madeira',    w:24, h:34, price:100, bonus:'+1 moeda em cada mini-jogo.'}]},
  geladeira: {room:'cozinha',  label:'Geladeira', x:0.02, tiers:[{name:'Geladeira de caixa de leite',  draw:'gel_caixaleite',     w:20, h:30},
                                                                {name:'Geladeira miniatura',           draw:'gel_mini',           w:22, h:34, price:110, bonus:'Comida na loja 1 moeda mais barata.'}]},
  fogao:     {room:'cozinha',  label:'Fogão',     x:0.28, tiers:[{name:'Fogãozinho de lata',           draw:'fogao_lata',         w:24, h:22},
                                                                {name:'Fogão miniatura',               draw:'fogao_mini',         w:26, h:26, price:100, bonus:'Sopa dá o dobro de energia.'}]},
  mesa:      {room:'cozinha',  label:'Mesa',      x:0.60, tiers:[{name:'Mesa de carretel',             draw:'mesa_carretel',      w:36, h:24},
                                                                {name:'Mesa de madeira',               draw:'mesa_madeira',       w:38, h:24, price:90,  bonus:'Cada refeição dá +5 de diversão.'}]},
  banheira:  {room:'banheiro', label:'Banheira',  x:0.02, tiers:[{name:'Banheira de lata de sardinha', draw:'banheira_lata',      w:40, h:18},
                                                                {name:'Banheira de porcelana',         draw:'banheira_porcelana', w:42, h:22, price:130, bonus:'Banho também dá +5 de diversão.'}]},
  pia:       {room:'banheiro', label:'Pia',       x:0.46, tiers:[{name:'Pia de tampinha',              draw:'pia_tampinha',       w:20, h:30},
                                                                {name:'Pia com espelho',               draw:'pia_espelho',        w:22, h:34, price:80,  bonus:'Higiene cai mais devagar. Espelho maior.'}]},
  privada:   {room:'banheiro', label:'Privada',   x:0.77, tiers:[{name:'Penico de dedal',              draw:'penico_dedal',       w:16, h:16},
                                                                {name:'Privadinha de louça',           draw:'privadinha',         w:20, h:26, price:80,  bonus:'Ele faz cocô com menos frequência.'}]},
  cama:      {room:'quarto',   label:'Cama',      x:0.03, tiers:[{name:'Cama de caixa de fósforo',     draw:'cama_fosforo',       w:40, h:16, sleep:{dx:22, dy:9}},
                                                                {name:'Cama de boneca',                draw:'cama_boneca',        w:42, h:22, price:130, bonus:'Dorme mais rápido.', sleep:{dx:26, dy:15}}]},
  comoda:    {room:'quarto',   label:'Cômoda',    x:0.42, tiers:[{name:'Cômoda de caixa de sapato',    draw:'comoda_caixa',       w:26, h:20},
                                                                {name:'Cômoda de madeira',             draw:'comoda_madeira',     w:28, h:24, price:110, bonus:'Roupas 5 moedas mais baratas.'}]},
  luminaria: {room:'quarto',   label:'Luminária', x:0.74, tiers:[{name:'Luminária de tampinha',        draw:'lum_tampinha',       w:14, h:26},
                                                                {name:'Abajur miniatura',              draw:'lum_abajur',         w:16, h:30, price:70,  bonus:'O quarto fica mais bonito à noite.'}]}
};
/* decoracoes: wall (x, y do topo da parede) | floor (x, no meio do chao) | onTub | onFurn.
   Com "tiers": duas versoes a venda (barata e de pet shop). Com "use": interativo. */
const DECOR = {
  /* sala */
  tapete:         {room:'sala', name:'Tapete de retalho',   price:25, kind:'rug'},
  poster:         {room:'sala', name:'Pôster de queijo',    price:35, wall:true, x:0.08, y:18, draw:'poster', w:24, h:30},
  quadro:         {room:'sala', name:'Quadro pintado',      price:45, wall:true, x:0.62, y:14, draw:'quadro', w:26, h:20},
  planta:         {room:'sala', name:'Planta no dedal',     price:30, x:0.90, floor:true, draw:'planta', w:10, h:12},
  papel_listras:  {room:'sala', name:'Papel listrado',      price:60, kind:'paper'},
  papel_bolinhas: {room:'sala', name:'Papel de bolinhas',   price:60, kind:'paper'},
  papel_coracoes: {room:'sala', name:'Papel de corações',   price:80, kind:'paper'},
  roda:    {room:'sala', label:'Rodinha de correr', x:0.76, floor:true, use:'roda',
            tiers:[{name:'Rodinha de lata de conserva', draw:'roda',         w:32, h:36, price:35},
                   {name:'Rodinha de pet shop',         draw:'roda_petshop', w:32, h:36, price:90}]},
  tv:      {room:'sala', label:'TV', x:0.08, floor:true, use:'tv',
            tiers:[{name:'TV de caixa de papelão', draw:'tv_papelao', w:20, h:16, price:30},
                   {name:'TV miniatura',           draw:'tv_mini',    w:20, h:16, price:120}]},
  roer:    {room:'sala', label:'Brinquedo de roer', x:0.50, floor:true, dy:6, use:'roer',
            tiers:[{name:'Rolha de cortiça',      draw:'roer_rolha', w:12, h:8, price:15},
                   {name:'Osso de roer colorido', draw:'roer_osso',  w:14, h:9, price:45}]},
  janela:  {room:'sala', label:'Janela', wall:true, x:0.34, y:16, use:'janela',
            tiers:[{name:'Buraco com vista',        draw:'janela_buraco',  w:22, h:18, price:20},
                   {name:'Janela com cortina',      draw:'janela_moldura', w:26, h:22, price:70}]},
  /* cozinha */
  relogio:        {room:'cozinha', name:'Relógio de parede',    price:30, wall:true, x:0.84, y:10, draw:'relogio', w:16, h:16},
  prateleira:     {room:'cozinha', name:'Prateleira de potes',  price:50, wall:true, x:0.06, y:26, draw:'prateleira', w:32, h:14},
  planta2:        {room:'cozinha', name:'Plantinha na cozinha', price:30, x:0.90, floor:true, draw:'planta', w:10, h:12},
  bebedouro: {room:'cozinha', label:'Bebedouro', wall:true, x:0.23, y:52, use:'bebedouro',
              tiers:[{name:'Bebedouro de garrafa PET', draw:'bebedouro_pet',     w:12, h:30, price:25},
                     {name:'Bebedouro de pet shop',    draw:'bebedouro_petshop', w:12, h:30, price:70}]},
  pote:      {room:'cozinha', label:'Pote de petisco', wall:true, x:0.40, y:44, use:'pote',
              tiers:[{name:'Vidro de maionese com biscoitos', draw:'pote_maionese', w:14, h:18, price:20},
                     {name:'Pote de biscoitos de cerâmica',   draw:'pote_biscoito', w:16, h:20, price:60}]},
  /* banheiro */
  patinho:        {room:'banheiro', name:'Patinho de borracha', price:20, onTub:true},
  toalha:         {room:'banheiro', name:'Toalha no gancho',    price:25, wall:true, x:0.70, y:44, draw:'toalha', w:12, h:20},
  tapete_banho:   {room:'banheiro', name:'Tapetinho do banho',  price:25, kind:'rug'},
  quadro2:        {room:'banheiro', name:'Quadro do mar',       price:45, wall:true, x:0.30, y:22, draw:'quadro', w:26, h:20},
  chuveiro:  {room:'banheiro', label:'Chuveirinho', wall:true, x:0.10, y:56, use:'chuveiro',
              tiers:[{name:'Regador pendurado',     draw:'chuveiro_regador',   w:18, h:26, price:25},
                     {name:'Chuveiro de brinquedo', draw:'chuveiro_brinquedo', w:18, h:20, price:75}]},
  /* quarto */
  rede:      {room:'quarto', label:'Rede', wall:true, x:0.22, y:36, use:'rede',
              tiers:[{name:'Rede de meia velha',  draw:'rede_meia', w:40, h:18, price:20},
                     {name:'Rede de pet de tecido', draw:'rede_pet', w:40, h:18, price:65}]},
  casinha:   {room:'quarto', label:'Casinha de esconder', x:0.14, floor:true, use:'casinha',
              tiers:[{name:'Caixa de sapato com buraco', draw:'casinha_sapato',  w:28, h:22, price:25},
                     {name:'Casinha de madeira',         draw:'casinha_madeira', w:30, h:26, price:90}]},
  radio:     {room:'quarto', label:'Rádio', x:0.84, floor:true, use:'radio',
              tiers:[{name:'Rádio de caixa de fósforo', draw:'radio_fosforo', w:16, h:14, price:25},
                     {name:'Vitrola miniatura',         draw:'radio_vitrola', w:18, h:14, price:80}]},
  cofre:     {room:'quarto', label:'Cofrinho', onFurn:'comoda', dx:2, use:'cofre',
              tiers:[{name:'Cofrinho de lata de leite', draw:'cofre_lata',  w:12, h:14, price:25},
                     {name:'Cofrinho de porquinho',     draw:'cofre_porco', w:16, h:12, price:80}]}
};
function furnTier(key){ return (S.furn && S.furn[key]) || 0; }
function furnDef(key){ return FURN[key].tiers[furnTier(key)]; }
function hasUpgrade(key){ return furnTier(key) >= 1; }
function decorTier(key){ return (S.decorTier && S.decorTier[key]) || 0; }
function decorDef(key){ const d = DECOR[key]; return d.tiers ? d.tiers[decorTier(key)] : d; }
function hasDecor(key){ return S.decor.includes(key); }
