/**
 * Original Web Audio SFX — pure synthesis, no sample files.
 *
 * AudioSys.play(name) keys:
 *   cookie, fizzy, jump, land, burp, guardHit, bark, sizzle,
 *   mash, crush, hurt, die, levelClear, win, click, select, gameOver
 *
 * Named methods (jump, land, cookie, …) remain for existing call sites.
 */
const AudioSys = (() => {
  let ctx = null;
  let master = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function unlock() {
    ensure();
  }

  /* ── primitives ─────────────────────────────────────────── */

  function osc(freq, dur, type, vol, opts) {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (opts && opts.slide != null) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(20, freq + opts.slide),
        t + dur
      );
    }
    if (opts && opts.slideLin != null) {
      o.frequency.linearRampToValueAtTime(freq + opts.slideLin, t + dur);
    }
    const peak = Math.max(0.001, vol);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.015, dur * 0.15));
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    if (opts && opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = opts.filter.type || 'lowpass';
      f.frequency.setValueAtTime(opts.filter.freq || 2000, t);
      if (opts.filter.q) f.Q.setValueAtTime(opts.filter.q, t);
      if (opts.filter.slide) {
        f.frequency.exponentialRampToValueAtTime(
          Math.max(40, opts.filter.slide),
          t + dur
        );
      }
      o.connect(f);
      f.connect(g);
    } else {
      o.connect(g);
    }
    g.connect(master);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function noiseBurst(dur, vol, opts) {
    if (muted) return;
    ensure();
    const t = ctx.currentTime;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    const crackle = opts && opts.crackle;
    for (let i = 0; i < len; i++) {
      let v = Math.random() * 2 - 1;
      if (crackle && Math.random() < 0.04) v *= 3;
      const env = 1 - i / len;
      data[i] = v * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    const peak = Math.max(0.001, vol);
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    if (opts && opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = opts.filter.type || 'bandpass';
      f.frequency.setValueAtTime(opts.filter.freq || 1200, t);
      if (opts.filter.q) f.Q.setValueAtTime(opts.filter.q, t);
      if (opts.filter.slide) {
        f.frequency.exponentialRampToValueAtTime(
          Math.max(40, opts.filter.slide),
          t + dur
        );
      }
      src.connect(f);
      f.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(master);
    src.start(t);
  }

  function schedule(fn, ms) {
    setTimeout(fn, ms);
  }

  /* ── sound designs ──────────────────────────────────────── */

  const sounds = {
    cookie() {
      // Bright short arpeggio — cookie pickup
      const notes = [740, 880, 1175];
      notes.forEach((f, i) => {
        schedule(() => osc(f, 0.09, 'square', 0.22 - i * 0.03), i * 55);
      });
    },

    fizzy() {
      // Bubbly ascending sine blips
      const notes = [440, 523, 659, 784, 988];
      notes.forEach((f, i) => {
        schedule(() => osc(f, 0.07, 'sine', 0.18 - i * 0.02), i * 45);
      });
    },

    jump() {
      osc(260, 0.14, 'square', 0.22, { slideLin: 220 });
    },

    land() {
      osc(110, 0.07, 'triangle', 0.2, { filter: { type: 'lowpass', freq: 800 } });
      noiseBurst(0.04, 0.06, { filter: { type: 'lowpass', freq: 600 } });
    },

    burp() {
      // Low saw + noise — burp / AOE KO
      osc(90, 0.38, 'sawtooth', 0.32, {
        slideLin: -45,
        filter: { type: 'lowpass', freq: 500, slide: 180 },
      });
      osc(55, 0.3, 'triangle', 0.18, { slideLin: -20 });
      noiseBurst(0.28, 0.1, { filter: { type: 'bandpass', freq: 300, q: 0.8 } });
    },

    guardHit() {
      osc(180, 0.18, 'triangle', 0.26, { slideLin: -80 });
      noiseBurst(0.1, 0.12, { filter: { type: 'bandpass', freq: 900, q: 1.2 } });
    },

    bark() {
      // Two-part yap
      osc(320, 0.07, 'square', 0.28, {
        slideLin: -80,
        filter: { type: 'bandpass', freq: 1400, q: 2 },
      });
      schedule(() => {
        osc(200, 0.11, 'square', 0.24, {
          slideLin: -60,
          filter: { type: 'bandpass', freq: 900, q: 1.5 },
        });
      }, 65);
    },

    sizzle() {
      // Vat sizzle — filtered noise with crackle
      noiseBurst(0.45, 0.14, {
        crackle: true,
        filter: { type: 'highpass', freq: 2500, q: 0.7, slide: 4000 },
      });
      noiseBurst(0.35, 0.08, {
        crackle: true,
        filter: { type: 'bandpass', freq: 1800, q: 1.5 },
      });
    },

    mash() {
      // Masher crush — thump + crunch
      osc(70, 0.14, 'triangle', 0.3, {
        slideLin: -40,
        filter: { type: 'lowpass', freq: 400 },
      });
      osc(45, 0.1, 'sine', 0.2);
      noiseBurst(0.16, 0.18, {
        crackle: true,
        filter: { type: 'bandpass', freq: 700, q: 0.9, slide: 200 },
      });
    },

    crush() {
      sounds.mash();
    },

    hurt() {
      osc(280, 0.12, 'sawtooth', 0.28, { slideLin: -160 });
      schedule(() => osc(160, 0.14, 'square', 0.2, { slideLin: -70 }), 80);
    },

    die() {
      // Heavier life-lost / death
      osc(340, 0.18, 'square', 0.26, { slideLin: -180 });
      schedule(() => osc(200, 0.22, 'sawtooth', 0.24, { slideLin: -100 }), 120);
      schedule(() => {
        osc(90, 0.4, 'triangle', 0.22, {
          slideLin: -50,
          filter: { type: 'lowpass', freq: 600, slide: 120 },
        });
      }, 260);
    },

    levelClear() {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => {
        schedule(() => {
          osc(f, 0.2, 'square', 0.22);
          osc(f * 2, 0.16, 'sine', 0.08);
        }, i * 110);
      });
    },

    win() {
      const notes = [523, 659, 784, 1046, 784, 1319];
      notes.forEach((f, i) => {
        schedule(() => {
          osc(f, 0.22, 'square', 0.2);
          if (i === notes.length - 1) {
            osc(f / 2, 0.35, 'triangle', 0.12);
          }
        }, i * 130);
      });
    },

    click() {
      osc(880, 0.04, 'square', 0.14);
      osc(1320, 0.03, 'sine', 0.08);
    },

    select() {
      sounds.click();
    },

    gameOver() {
      const notes = [392, 311, 262, 196];
      notes.forEach((f, i) => {
        schedule(() => {
          osc(f, 0.28, 'sawtooth', 0.24, {
            filter: { type: 'lowpass', freq: 1200 - i * 200 },
          });
        }, i * 200);
      });
    },
  };

  function play(name) {
    if (muted) return;
    const fn = sounds[name];
    if (fn) fn();
  }

  /* ── mute API ───────────────────────────────────────────── */

  function setMuted(v) {
    muted = !!v;
  }

  function mute() {
    muted = true;
  }

  function unmute() {
    muted = false;
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  /** @deprecated Prefer toggleMute(); kept for game.js M-key hook */
  function toggle() {
    muted = !muted;
    return !muted; // returns "enabled" (sound on)
  }

  return {
    play,
    unlock,
    mute,
    unmute,
    toggleMute,
    setMuted,
    get muted() {
      return muted;
    },
    // Backward-compat with existing game.js / player.js hooks
    get enabled() {
      return !muted;
    },
    setEnabled(v) {
      muted = !v;
    },
    toggle,
    jump() {
      play('jump');
    },
    land() {
      play('land');
    },
    cookie() {
      play('cookie');
    },
    fizzy() {
      play('fizzy');
    },
    burp() {
      play('burp');
    },
    hurt() {
      play('hurt');
    },
    die() {
      play('die');
    },
    bark() {
      play('bark');
    },
    guardHit() {
      play('guardHit');
    },
    levelClear() {
      play('levelClear');
    },
    gameOver() {
      play('gameOver');
    },
    win() {
      play('win');
    },
    select() {
      play('select');
    },
    mash() {
      play('mash');
    },
    sizzle() {
      play('sizzle');
    },
    crush() {
      play('crush');
    },
    click() {
      play('click');
    },
  };
})();
