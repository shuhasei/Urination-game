(() => {
  'use strict';

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const parenAt = source.indexOf('(', markerAt + marker.length);
    if (parenAt < 0) return null;
    let quote = null;
    let escape = false;
    let parenDepth = 0;
    let closeParen = -1;
    for (let i = parenAt; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '(') parenDepth++;
      else if (ch === ')') {
        parenDepth--;
        if (parenDepth === 0) { closeParen = i; break; }
      }
    }
    if (closeParen < 0) return null;
    const brace = source.indexOf('{', closeParen + 1);
    if (brace < 0) return null;
    let depth = 0;
    quote = null;
    escape = false;
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

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function patchFunctionBody(source, name, transform) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    const body = source.slice(bounds.start, bounds.end);
    const next = transform(body);
    if (next === body) return source;
    return source.slice(0, bounds.start) + next + source.slice(bounds.end);
  }

  function patchSansVoice(source) {
    return replaceFunction(source, 'speechBlip', `  function speechBlip() {
    const isSans = speakingEnemy?.visual === 'sans' || speakingEnemy?.type === 'sans';

    // Use the short Sans voice WAV already embedded in game.js.  The previous
    // patch layered a long MyInstants "talking" clip on every few characters
    // and shifted this sample close to normal speed; that produced a doubled,
    // high/warbly voice.  The fight reference uses one short low blip per
    // printable character, so keep one source, the original low playback band,
    // and no network-dependent overlay.
    if (isSans) {
      startAudio();
      if (sansSpeechPool.length) {
        const sample = sansSpeechPool[sansSpeechPoolIndex++ % sansSpeechPool.length];
        sample.pause();
        sample.currentTime = 0;
        sample.preservesPitch = false;
        sample.volume = .34;
        sample.playbackRate = .58 + (Math.floor(speechChars) % 4) * .025;
        const promise = sample.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            startAudio();
            if (audio && audio.state === 'running') beep(152, .038);
          });
        }
        window.setTimeout(() => {
          sample.pause();
          sample.currentTime = 0;
        }, 74);
      }
      return;
    }

    startAudio();
    if (!audio || audio.state !== 'running') return;
    const visualPitch = {
      comet: 390, jelly: 280, lantern: 330, moon: 245, moth: 460,
      mirror: 360, clock: 510, crown: 205, sun: 430, star: 475, sans: 152
    };
    const base = visualPitch[speakingEnemy?.visual] || 320;
    const frequency = base + (Math.floor(speechChars) % 3) * 13;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    oscillator.detune.setValueAtTime((Math.floor(speechChars) % 5 - 2) * 7, audio.currentTime);
    gain.gain.setValueAtTime(.045, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .04);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + .045);
  }`);
  }

  function patchSansSpeechCadence(source) {
    return patchFunctionBody(source, 'updateEnemySpeech', body => body
      .replace("speechChars + dt * (speakingEnemy?.visual === 'sans' ? 24 : 30)",
        "speechChars + dt * (speakingEnemy?.visual === 'sans' ? 21 : 30)"));
  }

  function patchStageTenStats(source) {
    let s = source.replace('  const TEST_PLAY_INVINCIBLE = true;', '  const TEST_PLAY_INVINCIBLE = false;');
    s = patchFunctionBody(s, 'startStage', body => {
      let next = body;
      next = next.replace('    stage = number;',
        "    stage = number;\n    if (stage === 10) playerLevel = 19;");
      next = next.replace('    maxHp = levelMaxHp(playerLevel);\n    hp = maxHp;',
        "    maxHp = stage === 10 ? 92 : levelMaxHp(playerLevel);\n    hp = maxHp;\n    if (stage === 10) {\n      karmaHp = 0;\n      practiceGuardTurns = 0;\n      practiceGuardActive = false;\n      reviveItems = 0;\n    }");
      return next;
    });
    return s;
  }

  function patchSansTurnDialogue(source) {
    return patchFunctionBody(source, 'beginEnemyTurn', body => {
      const verbose = `    setState('enemySpeak', [\n      '＊ ' + attacker.name + '「' + battleLine + '」',\n      '＊ 黒い箱の空気が 低く震えた。'\n    ]);`;
      const faithful = `    setState('enemySpeak', [battleLine]);`;
      return body.includes(verbose) ? body.replace(verbose, faithful) : body;
    });
  }

  function patchSansDamageCadence(source) {
    return patchFunctionBody(source, 'applySansDamage', body => body
      .replace('if (now - lastSansDamageAt < 100) return;',
        'if (now - lastSansDamageAt < 34) return;')
      .replace('約0.1秒ごとの判定', '約1フレーム(30fps)ごとの判定'));
  }

  function patchReferencePalette(source) {
    let s = source;
    // The recorded fight shows neutral grey moving platforms, not neon green.
    s = s.replace(
      "        rect(bullet.x - bullet.w / 2, bullet.y, bullet.w, 2, '#55e69a');\n        rect(bullet.x - bullet.w / 2 + 2, bullet.y + 2, bullet.w - 4, 2, '#176641');",
      "        rect(bullet.x - bullet.w / 2, bullet.y, bullet.w, 2, '#b8b8b8');\n        rect(bullet.x - bullet.w / 2 + 2, bullet.y + 2, bullet.w - 4, 2, '#4a4a4a');"
    );
    return s;
  }

  function patchReferenceGeometry(source) {
    let s = source;
    // Earlier fairness patches almost doubled the visible opening in the
    // recorded Bone Gap 2 pattern (111 -> 94).  Restore the reference shape
    // while retaining a very small five-source-pixel allowance for keyboard
    // hitbox differences.
    s = s.split('const heightT = 94 - heightB;').join('const heightT = 106 - heightB;');
    s = s.split('const heightT = 97 - heightB;').join('const heightT = 106 - heightB;');
    // Likewise keep the sine corridor visually close to the recording.  The
    // original minimum was 20; 23 leaves only a modest accessibility margin.
    s = s.split('const opening = Math.max(34, options.opening || 34);')
      .join('const opening = Math.max(23, options.opening || 20);');
    s = s.split('const opening = Math.max(32, options.opening || 32);')
      .join('const opening = Math.max(23, options.opening || 20);');
    return s;
  }

  function applySansVoiceFix(source) {
    let s = String(source || '');
    s = patchSansVoice(s);
    s = patchSansSpeechCadence(s);
    s = patchStageTenStats(s);
    s = patchSansTurnDialogue(s);
    s = patchSansDamageCadence(s);
    s = patchReferencePalette(s);
    s = patchReferenceGeometry(s);
    return s;
  }

  window.applySansVoiceFix = applySansVoiceFix;

  // Loaded after the reference-video and fairness patches. Compose this as the
  // final source transform so the last calibration wins without discarding the
  // recorded attack scripts themselves.
  let wrappedTarget = null;
  const timer = window.setInterval(() => {
    const current = window.applyUserPolishHotfix;
    if (typeof current !== 'function' || current === wrappedTarget || current.__sansVoiceFixWrapped) return;
    const wrapped = source => applySansVoiceFix(current(source));
    wrapped.__sansVoiceFixWrapped = true;
    wrappedTarget = wrapped;
    window.applyUserPolishHotfix = wrapped;
    window.clearInterval(timer);
  }, 10);
})();