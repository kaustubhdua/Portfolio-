/**
 * All sound is synthesised with the Web Audio API, so no audio file ships and nothing from any
 * game's soundtrack or effects is copied. Nothing starts without a click or key press from the
 * visitor, and the AudioContext is created lazily.
 *
 * Layers: sfx (effects and voices), music (generative piano with a long reverb), amb (ambient
 * beds), all through a master volume and a mute fade. Every effect has a logical name (see
 * public/sounds/README.md). If the owner adds public/sounds/manifest.json mapping names to
 * audio files they hold the rights to, those play instead of the synth. Simultaneous voices are
 * capped, and timers and beds stop while muted or while the tab is hidden.
 */
let ctx = null;
let mute = null; // mute fade
let master = null; // master volume
let sfx = null;
let music = null;
let amb = null;
let reverb = null;
let enabled = false;
let hidden = typeof document !== 'undefined' && document.hidden;
let world = 'nether';
let noiseBuf = null;
let timers = [];
let bed = [];
let bedGain = null;
let vc = 0; // active voices
let sampleState = 0; // 0 untried, 1 loading, 2 done
const samples = {};
const last = {};
let vol = 0.7;
try {
  const v = parseFloat(localStorage.getItem('portfolio-volume'));
  if (v >= 0 && v <= 1) vol = v;
} catch {
  /* default volume */
}

// per-call state read by tone/burst/voice, so one set of recipes serves loud, quiet and far uses
const cur = { g: 1, p: 1, d: 0, bus: null, far: false };

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const live = () => enabled && ctx && !hidden && ctx.state !== 'closed';
const room = (hi, lo) => vc < (hi ? 48 : lo ? 16 : 32);
const dec = () => {
  vc = Math.max(0, vc - 1);
};

function noise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function build() {
  ctx = new AudioContext();
  mute = ctx.createGain();
  mute.gain.value = 0;
  master = ctx.createGain();
  master.gain.value = vol;
  const comp = ctx.createDynamicsCompressor();
  master.connect(mute).connect(comp).connect(ctx.destination);
  sfx = ctx.createGain();
  sfx.gain.value = 0.9;
  music = ctx.createGain();
  music.gain.value = 0.55;
  amb = ctx.createGain();
  amb.gain.value = 0.5;
  // a long, dark hall reverb from smoothed decaying noise
  const len = Math.floor(ctx.sampleRate * 4);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let y = 0;
    for (let i = 0; i < len; i++) {
      y += ((Math.random() * 2 - 1) - y) * 0.3;
      d[i] = y * (1 - i / len) ** 3;
    }
  }
  reverb = ctx.createConvolver();
  reverb.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  reverb.connect(wet).connect(master);
  sfx.connect(master);
  music.connect(master);
  music.connect(reverb);
  amb.connect(master);
  document.addEventListener('visibilitychange', onVisibility);
}

/* ---------------------------------------------------------------- building blocks */

/** An oscillator with a quick attack and exponential decay. */
function tone(o) {
  const bus = o.bus || cur.bus || sfx;
  if (!room(o.hi, bus === amb)) return;
  const t = ctx.currentTime + (o.delay || 0) + cur.d;
  const dur = o.dur;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type || 'sine';
  if (o.detune) osc.detune.value = o.detune;
  osc.frequency.setValueAtTime(o.f0 * cur.p, t);
  if (o.f1 && o.f1 !== o.f0) osc.frequency.exponentialRampToValueAtTime(o.f1 * cur.p, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain * cur.g), t + (o.attack || 0.01));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(bus);
  if (o.rv) g.connect(reverb);
  osc.onended = dec;
  vc++;
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Filtered noise with a decay, optionally sweeping its filter. */
function burst(o) {
  const bus = o.bus || cur.bus || sfx;
  if (!room(o.hi, bus === amb)) return;
  const t = ctx.currentTime + (o.delay || 0) + cur.d;
  const dur = o.dur;
  const src = ctx.createBufferSource();
  src.buffer = noise();
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = o.type || 'lowpass';
  const fr = o.freq * Math.sqrt(cur.p);
  f.frequency.setValueAtTime(fr, t);
  if (o.sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, fr * o.sweep), t + dur);
  f.Q.value = o.q || 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(Math.max(0.0002, o.gain * cur.g), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus);
  if (o.rv) g.connect(reverb);
  src.onended = dec;
  vc++;
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

// rough vowel formants (F1, F2, F3), original approximations
const VOW = {
  u: [300, 800, 2300],
  o: [500, 900, 2400],
  a: [750, 1150, 2600],
  e: [450, 1900, 2600],
  i: [300, 2300, 3000],
  m: [250, 1000, 2200],
  ae: [650, 1700, 2500],
};
const FORMANT_GAIN = [1, 0.7, 0.4];

