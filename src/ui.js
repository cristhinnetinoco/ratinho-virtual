/* ===== Interface (DOM sobre o canvas) ===== */
const UI = (() => {
  const el = document.getElementById('ui');
  let panel = null;
  let focusIdx = -1;
  let toastEl = null, toastTimer = 0;
  let acts = {};
  let onBack = null;
  let navCb = null;
  const NAMES = ['Queijinho', 'Biscoito', 'Pipoca', 'Nino', 'Mimi', 'Feijão', 'Tico', 'Amora', 'Bolinha', 'Cacau'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

  /* elementos fixos (barra de cima, setas) sobrevivem aos paineis */
  function fixed(cls, html){
    let e = el.querySelector('.' + cls.split(' ')[0]);
    if (!e){ e = document.createElement('div'); e.className = cls; el.appendChild(e); }
    if (html != null) e.innerHTML = html;
    return e;
  }
  function clearPanel(){
    el.querySelectorAll('.panel, .title, .toast').forEach(x => x.remove());
    panel = null; acts = {}; onBack = null; focusIdx = -1; toastEl = null;
  }
  function open(name, h, map, back){
    clearPanel();
    panel = name; acts = map || {}; onBack = back || null;
    const wrap = document.createElement('div');
    wrap.innerHTML = h;
    while (wrap.firstChild) el.appendChild(wrap.firstChild);
    setFocus(0);
  }
  function close(){ if (panel) clearPanel(); }
  function isOpen(){ return !!panel; }
  function current(){ return panel; }
  function items(){ return Array.from(el.querySelectorAll('.panel .opt:not(.disabled), .panel .tab, .title .opt')); }
  function setFocus(i){
    const it = items(); if (!it.length){ focusIdx = -1; return; }
    it.forEach(x => x.classList.remove('focus'));
    focusIdx = ((i % it.length) + it.length) % it.length;
    it[focusIdx].classList.add('focus');
    try { it[focusIdx].scrollIntoView({block:'nearest'}); } catch (e) {}
  }
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t || t.classList.contains('disabled')) return;
    SFX.ensure();
    const fn = acts[t.dataset.act];
    if (fn) fn(t.dataset.arg, t);
  });
  el.addEventListener('pointerdown', e => {
    const t = e.target.closest('.opt, .tab');
    if (!t) return;
    const it = items(); const i = it.indexOf(t); if (i >= 0) setFocus(i);
  });

  /* teclado no PC: A mover, B ok, C voltar. */
  function button(k){
    if (!panel) return false;
    if (panel === 'title'){ acts.go && acts.go(); return true; }
    if (panel === 'intro'){ if (k !== 'C'){ acts.next && acts.next(); } return true; }
    if (k === 'A'){ SFX.play('blip'); setFocus(focusIdx + 1); return true; }
    if (k === 'B'){
      const it = items();
      if (focusIdx >= 0 && it[focusIdx]){ it[focusIdx].click(); }
      else if (panel === 'name'){ acts.confirm && acts.confirm(); }
      return true;
    }
    if (k === 'C'){ if (onBack) onBack(); else close(); return true; }
    return true;
  }

  /* ---------- barra de cima e setas de comodo ---------- */
  function topbar(roomName, coins){
    const t = fixed('topbar');
    const html = '<span>' + esc(roomName) + '</span><span class="coins"><img alt="" src="' + sprURL('moeda') + '">' + coins + '</span>';
    if (t.innerHTML !== html) t.innerHTML = html;
    t.hidden = false;
  }
  function hideTop(){ const t = el.querySelector('.topbar'); if (t) t.hidden = true; }
  function nav(cb){
    navCb = cb;
    let l = el.querySelector('.nav.l'), r = el.querySelector('.nav.r');
    if (!l){
      l = document.createElement('button'); l.className = 'nav l'; l.textContent = '<'; l.setAttribute('aria-label', 'Cômodo anterior');
      r = document.createElement('button'); r.className = 'nav r'; r.textContent = '>'; r.setAttribute('aria-label', 'Próximo cômodo');
      l.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); navCb && navCb(-1); });
      r.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); navCb && navCb(1); });
      el.appendChild(l); el.appendChild(r);
    }
    l.hidden = r.hidden = false;
  }
  function hideNav(){ el.querySelectorAll('.nav').forEach(x => { x.hidden = true; }); }

  /* ---------- balao de fala ---------- */
  function toast(msg, ms){
    if (!msg) return;
    if (toastEl && toastEl.parentNode) toastEl.remove();
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.textContent = msg;
    el.appendChild(toastEl);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { if (toastEl && toastEl.parentNode) toastEl.remove(); toastEl = null; }, ms || 2200);
  }

  /* ---------- telas ---------- */
  function title(go){
    open('title',
      '<div class="title">' +
        '<div class="logo">TEM UM<br>RATO AQUI<small>BICHINHO VIRTUAL</small></div>' +
        '<button class="opt center" data-act="go"><span class="blink">' +
        (S.started ? 'TOQUE PARA CONTINUAR' : 'TOQUE PARA COMEÇAR') + '</span></button>' +
      '</div>',
      {go});
  }
  function intro(onDone){
    let step = 0;
    const lines = [
      'Um barulhinho atrás da parede...',
      'Tec, tec, tec... Alguém roeu um buraquinho!',
      'Tem um rato aqui! Um filhote apareceu na sua toca.'
    ];
    const render = () => {
      open('intro',
        '<div class="panel short">' +
          '<p style="font-size:1em">' + esc(lines[step]) + '</p>' +
          '<button class="opt center" data-act="next" style="margin-top:auto">' +
          (step < lines.length - 1 ? 'Continuar' : 'Dar um nome') + '</button>' +
        '</div>',
        {next:() => { SFX.play('ok'); step++; if (step >= lines.length) nameForm(onDone); else render(); }});
    };
    render();
  }
  function nameForm(onDone){
    const sug = NAMES[Math.floor(Math.random() * NAMES.length)];
    open('name',
      '<div class="panel short" style="height:44%">' +
        '<h2>Qual o nome dele?</h2>' +
        '<input class="name" id="ratName" maxlength="12" placeholder="' + sug + '" autocomplete="off" autocapitalize="words">' +
        '<p class="sub">Até 12 letras. Pode usar a sugestão.</p>' +
        '<button class="opt center" data-act="confirm" style="margin-top:auto">É esse!</button>' +
      '</div>',
      {confirm:() => {
        const inp = document.getElementById('ratName');
        let n = (inp.value || '').trim() || sug;
        n = n.slice(0, 12);
        SFX.play('happy');
        close();
        onDone(n);
      }});
    focusIdx = -1; items().forEach(x => x.classList.remove('focus'));
    setTimeout(() => { const i = document.getElementById('ratName'); if (i) i.focus(); }, 50);
  }

  function foodMenu(onPick){
    const keys = Object.keys(FOODS).filter(k => (S.inv[k] || 0) > 0);
    let h = '<div class="panel"><h2>Comer</h2>';
    if (!keys.length){
      h += '<p class="sub">A despensa está vazia.</p>' +
           '<button class="opt center" data-act="shop">Ir à loja</button>';
    } else {
      h += '<div class="list">' + keys.map(k =>
        '<button class="opt" data-act="pick" data-arg="' + k + '">' + sprImg(k) +
        '<span class="name">' + esc(FOODS[k].name) + '</span><span class="meta">x' + S.inv[k] + '</span></button>').join('') + '</div>';
    }
    h += '<button class="opt center" data-act="back">Voltar</button></div>';
    open('food', h, {pick:k => onPick(k), back:() => { SFX.play('back'); close(); }, shop:() => shop('food')});
  }

  function playMenu(onPick){
    const G = GAMES.list;
    const h = '<div class="panel"><h2>Brincar</h2><div class="list">' +
      G.map(g => '<button class="opt" data-act="pick" data-arg="' + g.id + '">' + sprImg(g.icon) +
        '<span class="name">' + esc(g.name) + '</span><span class="meta">' + (S.best[g.id] ? 'rec ' + S.best[g.id] : '') + '</span></button>').join('') +
      '</div><button class="opt center" data-act="back">Voltar</button></div>';
    open('play', h, {pick:id => onPick(id), back:() => { SFX.play('back'); close(); }});
  }

  function bar(icon, label, v){
    const cls = v < 25 ? 'low' : v < 50 ? 'mid' : '';
    return '<div class="bar" title="' + label + '">' + '<img alt="' + label + '" src="' + sprURL(icon) + '">' +
      '<div class="track"><div class="fill ' + cls + '" style="width:' + Math.round(v) + '%"></div></div>' +
      '<div class="val">' + Math.round(v) + '</div></div>';
  }
  function status(){
    const ageH = S.age, days = Math.floor(ageH / 24), hrs = Math.floor(ageH % 24);
    const st = STAGES[S.stage].name, fm = S.stage === 'adult' && FORMS[S.form] ? FORMS[S.form].name : '';
    const h = '<div class="panel"><h2>' + esc(S.name) + '</h2>' +
      '<div class="bars">' + bar('queijo', 'Fome', S.hunger) + bar('zzz', 'Energia', S.energy) +
      bar('sabonete', 'Higiene', S.hygiene) + bar('coracao', 'Diversão', S.fun) + '</div>' +
      '<div class="kv">' +
      '<b>Fase</b><span>' + st + (fm ? ' · ' + esc(fm) : '') + '</span>' +
      '<b>Idade</b><span>' + days + 'd ' + hrs + 'h</span>' +
      '<b>Peso</b><span>' + Math.round(S.weight) + 'g</span>' +
      '<b>Saúde</b><span>' + (S.sick ? 'Doente!' : 'Boa') + '</span>' +
      '<b>Moedas</b><span>' + S.coins + '</span>' +
      '<b>Refeições</b><span>' + S.stats.fed + '</span>' +
      '<b>Brincadeiras</b><span>' + S.stats.played + '</span>' +
      '<b>Banhos</b><span>' + S.stats.baths + '</span>' +
      '</div>' +
      '<button class="opt center" data-act="back" style="margin-top:auto">Voltar</button></div>';
    open('status', h, {back:() => { SFX.play('back'); close(); }});
  }

  function shop(tab){
    tab = tab || 'food';
    const tabs = [['food', 'Comida'], ['wear', 'Roupas'], ['home', 'Toca'], ['skin', 'Cores']];
    const row = (act, key, icon, name, meta, cls) =>
      '<button class="opt ' + cls + '" data-act="' + act + '" data-arg="' + key + '">' + icon +
      '<span class="name">' + esc(name) + '</span><span class="meta">' + meta + '</span></button>';
    const swatch = col => '<span class="ico" style="background:' + col + ';border:2px solid #3a2a4a;border-radius:50%"></span>';
    let list = '';
    if (tab === 'food'){
      list = Object.keys(FOODS).map(k => row('buy', 'food:' + k, sprImg(k), FOODS[k].name, foodPrice(k) + ' · x' + (S.inv[k] || 0), '')).join('');
    } else if (tab === 'wear'){
      list += '<h3>Chapéus e acessórios</h3>';
      list += row('wearHat', '', sprImg('brilho'), 'Sem chapéu', S.hat ? 'tirar' : 'ok', S.hat ? '' : 'owned');
      list += Object.keys(HATS).map(k => {
        const owned = S.hats.includes(k), on = S.hat === k;
        return row(owned ? 'wearHat' : 'buy', owned ? k : 'hat:' + k, sprImg(k), HATS[k].name, owned ? (on ? 'usando' : 'usar') : HATS[k].price + '', owned ? 'owned' : '');
      }).join('');
      list += '<h3>Roupas</h3>';
      list += row('wearOutfit', '', sprImg('brilho'), 'Sem roupa', S.outfit ? 'tirar' : 'ok', S.outfit ? '' : 'owned');
      list += Object.keys(OUTFITS).map(k => {
        const owned = S.outfits.includes(k), on = S.outfit === k;
        const icon = '<img class="ico" alt="" src="' + outfitIconURL(k) + '">';
        return row(owned ? 'wearOutfit' : 'buy', owned ? k : 'outfit:' + k, icon, OUTFITS[k].name, owned ? (on ? 'usando' : 'usar') : OUTFITS[k].price + '', owned ? 'owned' : '');
      }).join('');
    } else if (tab === 'home'){
      for (const room of ROOMS){
        list += '<h3>' + esc(room.name) + ' · móveis</h3>';
        list += room.slots.map(key => {
          const f = FURN[key], up = hasUpgrade(key), t1 = f.tiers[1];
          const icon = '<img class="ico" alt="" src="' + furnIconURL(t1.draw, t1.w, t1.h) + '">';
          return row(up ? 'none' : 'buy', up ? key : 'furn:' + key, icon, t1.name, up ? 'na ' + room.name.toLowerCase() : t1.price + '', up ? 'owned' : '');
        }).join('');
        list += '<h3>' + esc(room.name) + ' · decoração</h3>';
        list += Object.keys(DECOR).filter(k => DECOR[k].room === room.id).map(k => {
          const d = DECOR[k], owned = S.decor.includes(k), paper = d.kind === 'paper';
          const icon = paper ? sprImg('brilho') : d.kind === 'rug' ? sprImg('coracao') : sprImg(d.spr || k);
          const meta = owned ? (paper ? (S.paper === k ? 'usando' : 'usar') : 'na ' + room.name.toLowerCase()) : d.price + '';
          return row(owned ? (paper ? 'paper' : 'none') : 'buy', owned ? k : 'decor:' + k, icon, d.name, meta, owned ? 'owned' : '');
        }).join('');
      }
    } else if (tab === 'skin'){
      list = Object.keys(SKINS).map(k => {
        const owned = S.skins.includes(k), on = S.skin === k;
        return row(owned ? 'skin' : 'buy', owned ? k : 'skin:' + k, swatch(SKINS[k].fur), SKINS[k].name, owned ? (on ? 'usando' : 'usar') : SKINS[k].price + '', owned ? 'owned' : '');
      }).join('');
    }
    const h = '<div class="panel">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h2>Loja</h2>' +
      '<div class="coins"><img alt="moedas" src="' + sprURL('moeda') + '">' + S.coins + '</div></div>' +
      '<div class="tabs">' + tabs.map(t => '<button class="tab ' + (t[0] === tab ? 'on' : '') + '" data-act="tab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      '<div class="list">' + list + '</div>' +
      '<button class="opt center" data-act="back">Voltar</button></div>';
    open('shop', h, {
      tab:t => { SFX.play('blip'); shop(t); },
      buy:arg => {
        const [cat, key] = arg.split(':');
        const r = buy(cat, key);
        SFX.play(r.ok ? 'buy' : 'no');
        toast(r.msg, 1400);
        if (r.ok){ shop(tab); if (cat === 'furn' || cat === 'decor'){ const room = ROOMS.findIndex(x => x.id === (cat === 'furn' ? FURN[key].room : DECOR[key].room)); if (room >= 0 && room !== SCENE.room) goRoom(room); } }
      },
      wearHat:k => { S.hat = k || ''; save(); SFX.play('ok'); shop(tab); },
      wearOutfit:k => { S.outfit = k || ''; save(); SFX.play('ok'); shop(tab); },
      skin:k => { S.skin = k; save(); SFX.play('ok'); shop(tab); },
      paper:k => { S.paper = k; save(); SFX.play('ok'); shop(tab); },
      none:() => { SFX.play('blip'); },
      back:() => { SFX.play('back'); close(); }
    });
    const idx = items().findIndex(x => x.classList.contains('opt'));
    if (idx >= 0) setFocus(idx);
  }

  function settings(hooks){
    const h = '<div class="panel"><h2>Ajustes</h2><div class="list">' +
      '<button class="opt" data-act="sound"><span class="name">Som</span><span class="meta">' + (S.sound ? 'ligado' : 'desligado') + '</span></button>' +
      '<button class="opt" data-act="export"><span class="name">Código do save</span><span class="meta">copiar</span></button>' +
      '<button class="opt" data-act="import"><span class="name">Carregar código</span><span class="meta">colar</span></button>' +
      '<button class="opt" data-act="skip"><span class="name">Modo teste: +12h</span><span class="meta">tempo</span></button>' +
      '<button class="opt danger" data-act="reset"><span class="name">Recomeçar do zero</span></button>' +
      '<button class="opt" data-act="about"><span class="name">Sobre</span></button>' +
      '</div><button class="opt center" data-act="back">Voltar</button></div>';
    open('settings', h, {
      sound:() => { S.sound = !S.sound; SFX.on = S.sound; save(); SFX.play('ok'); settings(hooks); },
      export:() => exportPanel(hooks),
      import:() => importPanel(hooks),
      skip:() => { SFX.play('ok'); hooks.skip(); settings(hooks); toast('Passaram 12 horas.', 1600); },
      reset:() => confirm('Recomeçar do zero? O ratinho atual vai embora para sempre.', () => hooks.reset(), () => settings(hooks)),
      about:() => aboutPanel(hooks),
      back:() => { SFX.play('back'); close(); }
    });
  }
  function exportPanel(hooks){
    const code = exportCode();
    const h = '<div class="panel"><h2>Código do save</h2>' +
      '<p class="sub">Guarde este código para recuperar o ratinho em outro aparelho.</p>' +
      '<textarea class="code" id="saveCode" readonly>' + code + '</textarea>' +
      '<button class="opt center" data-act="copy">Copiar</button>' +
      '<button class="opt center" data-act="back" style="margin-top:auto">Voltar</button></div>';
    open('export', h, {
      copy:async () => {
        const ta = document.getElementById('saveCode');
        let ok = false;
        try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {
          try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e2) {}
        }
        SFX.play(ok ? 'ok' : 'no');
        toast(ok ? 'Copiado!' : 'Selecione o texto e copie.', 1600);
      },
      back:() => settings(hooks)
    }, () => settings(hooks));
  }
  function importPanel(hooks){
    const h = '<div class="panel"><h2>Carregar código</h2>' +
      '<p class="sub">Cole o código aqui. Isso substitui o ratinho atual.</p>' +
      '<textarea class="code" id="loadCode"></textarea>' +
      '<button class="opt center" data-act="load">Carregar</button>' +
      '<button class="opt center" data-act="back" style="margin-top:auto">Voltar</button></div>';
    open('import', h, {
      load:() => {
        const v = document.getElementById('loadCode').value;
        if (importCode(v)){ SFX.play('happy'); close(); hooks.loaded(); toast('Bem-vindo de volta, ' + S.name + '!'); }
        else { SFX.play('no'); toast('Código inválido.', 1600); }
      },
      back:() => settings(hooks)
    }, () => settings(hooks));
  }
  function aboutPanel(hooks){
    const h = '<div class="panel"><h2>Sobre</h2><div class="list" style="gap:4%">' +
      '<p>Tem um rato aqui é um bichinho virtual: cuide da fome, do sono, da higiene e da diversão do seu rato.</p>' +
      '<p>A toca tem sala, cozinha e banheiro. Deslize para o lado ou use as setas para andar entre os cômodos. Os móveis começam improvisados e podem ser trocados por miniaturas de verdade na loja.</p>' +
      '<p>Ele vira jovem com 20 horas de vida e adulto com 68. A forma adulta depende de como você cuidou dele quando jovem.</p>' +
      '<p>O tempo passa devagar com o app fechado. Se ficar muito tempo sem cuidar, ele fica doente e triste, mas nunca vai embora.</p>' +
      '</div><button class="opt center" data-act="back">Voltar</button></div>';
    open('about', h, {back:() => settings(hooks)}, () => settings(hooks));
  }
  function confirm(msg, yes, no){
    const h = '<div class="panel short"><h2>Tem certeza?</h2><p>' + esc(msg) + '</p>' +
      '<div class="row" style="margin-top:auto"><button class="opt" data-act="no">Não</button><button class="opt danger" data-act="yes">Sim</button></div></div>';
    open('confirm', h, {yes:() => { close(); yes(); }, no:() => { SFX.play('back'); no ? no() : close(); }}, () => { no ? no() : close(); });
  }
  function evolved(stage, onOk){
    const st = STAGES[stage].name;
    const fm = stage === 'adult' && FORMS[S.form] ? FORMS[S.form] : null;
    const h = '<div class="panel short"><h2>Evoluiu!</h2>' +
      '<p>' + esc(S.name) + ' agora é <b>' + esc(fm ? fm.name : st) + '</b>!' + (fm ? ' ' + esc(fm.desc) : '') + '</p>' +
      '<button class="opt center" data-act="ok" style="margin-top:auto">Uau!</button></div>';
    open('evolved', h, {ok:() => { close(); onOk && onOk(); }}, () => { close(); onOk && onOk(); });
  }
  function result(g, score, coins, isBest, onOk, onRetry){
    const h = '<div class="panel short" style="height:46%"><h2>' + esc(g.name) + '</h2>' +
      '<div class="kv" style="font-size:1em"><b>Pontos</b><span>' + score + (isBest ? ' ★ recorde' : '') + '</span>' +
      '<b>Moedas</b><span>+' + coins + '</span><b>Diversão</b><span>+25</span></div>' +
      '<div class="row" style="margin-top:auto"><button class="opt" data-act="back">Voltar</button><button class="opt" data-act="retry">Jogar de novo</button></div></div>';
    open('result', h, {retry:() => { close(); onRetry(); }, back:() => { close(); onOk(); }}, () => { close(); onOk(); });
    setFocus(1);
  }
  function gameIntro(g, onStart, onCancel){
    const h = '<div class="panel short" style="height:46%"><h2>' + esc(g.name) + '</h2><p>' + esc(g.how) + '</p>' +
      '<div class="row" style="margin-top:auto"><button class="opt" data-act="cancel">Voltar</button><button class="opt" data-act="go">Jogar</button></div></div>';
    open('gameintro', h, {go:() => { close(); onStart(); }, cancel:() => { SFX.play('back'); close(); onCancel(); }}, () => { close(); onCancel(); });
    setFocus(1);
  }
  /* HUD de mini-jogo */
  function hud(left, right, dark){
    let h = el.querySelector('.hud');
    if (!h){ h = document.createElement('div'); h.className = 'hud'; el.appendChild(h); }
    h.className = 'hud' + (dark ? ' dark' : '');
    const html = '<span>' + left + '</span><span>' + right + '</span>';
    if (h.innerHTML !== html) h.innerHTML = html;
  }
  function hint(text, dark){
    let h = el.querySelector('.hint');
    if (!text){ if (h) h.remove(); return; }
    if (!h){ h = document.createElement('div'); h.className = 'hint'; el.appendChild(h); }
    h.className = 'hint' + (dark ? ' dark' : '');
    h.textContent = text;
  }
  function dpad(cb){
    let d = el.querySelector('.dpad');
    if (!d){
      d = document.createElement('div'); d.className = 'dpad';
      d.innerHTML = '<button class="u" data-dir="n" aria-label="cima">▲</button><button class="l" data-dir="w" aria-label="esquerda">◀</button>' +
                    '<button class="d" data-dir="s" aria-label="baixo">▼</button><button class="r" data-dir="e" aria-label="direita">▶</button>';
      d.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dir]'); if (b){ e.preventDefault(); e.stopPropagation(); cb(b.dataset.dir); } });
      el.appendChild(d);
    }
  }
  function quitButton(cb){
    let q = el.querySelector('.quit');
    if (!q){ q = document.createElement('button'); q.className = 'quit'; q.setAttribute('aria-label', 'Sair do jogo'); q.textContent = 'X'; el.appendChild(q); }
    q.onclick = e => { e.preventDefault(); cb(); };
  }
  function clearGameUI(){ el.querySelectorAll('.hud, .hint, .dpad, .quit').forEach(x => x.remove()); }

  return {open, close, isOpen, current, button, toast, title, intro, nameForm, foodMenu, playMenu, status, shop, settings,
          confirm, evolved, result, gameIntro, hud, hint, dpad, quitButton, clearGameUI, setFocus, topbar, hideTop, nav, hideNav};
})();
