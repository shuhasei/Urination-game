(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name + '(';
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const brace = source.indexOf('{', at + marker.length);
    if (brace < 0) return null;
    let depth = 0;
    let quote = null;
    let escape = false;
    for (let i = brace; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return { start, brace, end: i + 1 };
      }
    }
    return null;
  }

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    return next === body ? source : source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function injectBirdAmbience(source) {
    let s = String(source || '');
    if (!s.includes('function playSansBirdAmbienceV23()')) {
      const marker = '  function resetSansBattlePreludeV19() {';
      const at = s.indexOf(marker);
      if (at >= 0) {
        const helper = `  function playSansBirdAmbienceV23() {
    // Recreates the quiet bird-chirp cue heard before the Sans encounter.
    // This is synthesized locally; no Apple Music stream audio is copied.
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const now = audio.currentTime;
    const notes = [
      { delay: 0, freq: 1660, end: 2310, length: .085 },
      { delay: .16, freq: 1940, end: 2520, length: .070 },
      { delay: .43, freq: 1510, end: 2180, length: .090 },
      { delay: .67, freq: 1830, end: 2440, length: .075 }
    ];
    for (const note of notes) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      const start = now + note.delay;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, start);
      osc.frequency.exponentialRampToValueAtTime(note.end, start + note.length);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.032, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + note.length);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + note.length + .01);
    }
  }

`;
        s = s.slice(0, at) + helper + s.slice(at);
      }
    }

    s = patchFunctionBody(s, 'resetSansBattlePreludeV19', body => {
      if (body.includes('playSansBirdAmbienceV23();')) return body;
      const brace = body.indexOf('{');
      if (brace < 0) return body;
      return body.slice(0, brace + 1) + '\n    playSansBirdAmbienceV23();' + body.slice(brace + 1);
    });
    return s;
  }

  window.applySansBirdReferenceV23 = injectBirdAmbience;
})();