/**
 * A formant voice: a buzzy source through three band-pass filters that glide between vowels
 * while the pitch follows a contour. `f` is the pitch contour (Hz), `v` the vowel sequence.
 */
function voice(o) {
  const bus = o.bus || cur.bus || sfx;
  if (!room(o.hi, bus === amb)) return;
  const t = ctx.currentTime + (o.delay || 0) + cur.d;
  const dur = o.dur;
  const fs = (o.fs || 1) * rnd(0.95, 1.05);
  const osc = ctx.createOscillator();
  osc.type = o.type || 'sawtooth';
  const n = o.f.length;
  osc.frequency.setValueAtTime(o.f[0] * cur.p, t);
  for (let i = 1; i < n; i++) osc.frequency.linearRampToValueAtTime(o.f[i] * cur.p, t + (dur * i) / (n - 1));
  const env = ctx.createGain();
  const atk = Math.min(0.05, dur * 0.3);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.gain * cur.g * 2.5), t + atk);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let tail = env;
  if (cur.far) {
    tail = ctx.createBiquadFilter();
    tail.type = 'lowpass';
    tail.frequency.value = 800;
    env.connect(tail);
  }
  tail.connect(bus);
  if (o.rv) tail.connect(reverb);
  const m = o.v.length;
  for (let k = 0; k < 3; k++) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = o.q || (k ? 9 : 6);
    bp.frequency.setValueAtTime(VOW[o.v[0]][k] * fs, t);
    for (let i = 1; i < m; i++) bp.frequency.linearRampToValueAtTime(VOW[o.v[i]][k] * fs, t + (dur * i) / (m - 1));
    const fg = ctx.createGain();
    fg.gain.value = FORMANT_GAIN[k];
    osc.connect(bp).connect(fg).connect(env);
  }
  if (o.vib) {
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = o.vib[0];
    lg.gain.value = o.vib[1];
    lfo.connect(lg).connect(osc.detune);
    lfo.start(t);
    lfo.stop(t + dur + 0.05);
  }
  osc.onended = dec;
  vc++;
  osc.start(t);
  osc.stop(t + dur + 0.05);
  if (o.breath) burst({ dur: dur * 0.6, gain: o.breath, freq: VOW[o.v[0]][1] * fs, type: 'bandpass', q: 1.5, delay: o.delay || 0, bus });
}

/** A soft bell: the fundamental plus inharmonic partials, with reverb. */
function bell(f, delay, gain, parts = 3) {
  tone({ f0: f, dur: 1.5, gain, delay, rv: true, attack: 0.005 });
  tone({ f0: f * 2.76, dur: 0.6, gain: gain * 0.3, delay, rv: true, attack: 0.003 });
  if (parts > 2) tone({ f0: f * 5.4, dur: 0.25, gain: gain * 0.12, delay, attack: 0.002 });
}

/* ---------------------------------------------------------------- materials */

// Layers: [kind, type|wave, freq|f0, sweep|f1, dur, gain, delay, q]; 'n' is noise, 't' a tone.
const MAT = {
  grass: [['n', 'lowpass', 1100, 0, 0.1, 0.3, 0, 0.7], ['n', 'highpass', 5000, 0, 0.07, 0.08, 0, 0.4]],
  dirt: [['n', 'lowpass', 600, 0, 0.1, 0.34, 0, 0.8], ['t', 'sine', 110, 70, 0.08, 0.08, 0, 0]],
  stone: [['n', 'bandpass', 2200, 0, 0.08, 0.28, 0, 1.6], ['t', 'triangle', 190, 110, 0.07, 0.08, 0, 0]],
  wood: [['t', 'triangle', 260, 140, 0.09, 0.12, 0, 0], ['n', 'bandpass', 1400, 0, 0.06, 0.12, 0, 1.2]],
  sand: [['n', 'highpass', 3200, 0, 0.12, 0.18, 0, 0.5], ['n', 'bandpass', 5000, 0, 0.1, 0.06, 0, 0.8]],
  gravel: [['n', 'bandpass', 1800, 0, 0.12, 0.3, 0, 0.6], ['n', 'bandpass', 900, 0, 0.09, 0.2, 0.03, 0.8], ['n', 'highpass', 4000, 0, 0.05, 0.1, 0.05, 0.5]],
  glass: [['t', 'sine', 2400, 2300, 0.2, 0.06, 0, 0], ['t', 'sine', 3700, 3500, 0.15, 0.04, 0.01, 0], ['n', 'highpass', 5000, 0, 0.05, 0.15, 0, 1]],
  netherbrick: [['n', 'bandpass', 1600, 0, 0.08, 0.25, 0, 2], ['t', 'square', 140, 90, 0.08, 0.05, 0, 0], ['t', 'sine', 420, 400, 0.1, 0.03, 0, 0]],
  netherrack: [['n', 'lowpass', 500, 0, 0.09, 0.32, 0, 1.2], ['n', 'bandpass', 1500, 0, 0.04, 0.12, 0, 3]],
  soulsand: [['n', 'lowpass', 350, 0, 0.16, 0.3, 0, 0.7], ['n', 'bandpass', 900, 0.5, 0.14, 0.06, 0, 4], ['t', 'sine', 120, 80, 0.14, 0.05, 0, 0]],
};
const LAVA = [['t', 'sine', 300, 90, 0.12, 0.15, 0, 0], ['n', 'bandpass', 700, 0.6, 0.1, 0.15, 0, 5], ['n', 'lowpass', 300, 0, 0.15, 0.12, 0.04, 1]];
const WATER = [['n', 'bandpass', 1200, 2, 0.3, 0.25, 0, 0.8], ['t', 'sine', 500, 900, 0.1, 0.06, 0, 0], ['n', 'highpass', 3000, 0, 0.2, 0.08, 0.03, 0.5]];

