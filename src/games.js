/* ===== Mini-jogos ===== */
const GAMES = (() => {
  const list = [
    {id:'pulo',      name:'Pulo Espacial',      icon:'nuvem',    how:'Pule de plataforma em plataforma até chegar no espaço! Toque na metade esquerda ou direita da tela para se mover (ou use A e C).'},
    {id:'corrida',   name:'Corrida na Cozinha', icon:'ratoeira', how:'Toque na tela (ou em qualquer botão) para pular as ratoeiras e o gato. Pegue os queijos. Vai ficando mais rápido!'},
    {id:'chuva',     name:'Chuva de Comida',    icon:'biscoito', how:'Arraste o dedo para mover o rato. Pegue a comida que cai e desvie das meias e dos sabonetes. Você tem 3 vidas.'},
    {id:'memoria',   name:'Jogo da Memória',    icon:'moeda',    how:'Vire as cartas e encontre os 8 pares. Quanto menos jogadas, mais moedas.'},
    {id:'labirinto', name:'Labirinto',          icon:'queijo',   how:'Leve o rato até o queijo antes do tempo acabar. Use as setas ou deslize o dedo. Ele corre até a próxima curva.'}
  ];
  let cur = null, curId = null, onEnd = null;
  const inp = {down:false, x:0, y:0, sx:0, sy:0, tap:false, swipe:null, btn:null};
  const F = dt => dt / 16.667;
  const ratOpts = face => ({stage:S.stage === 'adult' ? 'young' : S.stage, skin:S.skin, hat:S.hat, face, t:performance.now()});
  const ratOptsFull = face => ({stage:S.stage, form:S.form, skin:S.skin, hat:S.hat, face, t:performance.now()});

  /* ---------- 1. Pulo Espacial ---------- */
  function Pulo(){
    const rat = {x:72, y:130, vy:0}, plats = [], cheese = [];
    let cam = 0, score = 0, bonus = 0, over = false, hold = 0, holdDir = 0, space = false, topY = 150, doneFlag = false;
    const stars = []; for (let i = 0; i < 40; i++) stars.push([Math.random() * W, Math.random() * 1000]);
    const clouds = []; for (let i = 0; i < 12; i++) clouds.push([Math.random() * (W - 16), Math.random() * 600]);
    function gen(){
      while (topY > cam - 200){
        topY -= 20 + Math.random() * 18;
        const w = 26, r = Math.random();
        plats.push({x:4 + Math.random() * (W - 8 - w), y:topY, w, type:r < 0.12 ? 'move' : r < 0.18 ? 'spring' : 'norm', dx:Math.random() < 0.5 ? -1 : 1});
        if (Math.random() < 0.2) cheese.push({x:8 + Math.random() * (W - 16), y:topY - 16, got:false});
      }
    }
    plats.push({x:36, y:142, w:72, type:'norm', dx:1});
    rat.y = 142; rat.vy = -6.1;
    gen();
    return {
      update(dt){
        if (over) return;
        const f = F(dt);
        let mx = 0;
        if (inp.down) mx = inp.x < W / 2 ? -1 : 1;
        if (inp.btn === 'A'){ hold = 220; holdDir = -1; } else if (inp.btn === 'C'){ hold = 220; holdDir = 1; }
        inp.btn = null;
        if (hold > 0){ mx = holdDir; hold -= dt; }
        rat.x += mx * 2.2 * f;
        if (rat.x < -6) rat.x = W + 6; if (rat.x > W + 6) rat.x = -6;
        rat.vy += 0.26 * f;
        const py = rat.y; rat.y += rat.vy * f;
        if (rat.vy > 0){
          for (const p of plats){
            if (rat.x + 5 > p.x && rat.x - 5 < p.x + p.w && py <= p.y + 1 && rat.y >= p.y){
              rat.y = p.y; rat.vy = p.type === 'spring' ? -10 : -6.1; SFX.play('jump'); break;
            }
          }
        }
        for (const p of plats) if (p.type === 'move'){ p.x += p.dx * 0.6 * f; if (p.x < 2 || p.x + p.w > W - 2) p.dx *= -1; }
        for (const c of cheese) if (!c.got && Math.abs(c.x - rat.x) < 9 && Math.abs(c.y - (rat.y - 10)) < 10){ c.got = true; bonus += 5; SFX.play('coin'); }
        if (rat.y < cam + 70) cam = rat.y - 70;
        const h = Math.max(0, Math.floor(-cam));
        score = Math.floor(h / 5) + bonus;
        if (!space && h >= 1200){ space = true; bonus += 30; SFX.play('win'); UI.hint('ESPAÇO! +30', true); setTimeout(() => UI.hint(''), 1800); }
        gen();
        for (let i = plats.length - 1; i >= 0; i--) if (plats[i].y > cam + H + 20) plats.splice(i, 1);
        for (let i = cheese.length - 1; i >= 0; i--) if (cheese[i].y > cam + H + 20) cheese.splice(i, 1);
        if (rat.y > cam + H + 12){ over = true; SFX.play('hit'); }
        UI.hud('ALT ' + h + 'm', 'PTS ' + score, h > 400);
      },
      draw(ctx){
        const h = Math.max(0, -cam);
        const band = h < 400 ? 0 : h < 800 ? 1 : h < 1200 ? 2 : 3;
        const bg = ['#f1d7c2', '#9ad4f5', '#7a5fa8', '#1b1233'][band];
        rect(ctx, 0, 0, W, H, bg);
        if (band === 0){
          for (let y = -((cam * 0.5) % 10); y < H; y += 10) for (let x = 0; x < W; x += 10) px(ctx, x + 2, y, '#e8c3ab');
        } else if (band < 3){
          for (const c of clouds){ const y = ((c[1] - cam * 0.4) % 700 + 700) % 700 - 100; if (y > -10 && y < H) drawSpr(ctx, 'nuvem', c[0], y, {alpha:band === 2 ? 0.5 : 0.9}); }
        } else {
          for (const s of stars){ const y = ((s[1] - cam * 0.3) % 1000 + 1000) % 1000 - 100; if (y > 0 && y < H) px(ctx, s[0], y, PAL.w); }
          fillEllipse(ctx, 120, 30 - (h - 1200) * 0.02, 10, 10, '#fff3b0'); fillEllipse(ctx, 116, 27 - (h - 1200) * 0.02, 3, 3, '#e6d58e');
        }
        for (const p of plats){
          const y = p.y - cam;
          box(ctx, p.x, y, p.w, 5, p.type === 'move' ? PAL.b : PAL.e, PAL.k);
          if (p.type === 'spring') drawSpr(ctx, 'mola', p.x + 9, y - 5);
        }
        for (const c of cheese) if (!c.got) drawSpr(ctx, 'queijo', c.x - 4, c.y - cam - 4);
        drawRat(ctx, rat.x, rat.y - cam, ratOpts(rat.vy < 0 ? 'happy' : 'wow'));
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 6) + (space ? 10 : 0))}; }
    };
  }

  /* ---------- 2. Corrida na Cozinha ---------- */
  function Corrida(){
    const GY = 124;
    const rat = {y:GY, vy:0, ground:true};
    let speed = 2.0, dist = 0, over = false, nextObs = 60, obs = [], cheese = [], score = 0, wob = 0;
    return {
      update(dt){
        if (over) return;
        const f = F(dt);
        if ((inp.tap || inp.btn) && rat.ground){ rat.vy = -5.6; rat.ground = false; SFX.play('jump'); }
        inp.tap = false; inp.btn = null;
        rat.vy += 0.3 * f; rat.y += rat.vy * f;
        if (rat.y >= GY){ rat.y = GY; rat.vy = 0; rat.ground = true; }
        speed += 0.00025 * dt;
        dist += speed * f; wob += dt;
        nextObs -= speed * f;
        if (nextObs <= 0){
          const r = Math.random();
          obs.push({x:W + 10, type:r < 0.7 ? 'trap' : 'cat'});
          if (Math.random() < 0.6) cheese.push({x:W + 40 + Math.random() * 30, y:GY - 24 - Math.random() * 14, got:false});
          nextObs = 70 + Math.random() * 60;
        }
        for (const o of obs) o.x -= speed * f;
        for (const c of cheese) c.x -= speed * f;
        obs = obs.filter(o => o.x > -20); cheese = cheese.filter(c => c.x > -10);
        for (const o of obs){
          const ow = o.type === 'trap' ? 12 : 16, oh = o.type === 'trap' ? 6 : 11;
          if (72 + 5 > o.x + 1 && 72 - 5 < o.x + ow - 1 && rat.y > GY - oh + 1){ over = true; SFX.play('hit'); }
        }
        for (const c of cheese) if (!c.got && Math.abs(c.x - 72) < 9 && Math.abs(c.y - (rat.y - 10)) < 12){ c.got = true; score += 5; SFX.play('coin'); }
        UI.hud('PTS ' + (Math.floor(dist / 10) + score), 'x' + speed.toFixed(1));
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#fbeed6');
        const off = Math.floor(dist) % 16;
        for (let x = -off; x < W; x += 16){ rect(ctx, x, 30, 1, GY - 40, '#f0dcc0'); }
        rect(ctx, 0, 62, W, 2, '#d9b98a');
        for (let x = -((Math.floor(dist * 1.5)) % 48); x < W; x += 48){ box(ctx, x + 6, 36, 20, 16, '#bfe6ff', PAL.k); rect(ctx, x + 15, 37, 1, 14, PAL.k); rect(ctx, x + 7, 43, 18, 1, PAL.k); }
        rect(ctx, 0, GY - 10, W, 10, '#e2c9a4');
        rect(ctx, 0, GY, W, H - GY, '#c8945c');
        for (let x = -(Math.floor(dist) % 24); x < W; x += 24){ rect(ctx, x, GY, 12, 4, '#b8834c'); rect(ctx, x + 12, GY + 4, 12, 4, '#b8834c'); }
        for (const c of cheese) if (!c.got) drawSpr(ctx, 'queijo', c.x - 4, c.y - 4);
        for (const o of obs){ if (o.type === 'trap') drawSpr(ctx, 'ratoeira', o.x, GY - 6); else drawSpr(ctx, 'gato', o.x, GY - 11); }
        drawRat(ctx, 72, rat.y + (rat.ground ? (Math.floor(wob / 90) % 2) : 0), ratOpts(over ? 'sad' : rat.ground ? 'normal' : 'happy'));
      },
      over:() => over,
      result(){ const s = Math.floor(dist / 10) + score; return {score:s, coins:Math.min(45, Math.floor(s / 8))}; }
    };
  }

  /* ---------- 3. Chuva de Comida ---------- */
  function Chuva(){
    const GOOD = [['queijo', 3], ['biscoito', 2], ['semente', 1], ['morango', 2], ['bolo', 4]];
    const BAD = ['meia', 'sabonete'];
    let x = 72, tx = 72, lives = 3, score = 0, items = [], spawn = 0, gap = 900, over = false, t = 0, flash = 0;
    return {
      update(dt){
        if (over) return;
        t += dt; flash = Math.max(0, flash - dt);
        if (inp.down) tx = inp.x;
        if (inp.btn === 'A') tx -= 24; if (inp.btn === 'C') tx += 24; inp.btn = null; inp.tap = false;
        tx = Math.max(10, Math.min(W - 10, tx));
        x += (tx - x) * Math.min(1, dt / 90);
        spawn -= dt;
        if (spawn <= 0){
          const bad = Math.random() < 0.28;
          const g = GOOD[Math.floor(Math.random() * GOOD.length)];
          items.push({x:8 + Math.random() * (W - 16), y:12, kind:bad ? BAD[Math.floor(Math.random() * 2)] : g[0], val:bad ? 0 : g[1], bad, vy:1.1 + Math.random() * 0.8 + t / 60000});
          gap = Math.max(380, 900 - t / 80); spawn = gap;
        }
        for (const it of items){
          it.y += it.vy * F(dt);
          if (!it.hit && it.y > 112 && it.y < 128 && Math.abs(it.x - x) < 11){
            it.hit = true;
            if (it.bad){ lives--; flash = 400; SFX.play('hit'); if (lives <= 0) over = true; }
            else { score += it.val; SFX.play('coin'); }
          }
        }
        items = items.filter(it => !it.hit && it.y < H + 8);
        UI.hud('PTS ' + score, '♥'.repeat(lives) + '♡'.repeat(3 - lives));
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, flash > 0 ? '#ffd9d3' : '#f1d7c2');
        for (let y = 12; y < 110; y += 10) for (let xx = ((y / 10) % 2) ? 5 : 0; xx < W; xx += 10) px(ctx, xx + 2, y, '#e8c3ab');
        rect(ctx, 0, 0, W, 10, '#d9b98a'); rect(ctx, 0, 10, W, 2, PAL.k);
        for (let xx = 0; xx < W; xx += 24) rect(ctx, xx + 11, 0, 2, 10, '#b8955f');
        rect(ctx, 0, 132, W, H - 132, '#c8945c'); rect(ctx, 0, 132, W, 2, '#b8834c');
        for (const it of items) drawSpr(ctx, it.kind, it.x - 4, it.y - 4);
        drawRat(ctx, x, 132, ratOpts(flash > 0 ? 'sad' : 'wow'));
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 2))}; }
    };
  }

  /* ---------- 4. Jogo da Memoria ---------- */
  function Memoria(){
    const icons = ['queijo', 'semente', 'biscoito', 'morango', 'bolo', 'sopa', 'coracao', 'moeda'];
    const deck = icons.concat(icons).map(ic => ({ic, up:false, done:false}));
    for (let i = deck.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    const CS = 30, GAP = 4, X0 = 6, Y0 = 22;
    let first = -1, second = -1, lock = 0, moves = 0, over = false, cursor = 0, done = 0;
    function flip(i){
      const c = deck[i];
      if (lock > 0 || c.up || c.done) return;
      c.up = true; SFX.play('flip');
      if (first < 0){ first = i; return; }
      second = i; moves++;
      if (deck[first].ic === deck[second].ic){ deck[first].done = deck[second].done = true; done += 2; first = second = -1; SFX.play('coin'); if (done >= 16){ over = true; SFX.play('win'); } }
      else lock = 750;
    }
    return {
      update(dt){
        if (over) return;
        if (lock > 0){ lock -= dt; if (lock <= 0){ deck[first].up = deck[second].up = false; first = second = -1; } }
        if (inp.tap){
          inp.tap = false;
          const cx = Math.floor((inp.sx - X0) / (CS + GAP)), cy = Math.floor((inp.sy - Y0) / (CS + GAP));
          if (cx >= 0 && cx < 4 && cy >= 0 && cy < 4){ cursor = cy * 4 + cx; flip(cursor); }
        }
        if (inp.btn === 'A'){ cursor = (cursor + 1) % 16; SFX.play('blip'); }
        else if (inp.btn === 'B'){ flip(cursor); }
        inp.btn = null;
        UI.hud('JOGADAS ' + moves, 'PARES ' + (done / 2) + '/8');
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#6b5a86');
        for (let y = 0; y < H; y += 8) for (let x = ((y / 8) % 2) ? 4 : 0; x < W; x += 8) px(ctx, x, y, '#7a69a0');
        deck.forEach((c, i) => {
          const x = X0 + (i % 4) * (CS + GAP), y = Y0 + Math.floor(i / 4) * (CS + GAP);
          if (c.done){ box(ctx, x, y, CS, CS, '#e4f4ee', '#3fb7a0'); drawSpr(ctx, c.ic, x + 11, y + 11, {alpha:0.55}); }
          else if (c.up){ box(ctx, x, y, CS, CS, PAL.w, PAL.k); drawSpr(ctx, c.ic, x + 11, y + 11); }
          else {
            box(ctx, x, y, CS, CS, '#e05a4e', PAL.k);
            box(ctx, x + 3, y + 3, CS - 6, CS - 6, '#f5943c', '#a63b33');
            drawSpr(ctx, 'estrela', x + 13, y + 13, {remap:{w:'#ffd23f'}});
          }
          if (i === cursor){ rect(ctx, x - 2, y - 2, CS + 4, 2, PAL.y); rect(ctx, x - 2, y + CS, CS + 4, 2, PAL.y); rect(ctx, x - 2, y, 2, CS, PAL.y); rect(ctx, x + CS, y, 2, CS, PAL.y); }
        });
      },
      over:() => over,
      result(){ const score = Math.max(0, 100 - moves * 4); return {score, coins:Math.min(40, Math.max(4, Math.floor(score / 3)))}; }
    };
  }

  /* ---------- 5. Labirinto ---------- */
  function Labirinto(){
    const COLS = 11, ROWS = 8, CS = 12, OX = 6, OY = 20;
    const cells = [];
    for (let r = 0; r < ROWS; r++){ cells.push([]); for (let c = 0; c < COLS; c++) cells[r].push({n:true, e:true, s:true, w:true, v:false}); }
    const stack = [[0, 0]]; cells[0][0].v = true;
    const D = {n:[0, -1, 's'], s:[0, 1, 'n'], e:[1, 0, 'w'], w:[-1, 0, 'e']};
    while (stack.length){
      const [c, r] = stack[stack.length - 1];
      const opts = Object.keys(D).filter(k => { const nc = c + D[k][0], nr = r + D[k][1]; return nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !cells[nr][nc].v; });
      if (!opts.length){ stack.pop(); continue; }
      const k = opts[Math.floor(Math.random() * opts.length)];
      const nc = c + D[k][0], nr = r + D[k][1];
      cells[r][c][k] = false; cells[nr][nc][D[k][2]] = false; cells[nr][nc].v = true;
      stack.push([nc, nr]);
    }
    const rat = {c:0, r:0, x:0, y:0, tc:0, tr:0, moving:false};
    let timeLeft = 60000, over = false, won = false, dir = 'e';
    const openings = (c, r) => ['n', 'e', 's', 'w'].filter(k => !cells[r][c][k]).length;
    function go(k){
      if (rat.moving || over) return;
      let c = rat.c, r = rat.r, steps = 0;
      while (!cells[r][c][k]){
        c += D[k][0]; r += D[k][1]; steps++;
        if (openings(c, r) !== 2) break;
        if (c === COLS - 1 && r === ROWS - 1) break;
      }
      if (!steps){ SFX.play('no'); return; }
      rat.tc = c; rat.tr = r; rat.moving = true; dir = k; SFX.play('blip');
    }
    UI.dpad(go);
    return {
      update(dt){
        if (over) return;
        timeLeft -= dt;
        if (inp.swipe){ go(inp.swipe); inp.swipe = null; }
        if (inp.btn === 'A'){ go('w'); } else if (inp.btn === 'C'){ go('e'); } else if (inp.btn === 'B'){ go(dir === 'n' ? 's' : 'n'); }
        inp.btn = null; inp.tap = false;
        if (rat.moving){
          const txp = rat.tc * CS, typ = rat.tr * CS, sp = 0.09 * dt;
          rat.x += Math.max(-sp, Math.min(sp, txp - rat.x)); rat.y += Math.max(-sp, Math.min(sp, typ - rat.y));
          if (Math.abs(rat.x - txp) < 0.01 && Math.abs(rat.y - typ) < 0.01){ rat.c = rat.tc; rat.r = rat.tr; rat.x = txp; rat.y = typ; rat.moving = false;
            if (rat.c === COLS - 1 && rat.r === ROWS - 1){ over = true; won = true; SFX.play('win'); } }
        }
        if (timeLeft <= 0){ timeLeft = 0; over = true; SFX.play('sad'); }
        UI.hud('TEMPO ' + Math.ceil(timeLeft / 1000), '');
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#c8945c');
        rect(ctx, OX - 2, OY - 2, COLS * CS + 4, ROWS * CS + 4, PAL.k);
        rect(ctx, OX, OY, COLS * CS, ROWS * CS, '#f1d7c2');
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++){
          const x = OX + c * CS, y = OY + r * CS, w = cells[r][c];
          if (w.n) rect(ctx, x, y, CS + 1, 2, PAL.k);
          if (w.w) rect(ctx, x, y, 2, CS + 1, PAL.k);
          if (w.s) rect(ctx, x, y + CS - 1, CS + 1, 2, PAL.k);
          if (w.e) rect(ctx, x + CS - 1, y, 2, CS + 1, PAL.k);
        }
        drawSpr(ctx, 'queijo', OX + (COLS - 1) * CS + 2, OY + (ROWS - 1) * CS + 2);
        const hx = OX + rat.x + 6, hy = OY + rat.y + 10;
        oEllipse(ctx, hx, hy - 4, 4, 3, SKINS[S.skin] ? SKINS[S.skin].fur : PAL.c, PAL.k);
        oEllipse(ctx, hx - 3, hy - 7, 1, 1, PAL.p, PAL.k); oEllipse(ctx, hx + 3, hy - 7, 1, 1, PAL.p, PAL.k);
        px(ctx, hx - 2, hy - 5, PAL.k); px(ctx, hx + 1, hy - 5, PAL.k); px(ctx, hx, hy - 3, PAL.P);
      },
      over:() => over,
      result(){ const s = won ? Math.ceil(timeLeft / 1000) : 0; return {score:s, coins:won ? Math.min(30, 10 + Math.floor(s / 3)) : 3}; }
    };
  }

  const makers = {pulo:Pulo, corrida:Corrida, chuva:Chuva, memoria:Memoria, labirinto:Labirinto};
  let endTimer = 0;

  function start(id, done){
    const g = list.find(x => x.id === id);
    onEnd = done;
    UI.gameIntro(g, () => {
      SFX.play('ok');
      inp.down = false; inp.tap = false; inp.swipe = null; inp.btn = null;
      curId = id; cur = makers[id](); endTimer = 0;
      UI.quitButton(() => { SFX.play('back'); quit(); onEnd && onEnd(false); });
    }, () => { onEnd && onEnd(false); });
  }
  function active(){ return !!cur; }
  function update(dt){
    if (!cur) return;
    cur.update(dt);
    if (cur.over()){
      endTimer += dt;
      if (endTimer > 900){
        const g = list.find(x => x.id === curId);
        const r = cur.result();
        const isBest = r.score > 0 && (!S.best[curId] || r.score > S.best[curId]);
        finishGame(curId, r.score, r.coins);
        cur = null; UI.clearGameUI();
        SFX.play('happy');
        UI.result(g, r.score, r.coins, isBest, () => { onEnd && onEnd(true); });
      }
    }
  }
  function draw(ctx){ if (cur) cur.draw(ctx); }
  function pointer(type, x, y){
    if (!cur) return;
    if (type === 'down'){ inp.down = true; inp.x = x; inp.y = y; inp.sx = x; inp.sy = y; inp.tap = true; }
    else if (type === 'move'){ inp.x = x; inp.y = y; }
    else {
      inp.down = false;
      const dx = x - inp.sx, dy = y - inp.sy;
      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) inp.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : (dy > 0 ? 's' : 'n');
    }
  }
  function button(k){ if (!cur) return false; inp.btn = k; return true; }
  function quit(){ cur = null; UI.clearGameUI(); }
  return {list, start, active, update, draw, pointer, button, quit};
})();
