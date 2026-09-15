/* ===== Mini-jogos (usam W e H da tela, definidos em scene.js) ===== */
const GAMES = (() => {
  const list = [
    {id:'pulo',      name:'Pulo Espacial',      icon:'nuvem',    how:'Pule de plataforma em plataforma até chegar no espaço! Toque e segure na metade esquerda ou direita da tela para se mover.'},
    {id:'corrida',   name:'Corrida na Cozinha', icon:'ratoeira', how:'Toque na tela para pular as ratoeiras e o gato. Pegue os queijos. Vai ficando mais rápido!'},
    {id:'chuva',     name:'Chuva de Comida',    icon:'biscoito', how:'Arraste o dedo para mover o rato. Pegue a comida que cai e desvie das meias e dos sabonetes. Você tem 3 vidas.'},
    {id:'memoria',   name:'Jogo da Memória',    icon:'moeda',    how:'Encontre os pares antes do tempo acabar. A cada rodada o tabuleiro cresce. Acabou o tempo, acabou o jogo.'},
    {id:'labirinto', name:'Labirinto',          icon:'queijo',   how:'Leve o rato até o queijo antes do tempo acabar. Cada fase é maior e mais difícil. Use as setas ou deslize o dedo.'}
  ];
  let cur = null, curId = null, onEnd = null;
  const inp = {down:false, x:0, y:0, sx:0, sy:0, tap:false, swipe:null, btn:null};
  const F = dt => dt / 16.667;
  const ratOpts = face => ({stage:S.stage === 'adult' ? 'young' : S.stage, skin:S.skin, hat:S.hat, outfit:S.outfit, face, t:performance.now()});
  const lerp = (a, b, t) => a + (b - a) * t;
  function hexToRgb(h){ return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixColor(stops, v){
    let i = 0;
    while (i < stops.length - 2 && v > stops[i + 1][0]) i++;
    const [v0, c0] = stops[i], [v1, c1] = stops[i + 1];
    const t = Math.max(0, Math.min(1, (v - v0) / (v1 - v0)));
    const a = hexToRgb(c0), b = hexToRgb(c1);
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')';
  }

  /* ---------- 1. Pulo Espacial ---------- */
  function Pulo(){
    const rat = {x:W / 2, y:H - 30, vy:-6.1, vx:0}, plats = [], cheese = [];
    let cam = 0, score = 0, bonus = 0, over = false, hold = 0, holdDir = 0, space = false, topY = H - 20;
    const stars = []; for (let i = 0; i < 70; i++) stars.push([Math.random() * W, Math.random() * 1400, Math.random() < 0.3 ? 2 : 1]);
    const clouds = []; for (let i = 0; i < 14; i++) clouds.push([Math.random() * (W - 16), Math.random() * 900]);
    const SKY = [[0, '#f1d7c2'], [250, '#bfe6ff'], [700, '#9ad4f5'], [1100, '#7a5fa8'], [1500, '#3a2a5a'], [2000, '#1b1233'], [2600, '#0b0716']];
    function gen(){
      while (topY > cam - H){
        const height = Math.max(0, -topY);
        topY -= 20 + Math.random() * 16 + Math.min(16, height / 200);
        const w = Math.max(20, 30 - Math.floor(height / 400)), r = Math.random();
        const pMove = 0.1 + Math.min(0.25, height / 5000);
        plats.push({x:4 + Math.random() * (W - 8 - w), y:topY, w, type:r < pMove ? 'move' : r < pMove + 0.06 ? 'spring' : 'norm', dx:Math.random() < 0.5 ? -1 : 1});
        if (Math.random() < 0.2) cheese.push({x:8 + Math.random() * (W - 16), y:topY - 16, got:false});
      }
    }
    plats.push({x:Math.round(W / 2 - 40), y:H - 18, w:80, type:'norm', dx:1});
    rat.y = H - 18;
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
        rat.vx += mx * 0.5 * f;
        rat.vx *= Math.pow(0.86, f);
        rat.vx = Math.max(-3.2, Math.min(3.2, rat.vx));
        rat.x += rat.vx * f;
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
        const camLine = cam + H * 0.45;
        if (rat.y < camLine) cam = rat.y - H * 0.45;
        const h = Math.max(0, Math.floor(-cam));
        score = Math.floor(h / 5) + bonus;
        if (!space && h >= 2000){ space = true; bonus += 30; SFX.play('win'); UI.hint('ESPAÇO! +30', true); setTimeout(() => UI.hint(''), 1800); }
        gen();
        for (let i = plats.length - 1; i >= 0; i--) if (plats[i].y > cam + H + 20) plats.splice(i, 1);
        for (let i = cheese.length - 1; i >= 0; i--) if (cheese[i].y > cam + H + 20) cheese.splice(i, 1);
        if (rat.y > cam + H + 12){ over = true; SFX.play('hit'); }
        UI.hud('ALT ' + h + 'm', 'PTS ' + score, h > 900);
      },
      draw(ctx){
        const h = Math.max(0, -cam);
        rect(ctx, 0, 0, W, H, mixColor(SKY, h));
        if (h < 400){
          ctx.save(); ctx.globalAlpha = Math.max(0, 1 - h / 400);
          for (let y = -((cam * 0.5) % 10); y < H; y += 10) for (let x = 0; x < W; x += 10) px(ctx, x + 2, y, '#e8c3ab');
          ctx.restore();
        }
        const cloudA = h < 200 ? 0 : h < 600 ? (h - 200) / 400 : h < 1400 ? 1 : Math.max(0, 1 - (h - 1400) / 500);
        if (cloudA > 0) for (const c of clouds){ const y = ((c[1] - cam * 0.4) % 1000 + 1000) % 1000 - 100; if (y > -10 && y < H) drawSpr(ctx, 'nuvem', c[0], y, {alpha:cloudA * 0.9}); }
        const starA = h < 1100 ? 0 : Math.min(1, (h - 1100) / 700);
        if (starA > 0){
          ctx.save(); ctx.globalAlpha = starA;
          for (const s of stars){ const y = ((s[1] - cam * 0.3) % 1400 + 1400) % 1400 - 100; if (y > 0 && y < H){ px(ctx, s[0], y, PAL.w); if (s[2] === 2 && Math.floor(performance.now() / 400 + s[0]) % 3 === 0){ px(ctx, s[0] - 1, y, PAL.w); px(ctx, s[0] + 1, y, PAL.w); } } }
          ctx.restore();
        }
        if (h > 1800){ const my = 40 - (h - 1800) * 0.02; fillEllipse(ctx, W - 30, my, 12, 12, '#fff3b0'); fillEllipse(ctx, W - 35, my - 4, 4, 4, '#e6d58e'); fillEllipse(ctx, W - 26, my + 5, 2, 2, '#e6d58e'); }
        for (const p of plats){
          const y = p.y - cam;
          box(ctx, p.x, y, p.w, 5, p.type === 'move' ? PAL.b : PAL.e, PAL.k);
          if (p.type === 'spring') drawSpr(ctx, 'mola', p.x + p.w / 2 - 4, y - 5);
        }
        for (const c of cheese) if (!c.got) drawSpr(ctx, 'queijo', c.x - 4, c.y - cam - 4);
        const ro = ratOpts(rat.vy < 0 ? 'happy' : 'wow'); ro.flip = rat.vx < -0.3;
        drawRat(ctx, rat.x, rat.y - cam, ro);
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 6) + (space ? 10 : 0))}; }
    };
  }

  /* ---------- 2. Corrida na Cozinha ---------- */
  function Corrida(){
    const GY = H - 52, RX = Math.round(W * 0.3);
    const rat = {y:GY, vy:0, ground:true, holdT:0};
    let speed = 2.0, dist = 0, over = false, nextObs = 70, obs = [], cheese = [], score = 0, wob = 0;
    return {
      update(dt){
        if (over) return;
        const f = F(dt);
        if ((inp.tap || inp.btn) && rat.ground){ rat.vy = -5.0; rat.ground = false; rat.holdT = 0; SFX.play('jump'); }
        inp.tap = false; inp.btn = null;
        if (!rat.ground && inp.down && rat.vy < 0 && rat.holdT < 200){ rat.vy -= 0.14 * f; rat.holdT += dt; }
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
          if (RX + 5 > o.x + 1 && RX - 5 < o.x + ow - 1 && rat.y > GY - oh + 1){ over = true; SFX.play('hit'); }
        }
        for (const c of cheese) if (!c.got && Math.abs(c.x - RX) < 9 && Math.abs(c.y - (rat.y - 10)) < 12){ c.got = true; score += 5; SFX.play('coin'); }
        UI.hud('PTS ' + (Math.floor(dist / 10) + score), 'x' + speed.toFixed(1));
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#fbeed6');
        const off = Math.floor(dist) % 16;
        for (let x = -off; x < W; x += 16){ rect(ctx, x, 30, 1, GY - 40, '#f0dcc0'); }
        rect(ctx, 0, GY - 62, W, 2, '#d9b98a');
        for (let x = -((Math.floor(dist * 1.5)) % 60); x < W; x += 60){ box(ctx, x + 6, GY - 88, 26, 20, '#bfe6ff', PAL.k); rect(ctx, x + 18, GY - 87, 2, 18, PAL.k); rect(ctx, x + 7, GY - 79, 24, 2, PAL.k); }
        rect(ctx, 0, GY - 10, W, 10, '#e2c9a4');
        rect(ctx, 0, GY, W, H - GY, '#c8945c');
        for (let x = -(Math.floor(dist) % 24); x < W; x += 24){ rect(ctx, x, GY, 12, 4, '#b8834c'); rect(ctx, x + 12, GY + 4, 12, 4, '#b8834c'); }
        for (const c of cheese) if (!c.got) drawSpr(ctx, 'queijo', c.x - 4, c.y - 4);
        for (const o of obs){ if (o.type === 'trap') drawSpr(ctx, 'ratoeira', o.x, GY - 6); else drawSpr(ctx, 'gato', o.x, GY - 11); }
        drawRat(ctx, RX, rat.y + (rat.ground ? (Math.floor(wob / 90) % 2) : 0), ratOpts(over ? 'sad' : rat.ground ? 'normal' : 'happy'));
      },
      over:() => over,
      result(){ const s = Math.floor(dist / 10) + score; return {score:s, coins:Math.min(45, Math.floor(s / 8))}; }
    };
  }

  /* ---------- 3. Chuva de Comida ---------- */
  function Chuva(){
    const GOOD = [['queijo', 3], ['biscoito', 2], ['semente', 1], ['morango', 2], ['bolo', 4], ['pizza', 4], ['uva', 2], ['pao', 2], ['brigadeiro', 3]];
    const BAD = ['meia', 'sabonete'];
    const FY = H - 40;
    let x = W / 2, tx = W / 2, lives = 3, score = 0, items = [], spawn = 0, gap = 900, over = false, t = 0, flash = 0;
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
          items.push({x:8 + Math.random() * (W - 16), y:14, kind:bad ? BAD[Math.floor(Math.random() * 2)] : g[0], val:bad ? 0 : g[1], bad, vy:1.4 + Math.random() * 0.9 + t / 60000});
          gap = Math.max(380, 900 - t / 80); spawn = gap;
        }
        for (const it of items){
          it.y += it.vy * F(dt);
          if (!it.hit && it.y > FY - 24 && it.y < FY - 2 && Math.abs(it.x - x) < 13){
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
        for (let y = 16; y < FY - 8; y += 10) for (let xx = (Math.floor(y / 10) % 2) ? 5 : 0; xx < W; xx += 10) px(ctx, xx + 2, y, '#e8c3ab');
        rect(ctx, 0, 0, W, 12, '#d9b98a'); rect(ctx, 0, 12, W, 2, PAL.k);
        for (let xx = 0; xx < W; xx += 24) rect(ctx, xx + 11, 0, 2, 12, '#b8955f');
        rect(ctx, 0, FY, W, H - FY, '#c8945c'); rect(ctx, 0, FY, W, 2, '#b8834c');
        for (const it of items) drawSpr(ctx, it.kind, it.x - 4, it.y - 4);
        drawRat(ctx, x, FY, ratOpts(flash > 0 ? 'sad' : 'wow'));
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 2))}; }
    };
  }

  /* ---------- 4. Jogo da Memoria (rodadas) ---------- */
  function Memoria(){
    const ICONS_ALL = ['queijo', 'semente', 'biscoito', 'morango', 'bolo', 'sopa', 'coracao', 'moeda', 'pizza', 'uva', 'pao', 'sorvete', 'pipoca', 'brigadeiro'];
    const GAP = 4;
    let round = 1, deck = [], COLS = 4, ROWS = 4, CS = 30, X0 = 0, Y0 = 0;
    let first = -1, second = -1, lock = 0, moves = 0, over = false, cursor = 0, done = 0, timeLeft = 0, total = 1, totalPairs = 0, flashT = 0, bonusT = 0;
    function setup(){
      ROWS = Math.min(6, 3 + round); COLS = 4;
      const pairs = COLS * ROWS / 2;
      const icons = ICONS_ALL.slice().sort(() => Math.random() - 0.5).slice(0, pairs);
      deck = icons.concat(icons).map(ic => ({ic, up:false, done:false}));
      for (let i = deck.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
      CS = Math.min(30, Math.floor((W - 16 - (COLS - 1) * GAP) / COLS), Math.floor((H - 50 - (ROWS - 1) * GAP) / ROWS));
      X0 = Math.floor((W - (COLS * CS + (COLS - 1) * GAP)) / 2);
      Y0 = Math.max(24, Math.floor((H - (ROWS * CS + (ROWS - 1) * GAP)) / 2));
      first = second = -1; lock = 0; done = 0; cursor = 0;
      /* tempo da rodada: 14 s na primeira, +4 s por rodada; cada par certo da +1 s */
      total = (14 + (round - 1) * 4) * 1000;
      timeLeft = total;
    }
    setup();
    function flip(i){
      const c = deck[i];
      if (lock > 0 || c.up || c.done) return;
      c.up = true; SFX.play('flip');
      if (first < 0){ first = i; return; }
      second = i; moves++;
      if (deck[first].ic === deck[second].ic){
        deck[first].done = deck[second].done = true; done += 2; totalPairs++; first = second = -1; SFX.play('coin');
        timeLeft += 1000; bonusT = 600;
        if (done >= deck.length){ round++; flashT = 900; SFX.play('win'); lock = 900; }
      } else lock = 700;
    }
    return {
      update(dt){
        if (over) return;
        timeLeft -= dt; flashT = Math.max(0, flashT - dt); bonusT = Math.max(0, bonusT - dt);
        if (lock > 0){
          lock -= dt;
          if (lock <= 0){
            if (done >= deck.length) setup();
            else { deck[first].up = deck[second].up = false; first = second = -1; }
          }
        }
        if (inp.tap){
          inp.tap = false;
          const cx = Math.floor((inp.sx - X0) / (CS + GAP)), cy = Math.floor((inp.sy - Y0) / (CS + GAP));
          if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS){ cursor = cy * COLS + cx; flip(cursor); }
        }
        if (inp.btn === 'A'){ cursor = (cursor + 1) % deck.length; SFX.play('blip'); }
        else if (inp.btn === 'B'){ flip(cursor); }
        inp.btn = null;
        if (timeLeft <= 0){ timeLeft = 0; over = true; SFX.play('sad'); }
        UI.hud('RODADA ' + round, 'PARES ' + totalPairs, true);
        UI.timer(timeLeft / 1000, total / 1000);
        UI.hint(flashT > 0 ? 'RODADA COMPLETA!' : bonusT > 0 ? '+1s' : '', true);
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#6b5a86');
        for (let y = 0; y < H; y += 8) for (let x = (Math.floor(y / 8) % 2) ? 4 : 0; x < W; x += 8) px(ctx, x, y, '#7a69a0');
        const half = Math.floor(CS / 2);
        deck.forEach((c, i) => {
          const x = X0 + (i % COLS) * (CS + GAP), y = Y0 + Math.floor(i / COLS) * (CS + GAP);
          if (c.done){ box(ctx, x, y, CS, CS, '#e4f4ee', '#3fb7a0'); drawSpr(ctx, c.ic, x + half - 4, y + half - 4, {alpha:0.55}); }
          else if (c.up){ box(ctx, x, y, CS, CS, PAL.w, PAL.k); drawSpr(ctx, c.ic, x + half - 4, y + half - 4); }
          else {
            box(ctx, x, y, CS, CS, '#e05a4e', PAL.k);
            box(ctx, x + 3, y + 3, CS - 6, CS - 6, '#f5943c', '#a63b33');
            drawSpr(ctx, 'estrela', x + half - 2, y + half - 2, {remap:{w:'#ffd23f'}});
          }
          if (i === cursor){ rect(ctx, x - 2, y - 2, CS + 4, 2, PAL.y); rect(ctx, x - 2, y + CS, CS + 4, 2, PAL.y); rect(ctx, x - 2, y, 2, CS, PAL.y); rect(ctx, x + CS, y, 2, CS, PAL.y); }
        });
      },
      over:() => over,
      result(){ const score = totalPairs; return {score, coins:Math.min(45, totalPairs * 2 + (round - 1) * 3)}; }
    };
  }

  /* ---------- 5. Labirinto (fases) ---------- */
  function Labirinto(){
    const CS = 14, OY = 24, padH = Math.ceil(H * 0.22);
    const MAXC = Math.max(7, Math.floor((W - 8) / CS)), MAXR = Math.max(7, Math.floor((H - OY - padH - 8) / CS));
    let level = 1, done = 0, COLS = 5, ROWS = 6, OX = 0, cells = [], over = false, timeLeft = 0, total = 1, flashT = 0, dir = 'e';
    const rat = {c:0, r:0, x:0, y:0, tc:0, tr:0, moving:false};
    const D = {n:[0, -1, 's'], s:[0, 1, 'n'], e:[1, 0, 'w'], w:[-1, 0, 'e']};
    function build(){
      COLS = Math.min(MAXC, 5 + Math.floor(level / 2)); ROWS = Math.min(MAXR, 6 + Math.floor((level + 1) / 2));
      OX = Math.floor((W - COLS * CS) / 2);
      cells = [];
      for (let r = 0; r < ROWS; r++){ cells.push([]); for (let c = 0; c < COLS; c++) cells[r].push({n:true, e:true, s:true, w:true, v:false}); }
      const stack = [[0, 0]]; cells[0][0].v = true;
      while (stack.length){
        const [c, r] = stack[stack.length - 1];
        const opts = Object.keys(D).filter(k => { const nc = c + D[k][0], nr = r + D[k][1]; return nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !cells[nr][nc].v; });
        if (!opts.length){ stack.pop(); continue; }
        const k = opts[Math.floor(Math.random() * opts.length)];
        const nc = c + D[k][0], nr = r + D[k][1];
        cells[r][c][k] = false; cells[nr][nc][D[k][2]] = false; cells[nr][nc].v = true;
        stack.push([nc, nr]);
      }
      rat.c = rat.r = rat.x = rat.y = rat.tc = rat.tr = 0; rat.moving = false;
      /* tempo da fase: 8 s na primeira, +2 s por fase */
      total = (8 + (level - 1) * 2) * 1000;
      timeLeft = total;
    }
    build();
    const openings = (c, r) => ['n', 'e', 's', 'w'].filter(k => !cells[r][c][k]).length;
    function go(k){
      if (rat.moving || over || flashT > 0) return;
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
        if (flashT > 0){ flashT -= dt; if (flashT <= 0){ level++; done++; build(); } inp.swipe = null; inp.btn = null; inp.tap = false; UI.hud('FASE ' + level, ''); UI.hint('FASE ' + (level + 1) + '!'); return; }
        UI.hint('');
        timeLeft -= dt;
        if (inp.swipe){ go(inp.swipe); inp.swipe = null; }
        if (inp.btn === 'A'){ go('w'); } else if (inp.btn === 'C'){ go('e'); } else if (inp.btn === 'B'){ go(dir === 'n' ? 's' : 'n'); }
        inp.btn = null; inp.tap = false;
        if (rat.moving){
          const txp = rat.tc * CS, typ = rat.tr * CS, sp = 0.11 * dt;
          rat.x += Math.max(-sp, Math.min(sp, txp - rat.x)); rat.y += Math.max(-sp, Math.min(sp, typ - rat.y));
          if (Math.abs(rat.x - txp) < 0.01 && Math.abs(rat.y - typ) < 0.01){
            rat.c = rat.tc; rat.r = rat.tr; rat.x = txp; rat.y = typ; rat.moving = false;
            if (rat.c === COLS - 1 && rat.r === ROWS - 1){ flashT = 900; SFX.play('win'); }
          }
        }
        if (timeLeft <= 0){ timeLeft = 0; over = true; SFX.play('sad'); }
        UI.hud('FASE ' + level, '');
        UI.timer(timeLeft / 1000, total / 1000);
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
        drawSpr(ctx, 'queijo', OX + (COLS - 1) * CS + 3, OY + (ROWS - 1) * CS + 3);
        const hx = OX + rat.x + 7, hy = OY + rat.y + 11;
        oEllipse(ctx, hx, hy - 4, 4, 3, SKINS[S.skin] ? SKINS[S.skin].fur : PAL.c, PAL.k);
        oEllipse(ctx, hx - 3, hy - 7, 1, 1, PAL.p, PAL.k); oEllipse(ctx, hx + 3, hy - 7, 1, 1, PAL.p, PAL.k);
        px(ctx, hx - 2, hy - 5, PAL.k); px(ctx, hx + 1, hy - 5, PAL.k); px(ctx, hx, hy - 3, PAL.P);
      },
      over:() => over,
      result(){ return {score:done, coins:Math.min(45, done * 4)}; }
    };
  }

  const makers = {pulo:Pulo, corrida:Corrida, chuva:Chuva, memoria:Memoria, labirinto:Labirinto};
  let endTimer = 0;
  function register(def, maker){ list.push(def); makers[def.id] = maker; }

  function begin(){
    inp.down = false; inp.tap = false; inp.swipe = null; inp.btn = null;
    UI.clearGameUI();
    cur = makers[curId](); endTimer = 0;
    UI.quitButton(() => { SFX.play('back'); quit(); onEnd && onEnd(false); });
  }
  function start(id, done){
    const g = list.find(x => x.id === id);
    onEnd = done; curId = id;
    UI.gameIntro(g, () => { SFX.play('ok'); begin(); }, () => { onEnd && onEnd(false); });
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
        UI.result(g, r.score, r.coins, isBest, () => { onEnd && onEnd(true); }, () => { SFX.play('ok'); begin(); });
      }
    }
  }
  function draw(ctx){ if (cur) cur.draw(ctx); }
  function pointer(type, x, y){
    if (!cur) return;
    if (type === 'down'){ inp.down = true; inp.x = x; inp.y = y; inp.sx = x; inp.sy = y; inp.tap = true; }
    else if (type === 'move'){ inp.x = x; inp.y = y; }
    else {
      inp.down = false; inp.x = x; inp.y = y;
      const dx = x - inp.sx, dy = y - inp.sy;
      if (Math.abs(dx) > 14 || Math.abs(dy) > 14) inp.swipe = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : (dy > 0 ? 's' : 'n');
    }
  }
  function button(k){ if (!cur) return false; inp.btn = k; return true; }
  function quit(){ cur = null; UI.clearGameUI(); }
  return {list, start, active, update, draw, pointer, button, quit, register, inp, F, ratOpts, mixColor};
})();
