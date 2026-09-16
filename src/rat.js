/* ===== O ratinho: peles, formas, roupas, acessorios e desenho procedural ===== */
const SKINS = {
  /* cores naturais */
  bege:    {name:'Bege',     fur:'#f2d9b1', sh:'#d9b98a', belly:'#fff3dc', price:0, group:'natural'},
  branco:  {name:'Branco',   fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', price:60, group:'natural'},
  cinza:   {name:'Cinza',    fur:'#b9b3c7', sh:'#8d86a3', belly:'#e3dff0', price:60, group:'natural'},
  caramelo:{name:'Caramelo', fur:'#e0a25c', sh:'#b57a3a', belly:'#f6d7a8', price:80, group:'natural'},
  malhado: {name:'Malhado',  fur:'#f2d9b1', sh:'#d9b98a', belly:'#fff3dc', spots:'#8a5a34', price:100, group:'natural'},
  preto:   {name:'Pretinho', fur:'#5a4a6a', sh:'#3f3350', belly:'#7d6b90', price:120, group:'natural'},
  /* bicolores (capuz: cabeca de uma cor, corpo branco) */
  branco_bege:  {name:'Branco com bege',  fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', hood:'#e0b98a', price:70,  group:'bicolor'},
  branco_cinza: {name:'Branco com cinza', fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', hood:'#9d97ad', price:70,  group:'bicolor'},
  branco_preto: {name:'Branco com preto', fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', hood:'#4a3f5a', price:90,  group:'bicolor'},
  branco_caramelo:{name:'Branco com caramelo', fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', hood:'#d9944e', price:90, group:'bicolor'},
  /* coloridos (caros) */
  rosinha: {name:'Rosinha',  fur:'#f8c8d8', sh:'#e39ab5', belly:'#fff0f5', price:150, group:'color'},
  azul:    {name:'Azul',     fur:'#7fbcf0', sh:'#4f8fd0', belly:'#cfe6ff', price:200, group:'color'},
  vermelho:{name:'Vermelho', fur:'#ef7a6c', sh:'#c94a3f', belly:'#ffd0c8', price:200, group:'color'},
  verde:   {name:'Verde',    fur:'#8fd98a', sh:'#5aa65a', belly:'#d8f5d0', price:200, group:'color'},
  amarelo: {name:'Amarelo',  fur:'#ffe066', sh:'#e0b400', belly:'#fff6c0', price:200, group:'color'},
  laranja: {name:'Laranja',  fur:'#ffad5c', sh:'#e07c2a', belly:'#ffe0c0', price:200, group:'color'},
  roxo:    {name:'Roxo',     fur:'#b79cf0', sh:'#8a66d0', belly:'#e6dcff', price:220, group:'color'},
  turquesa:{name:'Turquesa', fur:'#7fe0d0', sh:'#3fb7a0', belly:'#d6f7f0', price:220, group:'color'}
};
const FORMS = {
  comum:      {name:'Ratinho Comum',      desc:'Um ratinho normal e contente.'},
  rei:        {name:'Rato Rei',           desc:'Cuidado perfeito! Ele virou realeza.', acc:'coroa_rei', where:'head'},
  chef:       {name:'Ratinho Chef',       desc:'Sempre bem alimentado. Agora cozinha!', acc:'chef', where:'head'},
  atleta:     {name:'Ratinho Atleta',     desc:'Brincou demais. Está em forma!', acc:'faixa', where:'brow'},
  dorminhoco: {name:'Ratinho Dorminhoco', desc:'Dormiu muito. Vive sonhando.', acc:'touca', where:'head'},
  limpinho:   {name:'Ratinho Limpinho',   desc:'Sempre cheiroso, de banho tomado.', acc:'gravata', where:'neck'},
  bolota:     {name:'Ratinho Bolota',     desc:'Comeu muito doce. Redondinho!', chubby:true}
};
const STAGES = {
  baby:  {name:'Filhote',     level:1},
  young: {name:'Adolescente', level:4},
  adult: {name:'Adulto',      level:10}
};
const STAGE_ORDER = ['baby', 'young', 'adult'];
const stageRank = s => STAGE_ORDER.indexOf(s);

/* sprites dos acessorios novos (14 de largura) */
Object.assign(SPR, {
  nariz_palhaco:['.kkk.', 'krwrk', 'krrrk', '.kkk.'],
  bigode:['kk.......kk', '.kkkk.kkkk.', '...kkkkk...'],
  oculos_nerd:[
  '.kkkk...kkkk..',
  'kkkkkk.kkkkkk.',
  'kwwwwk.kwwwwk.',
  'kwwwwkkkwwwwk.',
  '.kkkk.n.kkkk..',
  '......kNk.....',
  '.....kNNNk....',
  '......kkk.....'],
  chapeu_festa:[
  '......kk......',
  '.....kyyk.....',
  '.....kyyk.....',
  '....kbbbbk....',
  '....kbbbbk....',
  '...krrrrrrk...',
  '...krrrrrrk...',
  '..kbbbbbbbbk..',
  '..kbbbbbbbbk..',
  '.kkkkkkkkkkkk.'],
  orelhas_coelho:[
  '..kk......kk..',
  '.kwwk....kwwk.',
  '.kwpwk..kwpwk.',
  '.kwpwk..kwpwk.',
  '.kwpwk..kwpwk.',
  '.kwpwk..kwpwk.',
  '.kwpwk..kwpwk.',
  '..kwk....kwk..',
  '..kwk....kwk..',
  '..kkk....kkk..'],
  tiara_unicornio:[
  '......kk......',
  '.....kyyk.....',
  '.....kyyk.....',
  '.....kYyk.....',
  '....kkyykk....',
  '...kpkkkkpk...',
  '..kpypkkpypk..',
  '...kpkkkkpk...',
  '....kkkkkk....'],
  mascara_heroi:[
  '.kkkkk..kkkkk.',
  'kbbbbbkkbbbbbk',
  'kbkkbbbbbbkkbk',
  'kbbbbbkkbbbbbk',
  '.kkkkk..kkkkk.'],
  cone:[
  '......kk......',
  '.....kook.....',
  '.....kook.....',
  '....koooook...',
  '....kwwwwwk...',
  '...kooooooook.',
  '...kwwwwwwwwk.',
  '..kooooooooook',
  'kkkkkkkkkkkkkk'],
  capacete_queijo:[
  '.............k',
  '..........kkyk',
  '.......kkkyyyk',
  '....kkkyyYyyyk',
  '.kkkyyyyyyyYyk',
  'kyYyyyyyyyyyyk',
  'kyyyyyYyyyyyyk',
  'kkkkkkkkkkkkkk'],
  olhos_bobos:[
  '.kkkk...kkkk..',
  'kwwwwk.kwwwwk.',
  'kwkkwk.kwkkwk.',
  'kwkkwk.kwkkwk.',
  '.kkkk...kkkk..'],
  bone_virado:[
  '.....kkkk.....',
  '...kkbbbbkk...',
  '..kbbbbbbbbk..',
  '..kbbbbbbbbk..',
  'kkkkkkkkkkkk..'],
  fone:[
  '....kkkkkk....',
  '...kkGGGGkk...',
  '..kGkkkkkkGk..',
  '..kGk....kGk..',
  '.kkkk....kkkk.',
  '.kGGk....kGGk.',
  '.kGGk....kGGk.',
  '.kkkk....kkkk.'],
  oculos_redondos:[
  '.kkkk...kkkk..',
  'kwwwwkkkwwwwk.',
  'kwwwwk.kwwwwk.',
  'kwwwwk.kwwwwk.',
  '.kkkk...kkkk..'],
  gorro:[
  '......kk......',
  '.....kyyk.....',
  '..kkkkkkkkkk..',
  '.kbbbbbbbbbbk.',
  '.kbbbbbbbbbbk.',
  '.kBbBbBbBbBbk.',
  '.kbbbbbbbbbbk.',
  '.kkkkkkkkkkkk.'],
  mochila:[
  '...kkkkkk...',
  '..krrrrrrk..',
  '.krrrrrrrrk.',
  '.krrkkkkrrk.',
  '.krrrrrrrrk.',
  '.krrrrrrrrk.',
  '.kRRRRRRRRk.',
  '.krrrrrrrrk.',
  '..kkkkkkkk..'],
  chapeu_coco:[
  '....kkkkkk....',
  '...kxxxxxxk...',
  '..kxxxxxxxxk..',
  '..kxxxxxxxxk..',
  '..kxxxxxxxxk..',
  '.kkkkkkkkkkkk.',
  'kxxxxxxxxxxxxk',
  '.kkkkkkkkkkkk.'],
  oculos_escuros:[
  'kkkkkk.kkkkkk.',
  'kxxxxkkkxxxxk.',
  'kxxxxk.kxxxxk.',
  '.kxxk...kxxk..',
  '..kk.....kk...'],
  monoculo:[
  '........kkkk..',
  '.......kwwwwk.',
  '.......kwwwwk.',
  '.......kwwwwk.',
  '........kkkk..',
  '..........k...'],
  gravata_vermelha:[
  '......kk......',
  '.....krrk.....',
  '......kk......',
  '.....krrk.....',
  '.....krrk.....',
  '......kk......']
});

/* stage = fase minima para COMPRAR; depois de comprado pode usar sempre */
const HATS = {
  /* filhote: genericos e engracados */
  bone:            {name:'Boné vermelho',        price:35,  where:'head', stage:'baby'},
  laco:            {name:'Laço rosa',            price:30,  where:'head', dx:3, stage:'baby'},
  flor:            {name:'Flor',                 price:25,  where:'head', stage:'baby'},
  oculos:          {name:'Óculos',               price:40,  where:'eyes', stage:'baby'},
  cachecol:        {name:'Cachecol azul',        price:45,  where:'neck', stage:'baby'},
  cartola:         {name:'Cartola',              price:60,  where:'head', stage:'baby'},
  coroa:           {name:'Coroa',                price:120, where:'head', stage:'baby'},
  nariz_palhaco:   {name:'Nariz de palhaço',     price:20,  where:'nose', stage:'baby'},
  bigode:          {name:'Bigodão',              price:25,  where:'nose', dy:2, stage:'baby'},
  oculos_nerd:     {name:'Óculos de nariz',      price:40,  where:'eyes', stage:'baby'},
  chapeu_festa:    {name:'Chapéu de festa',      price:30,  where:'head', stage:'baby'},
  orelhas_coelho:  {name:'Orelhas de coelho',    price:45,  where:'head', stage:'baby'},
  tiara_unicornio: {name:'Tiara de unicórnio',   price:55,  where:'head', stage:'baby'},
  mascara_heroi:   {name:'Máscara de herói',     price:40,  where:'eyes', stage:'baby'},
  cone:            {name:'Cone de trânsito',     price:35,  where:'head', stage:'baby'},
  capacete_queijo: {name:'Capacete de queijo',   price:50,  where:'head', stage:'baby'},
  olhos_bobos:     {name:'Olhos de bobo',        price:30,  where:'eyes', stage:'baby'},
  /* adolescente: estudante */
  bone_virado:     {name:'Boné virado',          price:40,  where:'head', stage:'young'},
  fone:            {name:'Fone de ouvido',       price:60,  where:'head', stage:'young'},
  oculos_redondos: {name:'Óculos redondos',      price:45,  where:'eyes', stage:'young'},
  gorro:           {name:'Gorro de lã',          price:45,  where:'head', stage:'young'},
  mochila:         {name:'Mochila escolar',      price:70,  where:'back', stage:'young'},
  /* adulto: serio */
  chapeu_coco:     {name:'Chapéu-coco',          price:80,  where:'head', stage:'adult'},
  oculos_escuros:  {name:'Óculos escuros',       price:70,  where:'eyes', stage:'adult'},
  monoculo:        {name:'Monóculo',             price:90,  where:'eyes', stage:'adult'},
  gravata_vermelha:{name:'Gravata vermelha',     price:60,  where:'neck', stage:'adult'}
};
/* Roupas de corpo: desenhadas por cima do corpo, acompanham o tamanho de cada fase. */
const OUTFITS = {
  /* filhote */
  camiseta_vermelha:{name:'Camiseta vermelha',   price:30, c:'#e05a4e', d:'#a63b33', stage:'baby'},
  camiseta_azul:    {name:'Camiseta azul',       price:30, c:'#5aa9e6', d:'#2f6bb0', stage:'baby'},
  camiseta_verde:   {name:'Camiseta verde',      price:30, c:'#6ccf7a', d:'#3c9a4c', stage:'baby'},
  marinheiro:       {name:'Camisa marinheira',   price:45, c:'#fffaf0', d:'#dcd3c4', stripes:'#2f6bb0', stage:'baby'},
  estampa_queijo:   {name:'Camiseta do queijo',  price:50, c:'#ffd23f', d:'#e0a500', print:'queijo', stage:'baby'},
  estampa_coracao:  {name:'Camiseta do coração', price:50, c:'#f4a7c0', d:'#d97a9c', print:'coracao', stage:'baby'},
  estampa_estrela:  {name:'Camiseta da estrela', price:50, c:'#3a2a4a', d:'#2a2140', print:'estrela', stage:'baby'},
  pijama:           {name:'Pijama listrado',     price:60, c:'#bfe6ff', d:'#8fc6ea', stripes:'#fffaf0', stage:'baby'},
  vestido_rosa:     {name:'Vestido rosa',        price:70, c:'#f4a7c0', d:'#d97a9c', skirt:true, stage:'baby'},
  vestido_azul:     {name:'Vestido azul',        price:70, c:'#5aa9e6', d:'#2f6bb0', skirt:true, stage:'baby'},
  jaqueta:          {name:'Jaqueta vermelha',    price:80, c:'#e05a4e', d:'#a63b33', jacket:true, stage:'baby'},
  macacao:          {name:'Macacão jeans',       price:80, c:'#5aa9e6', d:'#2f6bb0', overalls:true, stage:'baby'},
  abelha:           {name:'Fantasia de abelha',  price:60, c:'#ffd23f', d:'#e0a500', stripes:'#2a2140', stage:'baby'},
  regata:           {name:'Regata branca',       price:25, c:'#fffaf0', d:'#dcd3c4', tank:true, stage:'baby'},
  moletom_roxo:     {name:'Moletom roxo',        price:55, c:'#a98be8', d:'#7e5bc4', pocket:true, stage:'baby'},
  /* adolescente */
  uniforme:         {name:'Uniforme escolar',    price:60, c:'#fffaf0', d:'#dcd3c4', tie:'#2f6bb0', stage:'young'},
  camiseta_banda:   {name:'Camiseta de banda',   price:55, c:'#2a2140', d:'#1b1233', print:'nota', stage:'young'},
  jaqueta_jeans:    {name:'Jaqueta jeans',       price:85, c:'#5aa9e6', d:'#2f6bb0', jacket:true, stage:'young'},
  moletom_capuz:    {name:'Moletom com capuz',   price:70, c:'#e05a4e', d:'#a63b33', pocket:true, hood:true, stage:'young'},
  camisa_time:      {name:'Camisa do time',      price:65, c:'#ffd23f', d:'#e0a500', stripes:'#6ccf7a', stage:'young'},
  saia_xadrez:      {name:'Saia xadrez',         price:75, c:'#e05a4e', d:'#a63b33', skirt:true, plaid:true, stage:'young'},
  /* adulto */
  terno:            {name:'Terno',               price:150, c:'#2a2140', d:'#1b1233', jacket:true, tie:'#e05a4e', stage:'adult'},
  camisa_social:    {name:'Camisa social',       price:80,  c:'#bfe6ff', d:'#8fc6ea', tie:'#2a2140', stage:'adult'},
  vestido_social:   {name:'Vestido social',      price:120, c:'#2a2140', d:'#1b1233', skirt:true, stage:'adult'},
  jaleco:           {name:'Jaleco',              price:100, c:'#fffaf0', d:'#dcd3c4', jacket:true, under:'#bfe6ff', stage:'adult'},
  avental_chef:     {name:'Avental de chef',     price:90,  c:'#fffaf0', d:'#dcd3c4', apron:true, stage:'adult'},
  smoking:          {name:'Smoking',             price:160, c:'#2a2140', d:'#1b1233', jacket:true, bow:'#e05a4e', stage:'adult'},
  vestido_gala:     {name:'Vestido de gala',     price:140, c:'#e05a4e', d:'#a63b33', skirt:true, print:'estrela', stage:'adult'}
};
const PRINTS = {
  coracao:['.h.h.', 'hhhhh', 'hhhhh', '.hhh.', '..h..'],
  estrela:['..y..', '.yyy.', 'yyyyy', '.yyy.', '..y..'],
  queijo: ['....k', '..kyk', 'kkyyk', 'kyYyk', 'kkkkk'],
  nota:   ['...w.', '...w.', '...w.', '.www.', '.ww..']
};

function ratTop(stage, y){
  return stage === 'baby' ? y - 20 : stage === 'young' ? y - 27 : y - 34;
}

function drawFace(ctx, cx, ey, stage, face, t, blushCol){
  const K = PAL.k, W = PAL.w;
  const eh = stage === 'baby' ? 2 : 3;
  const lx = cx - 4, rx = cx + 3;
  const ny = ey + eh, my = ey + eh + 1;
  const eyesNormal = () => {
    rect(ctx, lx, ey, 2, eh, K); rect(ctx, rx, ey, 2, eh, K);
    px(ctx, lx, ey, W); px(ctx, rx, ey, W);
  };
  const mouthW = () => {
    if (stage === 'baby'){ px(ctx, cx - 1, my, K); px(ctx, cx, my + 1, K); px(ctx, cx + 1, my, K); }
    else { px(ctx, cx - 2, my, K); px(ctx, cx - 1, my + 1, K); px(ctx, cx, my, K); px(ctx, cx + 1, my + 1, K); px(ctx, cx + 2, my, K); }
  };
  const blush = () => { rect(ctx, cx - 7, ny, 2, 1, blushCol); rect(ctx, cx + 6, ny, 2, 1, blushCol); };
  switch (face){
    case 'blink':
      rect(ctx, lx, ey + eh - 1, 2, 1, K); rect(ctx, rx, ey + eh - 1, 2, 1, K); mouthW(); break;
    case 'happy':
    case 'pet':
      px(ctx, cx - 5, ey + 1, K); px(ctx, cx - 4, ey, K); px(ctx, cx - 3, ey, K); px(ctx, cx - 2, ey + 1, K);
      px(ctx, cx + 2, ey + 1, K); px(ctx, cx + 3, ey, K); px(ctx, cx + 4, ey, K); px(ctx, cx + 5, ey + 1, K);
      px(ctx, cx - 2, my, K); rect(ctx, cx - 1, my + 1, 3, 1, K); px(ctx, cx + 2, my, K);
      rect(ctx, cx - 1, my, 3, 1, PAL.P);
      blush(); break;
    case 'sleep':
      rect(ctx, lx, ey + eh - 1, 2, 1, K); rect(ctx, rx, ey + eh - 1, 2, 1, K);
      px(ctx, cx, my, K); break;
    case 'sad':
      eyesNormal();
      px(ctx, cx - 2, ey - 2, K); px(ctx, cx - 3, ey - 2, K); px(ctx, cx - 4, ey - 1, K);
      px(ctx, cx + 3, ey - 2, K); px(ctx, cx + 4, ey - 2, K); px(ctx, cx + 5, ey - 1, K);
      px(ctx, cx - 2, my + 1, K); rect(ctx, cx - 1, my, 3, 1, K); px(ctx, cx + 2, my + 1, K);
      rect(ctx, cx + 5, ey + eh, 1, 2, PAL.b);
      break;
    case 'sick':
      px(ctx, cx - 5, ey, K); px(ctx, cx - 3, ey, K); px(ctx, cx - 4, ey + 1, K); px(ctx, cx - 5, ey + 2, K); px(ctx, cx - 3, ey + 2, K);
      px(ctx, cx + 3, ey, K); px(ctx, cx + 5, ey, K); px(ctx, cx + 4, ey + 1, K); px(ctx, cx + 3, ey + 2, K); px(ctx, cx + 5, ey + 2, K);
      px(ctx, cx - 2, my + 1, K); px(ctx, cx - 1, my, K); px(ctx, cx, my + 1, K); px(ctx, cx + 1, my, K); px(ctx, cx + 2, my + 1, K);
      rect(ctx, cx - 7, ny, 2, 1, '#9fd6a8'); rect(ctx, cx + 6, ny, 2, 1, '#9fd6a8');
      drawSpr(ctx, 'gota', cx + 5, ey - 6);
      break;
    case 'wow':
      eyesNormal(); rect(ctx, cx - 1, my, 3, 3, K); rect(ctx, cx, my + 1, 1, 1, PAL.P); break;
    case 'eat':
      eyesNormal();
      if (Math.floor(t / 180) % 2 === 0){ rect(ctx, cx - 1, my, 3, 2, K); }
      else { rect(ctx, cx - 1, my, 3, 1, K); }
      blush(); break;
    default:
      eyesNormal(); mouthW();
  }
  rect(ctx, cx - 1, ny, 2, 1, PAL.P);
}

/* preenche as linhas de uma elipse entre y0 e y1 (inclusive) */
function ellipseRows(ctx, cx, cy, rx, ry, y0, y1, fn){
  for (let yy = y0; yy <= y1; yy++){
    const t = (yy - cy) / (ry + 0.5);
    if (t < -1 || t > 1) continue;
    const hw = rx * Math.sqrt(Math.max(0, 1 - t * t));
    fn(yy, Math.round(cx - hw), Math.round(cx + hw));
  }
}

/* roupa de corpo: g = {cx, cy, rx, ry, top, bottom, arms:[[x,y],...], feetY} */
function drawOutfit(ctx, key, g){
  const o = OUTFITS[key]; if (!o) return;
  const K = PAL.k;
  const layered = o.jacket || o.overalls || o.apron;
  const base = layered ? (o.under || '#fffaf0') : o.c;
  const baseD = layered ? (o.under ? o.d : '#dcd3c4') : o.d;
  if (g.top > g.bottom){
    for (const a of g.arms){
      fillEllipse(ctx, a[0], a[1] - 1, 2, 1, o.tank ? null : base);
      if (!o.tank) rect(ctx, a[0] - 2, a[1] + 1, 5, 1, baseD);
    }
    return;
  }
  const mid = Math.round((g.top + g.bottom) / 2);
  ellipseRows(ctx, g.cx, g.cy, g.rx, g.ry, g.top, g.bottom, (yy, x0, x1) => {
    if (o.tank && yy < g.top + 2){ rect(ctx, g.cx - 2, yy, 5, 1, base); return; }
    let col = base;
    if (o.stripes && ((yy - g.top) % 4 === 2 || (yy - g.top) % 4 === 3)) col = o.stripes;
    rect(ctx, x0, yy, x1 - x0 + 1, 1, col);
    if (o.plaid){ for (let xx = x0 + ((yy - g.top) % 2); xx <= x1; xx += 2) px(ctx, xx, yy, ((yy - g.top) % 4 < 2) ? o.d : '#fffaf0'); }
    px(ctx, x1, yy, baseD);
    if (yy === g.bottom) rect(ctx, x0, yy, x1 - x0 + 1, 1, baseD);
  });
  if (o.jacket){
    ellipseRows(ctx, g.cx, g.cy, g.rx, g.ry, g.top, g.bottom, (yy, x0, x1) => {
      rect(ctx, x0, yy, Math.max(0, g.cx - 2 - x0), 1, o.c);
      rect(ctx, g.cx + 3, yy, Math.max(0, x1 - g.cx - 2), 1, o.c);
      px(ctx, x1, yy, o.d); px(ctx, g.cx - 3, yy, o.d);
    });
    px(ctx, g.cx - 3, g.top, PAL.w); px(ctx, g.cx + 3, g.top, PAL.w);
  }
  if (o.overalls){
    ellipseRows(ctx, g.cx, g.cy, g.rx, g.ry, mid, g.bottom, (yy, x0, x1) => {
      rect(ctx, x0, yy, x1 - x0 + 1, 1, o.c); px(ctx, x1, yy, o.d);
    });
    rect(ctx, g.cx - 2, g.top + 1, 5, mid - g.top, o.c);
    rect(ctx, g.cx - 3, g.top, 1, mid - g.top, o.d); rect(ctx, g.cx + 3, g.top, 1, mid - g.top, o.d);
    px(ctx, g.cx - 1, g.top + 2, PAL.y); px(ctx, g.cx + 1, g.top + 2, PAL.y);
  }
  if (o.apron){
    ellipseRows(ctx, g.cx, g.cy, g.rx, g.ry, g.top + 2, g.bottom, (yy, x0, x1) => {
      const w = Math.max(0, Math.round((x1 - x0) * 0.6));
      rect(ctx, g.cx - Math.floor(w / 2), yy, w + 1, 1, o.c);
    });
    rect(ctx, g.cx - 3, g.top, 1, 3, o.d); rect(ctx, g.cx + 3, g.top, 1, 3, o.d);
    rect(ctx, g.cx - 2, mid + 1, 5, 2, o.d);
  }
  if (o.pocket){ rect(ctx, g.cx - 3, mid + 1, 7, 1, o.d); rect(ctx, g.cx - 3, mid + 1, 1, 3, o.d); rect(ctx, g.cx + 3, mid + 1, 1, 3, o.d); }
  if (o.hood){ rect(ctx, g.cx - 4, g.top, 9, 1, o.d); px(ctx, g.cx - 5, g.top + 1, o.d); px(ctx, g.cx + 5, g.top + 1, o.d); }
  /* gola */
  if (!o.overalls && !o.tank){ const gc = o.stripes ? o.d : PAL.w; px(ctx, g.cx - 1, g.top, gc); px(ctx, g.cx + 1, g.top, gc); px(ctx, g.cx, g.top + 1, gc); }
  if (o.tie){ rect(ctx, g.cx - 1, g.top + 1, 3, 1, o.tie); rect(ctx, g.cx, g.top + 2, 1, Math.max(2, mid - g.top), o.tie); px(ctx, g.cx, mid + 1, o.tie); }
  if (o.bow){ rect(ctx, g.cx - 2, g.top, 2, 2, o.bow); rect(ctx, g.cx + 1, g.top, 2, 2, o.bow); px(ctx, g.cx, g.top + 1, K); }
  /* estampa */
  if (o.print && g.bottom - g.top >= 6){
    const p = PRINTS[o.print];
    const px0 = g.cx - 2, py0 = mid - 1;
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 5; xx++){
      const ch = p[yy][xx]; if (ch === '.') continue;
      const col = ch === 'k' ? K : PAL[ch]; px(ctx, px0 + xx, py0 + yy, col);
    }
  }
  /* saia */
  if (o.skirt){
    const y0 = g.bottom + 1, y1 = g.feetY - 1;
    for (let yy = y0; yy <= y1; yy++){
      const hw = g.rx + (yy - y0) + 1;
      rect(ctx, g.cx - hw, yy, hw * 2 + 1, 1, (yy - y0) % 2 ? o.d : o.c);
      if (o.plaid) for (let xx = g.cx - hw + ((yy - y0) % 2); xx <= g.cx + hw; xx += 3) px(ctx, xx, yy, '#fffaf0');
      px(ctx, g.cx - hw - 1, yy, K); px(ctx, g.cx + hw + 1, yy, K);
      if (yy === y1) rect(ctx, g.cx - hw - 1, yy + 1, hw * 2 + 3, 1, K);
    }
  }
  /* mangas */
  for (const a of g.arms){
    if (o.tank) continue;
    fillEllipse(ctx, a[0], a[1] - 1, 2, 1, layered ? (o.jacket ? o.c : base) : o.c);
    rect(ctx, a[0] - 2, a[1] + 1, 5, 1, layered ? (o.jacket ? o.d : baseD) : o.d);
  }
}

/* icone de camiseta para a loja */
const _outfitIcons = new Map();
function outfitIconURL(key){
  if (_outfitIcons.has(key)) return _outfitIcons.get(key);
  const o = OUTFITS[key];
  const c = document.createElement('canvas'); c.width = 12; c.height = 12;
  const g = c.getContext('2d');
  const rows = ['.kkk..kkk...', 'kcccccccck..', 'kkcccccckk..', '..kccccck...', '..kccccck...', '..kccccck...', '..kkkkkkk...'];
  const shape = o.skirt ? ['.kkk..kkk...', 'kcccccccck..', 'kkcccccckk..', '..kccccck...', '.kccccccck..', 'kcccccccccck', 'kkkkkkkkkkkk'] : rows;
  const layered = o.jacket || o.overalls || o.apron;
  shape.forEach((r, y) => { for (let x = 0; x < r.length; x++){ const ch = r[x]; if (ch === '.') continue; g.fillStyle = ch === 'k' ? PAL.k : (o.stripes && (y === 3 || y === 4) ? o.stripes : (o.overalls && y >= 3 ? o.c : (layered ? (o.under || '#fffaf0') : o.c))); g.fillRect(x, y + 2, 1, 1); } });
  if (o.jacket){ g.fillStyle = o.c; g.fillRect(3, 4, 2, 5); g.fillRect(7, 4, 2, 5); }
  if (o.apron){ g.fillStyle = o.d; g.fillRect(4, 5, 4, 4); }
  if (o.tie){ g.fillStyle = o.tie; g.fillRect(5, 4, 1, 4); }
  if (o.print){ g.fillStyle = o.print === 'coracao' ? PAL.h : o.print === 'estrela' ? PAL.y : o.print === 'nota' ? PAL.w : PAL.Y; g.fillRect(5, 6, 2, 2); }
  const u = c.toDataURL(); _outfitIcons.set(key, u); return u;
}

/* o = {stage, form, skin, face, t, flip, hat, outfit, sleeping, holding} ; (x,y) = centro dos pes */
function drawRat(ctx, x, y, o){
  o = o || {};
  const skin = SKINS[o.skin] || SKINS.bege;
  const t = o.t || 0;
  const stage = o.stage || 'baby';
  const form = FORMS[o.form];
  const chubby = !!(form && form.chubby && stage === 'adult');
  const still = o.sleeping || o.face === 'sick';
  const bob = still ? 0 : Math.floor(t / 520) % 2;
  const K = PAL.k;
  x = Math.round(x); y = Math.round(y);
  ctx.save();
  if (o.flip){ ctx.translate(2 * x, 0); ctx.scale(-1, 1); }

  let brx, bry, hrx = 0, hry = 0;
  if (stage === 'baby'){ brx = 7; bry = 6; }
  else if (stage === 'young'){ brx = 8; bry = 9; }
  else { brx = chubby ? 12 : 9; bry = chubby ? 9 : 7; hrx = 8; hry = 7; }
  const bcx = x, bcy = y - 3 - bry + bob;
  let hcx = x, hcy, HRX, HRY;
  if (hrx){ HRX = hrx; HRY = hry; hcy = bcy - bry - hry + 3; }
  else { HRX = brx; HRY = bry; hcy = bcy; }
  const ey = stage === 'baby' ? hcy - 1 : stage === 'young' ? hcy - 3 : hcy - 2;
  const eh = stage === 'baby' ? 2 : 3;
  const hat = o.hat && HATS[o.hat];

  /* mochila (atras do corpo) */
  if (hat && hat.where === 'back'){ const c = spriteCanvas(o.hat); if (c) drawSpr(ctx, o.hat, bcx + brx - 7, (hrx ? bcy - bry + 1 : bcy - 3)); }
  /* pes */
  oEllipse(ctx, x - 4, y - 2, 3, 1, PAL.p, K);
  oEllipse(ctx, x + 4, y - 2, 3, 1, PAL.p, K);
  /* rabo */
  const tx = bcx + brx - 2, ty = bcy + bry - 2;
  curve(ctx, [tx, ty], [tx + 10, ty + 3], [tx + 8, ty - 9], K, 3);
  curve(ctx, [tx, ty], [tx + 10, ty + 3], [tx + 8, ty - 9], PAL.P, 1);
  /* orelhas */
  const er = stage === 'baby' ? 3 : 4;
  const eox = HRX - 2, eoy = HRY - 2;
  for (const s of [-1, 1]){
    oEllipse(ctx, hcx + s * eox, hcy - eoy, er, er, skin.hood || skin.fur, K);
    fillEllipse(ctx, hcx + s * eox, hcy - eoy, er - 2, er - 2, PAL.p);
  }
  const arms = [];
  /* corpo (adulto) */
  if (hrx){
    oEllipse(ctx, bcx, bcy, brx, bry, skin.sh, K);
    fillEllipse(ctx, bcx - 1, bcy - 1, brx - 1, bry - 1, skin.fur);
    fillEllipse(ctx, bcx, bcy + 2, Math.round(brx * 0.5), Math.round(bry * 0.5), skin.belly);
    if (skin.spots){ fillEllipse(ctx, bcx + brx - 4, bcy - 2, 3, 2, skin.spots); }
    if (skin.hood){ rect(ctx, bcx - 1, bcy - bry + 1, 3, Math.round(bry * 0.9), skin.hood); }
    if (o.outfit) drawOutfit(ctx, o.outfit, {cx:bcx, cy:bcy, rx:brx, ry:bry, top:bcy - bry + 1, bottom:bcy + bry - 2, arms:[], feetY:y - 2});
    if (o.holding){
      oEllipse(ctx, x - 5, hcy + HRY, 2, 2, skin.fur, K); oEllipse(ctx, x + 5, hcy + HRY, 2, 2, skin.fur, K);
    } else {
      oEllipse(ctx, bcx - brx + 1, bcy, 2, 3, skin.sh, K); oEllipse(ctx, bcx + brx - 1, bcy, 2, 3, skin.sh, K);
      arms.push([bcx - brx + 1, bcy], [bcx + brx - 1, bcy]);
    }
    if (o.outfit && arms.length) drawOutfit(ctx, o.outfit, {cx:bcx, cy:bcy, rx:0, ry:0, top:1, bottom:0, arms, feetY:y - 2});
  }
  /* cabeca (ou corpo unico) */
  oEllipse(ctx, hcx, hcy, HRX, HRY, skin.sh, K);
  fillEllipse(ctx, hcx - 1, hcy - 1, HRX - 1, HRY - 1, skin.fur);
  if (skin.hood){
    ellipseRows(ctx, hcx, hcy, HRX, HRY, hcy - HRY, ey - 1, (yy, x0, x1) => rect(ctx, x0, yy, x1 - x0 + 1, 1, skin.hood));
    rect(ctx, hcx - HRX, ey - 1, 2, 2, skin.hood); rect(ctx, hcx + HRX - 1, ey - 1, 2, 2, skin.hood);
  }
  if (!hrx){
    fillEllipse(ctx, hcx, hcy + Math.round(HRY * 0.45), Math.round(HRX * 0.45), Math.round(HRY * 0.35), skin.belly);
    if (o.outfit){
      drawOutfit(ctx, o.outfit, {cx:hcx, cy:hcy, rx:HRX, ry:HRY, top:hcy + 3, bottom:hcy + HRY - 2, arms:[], feetY:y - 2});
    }
    if (stage === 'young'){
      if (o.holding){ oEllipse(ctx, x - 6, hcy + 3, 2, 2, skin.fur, K); oEllipse(ctx, x + 6, hcy + 3, 2, 2, skin.fur, K); }
      else {
        oEllipse(ctx, bcx - brx + 1, bcy + 3, 2, 2, skin.sh, K); oEllipse(ctx, bcx + brx - 1, bcy + 3, 2, 2, skin.sh, K);
        if (o.outfit) drawOutfit(ctx, o.outfit, {cx:bcx, cy:bcy, rx:0, ry:0, top:1, bottom:0, arms:[[bcx - brx + 1, bcy + 3], [bcx + brx - 1, bcy + 3]], feetY:y - 2});
      }
    }
  }
  if (skin.spots){
    fillEllipse(ctx, hcx - 4, hcy - HRY + 3, 2, 2, skin.spots);
    fillEllipse(ctx, hcx + eox, hcy - eoy - 1, 1, 1, skin.spots);
  }
  /* bigodes */
  if (stage !== 'baby'){
    rect(ctx, hcx - HRX - 1, ey + eh - 1, 2, 1, PAL.G); rect(ctx, hcx - HRX - 1, ey + eh + 1, 2, 1, PAL.G);
    rect(ctx, hcx + HRX, ey + eh - 1, 2, 1, PAL.G); rect(ctx, hcx + HRX, ey + eh + 1, 2, 1, PAL.G);
  }
  /* rosto */
  const face = o.sleeping ? 'sleep' : (o.face || 'normal');
  drawFace(ctx, hcx, ey, stage, face, t, skin === SKINS.rosinha ? PAL.P : PAL.p);
  if (chubby){ px(ctx, hcx + 3, ey + eh + 3, PAL.n); }

  /* acessorios */
  const headTop = hcy - HRY - 1;
  const neckY = hrx ? hcy + HRY - 1 : hcy + HRY - 3;
  const ny = ey + eh;
  const place = (name, where, dx, dy) => {
    const c = spriteCanvas(name); if (!c) return;
    const sx = hcx - Math.floor(c.width / 2) + (dx || 0);
    if (where === 'head') drawSpr(ctx, name, hcx - 7 + (dx || 0), headTop - c.height + 3 + (dy || 0));
    else if (where === 'eyes') drawSpr(ctx, name, hcx - 7 + (dx || 0), ey - 2 + (dy || 0));
    else if (where === 'brow') drawSpr(ctx, name, hcx - 7 + (dx || 0), ey - 3 + (dy || 0));
    else if (where === 'neck') drawSpr(ctx, name, hcx - 7 + (dx || 0), neckY - 2 + (dy || 0));
    else if (where === 'nose') drawSpr(ctx, name, sx, ny - 1 + (dy || 0));
  };
  if (form && form.acc && stage === 'adult' && !(hat && hat.where === form.where)) place(form.acc, form.where, 0, 0);
  if (hat && hat.where !== 'back') place(o.hat, hat.where, hat.dx, hat.dy);

  if (o.holding) drawSpr(ctx, o.holding, hcx - 4, hcy + HRY - 5);
  if (o.sleeping){
    const ph = Math.floor(t / 600) % 3;
    drawSpr(ctx, 'zzz', hcx + HRX + 3, headTop - 6 - ph * 2, {alpha:0.9});
    if (ph > 0) drawSpr(ctx, 'zzz', hcx + HRX + 9, headTop - 14 - ph, {alpha:0.6});
  }
  ctx.restore();
}
