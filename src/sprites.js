/* ===== Paleta e sprites (pixel art em texto) ===== */
const PAL = {
  k:'#3a2a4a', x:'#2a2140', w:'#fffaf0',
  c:'#f2d9b1', C:'#d9b98a',
  p:'#f4a7c0', P:'#d97a9c',
  y:'#ffd23f', Y:'#e0a500',
  r:'#e05a4e', R:'#a63b33',
  b:'#5aa9e6', B:'#2f6bb0',
  g:'#c9c3d6', G:'#8d86a3',
  n:'#b0713f', N:'#6e4222',
  e:'#6ccf7a', E:'#3c9a4c',
  o:'#f5943c', v:'#a98be8', t:'#3fb7a0',
  s:'#f6ecd2', d:'#6b5a86', h:'#ff8fa3'
};

const SPR = {
  queijo:[
  '........',
  '......k.',
  '....kkyk',
  '..kkyyyk',
  'kkyYyyyk',
  'kyyyyYyk',
  'kYyyyyyk',
  '.kkkkkk.'],
  semente:[
  '........',
  '...kk...',
  '..kNnk..',
  '..knNk..',
  '.kNnNnk.',
  '.knNnNk.',
  '..kNnk..',
  '...kk...'],
  biscoito:[
  '........',
  '..kkkk..',
  '.knnnnk.',
  'knNnnNnk',
  'knnnnnnk',
  'knNnnNnk',
  '.knnnnk.',
  '..kkkk..'],
  morango:[
  '...e.e..',
  '..keEk..',
  '.krrrrk.',
  'krRrrwrk',
  'krrrrrrk',
  'kwrrRrrk',
  '.krrrrk.',
  '..kkkk..'],
  bolo:[
  '...kr...',
  '..kpppk.',
  '.kwwwwwk',
  '.kpppppk',
  '.kwwwwwk',
  '.knnnnnk',
  '.knnnnnk',
  '..kkkkk.'],
  sopa:[
  '..g.g...',
  '.g.g....',
  'kkkkkkkk',
  'kooooook',
  'kbbbbbbk',
  '.kbbbbk.',
  '..kbbk..',
  '..kkkk..'],
  sabonete:[
  '.w..w...',
  'w.......',
  '.kkkkkk.',
  'kpppppwk',
  'kpppwppk',
  'kppppppk',
  '.kkkkkk.',
  '........'],
  remedio:[
  '..kkkk..',
  '..kggk..',
  '.kkkkkk.',
  'kwwrrwwk',
  'kwrrrrwk',
  'kwwrrwwk',
  'kwwwwwwk',
  '.kkkkkk.'],
  coco:[
  '........',
  '...kk...',
  '..kNNk..',
  '.kNnNNk.',
  'kNnNNNNk',
  'kNNNNNNk',
  'kNnNNNNk',
  '.kkkkkk.'],
  coracao:[
  '........',
  '.kk..kk.',
  'khhkkhhk',
  'khhhhhhk',
  'khwhhhhk',
  '.khhhhk.',
  '..khhk..',
  '...kk...'],
  zzz:[
  '........',
  '.bbbbb..',
  '....bb..',
  '...bb...',
  '..bb....',
  '.bbbbb..',
  '........',
  '........'],
  brilho:[
  '........',
  '...w....',
  '..www...',
  '.wwyww..',
  '..www...',
  '...w....',
  '........',
  '........'],
  gota:[
  '........',
  '...b....',
  '...b....',
  '..bwb...',
  '..bbb...',
  '.bbwbb..',
  '.bbbbb..',
  '..bbb...'],
  termometro:[
  '...kk...',
  '..kwwk..',
  '..kwrk..',
  '..kwrk..',
  '..kwrk..',
  '.kwrrrk.',
  '.kwrrrk.',
  '..kkkk..'],
  moeda:[
  '..kkkk..',
  '.kyyyyk.',
  'kyyYYyyk',
  'kyYyyYyk',
  'kyYyyYyk',
  'kyyYYyyk',
  '.kyyyyk.',
  '..kkkk..'],
  meia:[
  '..kkkk..',
  '..kggk..',
  '..kggk..',
  '..kggk..',
  '.kkggk..',
  'kgggggk.',
  'kggggk..',
  '.kkkk...'],
  estrela:[
  '..w..',
  '..w..',
  'wwwww',
  '..w..',
  '..w..'],
  mola:[
  'kkkkkkkk',
  '.kGkGkG.',
  '.GkGkGk.',
  '.kGkGkG.',
  'kkkkkkkk'],
  nuvem:[
  '.....kkkk.......',
  '...kkwwwwkk.....',
  '..kwwwwwwwwkkk..',
  '.kwwwwwwwwwwwwk.',
  'kwwwwwwwwwwwwwwk',
  'kwwwwwwwwwwwwwwk',
  '.kkkkkkkkkkkkkk.',
  '................'],
  ratoeira:[
  '...kkkkk....',
  '..kGGGGGk...',
  '.kkGkkkGkk..',
  'kNnnnnnnnnNk',
  'kNnnyynnnnNk',
  'kkkkkkkkkkkk'],
  gato:[
  '.kk..........kk.',
  'kook........kook',
  'koookkkkkkkkoook',
  'kooooooooooooook',
  'koookkoooookkook',
  'koookyoooooykook',
  'kooooooooooooook',
  'koooookpppkooook',
  'koooookokokooook',
  '.kooooooooooook.',
  '..kkkkkkkkkkkk..',
  '................'],
  pao:[
  '........',
  '..kkkk..',
  '.knnnnk.',
  'knNnnNnk',
  'knnnnnnk',
  'kNnnnnNk',
  '.kkkkkk.',
  '........'],
  cenoura:[
  '......ee',
  '.....eEe',
  '....koek',
  '...kook.',
  '..kook..',
  '.kook...',
  'kook....',
  '.kk.....'],
  uva:[
  '...ee...',
  '..kvk...',
  '.kvkvk..',
  'kvkvkvk.',
  '.kvkvk..',
  '..kvk...',
  '...k....',
  '........'],
  pizza:[
  'kkkkkkkk',
  'kyyyyyyk',
  '.kyryyk.',
  '.kyyyrk.',
  '..kryk..',
  '..kyyk..',
  '...kk...',
  '........'],
  brigadeiro:[
  '........',
  '..kkkk..',
  '.kNnNNk.',
  'kNNnNNNk',
  'kNnNNnNk',
  '.kwwwwk.',
  '.kwkwkk.',
  '..kkkk..'],
  sorvete:[
  '..kkkk..',
  '.kppppk.',
  'kppwpppk',
  'kppppppk',
  '.knnnnk.',
  '..knnk..',
  '..knnk..',
  '...kk...'],
  pipoca:[
  '.w.ww.w.',
  'wwkwwkww',
  '.kkkkkk.',
  '.krwrwrk',
  '.krwrwrk',
  '.krwrwrk',
  '.krwrwrk',
  '.kkkkkk.'],
  leite:[
  '.kkkkkk.',
  '.kwwrwk.',
  '.kwwrwk.',
  '.kwwwwk.',
  '.kwwwwk.',
  '.kwwwwk.',
  '.kwwwwk.',
  '.kkkkkk.'],
  banana:[
  '.k......',
  'kNk.....',
  'kyyk....',
  '.kyyk...',
  '..kyyyk.',
  '...kyyyk',
  '....kyyk',
  '.....kk.'],
  suco:[
  '.....oo.',
  '.kkkkkok',
  '.kwwwwk.',
  '.kooook.',
  '.kooook.',
  '.kooook.',
  '.kooook.',
  '..kkkk..'],
  cafe:[
  '..g.g...',
  '.g.g....',
  'kkkkkk..',
  'kNNNNkk.',
  'kwwwwk.k',
  'kwwwwkk.',
  '.kkkk...',
  'kkkkkkk.'],
  castanhas:[
  '........',
  '..nN.n..',
  '.NnNnNn.',
  'kkkkkkkk',
  '.kcccck.',
  '.kcccck.',
  '..kcck..',
  '..kkkk..'],
  mel:[
  '..kkkk..',
  '..kNNk..',
  '.kkkkkk.',
  '.kyyyyk.',
  '.kyYyyk.',
  '.kyyyyk.',
  '.kyyYyk.',
  '..kkkk..'],
  acai:[
  '........',
  '.y.o.y..',
  'kkkkkkkk',
  'kddvdddk',
  '.kddddk.',
  '.kwwwwk.',
  '..kwwk..',
  '..kkkk..'],
  nota:[
  '.....k..',
  '.....kk.',
  '.....k.k',
  '.....k..',
  '.....k..',
  '..kkkk..',
  '.kkkkk..',
  '..kkk...'],
  cano:[
  'kkkkk...',
  'kbbbbk..',
  'kbbbbkk.',
  'kkkbbbbk',
  '..kbbbbk',
  '..kbbbbk',
  '..kkkkkk',
  '........'],
  lixeira:[
  '.kkkkkk.',
  'kGGGGGGk',
  '.kkkkkk.',
  '.kggggk.',
  '.kgGgGk.',
  '.kggggk.',
  '.kgGgGk.',
  '.kkkkkk.'],
  papel:[
  '..kkk...',
  '.kwwwk..',
  'kwgwwwk.',
  'kwwwgwk.',
  'kwgwwwk.',
  '.kwwwk..',
  '..kkk...',
  '........'],
  /* ---- icones do menu (10x10) ---- */
  ic_comer:[
  '..........',
  '.......kk.',
  '.....kkyyk',
  '...kkyyyyk',
  '.kkyyYyyyk',
  'kyYyyyyYyk',
  'kyyyyYyyyk',
  'kYyyyyyyyk',
  'kyyyyyyYyk',
  '.kkkkkkkk.'],
  ic_luz:[
  '...kkkk...',
  '..kyyyyk..',
  '.kyywyyyk.',
  '.kyyyyyyk.',
  '.kyyyyyyk.',
  '..kyyyyk..',
  '...kyyk...',
  '...kggk...',
  '...kggk...',
  '....kk....'],
  ic_brincar:[
  '...kkkk...',
  '..kyyyyk..',
  '.kyyyyyyk.',
  'kyykyykyyk',
  'kyyyyyyyyk',
  'kykyyyykyk',
  'kyykkkkyyk',
  '.kyyyyyyk.',
  '..kyyyyk..',
  '...kkkk...'],
  ic_remedio:[
  '..........',
  '..........',
  '..........',
  '.kkkkkkkk.',
  'krrrrwwwwk',
  'krRrrwwwwk',
  'krrrrwwgwk',
  '.kkkkkkkk.',
  '..........',
  '..........'],
  ic_banho:[
  '..w...w...',
  '.w.w.w.w..',
  '..w...w...',
  '..........',
  'kkkkkkkkkk',
  'kbbbbbbbbk',
  'kbbbbbbbbk',
  '.kbbbbbbk.',
  '..kkkkkk..',
  '..k....k..'],
  ic_status:[
  '..........',
  '.kkk..kkk.',
  'khhhkkhhhk',
  'khwhhhhhhk',
  'khhhhhhhhk',
  '.khhhhhhk.',
  '..khhhhk..',
  '...khhk...',
  '....kk....',
  '..........'],
  ic_loja:[
  '..........',
  '..kkkkkk..',
  '.kyyyyyyk.',
  'kyyYYYYyyk',
  'kyYyyyyYyk',
  'kyYyyyyYyk',
  'kyyYYYYyyk',
  '.kyyyyyyk.',
  '..kkkkkk..',
  '..........'],
  ic_config:[
  '....kk....',
  '.kk.kk.kk.',
  '.kkGGGGkk.',
  '..kGGGGk..',
  'kkGGkkGGkk',
  'kkGGkkGGkk',
  '..kGGGGk..',
  '.kkGGGGkk.',
  '.kk.kk.kk.',
  '....kk....'],
  /* ---- chapeus e acessorios (14 de largura) ---- */
  bone:[
  '.....kkkk.....',
  '...kkrrrrkk...',
  '..krrrwrrrrk..',
  '..krrrrrrrrk..',
  '..kkkkkkkkkkkk',
  '..............'],
  laco:[
  '..............',
  '..kkk...kkk...',
  '.kpppkkkpppk..',
  '.kpPpkpkpPpk..',
  '.kpppkkkpppk..',
  '..kkk...kkk...'],
  oculos:[
  '..............',
  '.kkkkk..kkkkk.',
  '.kbbbbkkbbbbk.',
  '.kbwbbk.kbwbbk',
  '.kbbbbk.kbbbbk',
  '..kkkk...kkkk.'],
  cachecol:[
  '..............',
  '..............',
  '.kkkkkkkkkkkk.',
  'kbbwbbwbbwbbbk',
  'kbbbbbbbbbbbbk',
  '.kkkkkkkkkkkk.'],
  cartola:[
  '....kkkkkk....',
  '....kxxxxk....',
  '....kxxxxk....',
  '....kxxxxk....',
  '....krrrrk....',
  '..kkkkkkkkkk..',
  '..kxxxxxxxxk..',
  '...kkkkkkkk...'],
  flor:[
  '..............',
  '........k.k...',
  '.......kpkpk..',
  '........kyk...',
  '.......kpkpk..',
  '........k.k...'],
  coroa:[
  '..............',
  '...k...k...k..',
  '...kk.kkk.kk..',
  '...kyykyykyy..',
  '...kyyyyyyyk..',
  '...kkkkkkkkk..'],
  coroa_rei:[
  '..............',
  '...k...k...k..',
  '...kk.kkk.kk..',
  '...kyrkyykry..',
  '...kyyyyyyyk..',
  '...kkkkkkkkk..'],
  chef:[
  '...kkkkkkk....',
  '..kwwwwwwwk...',
  '.kwwwwwwwwwk..',
  '.kwwwwwwwwwk..',
  '..kwwwwwwwk...',
  '...kwwwwwk....',
  '...kwwwwwk....',
  '...kkkkkkk....'],
  faixa:[
  '.kkkkkkkkkkkk.',
  'krrrwrrrrrrrrk',
  '.kkkkkkkkkkkk.'],
  touca:[
  '.........kk...',
  '........kwwk..',
  '......kkbbkk..',
  '....kkbbbbk...',
  '..kkbbbbbbk...',
  '.kbbbbbbbbk...',
  '.kwwwwwwwwk...',
  '.kkkkkkkkkk...'],
  gravata:[
  '..............',
  '..kkk.k.kkk...',
  '.krrrkrkrrrk..',
  '..kkk.k.kkk...'],
  /* ---- moveis ---- */
  carretel:[
  '.kkkkkkkkkkkk.',
  'kNnnnnnnnnnnNk',
  '.kkkkkkkkkkkk.',
  '....knnnnk....',
  '....knNnnk....',
  '....knnnnk....',
  '....knNnnk....',
  '.kkkkkkkkkkkk.',
  'kNnnnnnnnnnnNk',
  '.kkkkkkkkkkkk.'],
  cama:[
  '..................',
  '.kkkkkkkkkkkkkkkk.',
  '.kwwwwkbbbbbbbbbk.',
  '.kwwwwkbbbbbbbbbk.',
  'kkkkkkkkkkkkkkkkkk',
  'kooooooooooooooook',
  'kooRRRRoRRRRoRRRok',
  'kooooooooooooooook',
  'kkkkkkkkkkkkkkkkkk'],
  lampada:[
  '..kkkkkk..',
  '.kyyyyyyk.',
  'kyyywyyyyk',
  'kyyyyyyyyk',
  'kkkkkkkkkk',
  '....kk....',
  '....kGk...',
  '....kGk...',
  '....kGk...',
  '....kGk...',
  '..kkkkkk..',
  '.krRrRrRk.',
  '.krrrrrrk.',
  '.kkkkkkkk.'],
  roda:[
  '....kkkkkk....',
  '..kkggggggkk..',
  '.kgggkggkgggk.',
  '.kggkggggkggk.',
  'kgggkggggkgggk',
  'kggggkkkkggggk',
  'kgggggkkgggggk',
  'kgggggkkgggggk',
  'kggggkkkkggggk',
  'kgggkggggkgggk',
  '.kggkggggkggk.',
  '.kgggkggkgggk.',
  '..kkggggggkk..',
  '....kkkkkk....'],
  poster:[
  'kkkkkkkkkkkk',
  'kwwwwwwwwwwk',
  'kwwwwwwwwwwk',
  'kwwwwkkkwwwk',
  'kwwwkyyykwwk',
  'kwwkyYyyykwk',
  'kwkyyyyYyykk',
  'kwkyYyyyyykk',
  'kwkkkkkkkkwk',
  'kwwwwwwwwwwk',
  'kwwkkkkkkwwk',
  'kwwwwwwwwwwk',
  'kwwwwwwwwwwk',
  'kkkkkkkkkkkk'],
  planta:[
  '....e.....',
  '...eEe.e..',
  '..eEeeeEe.',
  '...eEeEe..',
  '....eEe...',
  '.....e....',
  '..kkkkkk..',
  '.kggggggk.',
  '.kgGgGgGk.',
  '.kggggggk.',
  '..kkkkkk..',
  '..........']
};

