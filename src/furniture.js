/* ===== Comodos, moveis (desenhados por codigo) e decoracoes ===== */
Object.assign(SPR, {
  tv_mini:[
  '....k......k......',
  '.....k....k.......',
  '......k..k........',
  '.kkkkkkkkkkkkkkkk.',
  '.kggggggggggggkgk.',
  '.kgkkkkkkkkkkgkrk.',
  '.kgkbbbbbbbbkgkgk.',
  '.kgkbbbwbbbbkgkgk.',
  '.kgkbbbbbbbbkgkgk.',
  '.kgkkkkkkkkkkgkkk.',
  '.kggggggggggggggk.',
  '.kkkkkkkkkkkkkkkk.',
  '...kk........kk...'],
  quadro:[
  'kkkkkkkkkkkk',
  'kNNNNNNNNNNk',
  'kNbbbbbbbbNk',
  'kNbbbyybbbNk',
  'kNbbbbbbbbNk',
  'kNeeeeeeeeNk',
  'kNeeeeeeeeNk',
  'kNNNNNNNNNNk',
  'kkkkkkkkkkkk'],
  relogio:[
  '...kkkk...',
  '..kwwwwk..',
  '.kwwkwwwk.',
  '.kwwkwwwk.',
  '.kwwkkkwk.',
  '.kwwwwwwk.',
  '..kwwwwk..',
  '...kkkk...'],
  prateleira:[
  '..kkkk..kkkk..kkkk..',
  '..kyyk..kppk..keek..',
  '..kyyk..kppk..keek..',
  '..kkkk..kkkk..kkkk..',
  'kkkkkkkkkkkkkkkkkkkk',
  'kNNNNNNNNNNNNNNNNNNk',
  'kkkkkkkkkkkkkkkkkkkk'],
  patinho:[
  '..kkk...',
  '.kyykk..',
  '.kyykok.',
  '.kyyyk..',
  'kkyyyyk.',
  'kyyyyyyk',
  '.kkkkkk.'],
  toalha:[
  '...kk...',
  '...kk...',
  '.kkkkkk.',
  '.kppppk.',
  '.kppppk.',
  '.kwwwwk.',
  '.kppppk.',
  '.kppppk.',
  '.kwwwwk.',
  '.kppppk.',
  '.kppppk.',
  '.kkkkkk.']
});

/* ---- desenho procedural dos moveis: (ctx, x, y, w, h, night); x,y = canto superior esquerdo ---- */
const K = PAL.k;
const FDRAW = {
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
  }
};
function drawFurn(ctx, name, x, y, w, h, night){ const f = FDRAW[name]; if (f) f(ctx, x, y, w, h, night); }
const _furnIcons = new Map();
function furnIconURL(name, w, h){
  const key = name + w + 'x' + h;
  if (_furnIcons.has(key)) return _furnIcons.get(key);
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  drawFurn(g, name, 1, 1, w, h, false);
  const u = c.toDataURL(); _furnIcons.set(key, u); return u;
}