// which material a block or ground name means, in priority order
const GUESS = [
  [/soul/, 'soulsand'],
  [/brick/, 'netherbrick'],
  [/netherrack|rack|basalt|magma|crimson|warped/, 'netherrack'],
  [/gravel/, 'gravel'],
  [/sand/, 'sand'],
  [/glass|ice/, 'glass'],
  [/grass|leaf|leaves|moss|hay/, 'grass'],
  [/dirt|mud|farmland|path|clay/, 'dirt'],
  [/stone|cobble|rock|ore|deepslate|obsidian|bedrock/, 'stone'],
  [/wood|plank|log|door|chest|fence|bookshelf/, 'wood'],
  [/lava/, 'lava'],
  [/water/, 'water'],
];
function material(name, fallback) {
  const s = String(name).toLowerCase();
  for (let i = 0; i < GUESS.length; i++) if (GUESS[i][0].test(s)) return GUESS[i][1];
  return fallback;
}

function layers(L, g, d, p) {
  cur.g *= g;
  cur.p *= p;
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    const j = rnd(0.88, 1.14);
    if (l[0] === 'n') burst({ type: l[1], freq: l[2] * j, sweep: l[3], dur: l[4] * d, gain: l[5] * rnd(0.85, 1.1), delay: l[6], q: l[7] });
    else tone({ type: l[1], f0: l[2] * j, f1: l[3] * j, dur: l[4] * d, gain: l[5] * rnd(0.85, 1.1), delay: l[6] });
  }
}

/* ---------------------------------------------------------------- voices */

const VILL = {
  // base pitch, formant scale, gruffness, length, usual phrase
  farmer: [125, 1, 0.3, 1, 'hmm'],
  blacksmith: [88, 0.88, 1, 1.1, 'hrm'],
  librarian: [175, 1.08, 0, 0.9, 'hmm'],
  merchant: [150, 1, 0.1, 0.85, 'huh'],
  guard: [105, 0.92, 0.7, 0.8, 'hrm'],
  cleric: [140, 1, 0, 1.25, 'hmm'],
  child: [290, 1.25, 0, 0.75, 'huh'],
};
const ROLES = Object.keys(VILL);

function villager(role, variant) {
  const [f0, fs, gr, dm, usual] = VILL[role];
  const v = variant || (Math.random() < 0.75 ? usual : pick(['hmm', 'huh', 'hrm']));
  const vib = gr ? [34, 20 + 60 * gr] : [5.5, 10];
  if (v === 'hmm') {
    voice({ f: [f0, f0 * 1.06, f0 * 0.9], v: ['m', 'o', 'm'], dur: 0.4 * dm, gain: 0.2, fs, vib });
    voice({ f: [f0 * 0.97, f0 * 0.8], v: ['m', 'm'], dur: 0.3 * dm, gain: 0.15, fs, vib, delay: 0.36 * dm });
  } else if (v === 'huh') {
    voice({ f: [f0 * 0.9, f0 * 1.2], v: ['a', 'ae'], dur: 0.22 * dm, gain: 0.2, fs, vib, breath: 0.05 });
  } else {
    voice({ f: [f0, f0 * 0.85, f0 * 0.8], v: ['o', 'a', 'm'], dur: 0.5 * dm, gain: 0.22, fs, vib: [38, 60 + 120 * gr] });
    burst({ dur: 0.08, gain: 0.08, freq: 700, type: 'bandpass', q: 1 });
  }
}

/* ---------------------------------------------------------------- the named sounds */

const SYN = {};
Object.keys(MAT).forEach((m) => {
  SYN['step_' + m] = () => layers(MAT[m], 0.6, 1, 1);
  SYN['dig_' + m] = () => {
    layers(MAT[m], 1, 1.4, 0.92);
    if (m === 'glass') for (let i = 0; i < 4; i++) tone({ f0: rnd(2500, 6000), dur: rnd(0.08, 0.2), gain: 0.04, delay: i * rnd(0.02, 0.06) });
  };
  SYN['place_' + m] = () => layers(MAT[m], 0.8, 1, 1.12);
});
SYN.lava_pop = () => layers(LAVA, 1, 1, rnd(0.8, 1.3));
SYN.water_splash = () => layers(WATER, 1, 1, rnd(0.9, 1.15));