/* ===== Helpers de desenho ===== */
const _sprCache = new Map();
function spriteCanvas(name, remap){
  const key = name + '|' + (remap ? JSON.stringify(remap) : '');
  if (_sprCache.has(key)) return _sprCache.get(key);
  const rows = SPR[name];
  if (!rows){ console.warn('sprite?', name); return null; }
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++){
    const row = rows[y];
    if (row.length !== w) console.warn('sprite linha irregular:', name, y, row.length, w);
    for (let x = 0; x < row.length; x++){
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = (remap && remap[ch]) || PAL[ch];
      if (!col) continue;
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
  }
  _sprCache.set(key, c);
  return c;
}
function drawSpr(ctx, name, x, y, o){
  const c = spriteCanvas(name, o && o.remap);
  if (!c) return;
  x = Math.round(x); y = Math.round(y);
  if (o && o.flip){
    ctx.save(); ctx.translate(x + c.width, y); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0); ctx.restore();
  } else if (o && o.alpha != null){
    ctx.save(); ctx.globalAlpha = o.alpha; ctx.drawImage(c, x, y); ctx.restore();
  } else {
    ctx.drawImage(c, x, y);
  }
}
const _urlCache = new Map();
function sprURL(name, remap){
  const key = name + '|' + (remap ? JSON.stringify(remap) : '');
  if (_urlCache.has(key)) return _urlCache.get(key);
  const c = spriteCanvas(name, remap);
  const u = c ? c.toDataURL() : '';
  _urlCache.set(key, u);
  return u;
}
function sprImg(name, remap){ return '<img class="ico" alt="" src="' + sprURL(name, remap) + '">'; }

