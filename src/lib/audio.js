/**
 * All sound is synthesised with the Web Audio API, so no audio file ships and nothing from the
 * game's own soundtrack or effects is copied. It never starts without a click or key press from
 * the visitor. The effects are game-style: block clicks, footsteps that change with the ground,
 * digging, creature voices, the portal whoosh, and a slow generative piano-and-drone score that
 * changes with the world.
 */
let ctx = null;
let out = null; // master gain
let sfx = null;
let music = null;
let amb = null;
let reverb = null;
let enabled = false;
let world = 'nether';
let noiseBuf = null;
let timers = [];
let lastStep = 0;

const rnd = (a, b) => a + Math.random() * (b - a);

function noise() {
  if (noiseBuf) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function build() {
  ctx = new AudioContext();
  out = ctx.createGain();
  out.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  out.connect(comp).connect(ctx.destination);
  sfx = ctx.createGain();
  sfx.gain.value = 0.9;
  music = ctx.createGain();
  music.gain.value = 0.55;
  amb = ctx.createGain();
  amb.gain.value = 0.5;
  // a soft room reverb made from decaying noise
  const len = ctx.sampleRate * 2.6;
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  reverb = ctx.createConvolver();
  reverb.buffer = ir;
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  reverb.connect(wet).connect(out);
  sfx.connect(out);
  music.connect(out);
  music.connect(reverb);
  amb.connect(out);
}

/* ---------------------------------------------------------------- building blocks */

function tone({ type = 'sine', f0, f1 = f0, dur, gain, delay = 0, bus = sfx, attack = 0.01, detune = 0 }) {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function burst({ dur, gain, freq, q = 0.8, type = 'lowpass', delay = 0, bus = sfx, sweep = 0 }) {
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noise();
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * sweep), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

const live = () => enabled && ctx && ctx.state !== 'closed';

/* ---------------------------------------------------------------- effects */

/** The soft "tock" of pressing a button. */
export function uiClick() {
  if (!live()) return;
  tone({ type: 'square', f0: 520, f1: 330, dur: 0.05, gain: 0.07 });
  burst({ dur: 0.04, gain: 0.05, freq: 1800, type: 'highpass' });
}

/** A footstep. The ground decides the sound: grass and dirt are soft, stone and brick are sharp. */
export function stepSound(ground = 'grass') {
  if (!live()) return;
  const now = ctx.currentTime;
  if (now - lastStep < 0.12) return;
  lastStep = now;
  if (ground === 'stone') {
    burst({ dur: 0.07, gain: 0.3, freq: 2200, type: 'bandpass', q: 1.6 });
    tone({ type: 'triangle', f0: 190, f1: 110, dur: 0.07, gain: 0.07 });
  } else if (ground === 'wood') {
    tone({ type: 'triangle', f0: 260, f1: 140, dur: 0.09, gain: 0.1 });
    burst({ dur: 0.05, gain: 0.12, freq: 1400, type: 'bandpass', q: 1.2 });
  } else if (ground === 'sand') {
    burst({ dur: 0.11, gain: 0.18, freq: 3200, type: 'highpass', q: 0.5 });
  } else {
    burst({ dur: 0.1, gain: 0.26, freq: 700 + rnd(-80, 120), type: 'lowpass', q: 0.9 });
  }
}

/** Digging a block out. */
export function blockSound(ground = 'stone') {
  if (!live()) return;
  if (ground === 'stone') {
    burst({ dur: 0.16, gain: 0.45, freq: 2400, type: 'bandpass', q: 1.2 });
    tone({ type: 'square', f0: 160, f1: 70, dur: 0.12, gain: 0.07 });
  } else if (ground === 'wood') {
    tone({ type: 'triangle', f0: 300, f1: 120, dur: 0.14, gain: 0.16 });
    burst({ dur: 0.1, gain: 0.2, freq: 1500, type: 'bandpass', q: 1 });
  } else {
    burst({ dur: 0.2, gain: 0.4, freq: 900, type: 'lowpass', q: 0.7 });
    burst({ dur: 0.08, gain: 0.15, freq: 3000, type: 'highpass', delay: 0.02 });
  }
}

/** Placing a block back. */
export function placeSound(ground = 'stone') {
  if (!live()) return;
  burst({ dur: 0.1, gain: 0.35, freq: ground === 'stone' ? 1800 : 800, type: 'bandpass', q: 1 });
  tone({ type: 'triangle', f0: 220, f1: 150, dur: 0.08, gain: 0.08 });
}

/** The little bright blip of collecting an experience orb. */
export function orbSound() {
  if (!live()) return;
  const f = rnd(900, 1500);
  tone({ type: 'sine', f0: f, f1: f * 1.5, dur: 0.12, gain: 0.1 });
  tone({ type: 'sine', f0: f * 1.5, f1: f * 2, dur: 0.1, gain: 0.07, delay: 0.07 });
}

/** The chime for finishing loading or unlocking something. */
export function levelUpSound() {
  if (!live()) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.35, gain: 0.1, delay: i * 0.09, bus: music }));
}