ROLES.forEach((r) => {
  SYN['villager_' + r] = () => villager(r);
});
['hmm', 'huh', 'hrm'].forEach((v) => {
  SYN['villager_' + v] = (o) => villager(o.role && VILL[o.role] ? o.role : pick(ROLES), v);
});

SYN.mob_cow = () => voice({ f: [105, 125, 85], v: ['u', 'o', 'u'], dur: 0.95, gain: 0.22, vib: [5, 15] });
SYN.mob_sheep = () => voice({ f: [360, 330, 350], v: ['ae', 'a', 'ae'], dur: 0.55, gain: 0.2, vib: [24, 120], q: 5 });
SYN.mob_cat = () => voice({ f: [480, 880, 520], v: ['m', 'ae', 'o'], dur: 0.55, gain: 0.18, vib: [6, 20] });
SYN.mob_chicken = () => {
  for (let i = 0; i < 4; i++) voice({ type: 'square', f: [800, 650], v: ['a', 'e'], dur: 0.07, gain: 0.12, delay: i * 0.1 });
};
SYN.mob_pig = () => {
  voice({ f: [170, 250, 140], v: ['o', 'ae', 'o'], dur: 0.32, gain: 0.2, vib: [28, 50] });
  voice({ f: [150, 200, 130], v: ['o', 'ae', 'o'], dur: 0.25, gain: 0.16, vib: [28, 50], delay: 0.36 });
  burst({ dur: 0.12, gain: 0.12, freq: 900, type: 'bandpass', q: 1.2, delay: 0.6 });
};
SYN.mob_ghast = () => {
  voice({ f: [520, 880, 640, 1100, 420], v: ['ae', 'i', 'ae', 'a'], dur: 1.7, gain: 0.2, vib: [5.5, 35], rv: true, breath: 0.04, q: 7 });
  tone({ f0: 220, f1: 110, dur: 1.7, gain: 0.05, rv: true, attack: 0.3 });
};
SYN.mob_blaze = () => {
  burst({ dur: 0.55, gain: 0.2, freq: 900, type: 'bandpass', q: 0.9, sweep: 2.2 });
  burst({ dur: 0.6, gain: 0.16, freq: 2000, type: 'bandpass', q: 0.9, sweep: 0.45, delay: 0.6 });
  for (let i = 0; i < 4; i++) burst({ dur: 0.02, gain: 0.12, freq: rnd(3000, 5500), type: 'highpass', delay: rnd(0, 1.1) });
  tone({ type: 'sawtooth', f0: 120, f1: 70, dur: 0.5, gain: 0.03 });
};
SYN.mob_piglin = () => {
  burst({ dur: 0.1, gain: 0.14, freq: 700, type: 'bandpass', q: 1.2 });
  voice({ f: [150, 125, 135], v: ['o', 'a', 'o'], dur: 0.3, gain: 0.2, vib: [30, 60], delay: 0.05 });
  voice({ f: [140, 110, 120], v: ['o', 'a', 'o'], dur: 0.28, gain: 0.17, vib: [30, 60], delay: 0.38 });
};
SYN.mob_strider = () => voice({ type: 'triangle', f: [900, 1250, 800, 1300, 850], v: ['i', 'e', 'i', 'e'], dur: 0.55, gain: 0.2, vib: [17, 420], q: 4 });
SYN.mob_skeleton = () => {
  let d = 0;
  for (let i = 0; i < 7; i++) {
    burst({ dur: 0.035, gain: 0.25, freq: rnd(2400, 4200), type: 'bandpass', q: 5, delay: d });
    if (i % 2 === 0) tone({ f0: rnd(1500, 2200), dur: 0.03, gain: 0.04, delay: d });
    d += rnd(0.03, 0.06);
  }
};
SYN.mob_golem = () => {
  voice({ type: 'square', f: [70, 45], v: ['o'], dur: 0.5, gain: 0.25 });
  burst({ dur: 0.3, gain: 0.15, freq: 200, type: 'lowpass' });
};
SYN.mob_slime = () => {
  tone({ f0: 200, f1: 420, dur: 0.18, gain: 0.12 });
  tone({ f0: 420, f1: 180, dur: 0.2, gain: 0.1, delay: 0.16 });
};