function px(ctx, x, y, color){ ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
function rect(ctx, x, y, w, h, color){ ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function box(ctx, x, y, w, h, fill, outline){
  rect(ctx, x, y, w, h, outline);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, fill);
}
function fillEllipse(ctx, cx, cy, rx, ry, color){
  ctx.fillStyle = color;
  cx = Math.round(cx); cy = Math.round(cy);
  const RY = Math.max(0, Math.round(ry));
  for (let dy = -RY; dy <= RY; dy++){
    const t = dy / (ry + 0.5);
    const hw = rx * Math.sqrt(Math.max(0, 1 - t * t));
    const x0 = Math.round(cx - hw), x1 = Math.round(cx + hw);
    ctx.fillRect(x0, cy + dy, x1 - x0 + 1, 1);
  }
}
function oEllipse(ctx, cx, cy, rx, ry, fill, outline){
  fillEllipse(ctx, cx, cy, rx + 1, ry + 1, outline || PAL.k);
  fillEllipse(ctx, cx, cy, rx, ry, fill);
}
function curve(ctx, p0, p1, p2, color, thick){
  ctx.fillStyle = color;
  const n = 24, t0 = thick || 1, off = Math.floor(t0 / 2);
  for (let i = 0; i <= n; i++){
    const t = i / n, u = 1 - t;
    const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
    const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
    ctx.fillRect(Math.round(x) - off, Math.round(y) - off, t0, t0);
  }
}
function circleFill(ctx, cx, cy, r, color){ fillEllipse(ctx, cx, cy, r, r, color); }
