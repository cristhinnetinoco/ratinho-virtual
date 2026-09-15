/* ===== Mini-jogos, parte 2 ===== */
(() => {
  const inp = GAMES.inp, F = GAMES.F, ratOpts = GAMES.ratOpts;

  function bgTiles(ctx, wall, line, floorA, floorB, floorY){
    rect(ctx, 0, 0, W, H, wall);
    for (let y = 10; y < floorY - 2; y += 12) rect(ctx, 0, y, W, 1, line);
    for (let x = 8; x < W; x += 16) rect(ctx, x, 0, 1, floorY, line);
    for (let y = floorY; y < H; y += 10) for (let x = 0; x < W; x += 10)
      rect(ctx, x, y, 10, Math.min(10, H - y), ((x / 10 + (y - floorY) / 10) % 2) ? floorA : floorB);
  }

  /* ---------- Torre de queijos ---------- */
  function Torre(){
    const BH = 9, baseY = H - 34;
    const blocks = [{x:Math.round(W / 2 - 22), w:44}];
    let cur = {x:0, w:44, dir:1}, speed = 1.3, over = false, score = 0, cam = 0, perfect = 0, flashT = 0;
    const levelTop = i => baseY - (i + 1) * BH;
    function cheese(ctx, x, y, w, h, ghost){
      box(ctx, x, y, w, h, ghost ? '#ffe680' : PAL.y, PAL.k);
      rect(ctx, x + 1, y + 1, w - 2, 1, '#fff3b0');
      for (let i = x + 3; i < x + w - 3; i += 7){ px(ctx, i, y + 3, PAL.Y); px(ctx, i + 1, y + 3, PAL.Y); px(ctx, i + 3, y + 6, PAL.Y); }
    }
    return {
      update(dt){
        if (over) return;
        const f = F(dt);
        cur.x += cur.dir * speed * f;
        if (cur.x <= 0){ cur.x = 0; cur.dir = 1; }
        if (cur.x + cur.w >= W){ cur.x = W - cur.w; cur.dir = -1; }
        if (inp.tap || inp.btn){
          inp.tap = false; inp.btn = null;
          const last = blocks[blocks.length - 1];
          const x0 = Math.max(cur.x, last.x), x1 = Math.min(cur.x + cur.w, last.x + last.w);
          const ov = x1 - x0;
          if (ov <= 1){ over = true; SFX.play('hit'); }
          else {
            if (Math.abs(cur.x - last.x) <= 1.5){ blocks.push({x:last.x, w:last.w}); perfect++; score += 2; flashT = 500; SFX.play('coin'); }
            else { blocks.push({x:Math.round(x0), w:Math.round(ov)}); score += 1; SFX.play('ok'); }
            const nw = blocks[blocks.length - 1].w;
            cur = {x:cur.dir > 0 ? 0 : W - nw, w:nw, dir:cur.dir};
            speed = Math.min(4.6, speed + 0.13);
          }
        }
        flashT = Math.max(0, flashT - dt);
        const want = Math.min(0, levelTop(blocks.length) - H * 0.4);
        cam += (want - cam) * Math.min(1, dt / 150);
        UI.hud('ALTURA ' + (blocks.length - 1), 'PERFEITO ' + perfect);
        UI.hint(flashT > 0 ? 'PERFEITO!' : '');
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#e8f0d6');
        for (let y = 6 - ((cam * 0.5) % 12); y < H; y += 12) rect(ctx, 0, y, W, 1, '#d5e3c6');
        rect(ctx, 0, baseY - cam, W, H, '#c8945c'); rect(ctx, 0, baseY - cam, W, 3, '#b8834c');
        for (let i = 0; i < blocks.length; i++){ const b = blocks[i]; cheese(ctx, b.x, levelTop(i) - cam, b.w, BH); }
        if (!over) cheese(ctx, cur.x, levelTop(blocks.length) - cam, cur.w, BH, true);
        drawRat(ctx, 16, baseY - cam, ratOpts(over ? 'sad' : flashT > 0 ? 'happy' : 'wow'));
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, score * 2)}; }
    };
  }

  /* ---------- Danca do rato ---------- */
  function Danca(){
    const BEAT = 500, LX = i => Math.round(W * (i + 0.5) / 3), HIT = H - 64, FALL = 1500, total = 64;
    const cols = ['#e05a4e', '#ffd23f', '#3fb7a0'], freqs = [523, 659, 784];
    const notes = [];
    for (let b = 4; b < total; b++){
      if (Math.random() < 0.7) notes.push({lane:Math.floor(Math.random() * 3), t:b * BEAT});
      if (Math.random() < 0.15) notes.push({lane:Math.floor(Math.random() * 3), t:b * BEAT + BEAT / 2});
    }
    notes.sort((a, b) => a.t - b.t);
    const endT = total * BEAT + 800;
    let t = 0, score = 0, combo = 0, best = 0, misses = 0, over = false, fb = '', fbT = 0, lastLane = 1, flash = 0;
    function hitLane(l){
      let bestN = null, bd = 1e9;
      for (const n of notes){ if (n.done || n.missed || n.lane !== l) continue; const d = Math.abs(n.t - t); if (d < bd){ bd = d; bestN = n; } }
      if (bestN && bd <= 170){
        bestN.done = true; const p = bd <= 80; score += p ? 3 : 1; combo++; best = Math.max(best, combo);
        fb = p ? 'PERFEITO' : 'BOM'; fbT = 350; SFX.note(freqs[l], 0.16); lastLane = l; flash = 200;
      } else { combo = 0; fb = 'ERROU'; fbT = 350; SFX.play('no'); }
    }
    return {
      update(dt){
        if (over) return;
        t += dt; fbT = Math.max(0, fbT - dt); flash = Math.max(0, flash - dt);
        if (inp.tap){ inp.tap = false; hitLane(Math.min(2, Math.floor(inp.sx / (W / 3)))); }
        if (inp.btn){ hitLane({A:0, B:1, C:2}[inp.btn] || 0); inp.btn = null; }
        for (const n of notes){ if (!n.done && !n.missed && t - n.t > 170){ n.missed = true; misses++; combo = 0; fb = 'PERDEU'; fbT = 300; } }
        if (misses >= 12){ over = true; SFX.play('sad'); }
        if (t > endT){ over = true; SFX.play('win'); }
        UI.hud('PTS ' + score, 'COMBO ' + combo, true);
        UI.hint(fbT > 0 ? fb : '', true);
      },
      draw(ctx){
        const beat = Math.floor(t / BEAT);
        rect(ctx, 0, 0, W, H, beat % 2 ? '#2a1c4d' : '#1b1233');
        const disco = ['#e05a4e', '#ffd23f', '#3fb7a0', '#5aa9e6'];
        for (let i = 0; i < 4; i++) rect(ctx, Math.round(i * W / 4), 0, Math.ceil(W / 4), 5, disco[(i + beat) % 4]);
        for (let i = 1; i < 3; i++) rect(ctx, Math.round(i * W / 3), 5, 1, HIT - 5, '#3a2a4a');
        rect(ctx, 0, HIT, W, 2, PAL.w);
        for (let i = 0; i < 3; i++) oEllipse(ctx, LX(i), HIT + 1, 8, 3, '#3a2a4a', cols[i]);
        for (const n of notes){
          if (n.done) continue;
          const y = HIT - (n.t - t) / FALL * HIT;
          if (y < -8 || y > H) continue;
          drawSpr(ctx, 'nota', LX(n.lane) - 4, y - 4, {remap:{k:n.missed ? PAL.G : cols[n.lane]}});
        }
        rect(ctx, 0, H - 26, W, 26, '#3a2a4a');
        const o = ratOpts(fb === 'ERROU' || fb === 'PERDEU' ? (fbT > 0 ? 'sad' : 'normal') : 'happy');
        o.flip = lastLane === 0;
        drawRat(ctx, W / 2 + (lastLane - 1) * 8, H - 8 - (flash > 0 ? 4 : 0), o);
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 6))}; }
    };
  }

  /* ---------- Bolhas do banho ---------- */
  function Bolhas(){
    const DUR = 45000, FY = H - 30;
    let bubbles = [], pops = [], t = 0, score = 0, spawn = 0, over = false;
    return {
      update(dt){
        if (over) return;
        t += dt; spawn -= dt;
        if (spawn <= 0){
          const r = Math.random(), kind = r < 0.1 ? 'gold' : r < 0.2 ? 'dark' : 'norm';
          bubbles.push({x:14 + Math.random() * (W - 28), y:FY - 8, r:4 + Math.random() * 5, vy:0.5 + Math.random() * 0.8 + t / 45000, ph:Math.random() * 6.28, kind});
          spawn = Math.max(260, 700 - t / 100);
        }
        const f = F(dt);
        for (const b of bubbles){ b.y -= b.vy * f; b.x += Math.sin(t / 400 + b.ph) * 0.3 * f; }
        if (inp.tap){
          inp.tap = false;
          let hit = null;
          for (let i = bubbles.length - 1; i >= 0; i--){ const b = bubbles[i]; if (Math.hypot(b.x - inp.sx, b.y - inp.sy) <= b.r + 4){ hit = b; break; } }
          if (hit){
            hit.dead = true;
            const v = hit.kind === 'gold' ? 5 : hit.kind === 'dark' ? -3 : 1;
            score = Math.max(0, score + v);
            SFX.play(hit.kind === 'dark' ? 'no' : hit.kind === 'gold' ? 'coin' : 'flip');
            pops.push({x:hit.x, y:hit.y, r:hit.r, t:0, kind:hit.kind});
          }
        }
        inp.btn = null;
        bubbles = bubbles.filter(b => !b.dead && b.y > -12);
        for (const p of pops) p.t += dt;
        pops = pops.filter(p => p.t < 260);
        if (t >= DUR){ over = true; SFX.play('win'); }
        UI.hud('PTS ' + score, 'TEMPO ' + Math.ceil((DUR - t) / 1000));
      },
      draw(ctx){
        bgTiles(ctx, '#d6ecf3', '#b9d7e2', '#eaf6fa', '#bfd9e6', FY);
        const tx = Math.round(W / 2 - 26);
        box(ctx, tx, FY - 14, 52, 18, PAL.w, PAL.k); rect(ctx, tx + 2, FY - 11, 48, 6, '#9ad4f5');
        rect(ctx, tx + 3, FY + 4, 3, 3, PAL.Y); rect(ctx, tx + 46, FY + 4, 3, 3, PAL.Y);
        drawRat(ctx, W / 2, FY - 10, ratOpts(over ? 'happy' : 'wow'));
        for (const b of bubbles){
          const col = b.kind === 'gold' ? '#ffd23f' : b.kind === 'dark' ? '#6b5a86' : '#dff3ff';
          const oc = b.kind === 'gold' ? PAL.Y : b.kind === 'dark' ? PAL.k : '#5aa9e6';
          oEllipse(ctx, b.x, b.y, b.r, b.r, col, oc);
          px(ctx, b.x - Math.round(b.r / 2), b.y - Math.round(b.r / 2), PAL.w);
        }
        for (const p of pops){
          const k = p.t / 260, rr = p.r + k * 6;
          const c = p.kind === 'dark' ? PAL.k : '#5aa9e6';
          px(ctx, p.x - rr, p.y, c); px(ctx, p.x + rr, p.y, c); px(ctx, p.x, p.y - rr, c); px(ctx, p.x, p.y + rr, c);
          px(ctx, p.x - rr * 0.7, p.y - rr * 0.7, c); px(ctx, p.x + rr * 0.7, p.y - rr * 0.7, c); px(ctx, p.x - rr * 0.7, p.y + rr * 0.7, c); px(ctx, p.x + rr * 0.7, p.y + rr * 0.7, c);
        }
      },
      over:() => over,
      result(){ return {score, coins:Math.min(45, Math.floor(score / 3))}; }
    };
  }

  /* ---------- Canos da banheira ---------- */
  function Canos(){
    const COLS = 5, ROWS = 6, CS = Math.min(22, Math.floor((W - 10) / COLS));
    const OX = Math.floor((W - COLS * CS) / 2), OY = 40;
    const N = 1, E = 2, S_ = 4, W_ = 8;
    const seen = Array.from({length:ROWS}, () => Array(COLS).fill(false));
    const path = [];
    (function dfs(c, r){
      seen[r][c] = true; path.push([c, r]);
      if (c === COLS - 1 && r === ROWS - 1) return true;
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]].sort(() => Math.random() - 0.5);
      for (const [dc, dr] of dirs){
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || seen[nr][nc]) continue;
        if (dfs(nc, nr)) return true;
      }
      path.pop(); return false;
    })(0, 0);
    const grid = Array.from({length:ROWS}, () => Array(COLS).fill(0));
    const dm = (dc, dr) => dc === 1 ? E : dc === -1 ? W_ : dr === 1 ? S_ : N;
    for (let i = 0; i < path.length; i++){
      const [c, r] = path[i]; let m = 0;
      if (i === 0) m |= N; else { const [pc, pr] = path[i - 1]; m |= dm(pc - c, pr - r); }
      if (i === path.length - 1) m |= S_; else { const [nc, nr] = path[i + 1]; m |= dm(nc - c, nr - r); }
      grid[r][c] = m;
    }
    const fillers = [N | S_, E | W_, N | E, E | S_, S_ | W_, W_ | N, N | E | S_, E | S_ | W_, N | S_ | W_, N | E | W_];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!grid[r][c]) grid[r][c] = fillers[Math.floor(Math.random() * fillers.length)];
    const rot = m => ((m << 1) & 15) | ((m & 8) ? 1 : 0);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++){ const k = Math.floor(Math.random() * 4); for (let i = 0; i < k; i++) grid[r][c] = rot(grid[r][c]); }
    let wet = null, won = false, over = false, timeLeft = 75000;
    function flood(){
      wet = Array.from({length:ROWS}, () => Array(COLS).fill(false));
      const q = [];
      if (grid[0][0] & N){ wet[0][0] = true; q.push([0, 0]); }
      while (q.length){
        const [c, r] = q.shift(), m = grid[r][c];
        const go = (dc, dr, out, inn) => {
          if (!(m & out)) return;
          const nc = c + dc, nr = r + dr;
          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || wet[nr][nc] || !(grid[nr][nc] & inn)) return;
          wet[nr][nc] = true; q.push([nc, nr]);
        };
        go(1, 0, E, W_); go(-1, 0, W_, E); go(0, 1, S_, N); go(0, -1, N, S_);
      }
      return wet[ROWS - 1][COLS - 1] && !!(grid[ROWS - 1][COLS - 1] & S_);
    }
    if (flood()){ const [c, r] = path[Math.floor(path.length / 2)]; grid[r][c] = rot(grid[r][c]); flood(); }
    return {
      update(dt){
        if (over) return;
        timeLeft -= dt;
        if (inp.tap){
          inp.tap = false;
          const c = Math.floor((inp.sx - OX) / CS), r = Math.floor((inp.sy - OY) / CS);
          if (c >= 0 && c < COLS && r >= 0 && r < ROWS){
            grid[r][c] = rot(grid[r][c]); SFX.play('flip');
            if (flood()){ won = true; over = true; SFX.play('win'); }
          }
        }
        inp.btn = null;
        if (timeLeft <= 0){ timeLeft = 0; over = true; SFX.play('sad'); }
        UI.hud('AGUA ' + Math.ceil(timeLeft / 1000), '');
      },
      draw(ctx){
        bgTiles(ctx, '#d6ecf3', '#b9d7e2', '#eaf6fa', '#bfd9e6', OY + ROWS * CS + 4);
        box(ctx, OX + 2, OY - 16, CS - 4, 14, '#5aa9e6', PAL.k); rect(ctx, OX + 4, OY - 14, CS - 8, Math.max(1, Math.round((CS - 10) * timeLeft / 75000)), '#9ad4f5');
        const tubX = OX + (COLS - 1) * CS - 8, tubY = OY + ROWS * CS + 6;
        box(ctx, tubX, tubY, CS + 16, 12, PAL.w, PAL.k); rect(ctx, tubX + 2, tubY + 3, CS + 12, 3, won ? '#5aa9e6' : '#eaf6fa');
        const T = 6;
        for (let pass = 0; pass < 2; pass++){
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++){
            const x = OX + c * CS, y = OY + r * CS, m = grid[r][c];
            if (pass === 0) box(ctx, x, y, CS, CS, '#f6f9fb', '#b9d7e2');
            const w = wet && wet[r][c];
            const col = pass === 0 ? (w ? '#2f6bb0' : '#6b5a86') : (w ? '#5aa9e6' : '#c9c3d6');
            const th = pass === 0 ? T + 2 : T, o = Math.floor(th / 2);
            const cx = x + Math.floor(CS / 2), cy = y + Math.floor(CS / 2);
            rect(ctx, cx - o, cy - o, th, th, col);
            if (m & N) rect(ctx, cx - o, y, th, cy - y + o, col);
            if (m & S_) rect(ctx, cx - o, cy - o, th, y + CS - cy + o, col);
            if (m & W_) rect(ctx, x, cy - o, cx - x + o, th, col);
            if (m & E) rect(ctx, cx - o, cy - o, x + CS - cx + o, th, col);
          }
        }
        drawRat(ctx, 22, H - 8, ratOpts(over ? (won ? 'happy' : 'sad') : 'normal'));
      },
      over:() => over,
      result(){ const s = won ? Math.ceil(timeLeft / 1000) : 0; return {score:s, coins:won ? Math.min(30, 8 + Math.floor(s / 3)) : 3}; }
    };
  }

  /* ---------- Diz o guincho ---------- */
  function Guincho(){
    const cols = ['#e05a4e', '#5aa9e6', '#ffd23f', '#6ccf7a'], dark = ['#a63b33', '#2f6bb0', '#e0a500', '#3c9a4c'], freqs = [392, 523, 659, 784];
    const size = Math.min(W - 16, 110), half = Math.floor(size / 2), bx = Math.floor((W - size) / 2), by = Math.floor((H - size) / 2) + 6;
    const seq = [];
    let idx = 0, phase = 'show', showI = 0, showT = 0, lit = -1, over = false, score = 0, wait = 0;
    function addStep(){ seq.push(Math.floor(Math.random() * 4)); phase = 'show'; showI = 0; showT = -400; lit = -1; }
    function light(i){ lit = i; SFX.note(freqs[i], 0.25); }
    addStep();
    return {
      update(dt){
        if (over) return;
        if (phase === 'show'){
          showT += dt; inp.tap = false; inp.btn = null;
          if (lit < 0 && showT >= 0){ light(seq[showI]); showT = 0; }
          else if (lit >= 0 && showT > 450){ lit = -1; showT = -250; showI++; if (showI >= seq.length){ phase = 'input'; idx = 0; showT = 0; } }
        } else if (phase === 'input'){
          let pressed = -1;
          if (inp.tap){
            inp.tap = false;
            if (inp.sx >= bx && inp.sx < bx + size && inp.sy >= by && inp.sy < by + size) pressed = (inp.sy < by + half ? 0 : 2) + (inp.sx < bx + half ? 0 : 1);
          }
          if (inp.btn){ pressed = {A:0, B:1, C:2}[inp.btn]; inp.btn = null; }
          if (pressed >= 0){
            light(pressed); showT = 0;
            if (pressed === seq[idx]){ idx++; if (idx >= seq.length){ score = seq.length; phase = 'wait'; wait = 700; SFX.play('coin'); } }
            else { over = true; SFX.play('sad'); }
          } else { showT += dt; if (showT > 220) lit = -1; }
        } else {
          wait -= dt; lit = -1; if (wait <= 0) addStep();
        }
        UI.hud('SEQUENCIA ' + score, phase === 'input' ? 'SUA VEZ' : phase === 'show' ? 'OUÇA' : '');
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#f1d7c2');
        for (let y = 6; y < H; y += 10) for (let x = (Math.floor(y / 10) % 2) ? 5 : 0; x < W; x += 10) px(ctx, x + 2, y, '#e8c3ab');
        for (let i = 0; i < 4; i++){
          const x = bx + (i % 2) * half, y = by + Math.floor(i / 2) * half;
          box(ctx, x + 2, y + 2, half - 4, half - 4, lit === i ? cols[i] : dark[i], PAL.k);
          if (lit === i) rect(ctx, x + 5, y + 5, half - 10, 2, '#fffaf0');
        }
        drawRat(ctx, W / 2, by - 6, ratOpts(over ? 'sad' : lit >= 0 ? 'wow' : 'normal'));
      },
      over:() => over,
      result(){ return {score, coins:Math.min(40, score * 3)}; }
    };
  }

  /* ---------- Basquete de papel ---------- */
  function Basquete(){
    const FY = H - 30, start = {x:24, y:FY - 22};
    let balls = 10, score = 0, over = false, ball = null, wind = 0, bin = {x:0, y:0, w:20, h:18}, from = null, msg = '', msgT = 0;
    function newRound(){ wind = (Math.random() - 0.5) * 0.12; bin.x = Math.round(W * 0.45 + Math.random() * (W * 0.5 - bin.w)); bin.y = Math.round(H * 0.25 + Math.random() * H * 0.18); }
    newRound();
    return {
      update(dt){
        if (over) return;
        const f = F(dt); msgT = Math.max(0, msgT - dt);
        if (!ball){
          if (inp.down && !from) from = {x:inp.sx, y:inp.sy};
          if (from && !inp.down){
            const dx = inp.x - from.x, dy = inp.y - from.y; from = null;
            if (Math.hypot(dx, dy) > 12 && dy < 0){
              ball = {x:start.x, y:start.y, vx:Math.max(-6, Math.min(6, dx * 0.09)), vy:Math.max(-9, dy * 0.09), life:0, scored:false};
              SFX.play('jump'); balls--;
            }
          }
          inp.tap = false; inp.btn = null;
        } else {
          ball.vy += 0.16 * f; ball.vx += wind * f; ball.x += ball.vx * f; ball.y += ball.vy * f; ball.life += dt;
          if (ball.x < 4){ ball.x = 4; ball.vx *= -0.6; }
          if (ball.x > W - 4){ ball.x = W - 4; ball.vx *= -0.6; }
          if (ball.y < 2){ ball.y = 2; ball.vy *= -0.5; }
          if (!ball.scored && ball.vy > 0 && ball.y > bin.y && ball.y < bin.y + 6 && ball.x > bin.x + 3 && ball.x < bin.x + bin.w - 3){
            ball.scored = true; score++; SFX.play('coin'); msg = 'CESTA!'; msgT = 800;
          }
          if (!ball.scored && ball.vy > 0 && ball.y > bin.y - 2 && ball.y < bin.y + 3 && (Math.abs(ball.x - bin.x) < 3 || Math.abs(ball.x - bin.x - bin.w) < 3)){ ball.vy *= -0.4; ball.vx *= 0.6; }
          if (ball.y > H + 10 || ball.life > 4500 || (ball.scored && ball.y > bin.y + bin.h - 4)){
            ball = null; newRound();
            if (balls <= 0){ over = true; SFX.play(score > 0 ? 'win' : 'sad'); }
          }
        }
        UI.hud('CESTAS ' + score, 'BOLAS ' + balls);
        UI.hint(msgT > 0 ? msg : (!ball && !over ? 'DESLIZE PARA ARREMESSAR' : ''));
      },
      draw(ctx){
        rect(ctx, 0, 0, W, H, '#f1d7c2');
        for (let y = 6; y < FY; y += 10) for (let x = (Math.floor(y / 10) % 2) ? 5 : 0; x < W; x += 10) px(ctx, x + 2, y, '#e8c3ab');
        rect(ctx, 0, FY - 4, W, 4, '#d9b98a'); rect(ctx, 0, FY, W, H - FY, '#c8945c');
        /* ventilador e vento */
        box(ctx, 6, 8, 16, 16, PAL.g, PAL.k); oEllipse(ctx, 14, 16, 4, 4, PAL.G, PAL.k);
        const wl = Math.round(wind * 260), ax = 30, ay = 16;
        rect(ctx, wl < 0 ? ax + wl : ax, ay, Math.abs(wl) + 1, 2, PAL.b);
        if (wl > 0){ px(ctx, ax + wl + 1, ay - 1, PAL.b); px(ctx, ax + wl + 1, ay + 2, PAL.b); }
        if (wl < 0){ px(ctx, ax + wl - 1, ay - 1, PAL.b); px(ctx, ax + wl - 1, ay + 2, PAL.b); }
        /* lixeira */
        box(ctx, bin.x, bin.y, bin.w, bin.h, '#c9c3d6', PAL.k);
        rect(ctx, bin.x - 1, bin.y, bin.w + 2, 3, PAL.G); rect(ctx, bin.x - 1, bin.y, bin.w + 2, 1, PAL.k);
        for (let i = bin.x + 3; i < bin.x + bin.w - 2; i += 4) rect(ctx, i, bin.y + 5, 1, bin.h - 8, PAL.G);
        /* mira */
        if (from && inp.down){
          const dx = inp.x - from.x, dy = inp.y - from.y;
          for (let i = 1; i <= 5; i++) px(ctx, start.x + dx * 0.25 * i, start.y + dy * 0.25 * i, PAL.k);
        }
        drawRat(ctx, start.x, FY - 2, ratOpts(msgT > 0 ? 'happy' : over ? (score > 3 ? 'happy' : 'sad') : 'normal'));
        if (ball) drawSpr(ctx, 'papel', ball.x - 3, ball.y - 3);
        else if (!over) drawSpr(ctx, 'papel', start.x - 3, start.y - 3);
      },
      over:() => over,
      result(){ return {score, coins:Math.min(40, score * 4)}; }
    };
  }

  GAMES.register({id:'torre', name:'Torre de queijos', icon:'queijo', how:'A fatia vai e volta. Toque para soltar em cima da anterior. Se alinhar perfeito, a torre não encolhe.'}, Torre);
  GAMES.register({id:'danca', name:'Dança do rato', icon:'nota', how:'As notas descem em três faixas. Toque na faixa certa quando a nota chegar na linha. Erre 12 vezes e a música para.'}, Danca);
  GAMES.register({id:'bolhas', name:'Bolhas do banho', icon:'sabonete', how:'Toque nas bolhas para estourar antes que escapem. Douradas valem 5, as escuras tiram 3. Você tem 45 segundos.'}, Bolhas);
  GAMES.register({id:'canos', name:'Canos da banheira', icon:'cano', how:'Toque nos canos para girar e levar a água da caixa até a banheira antes que ela esvazie.'}, Canos);
  GAMES.register({id:'guincho', name:'Diz o guincho', icon:'brilho', how:'Ouça a sequência de guinchos e repita tocando nas cores. A cada rodada entra mais um.'}, Guincho);
  GAMES.register({id:'basquete', name:'Basquete de papel', icon:'lixeira', how:'Deslize o dedo para arremessar a bolinha de papel na lixeira. Cuidado com o vento do ventilador. 10 bolas.'}, Basquete);
})();