SYN.ui_click = () => {
  tone({ type: 'square', f0: 760, f1: 420, dur: 0.045, gain: 0.06 });
  tone({ type: 'triangle', f0: 1500, f1: 900, dur: 0.03, gain: 0.03 });
  burst({ dur: 0.025, gain: 0.05, freq: 3500, type: 'highpass' });
};
SYN.ui_hover = () => tone({ f0: 2200, f1: 2600, dur: 0.02, gain: 0.012 });
SYN.inventory_open = () => {
  burst({ dur: 0.14, gain: 0.07, freq: 1800, type: 'bandpass', q: 0.8, sweep: 1.8 });
  tone({ type: 'triangle', f0: 520, f1: 700, dur: 0.07, gain: 0.05, delay: 0.05 });
};
SYN.inventory_close = () => {
  burst({ dur: 0.12, gain: 0.07, freq: 2400, type: 'bandpass', q: 0.8, sweep: 0.5 });
  tone({ type: 'triangle', f0: 700, f1: 480, dur: 0.07, gain: 0.05, delay: 0.04 });
};
SYN.chest_open = () => {
  tone({ type: 'sawtooth', f0: 80, f1: 200, dur: 0.4, gain: 0.04 });
  burst({ dur: 0.4, gain: 0.07, freq: 700, type: 'bandpass', q: 6, sweep: 3 });
  burst({ dur: 0.02, gain: 0.15, freq: 2500, type: 'bandpass', q: 2, delay: 0.38 });
  tone({ f0: 180, f1: 120, dur: 0.15, gain: 0.1, delay: 0.42 });
};
SYN.chest_close = () => {
  tone({ type: 'sawtooth', f0: 200, f1: 90, dur: 0.22, gain: 0.03 });
  burst({ dur: 0.1, gain: 0.3, freq: 300, type: 'lowpass', delay: 0.2 });
  tone({ type: 'triangle', f0: 160, f1: 80, dur: 0.12, gain: 0.12, delay: 0.2 });
  burst({ dur: 0.02, gain: 0.15, freq: 2200, type: 'bandpass', q: 2, delay: 0.3 });
};
const PENT = [0, 2, 4, 7, 9, 12, 14, 16];
SYN.xp_orb = () => {
  const f = 700 * 2 ** (pick(PENT) / 12);
  tone({ f0: f, f1: f * 1.5, dur: 0.1, gain: 0.1 });
  tone({ type: 'triangle', f0: f * 2, f1: f * 3, dur: 0.08, gain: 0.04, delay: 0.05 });
};
SYN.level_up = () => [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => bell(f, i * 0.1, 0.08));
SYN.advancement = () => {
  [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => bell(f, i * 0.12, 0.08, 2));
  [659.25, 987.77, 1318.5].forEach((f) => bell(f, 0.55, 0.07, 2));
  burst({ dur: 0.35, gain: 0.05, freq: 6000, type: 'highpass', delay: 0.55, rv: true });
};
SYN.portal = () => {
  const t = ctx.currentTime + cur.d;
  tone({ type: 'sawtooth', f0: 60, f1: 380, dur: 1.4, gain: 0.07, attack: 0.6 });
  tone({ f0: 90, f1: 560, dur: 1.4, gain: 0.1, attack: 0.5, detune: 14 });
  tone({ f0: 40, f1: 70, dur: 2.6, gain: 0.22, attack: 1.2 }); // the deep swell
  tone({ type: 'sawtooth', f0: 380, f1: 80, dur: 1.3, gain: 0.06, delay: 1.4 });
  tone({ f0: 560, f1: 110, dur: 1.2, gain: 0.08, delay: 1.4 });
  burst({ dur: 2.4, gain: 0.22, freq: 300, type: 'bandpass', q: 1.5, sweep: 10 });
  burst({ dur: 2.4, gain: 0.07, freq: 4000, type: 'highpass', q: 0.7, sweep: 1.5, rv: true });
  if (!room(false, false)) return;
  // shimmer: a bright triangle with a fast tremolo
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  const g = ctx.createGain();
  const osc = ctx.createOscillator();
  lfo.frequency.value = 9;
  lg.gain.value = 0.02;
  g.gain.value = 0.03;
  lfo.connect(lg).connect(g.gain);
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1500, t);
  osc.frequency.exponentialRampToValueAtTime(3200, t + 2.4);
  osc.connect(g).connect(sfx);
  osc.onended = dec;
  vc++;
  lfo.start(t);
  osc.start(t);
  lfo.stop(t + 2.5);
  osc.stop(t + 2.5);
};
SYN.portal_arrive = () => {
  [523.25, 783.99, 1174.66].forEach((f, i) => bell(f, i * 0.06, 0.08));
  burst({ dur: 0.9, gain: 0.05, freq: 5000, type: 'highpass', rv: true });
  tone({ f0: 80, f1: 50, dur: 1.2, gain: 0.12, attack: 0.05 });
};

/** Every logical sound name, for docs and tooling. */
export const soundNames = () => Object.keys(SYN);

/* ---------------------------------------------------------------- optional owner-supplied audio */

