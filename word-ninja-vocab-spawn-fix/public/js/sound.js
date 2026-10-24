// Word Ninja: sound. Files come from assets; the visitor's own switch decides.
(function () {
  const FILES = { slash: "sfx_slash", wrong: "sfx_wrong", stamp: "sfx_stamp", coin: "sfx_coin", levelup: "sfx_levelup", forge: "sfx_forge",
    fizzle: "sfx_fizzle", hurt: "sfx_hurt", tick: "sfx_tick", page: "sfx_pop", village: "music_village", battle: "music_battle" };
  const VOL = { slash: 0.7, wrong: 0.6, stamp: 0.7, coin: 0.55, levelup: 0.7, forge: 0.6, fizzle: 0.5, hurt: 0.6, tick: 0.25, page: 0.4 };
  let ctx = null, master = null, musicGain = null; const buf = {}; let musicSrc = null, musicName = null, wantMusic = null;
  const mb = () => window.mindblown;
  const SND = {
    on: true, ready: false,
    init() {
      const m = mb();
      if (m && m.sound) { this.on = !!m.sound.on; m.sound.onchange?.((v) => { this.on = !!v; this.apply(); }); }
      else { try { this.on = localStorage.getItem("wn_sound") !== "0"; } catch (e) {} }
    },
    unlock() {
      if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.connect(ctx.destination); musicGain = ctx.createGain(); musicGain.gain.value = 0.32; musicGain.connect(master);
      this.apply();
      for (const k in FILES) {
        fetch("audio/" + FILES[k] + ".mp3").then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
          .then((a) => new Promise((res, rej) => { const p = ctx.decodeAudioData(a, res, rej); if (p && p.catch) p.catch(rej); }))
          .then((b) => { buf[k] = b; if (wantMusic === k) this.music(k, true); })
          .catch(() => {});
      }
      this.ready = true;
    },
    apply() { if (master) master.gain.value = this.on ? 1 : 0; },
    set(v) {
      this.on = !!v; const m = mb();
      if (m && m.sound && m.sound.set) m.sound.set(this.on); else { try { localStorage.setItem("wn_sound", this.on ? "1" : "0"); } catch (e) {} }
      this.apply();
    },
    play(k, vol, rate) {
      if (!ctx || !buf[k] || !this.on) return;
      const s = ctx.createBufferSource(); s.buffer = buf[k]; if (rate) s.playbackRate.value = rate;
      const g = ctx.createGain(); g.gain.value = (vol ?? 1) * (VOL[k] ?? 0.6); s.connect(g); g.connect(master); s.start();
    },
    music(k, force) {
      wantMusic = k;
      if (!ctx) return;
      if (musicName === k && !force) return;
      if (!buf[k]) return;
      const old = musicSrc;
      if (old) { try { old.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4); old.s.stop(ctx.currentTime + 1.6); } catch (e) {} }
      const s = ctx.createBufferSource(); s.buffer = buf[k]; s.loop = true;
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(1, ctx.currentTime, 0.5); s.connect(g); g.connect(musicGain); s.start();
      musicSrc = { s, g }; musicName = k;
    },
  };
  window.SND = SND;

  // Optional English pronunciation after a confirmed correct answer. This setting is
  // independent from SND so players can keep music/SFX while muting word speech.
  const PRONUNCIATION_KEY = "wn_auto_pronounce";
  const WNPronunciation = {
    enabled: false,
    init() {
      try { this.enabled = localStorage.getItem(PRONUNCIATION_KEY) === "1"; } catch (e) { this.enabled = false; }
    },
    set(value) {
      this.enabled = !!value;
      try { localStorage.setItem(PRONUNCIATION_KEY, this.enabled ? "1" : "0"); } catch (e) {}
      if (!this.enabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
      return this.enabled;
    },
    speak(word) {
      const text = String(word || "").trim();
      if (!this.enabled || !text || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return false;
      // Avoid reading shuffled letter tiles or punctuation-only values.
      if (!/[a-z]/i.test(text)) return false;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.88;
        utterance.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => /^en-US$/i.test(v.lang)) || voices.find(v => /^en(-|_)/i.test(v.lang));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (e) { return false; }
    }
  };
  WNPronunciation.init();
  window.WNPronunciation = WNPronunciation;
})();