/** A chest opening: a slow creak, then a soft thud. */
export function chestSound() {
  if (!live()) return;
  tone({ type: 'sawtooth', f0: 90, f1: 210, dur: 0.35, gain: 0.05 });
  burst({ dur: 0.3, gain: 0.08, freq: 600, type: 'bandpass', q: 3, sweep: 3 });
  burst({ dur: 0.1, gain: 0.3, freq: 300, type: 'lowpass', delay: 0.36 });
}

/** A creature's voice when poked. Each kind has its own pitch and shape. */
export function mobSound(name, kind) {
  if (!live()) return;
  const v = (type, f0, f1, dur, gain, delay = 0) => tone({ type, f0, f1, dur, gain, delay });
  if (/Cat|Whisker/.test(name)) { v('triangle', 520, 900, 0.3, 0.14); v('triangle', 900, 460, 0.3, 0.12, 0.28); }
  else if (/Woolly/.test(name)) { v('sawtooth', 340, 300, 0.5, 0.07); v('sawtooth', 300, 330, 0.3, 0.06, 0.3); }
  else if (/Cow/.test(name)) v('sawtooth', 130, 90, 0.7, 0.11);
  else if (/Peeper|Skylark/.test(name)) { v('square', 1500, 2200, 0.08, 0.05); v('square', 2200, 1700, 0.08, 0.05, 0.1); }
  else if (/Sentinel/.test(name)) { v('square', 70, 45, 0.5, 0.14); burst({ dur: 0.3, gain: 0.15, freq: 200, type: 'lowpass' }); }
  else if (/Jelly/.test(name)) { v('sine', 200, 420, 0.18, 0.12); v('sine', 420, 180, 0.2, 0.1, 0.16); }
  else if (/Archer/.test(name)) { burst({ dur: 0.05, gain: 0.3, freq: 2800, type: 'bandpass', q: 3 }); burst({ dur: 0.05, gain: 0.3, freq: 2400, type: 'bandpass', q: 3, delay: 0.07 }); burst({ dur: 0.05, gain: 0.25, freq: 3000, type: 'bandpass', q: 3, delay: 0.14 }); }
  else if (/Flame|Cage|Wisp/.test(name)) { burst({ dur: 0.5, gain: 0.22, freq: 1200, type: 'bandpass', q: 0.6, sweep: 0.3 }); v('sawtooth', 300, 120, 0.4, 0.05); }
  else if (/Raider|Brute/.test(name)) { v('sawtooth', 150, 80, 0.3, 0.1); v('sawtooth', 130, 70, 0.25, 0.09, 0.22); }
  else if (kind === 'hostile') v('sawtooth', 190, 80, 0.35, 0.1);
  else { v('triangle', 250, 190, 0.18, 0.15); v('triangle', 300, 220, 0.2, 0.13, 0.16); } // a villager-ish "hmm"
}

