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
