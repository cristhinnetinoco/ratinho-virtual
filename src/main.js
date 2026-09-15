/* ===== Loop principal, entrada e ligacao das partes ===== */
(function(){
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  let last = performance.now(), lastWall = Date.now(), saveT = 0;

  const hooks = {
    skip(){ simulate(12 * HOUR); save(); },
    reset(){
      UI.intro(name => { startNew(name); SCENE.ratX = 72; UI.toast('Oi, ' + S.name + '!'); addHearts(3); });
    },
    loaded(){ simulate(Date.now() - S.last); save(); }
  };

  function activate(i){
    if (!S.started) return;
    const id = ICONS[i].id;
    switch (id){
      case 'comer':
        UI.foodMenu(k => {
          const r = feed(k);
          if (r.ok){ SFX.play('eat'); UI.close(); setAnim('eat', 1600, {food:k}); setTimeout(addCrumbs, 800); UI.toast(r.msg, 1500); }
          else { SFX.play('no'); UI.toast(r.msg); if (!S.sleeping) setAnim('no', 900); }
        });
        break;
      case 'luz': {
        const r = toggleLight();
        SFX.play(S.sleeping ? 'sleep' : 'wake');
        UI.toast(r.msg);
        break;
      }
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
      case 'banho': {
        const r = bath();
        SFX.play(r.ok ? 'happy' : 'no'); UI.toast(r.msg);
        if (r.ok) setAnim('bath', 2000);
        break;
      }
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
      } else if (ev === 'sick'){ SFX.play('sick'); UI.toast(S.name + ' ficou doente!'); }
      else if (ev === 'woke'){ SFX.play('wake'); UI.toast(S.name + ' acordou sozinho!'); }
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
    } else {
      updateScene(dt, now);
      drawScene(ctx, now);
      processEvents();
    }
    saveT += dt;
    if (saveT > 10000){ saveT = 0; if (S.started) save(); }
    requestAnimationFrame(loop);
  }

  /* ---- entrada: tela ---- */
  function canvasXY(e){
    const r = cv.getBoundingClientRect();
    return {x:(e.clientX - r.left) / r.width * W, y:(e.clientY - r.top) / r.height * H};
  }
  function roomTap(x, y){
    if (!S.started) return;
    for (let i = 0; i < ICONS.length; i++){
      const r = iconRect(i);
      if (x >= r.x - 3 && x <= r.x + r.w + 3 && y >= r.y - 3 && y <= r.y + r.h + 3){
        SCENE.sel = i; SFX.play('ok'); activate(i); return;
      }
    }
    for (let i = 0; i < S.poops; i++){
      const p = SCENE.poopPos[i];
      if (Math.abs(x - (p[0] + 4)) < 8 && Math.abs(y - (p[1] - 4)) < 8){
        const r = cleanPoop(); if (r.ok){ SFX.play('ok'); UI.toast(r.msg, 1200); } return;
      }
    }
    const top = ratTop(S.stage, RAT_Y);
    if (Math.abs(x - SCENE.ratX) < 18 && y > top - 4 && y < RAT_Y + 4){
      const r = petRat();
      if (r.ok){ SFX.play('pet'); setAnim('pet', 900); addHearts(2); }
      else { UI.toast(r.msg, 900); }
    }
  }
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); SFX.ensure();
    const p = canvasXY(e);
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (GAMES.active()) GAMES.pointer('down', p.x, p.y);
    else if (UI.current() === 'title') UI.button('B');
    else if (!UI.isOpen()) roomTap(p.x, p.y);
  });
  cv.addEventListener('pointermove', e => { if (GAMES.active()){ const p = canvasXY(e); GAMES.pointer('move', p.x, p.y); } });
  cv.addEventListener('pointerup', e => { if (GAMES.active()){ const p = canvasXY(e); GAMES.pointer('up', p.x, p.y); } });
  cv.addEventListener('pointercancel', e => { if (GAMES.active()){ const p = canvasXY(e); GAMES.pointer('up', p.x, p.y); } });

  /* ---- entrada: botoes A B C ---- */
  function press(k){
    SFX.ensure();
    if (GAMES.active()){ GAMES.button(k); return; }
    if (UI.isOpen()){ UI.button(k); return; }
    if (!S.started) return;
    if (k === 'A'){ SCENE.sel = (SCENE.sel + 1) % ICONS.length; SFX.play('blip'); }
    else if (k === 'B'){ if (SCENE.sel >= 0){ SFX.play('ok'); activate(SCENE.sel); } else { SCENE.sel = 0; SFX.play('blip'); } }
    else if (k === 'C'){ SCENE.sel = -1; SFX.play('back'); }
  }
  for (const k of ['A', 'B', 'C']){
    const b = document.getElementById('btn' + k);
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('pressed'); press(k); });
    b.addEventListener('pointerup', () => b.classList.remove('pressed'));
    b.addEventListener('pointerleave', () => b.classList.remove('pressed'));
    b.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); press(k); } });
  }
  document.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')){
      if (e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); UI.button('B'); }
      return;
    }
    const map = {ArrowLeft:'A', a:'A', ArrowRight:'C', c:'C', Enter:'B', ' ':'B', ArrowUp:'B', b:'B', Escape:'C', Backspace:'C', ArrowDown:'A'};
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
  UI.title(() => {
    SFX.ensure(); SFX.play('ok');
    if (S.started){ UI.close(); }
    else { UI.intro(name => { startNew(name); UI.toast('Oi, ' + S.name + '!'); addHearts(3); }); }
  });
  requestAnimationFrame(loop);
})();
