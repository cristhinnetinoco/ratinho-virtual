/* ===== O ratinho: peles, formas e desenho procedural ===== */
const SKINS = {
  bege:    {name:'Bege',     fur:'#f2d9b1', sh:'#d9b98a', belly:'#fff3dc', price:0},
  branco:  {name:'Branco',   fur:'#fffaf0', sh:'#dcd3c4', belly:'#ffffff', price:60},
  cinza:   {name:'Cinza',    fur:'#b9b3c7', sh:'#8d86a3', belly:'#e3dff0', price:60},
  caramelo:{name:'Caramelo', fur:'#e0a25c', sh:'#b57a3a', belly:'#f6d7a8', price:80},
  malhado: {name:'Malhado',  fur:'#f2d9b1', sh:'#d9b98a', belly:'#fff3dc', spots:'#8a5a34', price:100},
  rosinha: {name:'Rosinha',  fur:'#f8c8d8', sh:'#e39ab5', belly:'#fff0f5', price:150}
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
const HATS = {
  bone:    {name:'Boné vermelho', price:35,  where:'head'},
  laco:    {name:'Laço rosa',     price:30,  where:'head', dx:3},
  flor:    {name:'Flor',          price:25,  where:'head'},
  oculos:  {name:'Óculos',        price:40,  where:'eyes'},
  cachecol:{name:'Cachecol azul', price:45,  where:'neck'},
  cartola: {name:'Cartola',       price:60,  where:'head'},
  coroa:   {name:'Coroa',         price:120, where:'head'}
};
const STAGES = {
  baby:  {name:'Filhote', hours:0},
  young: {name:'Jovem',   hours:20},
  adult: {name:'Adulto',  hours:68}
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

/* o = {stage, form, skin, face, t, flip, hat, sleeping, holding} ; (x,y) = centro dos pes */
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
    oEllipse(ctx, hcx + s * eox, hcy - eoy, er, er, skin.fur, K);
    fillEllipse(ctx, hcx + s * eox, hcy - eoy, er - 2, er - 2, PAL.p);
  }
  /* corpo (adulto) */
  if (hrx){
    oEllipse(ctx, bcx, bcy, brx, bry, skin.sh, K);
    fillEllipse(ctx, bcx - 1, bcy - 1, brx - 1, bry - 1, skin.fur);
    fillEllipse(ctx, bcx, bcy + 2, Math.round(brx * 0.5), Math.round(bry * 0.5), skin.belly);
    if (skin.spots){ fillEllipse(ctx, bcx + brx - 4, bcy - 2, 3, 2, skin.spots); }
    /* bracos */
    if (o.holding){
      oEllipse(ctx, x - 5, hcy + HRY, 2, 2, skin.fur, K); oEllipse(ctx, x + 5, hcy + HRY, 2, 2, skin.fur, K);
    } else {
      oEllipse(ctx, bcx - brx + 1, bcy, 2, 3, skin.sh, K); oEllipse(ctx, bcx + brx - 1, bcy, 2, 3, skin.sh, K);
    }
  }
  /* cabeca (ou corpo unico) */
  oEllipse(ctx, hcx, hcy, HRX, HRY, skin.sh, K);
  fillEllipse(ctx, hcx - 1, hcy - 1, HRX - 1, HRY - 1, skin.fur);
  if (!hrx){
    fillEllipse(ctx, hcx, hcy + Math.round(HRY * 0.45), Math.round(HRX * 0.45), Math.round(HRY * 0.35), skin.belly);
    if (stage === 'young'){
      if (o.holding){ oEllipse(ctx, x - 6, hcy + 3, 2, 2, skin.fur, K); oEllipse(ctx, x + 6, hcy + 3, 2, 2, skin.fur, K); }
      else { oEllipse(ctx, bcx - brx + 1, bcy + 3, 2, 2, skin.sh, K); oEllipse(ctx, bcx + brx - 1, bcy + 3, 2, 2, skin.sh, K); }
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
  /* migalha do bolota */
  if (chubby){ px(ctx, hcx + 3, ey + eh + 3, PAL.n); }

  /* acessorios */
  const headTop = hcy - HRY - 1;
  const neckY = hrx ? hcy + HRY - 1 : hcy + HRY - 3;
  const place = (name, where, dx) => {
    const c = spriteCanvas(name); if (!c) return;
    const sx = hcx - 7 + (dx || 0);
    if (where === 'head') drawSpr(ctx, name, sx, headTop - c.height + 3);
    else if (where === 'eyes') drawSpr(ctx, name, sx, ey - 2);
    else if (where === 'brow') drawSpr(ctx, name, sx, ey - 3);
    else if (where === 'neck') drawSpr(ctx, name, sx, neckY - 2);
  };
  const hat = o.hat && HATS[o.hat];
  if (form && form.acc && stage === 'adult' && !(hat && hat.where === form.where)) place(form.acc, form.where, 0);
  if (hat) place(o.hat, hat.where, hat.dx);

  if (o.holding) drawSpr(ctx, o.holding, hcx - 4, hcy + HRY - 5);
  if (o.sleeping){
    const ph = Math.floor(t / 600) % 3;
    drawSpr(ctx, 'zzz', hcx + HRX + 3, headTop - 6 - ph * 2, {alpha: 0.9});
    if (ph > 0) drawSpr(ctx, 'zzz', hcx + HRX + 9, headTop - 14 - ph, {alpha: 0.6});
  }
  ctx.restore();
}
