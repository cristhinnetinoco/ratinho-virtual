/* ===== Interface dentro da telinha (DOM sobre o canvas) ===== */
const UI = (() => {
  const el = document.getElementById('ui');
  let panel = null;
  let focusIdx = -1;
  let toastEl = null, toastTimer = 0;
  let acts = {};
  let onBack = null;
  const NAMES = ['Queijinho', 'Biscoito', 'Pipoca', 'Nino', 'Mimi', 'Feijão', 'Tico', 'Amora', 'Bolinha', 'Cacau'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));

  function clear(){
    el.innerHTML = ''; panel = null; acts = {}; onBack = null; focusIdx = -1; toastEl = null;
  }
  function open(name, h, map, back){
    clear();
    panel = name; acts = map || {}; onBack = back || null;
    el.innerHTML = h;
    setFocus(0);
  }
  function close(){ if (panel){ clear(); } }
  function isOpen(){ return !!panel; }
  function current(){ return panel; }
  function items(){ return Array.from(el.querySelectorAll('.opt:not(.disabled), .tab')); }
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

  /* botoes fisicos: A mover, B ok, C voltar. Retorna true se consumiu. */
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
    if (k === 'C'){
      if (onBack) onBack(); else close();
      return true;
    }
    return true;
  }

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
        '<div class="logo">RATINHO<br>VIRTUAL<small>BICHINHO VIRTUAL</small></div>' +
        '<button class="opt" data-act="go" style="justify-content:center"><span class="blink">' +
        (S.started ? 'TOQUE PARA CONTINUAR' : 'TOQUE PARA COMEÇAR') + '</span></button>' +
      '</div>',
      {go});
  }
  function intro(onDone){
    let step = 0;
    const lines = [
      'Um barulhinho atrás da parede...',
      'Tec, tec, tec... Alguém roeu um buraquinho!',
      'Um filhote de rato apareceu na sua toca!'
    ];
    const render = () => {
      open('intro',
        '<div class="panel" style="top:auto;bottom:6%;height:34%">' +
          '<p style="margin:0;font-size:1em">' + esc(lines[step]) + '</p>' +
          '<button class="opt" data-act="next" style="justify-content:center;margin-top:auto">' +
          (step < lines.length - 1 ? 'Continuar' : 'Dar um nome') + '</button>' +
        '</div>',
        {next:() => { SFX.play('ok'); step++; if (step >= lines.length) nameForm(onDone); else render(); }});
    };
    render();
  }
  function nameForm(onDone){
    const sug = NAMES[Math.floor(Math.random() * NAMES.length)];
    open('name',
      '<div class="panel">' +
        '<h2>Qual o nome dele?</h2>' +
        '<input class="name" id="ratName" maxlength="12" placeholder="' + sug + '" autocomplete="off" autocapitalize="words">' +
        '<p class="sub">Até 12 letras. Você pode usar a sugestão.</p>' +
        '<button class="opt" data-act="confirm" style="justify-content:center;margin-top:auto">É esse!</button>' +
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
           '<button class="opt" data-act="shop" style="justify-content:center">Ir à loja</button>';
    } else {
      h += '<div class="list">' + keys.map(k =>
        '<button class="opt" data-act="pick" data-arg="' + k + '">' + sprImg(k) +
        '<span class="name">' + esc(FOODS[k].name) + '</span><span class="meta">x' + S.inv[k] + '</span></button>').join('') + '</div>';
    }
    h += '<button class="opt" data-act="back" style="justify-content:center">Voltar</button></div>';
    open('food', h, {pick:k => onPick(k), back:() => { SFX.play('back'); close(); }, shop:() => shop('food')});
  }

  function playMenu(onPick){
    const G = GAMES.list;
    const h = '<div class="panel tall"><h2>Brincar</h2><div class="list">' +
      G.map(g => '<button class="opt" data-act="pick" data-arg="' + g.id + '">' + sprImg(g.icon) +
        '<span class="name">' + esc(g.name) + '</span><span class="meta">' + (S.best[g.id] ? 'rec ' + S.best[g.id] : '') + '</span></button>').join('') +
      '</div><button class="opt" data-act="back" style="justify-content:center">Voltar</button></div>';
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
    const h = '<div class="panel tall"><h2>' + esc(S.name) + '</h2>' +
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
      '</div>' +
      '<button class="opt" data-act="back" style="justify-content:center;margin-top:auto">Voltar</button></div>';
    open('status', h, {back:() => { SFX.play('back'); close(); }});
  }

  function shop(tab){
    tab = tab || 'food';
    const tabs = [['food', 'Comida'], ['hat', 'Roupas'], ['decor', 'Toca'], ['skin', 'Cores']];
    let list = '';
    const row = (key, icon, name, meta, cls, act) =>
      '<button class="opt ' + cls + '" data-act="' + act + '" data-arg="' + key + '">' + icon +
      '<span class="name">' + esc(name) + '</span><span class="meta">' + meta + '</span></button>';
    if (tab === 'food'){
      list = Object.keys(FOODS).map(k => row(k, sprImg(k), FOODS[k].name, FOODS[k].price + ' · x' + (S.inv[k] || 0), '', 'buy')).join('');
    } else if (tab === 'hat'){
      list = Object.keys(HATS).map(k => {
        const owned = S.hats.includes(key(k));
        const on = S.hat === k;
        return row(k, sprImg(k), HATS[k].name, owned ? (on ? 'usando' : 'usar') : HATS[k].price + '', owned ? 'owned' : '', owned ? 'wear' : 'buy');
      }).join('');
      list = row('', sprImg('brilho'), 'Sem chapéu', S.hat ? 'tirar' : 'ok', S.hat ? '' : 'owned', 'wear') + list;
    } else if (tab === 'decor'){
      list = Object.keys(DECOR).map(k => {
        const owned = S.decor.includes(k);
        const paper = DECOR[k].kind === 'paper';
        const icon = paper ? sprImg('brilho') : k === 'tapete' ? sprImg('coracao') : sprImg(k);
        const meta = owned ? (paper ? (S.paper === k ? 'usando' : 'usar') : 'na toca') : DECOR[k].price + '';
        return row(k, icon, DECOR[k].name, meta, owned ? 'owned' : '', owned ? (paper ? 'paper' : 'none') : 'buy');
      }).join('');
    } else if (tab === 'skin'){
      list = Object.keys(SKINS).map(k => {
        const owned = S.skins.includes(k);
        const on = S.skin === k;
        const icon = '<span class="ico" style="background:' + SKINS[k].fur + ';border:2px solid #3a2a4a;border-radius:50%"></span>';
        return row(k, icon, SKINS[k].name, owned ? (on ? 'usando' : 'usar') : SKINS[k].price + '', owned ? 'owned' : '', owned ? 'skin' : 'buy');
      }).join('');
    }
    function key(k){ return k; }
    const h = '<div class="panel tall">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h2>Loja</h2>' +
      '<div class="coins"><img alt="moedas" src="' + sprURL('moeda') + '">' + S.coins + '</div></div>' +
      '<div class="tabs">' + tabs.map(t => '<button class="tab ' + (t[0] === tab ? 'on' : '') + '" data-act="tab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      '<div class="list">' + list + '</div>' +
      '<button class="opt" data-act="back" style="justify-content:center">Voltar</button></div>';
    open('shop', h, {
      tab:t => { SFX.play('blip'); shop(t); },
      buy:k => {
        const r = buy(tab, k);
        SFX.play(r.ok ? 'buy' : 'no');
        toast(r.msg, 1400);
        if (r.ok) shop(tab);
      },
      wear:k => { S.hat = k || ''; save(); SFX.play('ok'); shop(tab); },
      skin:k => { S.skin = k; save(); SFX.play('ok'); shop(tab); },
      paper:k => { S.paper = k; save(); SFX.play('ok'); shop(tab); },
      none:() => { SFX.play('blip'); },
      back:() => { SFX.play('back'); close(); }
    });
    const idx = items().findIndex(x => x.classList.contains('opt'));
    if (idx >= 0) setFocus(idx);
  }

  function settings(hooks){
    const h = '<div class="panel tall"><h2>Ajustes</h2><div class="list">' +
      '<button class="opt" data-act="sound"><span class="name">Som</span><span class="meta">' + (S.sound ? 'ligado' : 'desligado') + '</span></button>' +
      '<button class="opt" data-act="export"><span class="name">Código do save</span><span class="meta">copiar</span></button>' +
      '<button class="opt" data-act="import"><span class="name">Carregar código</span><span class="meta">colar</span></button>' +
      '<button class="opt" data-act="skip"><span class="name">Modo teste: +12h</span><span class="meta">tempo</span></button>' +
      '<button class="opt danger" data-act="reset"><span class="name">Recomeçar do zero</span></button>' +
      '<button class="opt" data-act="about"><span class="name">Sobre</span></button>' +
      '</div><button class="opt" data-act="back" style="justify-content:center">Voltar</button></div>';
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
    const h = '<div class="panel tall"><h2>Código do save</h2>' +
      '<p class="sub">Guarde este código para recuperar o ratinho em outro aparelho.</p>' +
      '<textarea class="code" id="saveCode" readonly>' + code + '</textarea>' +
      '<button class="opt" data-act="copy" style="justify-content:center">Copiar</button>' +
      '<button class="opt" data-act="back" style="justify-content:center;margin-top:auto">Voltar</button></div>';
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
    const h = '<div class="panel tall"><h2>Carregar código</h2>' +
      '<p class="sub">Cole o código aqui. Isso substitui o ratinho atual.</p>' +
      '<textarea class="code" id="loadCode"></textarea>' +
      '<button class="opt" data-act="load" style="justify-content:center">Carregar</button>' +
      '<button class="opt" data-act="back" style="justify-content:center;margin-top:auto">Voltar</button></div>';
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
    const h = '<div class="panel tall"><h2>Sobre</h2>' +
      '<p style="margin:0">Ratinho Virtual é um bichinho virtual: cuide da fome, do sono, da higiene e da diversão do seu rato.</p>' +
      '<p style="margin:0">Ele vira jovem com 20 horas de vida e adulto com 68. A forma adulta depende de como você cuidou dele quando jovem.</p>' +
      '<p style="margin:0">O tempo passa devagar com o app fechado. Se ficar muito tempo sem cuidar, ele fica doente e triste, mas nunca vai embora.</p>' +
      '<button class="opt" data-act="back" style="justify-content:center;margin-top:auto">Voltar</button></div>';
    open('about', h, {back:() => settings(hooks)}, () => settings(hooks));
  }
  function confirm(msg, yes, no){
    const h = '<div class="panel"><h2>Tem certeza?</h2><p style="margin:0">' + esc(msg) + '</p>' +
      '<div class="row" style="margin-top:auto"><button class="opt" data-act="no">Não</button><button class="opt danger" data-act="yes">Sim</button></div></div>';
    open('confirm', h, {yes:() => { close(); yes(); }, no:() => { SFX.play('back'); no ? no() : close(); }}, () => { no ? no() : close(); });
  }
  function evolved(stage, onOk){
    const st = STAGES[stage].name;
    const fm = stage === 'adult' && FORMS[S.form] ? FORMS[S.form] : null;
    const h = '<div class="panel" style="top:auto;bottom:6%;height:40%"><h2>Evoluiu!</h2>' +
      '<p style="margin:0">' + esc(S.name) + ' agora é <b>' + esc(fm ? fm.name : st) + '</b>!' + (fm ? ' ' + esc(fm.desc) : '') + '</p>' +
      '<button class="opt" data-act="ok" style="justify-content:center;margin-top:auto">Uau!</button></div>';
    open('evolved', h, {ok:() => { close(); onOk && onOk(); }}, () => { close(); onOk && onOk(); });
  }
  function result(g, score, coins, isBest, onOk){
    const h = '<div class="panel"><h2>' + esc(g.name) + '</h2>' +
      '<div class="kv" style="font-size:1em"><b>Pontos</b><span>' + score + (isBest ? ' ★ recorde' : '') + '</span>' +
      '<b>Moedas</b><span>+' + coins + '</span><b>Diversão</b><span>+25</span></div>' +
      '<button class="opt" data-act="ok" style="justify-content:center;margin-top:auto">Voltar à toca</button></div>';
    open('result', h, {ok:() => { close(); onOk(); }}, () => { close(); onOk(); });
  }
  function gameIntro(g, onStart, onCancel){
    const h = '<div class="panel"><h2>' + esc(g.name) + '</h2><p style="margin:0">' + esc(g.how) + '</p>' +
      '<div class="row" style="margin-top:auto"><button class="opt" data-act="cancel">Voltar</button><button class="opt" data-act="go">Jogar</button></div></div>';
    open('gameintro', h, {go:() => { close(); onStart(); }, cancel:() => { SFX.play('back'); close(); onCancel(); }}, () => { close(); onCancel(); });
    setFocus(1);
  }
  /* HUD de mini-jogo (nao bloqueia toques) */
  function hud(left, right, dark){
    let h = el.querySelector('.hud');
    if (!h){ h = document.createElement('div'); h.className = 'hud'; el.appendChild(h); }
    h.className = 'hud' + (dark ? ' dark' : '');
    h.innerHTML = '<span>' + left + '</span><span>' + right + '</span>';
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
      d.innerHTML = '<button class="u" data-dir="up" aria-label="cima">▲</button><button class="l" data-dir="left" aria-label="esquerda">◀</button>' +
                    '<button class="d" data-dir="down" aria-label="baixo">▼</button><button class="r" data-dir="right" aria-label="direita">▶</button>';
      d.addEventListener('pointerdown', e => { const b = e.target.closest('[data-dir]'); if (b){ e.preventDefault(); cb(b.dataset.dir); } });
      el.appendChild(d);
    }
  }
  function quitButton(cb){
    let q = el.querySelector('.quit');
    if (!q){ q = document.createElement('button'); q.className = 'quit'; q.setAttribute('aria-label', 'Sair do jogo'); q.textContent = '✕'; el.appendChild(q); }
    q.onclick = e => { e.preventDefault(); cb(); };
  }
  function clearGameUI(){ el.querySelectorAll('.hud, .hint, .dpad, .quit').forEach(x => x.remove()); }

  return {open, close, isOpen, current, button, toast, title, intro, nameForm, foodMenu, playMenu, status, shop, settings,
          confirm, evolved, result, gameIntro, hud, hint, dpad, quitButton, clearGameUI, setFocus};
})();