/** The portal: a rising, wobbling hum, a deep swell, and a bright rush as it completes. */
export function portalSound() {
  if (!live()) return;
  const t = ctx.currentTime;
  tone({ type: 'sawtooth', f0: 60, f1: 380, dur: 1.4, gain: 0.09, attack: 0.6 });
  tone({ type: 'sine', f0: 90, f1: 560, dur: 1.4, gain: 0.1, attack: 0.5, detune: 14 });
  tone({ type: 'sawtooth', f0: 380, f1: 80, dur: 1.3, gain: 0.07, delay: 1.4 });
  tone({ type: 'sine', f0: 560, f1: 110, dur: 1.2, gain: 0.08, delay: 1.4 });
  burst({ dur: 2.6, gain: 0.25, freq: 400, type: 'bandpass', q: 0.7, sweep: 6 });
  // wobble
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  lg.gain.value = 0.03;
  lfo.frequency.value = 6;
  const g = ctx.createGain();
  g.gain.value = 0.06;
  lfo.connect(lg).connect(g.gain);
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.linearRampToValueAtTime(190, t + 2.6);
  osc.connect(g).connect(sfx);
  lfo.start(t);
  osc.start(t);
  lfo.stop(t + 2.7);
  osc.stop(t + 2.7);
}

/* ---------------------------------------------------------------- music and ambience */

// Slow piano-like notes: a sine with a soft attack, a quiet octave above, and a long tail.
function pianoNote(freq, delay, gain = 0.12) {
  tone({ type: 'sine', f0: freq, dur: 3.2, gain, delay, bus: music, attack: 0.02 });
  tone({ type: 'triangle', f0: freq * 2, dur: 1.6, gain: gain * 0.22, delay, bus: music, attack: 0.01 });
}

const OVERWORLD_SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
const NETHER_SCALE = [110, 123.47, 130.81, 164.81, 174.61, 220, 246.94];

function playPhrase() {
  if (!live()) return;
  const scale = world === 'overworld' ? OVERWORLD_SCALE : NETHER_SCALE;
  const n = world === 'overworld' ? Math.floor(rnd(3, 6)) : Math.floor(rnd(2, 4));
  let i = Math.floor(rnd(0, scale.length));
  let at = 0;
  for (let k = 0; k < n; k++) {
    pianoNote(scale[i], at, world === 'overworld' ? 0.11 : 0.14);
    i = Math.max(0, Math.min(scale.length - 1, i + Math.round(rnd(-2, 2))));
    at += world === 'overworld' ? rnd(0.7, 1.5) : rnd(1.6, 3);
  }
  timers.push(setTimeout(playPhrase, rnd(14000, 32000)));
}

function ambientLoop() {
  if (!live()) return;
  if (world === 'overworld') {
    // wind and the odd bird
    burst({ dur: 4, gain: 0.025, freq: 500, type: 'bandpass', q: 0.4, bus: amb, sweep: 1.8 });
    if (Math.random() < 0.7) {
      const f = rnd(2400, 3600);
      for (let k = 0; k < 3; k++) tone({ type: 'sine', f0: f, f1: f * 1.25, dur: 0.07, gain: 0.025, delay: rnd(0, 0.5) + k * 0.12, bus: amb });
    }
  } else {
    // a low rumble, lava pops and a far-off wail
    burst({ dur: 4, gain: 0.05, freq: 160, type: 'lowpass', q: 0.5, bus: amb, sweep: 0.6 });
    if (Math.random() < 0.8) burst({ dur: 0.12, gain: 0.12, freq: rnd(300, 600), type: 'bandpass', q: 4, bus: amb, delay: rnd(0, 3) });
    if (Math.random() < 0.25) tone({ type: 'sawtooth', f0: rnd(240, 330), f1: rnd(120, 180), dur: 1.6, gain: 0.025, bus: amb, attack: 0.5 });
  }
  timers.push(setTimeout(ambientLoop, world === 'overworld' ? 3800 : 3000));
}

function startScore() {
  timers.forEach(clearTimeout);
  timers = [setTimeout(playPhrase, 2500), setTimeout(ambientLoop, 300)];
}

/** Which world the score and ambience belong to. */
export function setSoundWorld(name) {
  world = name;
  if (enabled && ctx) startScore();
}

/** Turns all sound on or off. Must be called from a click or key press the first time. */
export async function setAmbient(on) {
  if (typeof AudioContext === 'undefined') return false;
  if (on) {
    if (!ctx) build();
    await ctx.resume();
    enabled = true;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.2);
    startScore();
    try {
      localStorage.setItem('portfolio-sound', 'on');
    } catch {
      /* remembered only for this visit */
    }
    return true;
  }
  enabled = false;
  timers.forEach(clearTimeout);
  timers = [];
  if (ctx) {
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
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
