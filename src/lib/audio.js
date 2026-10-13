/**
 * Optional ambient sound, synthesised with the Web Audio API so no audio file ships.
 * It is never started without an explicit user click.
 */
let ctx = null;
let master = null;
let nodes = [];

function build() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const drone = (freq, gain, detune) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = gain;
    osc.connect(g).connect(master);
    osc.start();
    return osc;
  };
  const low = drone(55, 0.5, 0);
  const mid = drone(82.4, 0.28, 7);
  const high = drone(110, 0.14, -9);

  // Slow breathing, like distant lava.
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.35;
  lfo.connect(lfoGain).connect(master.gain);
  lfo.start();
  nodes = [low, mid, high, lfo];
}

export async function setAmbient(on) {
  if (typeof AudioContext === 'undefined') return false;
  if (on) {
    if (!ctx) build();
    await ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1.5);
    return true;
  }
  if (ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    const old = ctx;
    setTimeout(() => {
      if (old !== ctx) return;
      nodes.forEach((n) => n.stop());
      nodes = [];
      ctx.close();
      ctx = null;
    }, 800);
  }
  return false;
}

/** A short synthesised voice for a poked creature. Silent unless the visitor turned sound on. */
export function mobSound(name, kind) {
  if (!ctx || !master || master.gain.value < 0.01) return;
  const t = ctx.currentTime;
  const voice = (type, f0, f1, dur, gain, delay = 0) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t + delay);
    osc.frequency.exponentialRampToValueAtTime(f1, t + delay + dur);
    g.gain.setValueAtTime(0.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(gain, t + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t + delay);
    osc.stop(t + delay + dur + 0.05);
  };
  if (/Cat/.test(name)) voice('triangle', 520, 900, 0.35, 0.18), voice('triangle', 900, 460, 0.3, 0.14, 0.3);
  else if (/Woolly/.test(name)) voice('sawtooth', 340, 300, 0.55, 0.08);
  else if (/Cow/.test(name)) voice('sawtooth', 130, 95, 0.7, 0.12);
  else if (/Peeper|Skylark/.test(name)) voice('square', 1500, 2200, 0.08, 0.05), voice('square', 2200, 1700, 0.08, 0.05, 0.1);
  else if (/Sentinel/.test(name)) voice('square', 70, 45, 0.5, 0.15);
  else if (kind === 'hostile') voice('sawtooth', 190, 80, 0.35, 0.1);
  else voice('triangle', 250, 190, 0.18, 0.16), voice('triangle', 300, 220, 0.2, 0.14, 0.16);
}

/** A low rising whoosh for the portal trip. Silent unless sound is on. */
export function portalSound() {
  if (!ctx || !master || master.gain.value < 0.01) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(70, t);
  osc.frequency.exponentialRampToValueAtTime(420, t + 1.3);
  osc.frequency.exponentialRampToValueAtTime(90, t + 2.6);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.08, t + 1.2);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 2.7);
}

/** A dull crunch for a block being dug out. Silent unless sound is on. */
export function blockSound() {
  if (!ctx || !master || master.gain.value < 0.01) return;
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  const g = ctx.createGain();
  g.gain.value = 0.35;
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start(t);
}