/* Comodos: cada um tem 3 vagas de moveis. */
const ROOMS = [
  {id:'sala',     name:'Sala',     slots:['sofa', 'cama', 'luminaria']},
  {id:'cozinha',  name:'Cozinha',  slots:['geladeira', 'fogao', 'mesa']},
  {id:'banheiro', name:'Banheiro', slots:['banheira', 'pia', 'privada']}
];
/* Cada vaga: versao improvisada (gratis, nivel 0) e versao de verdade (nivel 1, paga). x = fracao da largura. */
const FURN = {
  sofa:      {room:'sala',     label:'Sofá',      x:0.02, tiers:[{name:'Sofá de esponja',              draw:'sofa_esponja',       w:38, h:18},
                                                                {name:'Sofá miniatura',                draw:'sofa_mini',          w:40, h:20, price:90,  bonus:'Carinho vale mais.'}]},
  cama:      {room:'sala',     label:'Cama',      x:0.37, tiers:[{name:'Cama de caixa de fósforo',     draw:'cama_fosforo',       w:40, h:16, sleep:{dx:22, dy:9}},
                                                                {name:'Cama de boneca',                draw:'cama_boneca',        w:42, h:22, price:130, bonus:'Dorme mais rápido.', sleep:{dx:26, dy:15}}]},
  luminaria: {room:'sala',     label:'Luminária', x:0.74, tiers:[{name:'Luminária de tampinha',        draw:'lum_tampinha',       w:14, h:26},
                                                                {name:'Abajur miniatura',              draw:'lum_abajur',         w:16, h:30, price:70,  bonus:'A toca fica mais bonita à noite.'}]},
  geladeira: {room:'cozinha',  label:'Geladeira', x:0.02, tiers:[{name:'Geladeira de caixa de leite',  draw:'gel_caixaleite',     w:20, h:30},
                                                                {name:'Geladeira miniatura',           draw:'gel_mini',           w:22, h:34, price:110, bonus:'Comida na loja 1 moeda mais barata.'}]},
  fogao:     {room:'cozinha',  label:'Fogão',     x:0.28, tiers:[{name:'Fogãozinho de lata',           draw:'fogao_lata',         w:24, h:22},
                                                                {name:'Fogão miniatura',               draw:'fogao_mini',         w:26, h:26, price:100, bonus:'Sopa dá o dobro de energia.'}]},
  mesa:      {room:'cozinha',  label:'Mesa',      x:0.60, tiers:[{name:'Mesa de carretel',             draw:'mesa_carretel',      w:36, h:24},
                                                                {name:'Mesa de madeira',               draw:'mesa_madeira',       w:38, h:24, price:90,  bonus:'Cada refeição dá +5 de diversão.'}]},
  banheira:  {room:'banheiro', label:'Banheira',  x:0.02, tiers:[{name:'Banheira de lata de sardinha', draw:'banheira_lata',      w:40, h:18},
                                                                {name:'Banheira de porcelana',         draw:'banheira_porcelana', w:42, h:22, price:130, bonus:'Banho também dá +5 de diversão.'}]},
  pia:       {room:'banheiro', label:'Pia',       x:0.46, tiers:[{name:'Pia de tampinha',              draw:'pia_tampinha',       w:20, h:30},
                                                                {name:'Pia com espelho',               draw:'pia_espelho',        w:22, h:34, price:80,  bonus:'Higiene cai mais devagar.'}]},
  privada:   {room:'banheiro', label:'Privada',   x:0.77, tiers:[{name:'Penico de dedal',              draw:'penico_dedal',       w:16, h:16},
                                                                {name:'Privadinha de louça',           draw:'privadinha',         w:20, h:26, price:80,  bonus:'Ele faz cocô com menos frequência.'}]}
};
/* Decoracoes: wall = na parede (y a partir do topo da parede); floor = no meio do chao; onTub = em cima da banheira. */
const DECOR = {
  tapete:         {room:'sala',     name:'Tapete de retalho',    price:25, kind:'rug'},
  poster:         {room:'sala',     name:'Pôster de queijo',     price:35, wall:true, x:0.06, y:8},
  quadro:         {room:'sala',     name:'Quadro pintado',       price:45, wall:true, x:0.70, y:12},
  planta:         {room:'sala',     name:'Planta no dedal',      price:30, x:0.90, floor:true},
  tv:             {room:'sala',     name:'TV miniatura',         price:120, x:0.06, floor:true, spr:'tv_mini'},
  roda:           {room:'sala',     name:'Rodinha de correr',    price:70, x:0.76, floor:true},
  papel_listras:  {room:'sala',     name:'Papel listrado',       price:60, kind:'paper'},
  papel_bolinhas: {room:'sala',     name:'Papel de bolinhas',    price:60, kind:'paper'},
  papel_coracoes: {room:'sala',     name:'Papel de corações',    price:80, kind:'paper'},
  relogio:        {room:'cozinha',  name:'Relógio de parede',    price:30, wall:true, x:0.82, y:6},
  prateleira:     {room:'cozinha',  name:'Prateleira de potes',  price:50, wall:true, x:0.20, y:14},
  planta2:        {room:'cozinha',  name:'Plantinha na cozinha', price:30, x:0.90, floor:true, spr:'planta'},
  patinho:        {room:'banheiro', name:'Patinho de borracha',  price:20, onTub:true},
  toalha:         {room:'banheiro', name:'Toalha no gancho',     price:25, wall:true, x:0.72, y:12},
  tapete_banho:   {room:'banheiro', name:'Tapetinho do banho',   price:25, kind:'rug'},
  quadro2:        {room:'banheiro', name:'Quadro do mar',        price:45, wall:true, x:0.38, y:8, spr:'quadro'}
};
function furnTier(key){ return (S.furn && S.furn[key]) || 0; }
function furnDef(key){ return FURN[key].tiers[furnTier(key)]; }
function hasUpgrade(key){ return furnTier(key) >= 1; }