function run(fn, g, p, d, bus, far, o) {
  cur.g = g;
  cur.p = p;
  cur.d = d;
  cur.bus = bus;
  cur.far = far;
  fn(o);
  cur.bus = null;
  cur.far = false;
  cur.d = 0;
}

const safePath = (s) => typeof s === 'string' && s.length < 200 && !/^[a-z]+:|^[/\\]|\.\.|\\/i.test(s);

// public/sounds/manifest.json (optional) maps logical names to audio files the owner supplied
async function loadSamples() {
  if (sampleState) return;
  sampleState = 1;
  try {
    const r = await window.fetch('./sounds/manifest.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('none');
    const man = await r.json();
    let count = 0;
    for (const name of Object.keys(man)) {
      if (name[0] === '_' || name[0] === '$' || count >= 256) continue;
      const m = man[name];
      const files = (typeof m === 'string' ? [m] : Array.isArray(m) ? m : m && (m.files || [m.file])) || [];
      const bufs = [];
      for (const f of files) {
        if (!safePath(f) || count >= 256) continue;
        count++;
        try {
          const res = await window.fetch('./sounds/' + f);
          if (res.ok) bufs.push(await ctx.decodeAudioData(await res.arrayBuffer()));
        } catch {
          /* skip an unreadable file */
        }
      }
      if (bufs.length) {
        const meta = m && typeof m === 'object' && !Array.isArray(m) ? m : {};
        samples[name] = { b: bufs, vol: Math.min(2, Math.max(0, +meta.volume || 1)), pv: Math.min(0.3, Math.max(0, +meta.pitchVariance || 0)) };
      }
    }
  } catch {
    /* no override file: the synth is used */
  }
  sampleState = 2;
}

function playSample(s, o) {
  if (!room(false, false)) return;
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  src.buffer = pick(s.b);
  src.playbackRate.value = (o.pitch || 1) * rnd(1 - s.pv, 1 + s.pv);
  g.gain.value = s.vol * (o.gain ?? 1);
  src.connect(g).connect(sfx);
  src.onended = dec;
  vc++;
  src.start(ctx.currentTime + (o.delay || 0));
}

const GAP = { ui_hover: 0.06, xp_orb: 0.04 };
const NONE = {};

/**
 * Plays a logical sound by name. opts: gain (multiplier), pitch (multiplier), delay (seconds),
 * role (for villager_hmm/huh/hrm). Returns false if nothing played.
 */
export function playSound(name, opts = NONE) {
  if (!live()) return false;
  const now = ctx.currentTime;
  const gap = name.startsWith('step_') ? 0.12 : GAP[name] || 0;
  if (gap) {
    if (now - (last[name] || 0) < gap) return false;
    last[name] = now;
  }
  const s = samples[name];
  if (s) {
    playSample(s, opts);
    return true;
  }
  const fn = SYN[name];
  if (!fn) return false;
  run(fn, opts.gain ?? 1, (opts.pitch || 1) * rnd(0.96, 1.04), opts.delay || 0, null, false, opts);
  return true;
}

/* ---------------------------------------------------------------- legacy and convenience exports */

const groundSound = (kind, ground, fallback) => {
  const m = material(ground, fallback);
  return m === 'water' ? 'water_splash' : m === 'lava' ? 'lava_pop' : kind + '_' + m;
};

/** The soft "tock" of pressing a button. */
export const uiClick = () => playSound('ui_click');
/** A very quiet tick for hovering a button. */
export const uiHover = () => playSound('ui_hover');
/** A footstep. The ground decides the sound. */
export const stepSound = (ground = 'grass') => playSound(groundSound('step', ground, 'grass'));
/** Digging a block out. */
export const blockSound = (ground = 'stone') => playSound(groundSound('dig', ground, 'stone'));
/** Placing a block back. */
export const placeSound = (ground = 'stone') => playSound(groundSound('place', ground, 'stone'));
/** Collecting an experience orb. */
export const orbSound = () => playSound('xp_orb');
/** The chime for finishing loading or unlocking something. */
export const levelUpSound = () => playSound('level_up');
/** The toast jingle for an advancement. */
export const advancementSound = () => playSound('advancement');
/** Opens (default) or closes a chest. */
export const chestSound = (open = true) => playSound(open ? 'chest_open' : 'chest_close');
/** Opens or closes an inventory panel. */
export const inventorySound = (open = true) => playSound(open ? 'inventory_open' : 'inventory_close');
/** The portal trip, with the arrival chime at the end (pass false to leave it out). */
export function portalSound(arrive = true) {
  const ok = playSound('portal');
  if (arrive) playSound('portal_arrive', { delay: 2.4 });
  return ok;
}

const ROLE_RE = [
  [/farm/i, 'farmer'],
  [/smith/i, 'blacksmith'],
  [/librar|scholar/i, 'librarian'],
  [/merchant|trader|shop/i, 'merchant'],
  [/guard|sentry/i, 'guard'],
  [/cleric|priest|monk/i, 'cleric'],
  [/kid|child|young/i, 'child'],
];
const MOBS = [
  [/Cat|Whisker/, 'mob_cat'],
  [/Woolly|Sheep/, 'mob_sheep'],
  [/Cow/, 'mob_cow'],
  [/Pig|Hog/, 'mob_pig'],
  [/Chick|Hen|Peeper|Skylark/, 'mob_chicken'],
  [/Sentinel|Golem/, 'mob_golem'],
  [/Jelly|Slime/, 'mob_slime'],
  [/Archer|Skeleton/, 'mob_skeleton'],
  [/Flame|Cage|Wisp|Blaze/, 'mob_blaze'],
  [/Ghast/, 'mob_ghast'],
  [/Strider/, 'mob_strider'],
  [/Raider|Brute|Piglin/, 'mob_piglin'],
];

/** A creature's voice when poked. `role` optionally forces a villager role. */
export function mobSound(name = '', kind, role) {
  for (let i = 0; i < MOBS.length; i++) if (MOBS[i][0].test(name)) return playSound(MOBS[i][1]);
  if (kind === 'hostile') return playSound('mob_piglin');
  let r = role;
  if (!VILL[r]) for (let i = 0; i < ROLE_RE.length; i++) if (ROLE_RE[i][0].test(name)) r = ROLE_RE[i][1];
  return playSound('villager_' + (VILL[r] ? r : pick(ROLES)));
}

/* ---------------------------------------------------------------- music and ambience */

function piano(f, delay, g) {
  const o = { bus: music, delay: delay + rnd(-0.02, 0.03), hi: true };
  tone({ ...o, f0: f, dur: 3.4, gain: g, attack: 0.008 });
  tone({ ...o, f0: f * 2, dur: 1.8, gain: g * 0.3, attack: 0.006 });
  tone({ ...o, type: 'triangle', f0: f * 3, dur: 0.7, gain: g * 0.1, attack: 0.004 });
  burst({ bus: music, dur: 0.03, gain: g * 0.5, freq: 1800, delay: o.delay, hi: true });
}

const CHORDS = {
  overworld: [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [62, 65, 69, 74]],
  nether: [[45, 52, 57, 60], [41, 48, 53, 57], [50, 53, 57, 62], [43, 50, 55, 59], [40, 47, 52, 55]],
};
let chord = 0;

function playPhrase() {
  const ow = world === 'overworld';
  const set = CHORDS[ow ? 'overworld' : 'nether'];
  chord = (chord + 1 + Math.floor(rnd(0, 3))) % set.length;
  const c = set[chord];
  const n = ow ? Math.floor(rnd(4, 7)) : Math.floor(rnd(3, 5));
  let at = 0;
  for (let k = 0; k < n; k++) {
    piano(mtof(k === 0 && !ow ? c[0] - 12 : pick(c)), at, (ow ? 0.1 : 0.13) * rnd(0.8, 1.1));
    at += ow ? rnd(0.6, 1.2) : rnd(1.4, 2.6);
  }
  if (ow && Math.random() < 0.5) piano(mtof(c[0] + 12 + pick([2, 4, 7, 9])), at + 0.4, 0.07);
}

function birds() {
  const f = rnd(2400, 4200);
  const n = Math.floor(rnd(2, 5));
  for (let k = 0; k < n; k++) tone({ f0: f, f1: f * rnd(1.15, 1.4), dur: 0.07, gain: 0.025, delay: k * 0.12 + rnd(0, 0.03) });
}
const farAnimal = () => SYN[pick(['mob_cow', 'mob_sheep'])]();
const farWail = () => SYN.mob_ghast();
function crackle() {
  const n = Math.floor(rnd(1, 4));
  for (let i = 0; i < n; i++) burst({ dur: 0.015, gain: 0.05, freq: rnd(2500, 6000), type: 'highpass', delay: rnd(0, 0.3) });
  if (Math.random() < 0.3) SYN.lava_pop();
}
const whisper = () => burst({ dur: 1.4, gain: 0.03, freq: rnd(1800, 3200), type: 'bandpass', q: 8, sweep: 0.5, rv: true });

// the fixed beds: nodes made once per start, not per event
function bedNoise(type, freq, q, g, lHz, lHzAmt, lGain) {
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const gn = ctx.createGain();
  src.buffer = noise();
  src.loop = true;
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  gn.gain.value = g;
  src.connect(f).connect(gn).connect(bedGain);
  src.start(0, rnd(0, 1));
  bed.push(src);
  if (lHz) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = lHz;
    if (lHzAmt) {
      const a = ctx.createGain();
      a.gain.value = lHzAmt;
      lfo.connect(a).connect(f.frequency);
    }
    if (lGain) {
      const b = ctx.createGain();
      b.gain.value = g * lGain;
      lfo.connect(b).connect(gn.gain);
    }
    lfo.start();
    bed.push(lfo);
  }
}

