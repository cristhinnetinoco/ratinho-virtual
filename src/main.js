/* ===== Loop principal, layout, toque e ligacao das partes ===== */
(function(){
  const cv = document.getElementById('cv');
  const stage = document.getElementById('stage');
  const ctx = cv.getContext('2d');
  let last = performance.now(), lastWall = Date.now(), saveT = 0;

  /* ---- layout: o jogo ocupa a tela toda, em pixels de 2x (ou mais em telas grandes) ---- */
  function layout(){
    const vw = Math.max(200, window.innerWidth), vh = Math.max(300, window.innerHeight);
    let bw = vw, bh = vh;
    if (bw / bh > 0.72) bw = Math.floor(bh * 0.72);
    if (bw / bh < 0.42) bh = Math.floor(bw / 0.42);
    SCALE = Math.max(2, Math.floor(bw / 125));
    W = Math.floor(bw / SCALE); H = Math.floor(bh / SCALE);
    cv.width = W; cv.height = H;
    cv.style.width = (W * SCALE) + 'px'; cv.style.height = (H * SCALE) + 'px';
    stage.style.width = (W * SCALE) + 'px'; stage.style.height = (H * SCALE) + 'px';
    stage.style.setProperty('--sw', (W * SCALE) + 'px');
    ctx.imageSmoothingEnabled = false;
    SCENE.ratX = Math.min(SCENE.ratX, W - 20); SCENE.targetX = Math.min(SCENE.targetX, W - 20);
  }
  layout();
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 120); });
  window.addEventListener('orientationchange', () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 300); });

  const hooks = {
    skip(){ simulate(12 * HOUR); save(); },
    reset(){
      UI.intro(name => { startNew(name); SCENE.room = 0; SCENE.ratX = W / 2; SCENE.ratY = LAY.ratY; SCENE.targetX = W / 2; SCENE.targetY = LAY.ratY; UI.toast('Oi, ' + S.name + '!'); addHearts(3); });
    },
    loaded(){ simulate(Date.now() - S.last); save(); SCENE.room = S.room; }
  };

  function inRoom(idx, then){
    if (SCENE.room === idx){ then(); return; }
    goRoom(idx);
    setTimeout(then, 320);
  }
  function activate(i){
    if (!S.started) return;
    const id = ICONS[i].id;
    if (SCENE.riding && id !== 'status' && id !== 'loja' && id !== 'config') stopRide();
    if (S.hidden && (id === 'comer' || id === 'luz' || id === 'banho' || id === 'brincar' || id === 'remedio')){ S.hidden = false; SCENE.anim = null; }
    switch (id){
      case 'comer':
        inRoom(1, () => UI.foodMenu(k => {
          const r = feed(k);
          if (r.ok){ SFX.play('eat'); UI.close(); setAnim('eat', 1700, {food:k}); setTimeout(addCrumbs, 900); UI.toast(r.msg, 1500); }
          else { SFX.play('no'); UI.toast(r.msg); if (!S.sleeping) setAnim('no', 900); }
        }));
        break;
      case 'luz':
        inRoom(roomIndex('quarto'), () => {
          const r = toggleLight();
          SFX.play(S.sleeping ? 'sleep' : 'wake');
          if (!S.sleeping){ SCENE.ratX = bedSpot().x; SCENE.ratY = LAY.walkTop; randomWalkTarget(); }
          UI.toast(r.msg);
        });
        break;
      case 'brincar':
        if (S.sleeping){ SFX.play('no'); UI.toast('Shh... ' + S.name + ' está dormindo.'); break; }
        if (S.sick){ SFX.play('no'); UI.toast(S.name + ' está doente. Dê remédio primeiro.'); setAnim('no', 900); break; }
        if (S.energy < 10){ SFX.play('no'); UI.toast(S.name + ' está cansado demais.'); setAnim('no', 900); break; }
        UI.playMenu(gid => {
          UI.close();
          GAMES.start(gid, played => { if (played){ setAnim('happy', 1600); addHearts(2); } });
        });
        break;
      case 'remedio': {
        const r = medicine();
        SFX.play(r.ok ? 'ok' : 'no'); UI.toast(r.msg);
        setAnim(r.ok ? 'med' : 'no', 1000);
        break;
      }
      case 'banho':
        inRoom(2, () => {
          const r = bath();
          SFX.play(r.ok ? 'happy' : 'no'); UI.toast(r.msg);
          if (r.ok){ setAnim('bath', 2200); SCENE.ratX = tubSpot().x; SCENE.ratY = LAY.walkTop; SCENE.targetX = tubSpot().x + 30; SCENE.targetY = LAY.walkTop + 10; }
        });
        break;
      case 'status': UI.status(); break;
      case 'loja': UI.shop('food'); break;
      case 'config': UI.settings(hooks); break;
    }
  }

  function processEvents(){
    if (UI.isOpen() || GAMES.active()) return;
    while (S.pending.length){
      const ev = S.pending.shift();
      if (ev.indexOf('evolve:') === 0){
        SFX.play('evolve'); setAnim('evolve', 2600); UI.evolved(ev.split(':')[1]); save(); return;
      } else if (ev.indexOf('level:') === 0){ SFX.play('win'); UI.toast('Nível ' + ev.split(':')[1] + '! +5 moedas', 1800); addHearts(3); }
      else if (ev === 'sick'){ SFX.play('sick'); UI.toast(S.name + ' ficou doente!'); }
      else if (ev === 'woke'){ SFX.play('wake'); UI.toast(S.name + ' acordou sozinho!'); SCENE.ratX = bedSpot().x; SCENE.ratY = LAY.walkTop; randomWalkTarget(); }
      else if (ev === 'autosleep'){ SFX.play('sleep'); UI.toast(S.name + ' caiu no sono de tanto cansaço.'); }
    }
  }

  function loop(now){
    const dt = Math.min(100, now - last); last = now;
    const wall = Date.now(), gap = wall - lastWall; lastWall = wall;
    if (S.started){
      if (gap > 1500) simulate(gap - dt);
      tick(dt);
    }
    if (GAMES.active()){
      GAMES.update(dt);
      GAMES.draw(ctx);
      UI.hideTop(); UI.hideNav();
    } else {
      updateScene(dt, now);
      drawScene(ctx, now);
      processEvents();
      if (S.started && UI.current() !== 'title'){
        UI.topbar(ROOMS[SCENE.room].name + (S.sleeping ? ' · zzz' : S.hidden ? ' · escondido' : ''), S.coins, S.level, levelProgress().pct);
        UI.nav(d => { SFX.play('blip'); goRoom(SCENE.room + d, d); });
      } else { UI.hideTop(); UI.hideNav(); }
    }
    saveT += dt;
    if (saveT > 10000){ saveT = 0; if (S.started) save(); }
    requestAnimationFrame(loop);
  }

  /* ---- toque na tela ---- */
  function canvasXY(e){
    const r = cv.getBoundingClientRect();
    return {x:(e.clientX - r.left) / r.width * W, y:(e.clientY - r.top) / r.height * H};
  }
  function roomTap(x, y){
    if (!S.started) return;
    if (y >= H - LAY.bar){
      const i = Math.min(ICONS.length - 1, Math.floor(x / (W / ICONS.length)));
      SCENE.sel = i; SFX.play('ok'); activate(i); return;
    }
    if (y < LAY.top) return;
    if (SCENE.riding && ROOMS[SCENE.room].id === 'sala'){
      const pos = ratPos('sala');
      if (pos && Math.abs(x - pos.x) < 20 && y > pos.y - 38 && y < pos.y + 8){
        stopRide(); SFX.play('back'); UI.toast(S.name + ' saiu da rodinha.', 1200); return;
      }
      if (y >= LAY.floorY && y < H - LAY.bar){
        SCENE.targetX = Math.min(W - 16, Math.max(16, x)); SCENE.targetY = Math.min(LAY.walkBottom, Math.max(LAY.walkTop, y));
        SFX.play('blip'); return;
      }
    }
    const item = interactiveAt(x, y);
    if (item){
      if (S.sleeping){ UI.toast('Shh... ' + S.name + ' está dormindo.', 1200); return; }
      if (item === 'roda'){
        if (S.hidden){ UI.toast(S.name + ' está escondido na casinha.', 1200); return; }
        startRide(); SFX.play('ok'); UI.toast('Toque no chão para correr. Toque nele para sair.', 2400); return;
      }
      const r = useItem(item);
      if (!r.ok) SFX.play('no');
      if (r.msg) UI.toast(r.msg, r.ok ? 1600 : 1800);
      return;
    }
    for (let i = 0; i < S.poops; i++){
      const p = poopSpot(i);
      if (p.room === SCENE.room && Math.abs(x - p.x) < 9 && Math.abs(y - (p.y - 4)) < 9){
        const r = cleanPoop(); if (r.ok){ SFX.play('ok'); UI.toast(r.msg, 1200); } return;
      }
    }
    const pos = ratPos(ROOMS[SCENE.room].id);
    if (!pos) return;
    if (Math.abs(x - pos.x) < 18 && y > ratTop(S.stage, pos.y) - 6 && y < pos.y + 6){
      if (S.sleeping){ UI.toast('Zzz...', 900); return; }
      const r = petRat();
      if (r.ok){ SFX.play('pet'); setAnim('pet', 900); addHearts(2); }
      else { UI.toast(r.msg, 900); }
    }
  }
  let pd = null;
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); SFX.ensure();
    const p = canvasXY(e);
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    pd = {x:p.x, y:p.y, t:performance.now()};
    if (GAMES.active()) GAMES.pointer('down', p.x, p.y);
    else if (UI.current() === 'title') UI.button('B');
  });
  cv.addEventListener('pointermove', e => { if (GAMES.active()){ const p = canvasXY(e); GAMES.pointer('move', p.x, p.y); } });
  function pointerEnd(e){
    const p = canvasXY(e);
    if (GAMES.active()){ GAMES.pointer('up', p.x, p.y); pd = null; return; }
    if (!pd) return;
    const dx = p.x - pd.x, dy = p.y - pd.y, dtm = performance.now() - pd.t;
    pd = null;
    if (UI.isOpen()) return;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy) * 1.5 && dtm < 600){
      SFX.play('blip'); goRoom(SCENE.room + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); return;
    }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) roomTap(p.x, p.y);
  }
  cv.addEventListener('pointerup', pointerEnd);
  cv.addEventListener('pointercancel', () => { pd = null; if (GAMES.active()) GAMES.pointer('up', 0, 0); });

  /* ---- teclado (PC) ---- */
  function press(k){
    SFX.ensure();
    if (GAMES.active()){ GAMES.button(k); return; }
    if (UI.isOpen()){ UI.button(k); return; }
    if (!S.started) return;
    if (k === 'A'){ SCENE.sel = (SCENE.sel + 1) % ICONS.length; SFX.play('blip'); }
    else if (k === 'B'){ if (SCENE.sel >= 0){ SFX.play('ok'); activate(SCENE.sel); } else { SCENE.sel = 0; SFX.play('blip'); } }
    else if (k === 'C'){ SCENE.sel = -1; SFX.play('back'); }
  }
  document.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')){
      if (e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); UI.button('B'); }
      return;
    }
    if (!GAMES.active() && !UI.isOpen() && S.started && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')){
      e.preventDefault(); goRoom(SCENE.room + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight' ? 1 : -1); return;
    }
    const map = {ArrowLeft:'A', a:'A', ArrowRight:'C', c:'C', Enter:'B', ' ':'B', ArrowUp:'B', b:'B', Escape:'C', Backspace:'C', ArrowDown:'A', Tab:'A'};
    const k = map[e.key];
    if (k){ e.preventDefault(); press(k); }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden){ if (S.started) save(); }
    else { if (S.started){ simulate(Date.now() - S.last); save(); } lastWall = Date.now(); last = performance.now(); }
  });
  window.addEventListener('pagehide', () => { if (S.started) save(); });

  /* ---- inicio ---- */
  const had = load();
  SFX.on = S.sound;
  if (had && S.started){ simulate(Date.now() - S.last); save(); }
  SCENE.room = S.room || 0;
  SCENE.ratX = W / 2; SCENE.targetX = W / 2; SCENE.ratY = LAY.ratY; SCENE.targetY = LAY.ratY;
  UI.title(() => {
    SFX.ensure(); SFX.play('ok');
    if (S.started){ UI.close(); }
    else { UI.intro(name => { startNew(name); UI.toast('Oi, ' + S.name + '!'); addHearts(3); }); }
  });
  requestAnimationFrame(loop);
})();
