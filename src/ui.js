/* ===== Interface (DOM sobre o canvas) ===== */
const UI = (() => {
  const el = document.getElementById('ui');
  let panel = null;
  let focusIdx = -1;
  let toastEl = null, toastTimer = 0;
  let acts = {};
  let onBack = null;
  let navCb = null;
  let sellMode = false;
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
  function topbar(roomName, coins, level, pct){
    const t = fixed('topbar');
    const html = '<span>' + esc(roomName) + '</span>' +
      '<span class="lvl">NV ' + level + '<i><b style="width:' + Math.round(pct * 100) + '%"></b></i></span>' +
      '<span class="coins"><img alt="" src="' + sprURL('moeda') + '">' + coins + '</span>';
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
    const lp = levelProgress();
    const nextStage = S.stage === 'baby' ? 'Adolescente no nível ' + STAGES.young.level : S.stage === 'young' ? 'Adulto no nível ' + STAGES.adult.level : '';
    const h = '<div class="panel"><h2>' + esc(S.name) + '</h2>' +
      '<div class="bars">' + bar('queijo', 'Fome', S.hunger) + bar('zzz', 'Energia', S.energy) +
      bar('sabonete', 'Higiene', S.hygiene) + bar('coracao', 'Diversão', S.fun) + '</div>' +
      '<div class="kv">' +
      '<b>Nível</b><span>' + S.level + (S.level >= 99 ? ' · máximo!' : ' · ' + lp.cur + '/' + lp.need + ' xp') + '</span>' +
      '<b>Fase</b><span>' + st + (fm ? ' · ' + esc(fm) : '') + '</span>' +
      (nextStage ? '<b>Próxima</b><span>' + nextStage + '</span>' : '') +
      '<b>Idade</b><span>' + days + 'd ' + hrs + 'h</span>' +
      '<b>Peso</b><span>' + Math.round(S.weight) + 'g</span>' +
      '<b>Saúde</b><span>' + (S.sick ? 'Doente!' : 'Boa') + '</span>' +
      '<b>Moedas</b><span>' + S.coins + '</span>' +
      '<b>Dias seguidos</b><span>' + (S.streak || 1) + '</span>' +
      '<b>Favorita</b><span>' + (S.favKnown ? esc(FOODS[S.fav].name) : '? (descubra)') + '</span>' +
      '<b>Não gosta</b><span>' + (S.hateKnown ? esc(FOODS[S.hate].name) : '?') + '</span>' +
      '<b>Truques</b><span>' + (knownTricks().length ? knownTricks().map(k => TRICKS[k].name).join(', ') : 'nenhum ainda') + '</span>' +
      '<b>Refeições</b><span>' + S.stats.fed + '</span>' +
      '<b>Brincadeiras</b><span>' + S.stats.played + '</span>' +
      '<b>Banhos</b><span>' + S.stats.baths + '</span>' +
      '</div>' +
      '<div class="list" style="flex:0 1 auto">' +
      '<h3>Medalhas ' + Object.keys(S.ach || {}).length + '/' + ACHIEVEMENTS.length + '</h3><div class="medals">' +
      ACHIEVEMENTS.map(a => '<span class="medal' + (S.ach && S.ach[a.id] ? ' on' : '') + '" title="' + esc(a.desc) + '">' + esc(a.name) + '</span>').join('') + '</div>' +
      '<h3>Truques para aprender</h3><div class="medals">' +
      Object.keys(TRICKS).map(k => '<span class="medal' + (S.tricks && S.tricks[k] ? ' on' : '') + '">' + esc(TRICKS[k].name) + ' · ' + esc(TRICKS[k].how) + '</span>').join('') + '</div></div>' +
      '<button class="opt center" data-act="back" style="margin-top:auto">Voltar</button></div>';
    open('status', h, {back:() => { SFX.play('back'); close(); }});
  }
  function tutorial(onDone){
    const steps = [
      ['Bem-vindo à toca!', 'Os ícones de baixo são: comer, luz (dormir), brincar, remédio, banho, status, loja e ajustes.'],
      ['Quatro cômodos', 'Deslize o dedo para o lado, ou toque nas setas, para ir da sala para a cozinha, o banheiro e o quarto.'],
      ['Carinho e brinquedos', 'Toque na cabeça dele para carinho, na barriga para cócegas, e arraste o dedo nele para um cafuné. Os itens com estrelinha na loja são brinquedos: toque neles na toca.'],
      ['Ele cresce', 'Cuidar dele dá experiência. No nível ' + STAGES.young.level + ' vira adolescente e no nível ' + STAGES.adult.level + ' vira adulto. As barras caem mesmo com o app fechado, então volte umas 3 vezes por dia.']
    ];
    let i = 0;
    const render = () => {
      const s = steps[i];
      open('tutorial', '<div class="panel short" style="height:44%"><h2>' + esc(s[0]) + '</h2><p>' + esc(s[1]) + '</p>' +
        '<button class="opt center" data-act="next" style="margin-top:auto">' + (i < steps.length - 1 ? 'Próximo (' + (i + 1) + '/' + steps.length + ')' : 'Entendi!') + '</button></div>',
        {next:() => { SFX.play('ok'); i++; if (i >= steps.length){ close(); onDone(); } else render(); }});
    };
    render();
  }
  function streakPanel(day, text){
    const h = '<div class="panel short" style="height:40%"><h2>Dia ' + day + ' seguido!</h2>' +
      '<p>Você voltou hoje. Ganhou: <b>' + esc(text) + '</b>.</p><p class="sub">' + (day < 7 ? 'Volte amanhã para o dia ' + (day + 1) + '. No 7º dia tem um presente raro.' : 'Sequência completa! Continua ganhando todo dia.') + '</p>' +
      '<button class="opt center" data-act="ok" style="margin-top:auto">Valeu!</button></div>';
    open('streak', h, {ok:() => { SFX.play('coin'); close(); }}, () => close());
  }

  function shop(tab){
    tab = tab || 'food';
    const tabs = [['food', 'Comida'], ['wear', 'Roupas'], ['home', 'Toca'], ['skin', 'Cores']];
    const row = (act, key, icon, name, meta, cls) =>
      '<button class="opt ' + cls + '" data-act="' + act + '" data-arg="' + key + '">' + icon +
      '<span class="name">' + (name.indexOf('<img') >= 0 ? esc(name.split('<img')[0]) + '<img' + name.split('<img')[1] : esc(name)) + '</span><span class="meta">' + meta + '</span></button>';
    const swatch = col => '<span class="ico" style="background:' + col + ';border:2px solid #3a2a4a;border-radius:50%"></span>';
    let list = '';
    if (tab === 'food'){
      list = Object.keys(FOODS).map(k => row('buy', 'food:' + k, sprImg(k), FOODS[k].name, foodPrice(k) + ' · x' + (S.inv[k] || 0), '')).join('');
    } else if (tab === 'wear'){
      const groups = [['baby', 'Para todas as idades'], ['young', 'Adolescente'], ['adult', 'Adulto']];
      const locked = st => stageRank(st) > stageRank(S.stage);
      list += '<h3>Acessórios</h3>';
      list += row('wearHat', '', sprImg('brilho'), 'Sem acessório', S.hat ? 'tirar' : 'ok', S.hat ? '' : 'owned');
      for (const [stg, title] of groups){
        list += '<h3>' + title + (locked(stg) ? ' · libera no nível ' + STAGES[stg].level : '') + '</h3>';
        list += Object.keys(HATS).filter(k => (HATS[k].stage || 'baby') === stg).map(k => {
          const owned = S.hats.includes(k), on = S.hat === k, lk = !owned && locked(stg);
          if (sellMode) return owned ? row('sellAsk', 'hat:' + k, sprImg(k), HATS[k].name, 'vender +' + Math.floor(HATS[k].price / 2), 'danger') : '';
          return row(owned ? 'wearHat' : lk ? 'none' : 'buy', owned ? k : 'hat:' + k, sprImg(k), HATS[k].name, owned ? (on ? 'usando' : 'usar') : lk ? 'bloqueado' : HATS[k].price + '', owned ? 'owned' : lk ? 'disabled' : '');
        }).join('');
      }
      list += '<h3>Roupas</h3>';
      list += row('wearOutfit', '', sprImg('brilho'), 'Sem roupa', S.outfit ? 'tirar' : 'ok', S.outfit ? '' : 'owned');
      for (const [stg, title] of groups){
        list += '<h3>' + title + (locked(stg) ? ' · libera no nível ' + STAGES[stg].level : '') + '</h3>';
        list += Object.keys(OUTFITS).filter(k => (OUTFITS[k].stage || 'baby') === stg).map(k => {
          const owned = S.outfits.includes(k), on = S.outfit === k, lk = !owned && locked(stg);
          const icon = '<img class="ico" alt="" src="' + outfitIconURL(k) + '">';
          if (sellMode) return owned ? row('sellAsk', 'outfit:' + k, icon, OUTFITS[k].name, 'vender +' + Math.floor(OUTFITS[k].price / 2), 'danger') : '';
          return row(owned ? 'wearOutfit' : lk ? 'none' : 'buy', owned ? k : 'outfit:' + k, icon, OUTFITS[k].name, owned ? (on ? 'usando' : 'usar') : lk ? 'bloqueado' : outfitPrice(k) + '', owned ? 'owned' : lk ? 'disabled' : '');
        }).join('');
      }
    } else if (tab === 'home'){
      const fi = (draw, w, h) => '<img class="ico" alt="" src="' + furnIconURL(draw, w, h) + '">';
      for (const room of ROOMS){
        const where = 'no ' + (room.id === 'sala' || room.id === 'cozinha' ? room.name.toLowerCase().replace(/^/, '') : room.name.toLowerCase());
        const inRoomTxt = (room.id === 'sala' || room.id === 'cozinha') ? 'na ' + room.name.toLowerCase() : 'no ' + room.name.toLowerCase();
        list += '<h3>' + esc(room.name) + ' · móveis</h3>';
        list += room.slots.map(key => {
          const f = FURN[key], up = hasUpgrade(key), t1 = f.tiers[1];
          if (sellMode) return up ? row('sellAsk', 'furn:' + key, fi(t1.draw, t1.w, t1.h), t1.name, 'vender +' + Math.floor(t1.price / 2), 'danger') : '';
          return row(up ? 'none' : 'buy', up ? key : 'furn:' + key, fi(t1.draw, t1.w, t1.h), t1.name, up ? inRoomTxt : t1.price + '', up ? 'owned' : '');
        }).join('');
        list += '<h3>' + esc(room.name) + ' · decoração e brinquedos</h3>';
        const ev = currentEvent();
        list += Object.keys(DECOR).filter(k => DECOR[k].room === room.id).map(k => {
          const d = DECOR[k], owned = S.decor.includes(k), paper = d.kind === 'paper';
          if (d.event && !owned && !(ev && ev.id === d.event)) return '';
          if (sellMode){
            if (!owned) return '';
            const def = decorDef(k);
            return row('sellAsk', 'decor:' + k, d.tiers ? fi(def.draw, def.w, def.h) : (paper ? sprImg('brilho') : sprImg('coracao')), def.name || d.name, 'vender +' + Math.floor((d.tiers ? def.price : d.price) / 2), 'danger');
          }
          if (d.tiers){
            const tier = owned ? decorTier(k) : -1;
            const star = d.use ? '<img class="star" alt="interativo" src="' + sprURL('estrela', {w:'#ffd23f'}) + '">' : '';
            const evTxt = d.event ? ' · ' + (ev && ev.id === d.event ? ev.name : 'evento') : '';
            const nm = i => d.tiers[i].name + evTxt + star;
            let rows = '';
            if (tier < 0) rows += row('buy', 'decor:' + k + ':0', fi(d.tiers[0].draw, d.tiers[0].w, d.tiers[0].h), nm(0), d.tiers[0].price + '', '');
            if (tier === 0) rows += row('none', k, fi(d.tiers[0].draw, d.tiers[0].w, d.tiers[0].h), nm(0), inRoomTxt, 'owned');
            if (tier < 1) rows += row('buy', 'decor:' + k + ':1', fi(d.tiers[1].draw, d.tiers[1].w, d.tiers[1].h), nm(1), d.tiers[1].price + '', '');
            else rows += row('none', k, fi(d.tiers[1].draw, d.tiers[1].w, d.tiers[1].h), nm(1), inRoomTxt, 'owned');
            return rows;
          }
          const icon = paper ? sprImg('brilho') : d.kind === 'rug' ? sprImg('coracao') : d.draw ? fi(d.draw, d.w, d.h) : sprImg(d.spr || k);
          const meta = owned ? (paper ? (S.paper === k ? 'usando' : 'usar') : inRoomTxt) : d.price + '';
          return row(owned ? (paper ? 'paper' : 'none') : 'buy', owned ? k : 'decor:' + k, icon, d.name, meta, owned ? 'owned' : '');
        }).join('');
      }
    } else if (tab === 'skin'){
      const groups = [['natural', 'Cores naturais'], ['bicolor', 'Bicolores'], ['color', 'Coloridos']];
      for (const [g, title] of groups){
        list += '<h3>' + title + '</h3>';
        list += Object.keys(SKINS).filter(k => (SKINS[k].group || 'natural') === g).map(k => {
          const owned = S.skins.includes(k), on = S.skin === k, sk = SKINS[k];
          const sw = sk.hood ? '<span class="ico" style="background:linear-gradient(135deg,' + sk.hood + ' 50%,' + sk.fur + ' 50%);border:2px solid #3a2a4a;border-radius:50%"></span>' : swatch(sk.fur);
          if (sellMode) return owned && k !== 'bege' ? row('sellAsk', 'skin:' + k, sw, sk.name, 'vender +' + Math.floor(sk.price / 2), 'danger') : '';
          return row(owned ? 'skin' : 'buy', owned ? k : 'skin:' + k, sw, sk.name, owned ? (on ? 'usando' : 'usar') : sk.price + '', owned ? 'owned' : '');
        }).join('');
      }
    }
    const h = '<div class="panel">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h2>Loja</h2>' +
      '<div class="coins"><img alt="moedas" src="' + sprURL('moeda') + '">' + S.coins + '</div>' +
      (tab !== 'food' ? '<button class="sellmode ' + (sellMode ? 'on' : '') + '" data-act="sellToggle">' + (sellMode ? 'VENDENDO' : 'VENDER') + '</button>' : '') + '</div>' +
      (sellMode && tab !== 'food' ? '<p class="sub">Toque num item seu para vender pela metade do preço.</p>' : '') +
      '<div class="tabs">' + tabs.map(t => '<button class="tab ' + (t[0] === tab ? 'on' : '') + '" data-act="tab" data-arg="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' +
      '<div class="list">' + list + '</div>' +
      '<button class="opt center" data-act="back">Voltar</button></div>';
    open('shop', h, {
      tab:t => { SFX.play('blip'); shop(t); },
      buy:arg => {
        const [cat, key, tier] = arg.split(':');
        const r = buy(cat, key, tier != null ? parseInt(tier, 10) : undefined);
        SFX.play(r.ok ? 'buy' : 'no');
        toast(r.msg, 1400);
        if (r.ok){ shop(tab); if (cat === 'furn' || cat === 'decor'){ const room = ROOMS.findIndex(x => x.id === (cat === 'furn' ? FURN[key].room : DECOR[key].room)); if (room >= 0 && room !== SCENE.room) goRoom(room); } }
      },
      sellToggle:() => { sellMode = !sellMode; SFX.play('blip'); shop(tab); },
      sellAsk:arg => {
        const [cat, key] = arg.split(':');
        const nm = cat === 'hat' ? HATS[key].name : cat === 'outfit' ? OUTFITS[key].name : cat === 'skin' ? SKINS[key].name : cat === 'furn' ? FURN[key].tiers[1].name : (decorDef(key).name || DECOR[key].name);
        confirm('Vender ' + nm + '?', () => { const r = sell(cat, key); SFX.play(r.ok ? 'coin' : 'no'); toast(r.msg || 'Não deu.', 1500); shop(tab); }, () => shop(tab));
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
      '<button class="opt" data-act="xp"><span class="name">Modo teste: +1 nível</span><span class="meta">xp</span></button>' +
      '<button class="opt" data-act="tutorial"><span class="name">Ver tutorial</span></button>' +
      '<button class="opt danger" data-act="reset"><span class="name">Recomeçar do zero</span></button>' +
      '<button class="opt" data-act="about"><span class="name">Sobre</span></button>' +
      '</div><button class="opt center" data-act="back">Voltar</button></div>';
    open('settings', h, {
      sound:() => { S.sound = !S.sound; SFX.on = S.sound; save(); SFX.play('ok'); settings(hooks); },
      export:() => exportPanel(hooks),
      import:() => importPanel(hooks),
      skip:() => { SFX.play('ok'); hooks.skip(); settings(hooks); toast('Passaram 12 horas.', 1600); },
      xp:() => { SFX.play('ok'); addXp(xpForLevel(S.level + 1) - S.xp); save(); close(); },
      tutorial:() => { SFX.play('ok'); hooks.tutorial(); },
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
      '<button class="opt center" data-act="copy">Copiar código</button>' +
      '<button class="opt center" data-act="file">Salvar arquivo (iCloud, Arquivos...)</button>' +
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
      file:async () => {
        const name = 'tem-um-rato-aqui-' + (S.name || 'save').toLowerCase().replace(/[^a-z0-9]/g, '') + '.txt';
        try {
          const file = new File([code], name, {type:'text/plain'});
          if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file], title:'Backup do ratinho'}); SFX.play('ok'); return; }
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], {type:'text/plain'})); a.download = name; document.body.appendChild(a); a.click(); a.remove();
          SFX.play('ok'); toast('Arquivo salvo.', 1600);
        } catch (e) { SFX.play('no'); toast('Não deu para salvar o arquivo. Use o código.', 1800); }
      },
      back:() => settings(hooks)
    }, () => settings(hooks));
  }
  function importPanel(hooks){
    const h = '<div class="panel"><h2>Carregar código</h2>' +
      '<p class="sub">Cole o código aqui, ou escolha o arquivo de backup. Isso substitui o ratinho atual.</p>' +
      '<textarea class="code" id="loadCode"></textarea>' +
      '<button class="opt center" data-act="load">Carregar código</button>' +
      '<label class="opt center" for="loadFile">Escolher arquivo de backup<input type="file" id="loadFile" accept=".txt,text/plain" style="display:none"></label>' +
      '<button class="opt center" data-act="back" style="margin-top:auto">Voltar</button></div>';
    open('import', h, {
      load:() => {
        const v = document.getElementById('loadCode').value;
        if (importCode(v)){ SFX.play('happy'); close(); hooks.loaded(); toast('Bem-vindo de volta, ' + S.name + '!'); }
        else { SFX.play('no'); toast('Código inválido.', 1600); }
      },
      back:() => settings(hooks)
    }, () => settings(hooks));
    const inp = document.getElementById('loadFile');
    if (inp) inp.addEventListener('change', () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { if (importCode(String(rd.result))){ SFX.play('happy'); close(); hooks.loaded(); toast('Bem-vindo de volta, ' + S.name + '!'); } else { SFX.play('no'); toast('Arquivo inválido.', 1600); } };
      rd.readAsText(f);
    });
  }
  function aboutPanel(hooks){
    const h = '<div class="panel"><h2>Sobre</h2><div class="list" style="gap:4%">' +
      '<p>Tem um rato aqui é um bichinho virtual: cuide da fome, do sono, da higiene e da diversão do seu rato.</p>' +
      '<p>A toca tem sala, cozinha e banheiro. Deslize para o lado ou use as setas para andar entre os cômodos. Os móveis começam improvisados e podem ser trocados por miniaturas de verdade na loja.</p>' +
      '<p>Cuidar dele dá experiência: comer, banho, carinho, brinquedos e mini-jogos. Ele vira adolescente no nível ' + STAGES.young.level + ' e adulto no nível ' + STAGES.adult.level + '. A forma adulta depende de como você cuidou dele quando adolescente.</p>' +
      '<p>As barras caem mesmo com o app fechado. Entrando umas 3 vezes por dia dá para manter tudo em dia. Se ficar muito tempo sem cuidar, ele fica doente e triste, mas nunca vai embora.</p>' +
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
  let lastSec = -1;
  function timer(seconds, total){
    let t = el.querySelector('.timer');
    if (!t){ t = document.createElement('div'); t.className = 'timer'; t.innerHTML = '<div class="num"></div><div class="track"><div class="fill"></div></div>'; el.appendChild(t); lastSec = -1; }
    const s = Math.max(0, Math.ceil(seconds));
    if (s !== lastSec){
      t.querySelector('.num').textContent = s;
      if (s <= 3 && s > 0 && lastSec !== -1) SFX.play('blip');
      lastSec = s;
    }
    t.classList.toggle('low', seconds <= 5);
    t.querySelector('.fill').style.width = Math.max(0, Math.min(100, seconds / Math.max(1, total) * 100)) + '%';
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
  function clearGameUI(){ el.querySelectorAll('.hud, .hint, .dpad, .quit, .timer').forEach(x => x.remove()); lastSec = -1; }

  return {open, close, isOpen, current, button, toast, title, intro, nameForm, foodMenu, playMenu, status, shop, settings,
          confirm, evolved, result, gameIntro, hud, hint, timer, dpad, quitButton, clearGameUI, setFocus, topbar, hideTop, nav, hideNav,
          tutorial, streakPanel};
})();
