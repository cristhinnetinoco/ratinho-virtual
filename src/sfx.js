/* ===== Sons de bip (Web Audio) ===== */
const SFX = (() => {
  let ac = null;
  let enabled = true;
  function ensure(){
    if (!ac){
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  function tone(f, dur, when, vol, type){
    if (!ac || !enabled) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.value = f;
    const v = vol || 0.06;
    const t0 = ac.currentTime + (when || 0);
    g.gain.setValueAtTime(v, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  const seqs = {
    blip:  [[880, .05]],
    ok:    [[660, .06], [990, .08, .06]],
    back:  [[440, .06], [330, .08, .06]],
    eat:   [[300, .05], [260, .05, .09], [300, .05, .18], [260, .05, .27]],
    happy: [[523, .08], [659, .08, .08], [784, .08, .16], [1046, .18, .24]],
    sad:   [[400, .15], [300, .25, .15]],
    sick:  [[200, .2], [180, .25, .2]],
    coin:  [[988, .05], [1319, .12, .05]],
    jump:  [[500, .06], [800, .06, .05]],
    hit:   [[150, .18]],
    evolve:[[523, .1], [659, .1, .1], [784, .1, .2], [1046, .1, .3], [1318, .35, .4]],
    sleep: [[440, .15], [349, .15, .15], [262, .3, .3]],
    wake:  [[262, .08], [392, .08, .08], [523, .15, .16]],
    buy:   [[784, .06], [988, .06, .06], [1175, .12, .12]],
    no:    [[220, .08], [220, .08, .12]],
    pet:   [[1046, .04], [1318, .06, .05]],
    flip:  [[700, .04]],
    win:   [[659, .1], [784, .1, .1], [1046, .1, .2], [784, .1, .3], [1046, .3, .4]]
  };
  function play(name){
    ensure();
    const s = seqs[name]; if (!s) return;
    for (const [f, d, w] of s) tone(f, d, w || 0);
  }
  return {
    play, ensure,
    set on(v){ enabled = !!v; },
    get on(){ return enabled; }
  };
})();