function startBed() {
  bedGain = ctx.createGain();
  bedGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  bedGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5);
  bedGain.connect(amb);
  if (world === 'overworld') {
    bedNoise('bandpass', 420, 0.6, 0.05, 0.09, 260, 0.4); // wind
    bedNoise('highpass', 4200, 0.5, 0.012, 0.23, 0, 0.8); // leaves
  } else {
    // a low breathing drone and a dark rumble
    const lp = ctx.createBiquadFilter();
    const dg = ctx.createGain();
    lp.type = 'lowpass';
    lp.frequency.value = 140;
    dg.gain.value = 0.05;
    lp.connect(dg).connect(bedGain);
    [['sawtooth', 55], ['sawtooth', 55.4], ['sine', 27.5]].forEach(([type, f]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(lp);
      o.start();
      bed.push(o);
    });
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.1;
    lg.gain.value = 0.03;
    lfo.connect(lg).connect(dg.gain);
    lfo.start();
    bed.push(lfo);
    bedNoise('lowpass', 220, 0.5, 0.06, 0.13, 60, 0.6);
  }
}

function stopBed() {
  if (!bedGain) return;
  const t = ctx.currentTime;
  bedGain.gain.cancelScheduledValues(t);
  bedGain.gain.setValueAtTime(bedGain.gain.value, t);
  bedGain.gain.linearRampToValueAtTime(0.0001, t + 0.8);
  bed.forEach((n) => n.stop(t + 0.9));
  bed = [];
  bedGain = null;
}

function stopTimers() {
  timers.forEach((l) => clearTimeout(l.id));
  timers = [];
}

// a self-rearming event loop; seconds between runs are random in [a, b]
function loop(fn, a, b, first, g = 1, bus = null, far = false) {
  const l = { id: 0 };
  timers.push(l);
  const go = () => {
    if (!live()) return;
    run(fn, g, 1, 0, bus, far);
    l.id = setTimeout(go, rnd(a, b) * 1000);
  };
  l.id = setTimeout(go, first * 1000);
}

function start() {
  stopTimers();
  stopBed();
  if (!live()) return;
  startBed();
  if (world === 'overworld') {
    loop(playPhrase, 16, 34, 3);
    loop(birds, 3, 9, 1, 1, amb);
    loop(farAnimal, 25, 55, 12, 0.3, amb, true);
  } else {
    loop(playPhrase, 18, 40, 4);
    loop(crackle, 0.25, 1.1, 0.3, 1, amb);
    loop(farWail, 22, 50, 15, 0.25, amb, true);
    loop(whisper, 9, 22, 6, 1, amb);
  }
}

function onVisibility() {
  hidden = document.hidden;
  if (!ctx) return;
  if (hidden) {
    stopTimers();
    stopBed();
    void ctx.suspend();
  } else if (enabled) {
    ctx.resume().then(start, () => {});
  }
}

/** Which world the score and ambience belong to. */
export function setSoundWorld(name) {
  world = name;
  if (enabled && ctx) start();
}

/** Master volume 0..1, remembered between visits. */
export function setVolume(v) {
  vol = Math.min(1, Math.max(0, +v || 0));
  if (master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(vol, ctx.currentTime, 0.05);
  }
  try {
    localStorage.setItem('portfolio-volume', String(vol));
  } catch {
    /* remembered only for this visit */
  }
  return vol;
}
export const getVolume = () => vol;

/** Balance of one layer ('sfx', 'music' or 'ambient'), 0..1. Not persisted. */
export function setMixVolume(layer, v) {
  const b = layer === 'music' ? music : layer === 'ambient' ? amb : sfx;
  if (b) b.gain.setTargetAtTime(Math.min(1, Math.max(0, +v || 0)), ctx.currentTime, 0.05);
}

/** Turns all sound on or off. Must be called from a click or key press the first time. */
export async function setAmbient(on) {
  if (typeof AudioContext === 'undefined') return false;
  if (on) {
    if (!ctx) build();
    await ctx.resume();
    enabled = true;
    mute.gain.cancelScheduledValues(ctx.currentTime);
    mute.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    loadSamples();
    start();
    try {
      localStorage.setItem('portfolio-sound', 'on');
    } catch {
      /* remembered only for this visit */
    }
    return true;
  }
  enabled = false;
  stopTimers();
  if (ctx) {
    stopBed();
    mute.gain.cancelScheduledValues(ctx.currentTime);
    mute.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }
  try {
    localStorage.setItem('portfolio-sound', 'off');
  } catch {
    /* remembered only for this visit */
  }
  return false;
}

export const soundWanted = () => {
  try {
    return localStorage.getItem('portfolio-sound') === 'on';
  } catch {
    return false;
  }
};
export const soundIsOn = () => enabled;
