(() => {
  'use strict';

  window.USER_SANS_HANDS_UP_DATA = window.USER_SANS_HANDS_UP_DATA
    || 'data:image/png;base64,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';
  // Verified from the MyInstants "Undertale Gaster blaster" download link.
  window.USER_GASTER_SOUND_URL = 'https://www.myinstants.com/media/sounds/gaster_blaster_sound_effect_1.mp3';
  window.USER_GASTER_SOUND_SOURCE_PAGE = 'https://www.myinstants.com/en/instant/undertale-gaster-blaster/';
  window.USER_BIRD_SOUND_SOURCE_PAGE = 'https://www.myinstants.com/en/instant/weird-birds-58079/';

  const VIDEO_SANS_LINES = Object.freeze([
    'なによりだな。',
    'だれでも いいひとに なれると おもうか？',
    'こうかい することに なるぜ？',
    'きょうは ステキな日だ',
    'はなが さいてる',
    'ことりも さえずってる',
    'こんな日には おまえみたいな やつは…',
    'じごくで もえて しまえばいい',
    'ハハ…',
    'へへへ…',
    'なにもかもが リセットされる…',
    'それを しりながら いきていく きもちなんて',
    'オレは とっくに あきらめた',
    '…ま それも なまける ための こうじつ なのかも しれないけどな',
    'ウマいメシとか',
    'だって…',
    'こわい',
    'ハァ… ハァ…',
    'おどろくなよ…',
    'そう スペシャルこうげき なんて ないんだ',
    'わかったか？',
    'っていうか もう タイケツしてきたんじゃ ないか？',
    'なにが あっても ぜったいに あきらめようと しないんだ…',
    'これいじょうは なにもない',
    'んじゃ…'
  ]);

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const markerAt = source.indexOf(marker);
    if (markerAt < 0) return null;
    const start = source.lastIndexOf('\n', markerAt) + 1;
    const brace = source.indexOf('{', markerAt + marker.length);
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

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function injectFunctionStart(source, name, snippet, sentinel) {
    if (source.includes(sentinel)) return source;
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.brace + 1) + '\n' + snippet + source.slice(bounds.brace + 1);
  }

  function replaceConstArray(source, name, values) {
    const marker = '  const ' + name + ' = [';
    const start = source.indexOf(marker);
    if (start < 0) return source;
    const end = source.indexOf('];', start);
    if (end < 0) return source;
    const body = values.map(value => '    ' + JSON.stringify(value) + ',').join('\n');
    const replacement = '  const ' + name + ' = [\n' + body + '\n  ];';
    return source.slice(0, start) + replacement + source.slice(end + 2);
  }

  function injectDialogueImages(source) {
    if (source.includes('const sansDialogueHandsImage = new Image();')) return source;
    const marker = '  const sansWoundedSitImage = new Image();';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  const sansDialogueHandsImage = new Image();
  sansDialogueHandsImage.src = window.USER_SANS_HANDS_UP_DATA || '';

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function injectBirdChirp(source) {
    if (source.includes('function playUserBirdChirp()')) return source;
    const marker = '  function speechBlip() {';
    const at = source.indexOf(marker);
    if (at < 0) return source;
    const block = `  let userBirdLastAt = -10000;
  function playUserBirdChirp() {
    const now = performance.now();
    if (now - userBirdLastAt < 900) return;
    userBirdLastAt = now;
    startAudio();
    if (!audio || audio.state !== 'running') return;
    const chirp = (delay, startHz, endHz, volume) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + delay;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(startHz, start);
      oscillator.frequency.exponentialRampToValueAtTime(endHz, start + .11);
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .018);
      gain.gain.exponentialRampToValueAtTime(.001, start + .13);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + .14);
    };
    chirp(0, 1220, 1880, .018);
    chirp(.12, 1480, 2180, .015);
    chirp(.27, 1180, 1760, .013);
  }

`;
    return source.slice(0, at) + block + source.slice(at);
  }

  function patchDialoguePose(source) {
    const snippet = `    // userSansDialoguePoseV2
    if (stage === 10 && (state === 'enemySpeak' || state === 'intro')) {
      const dialogueText = message.join(' ');
      const phase = Math.floor(Math.max(0, t - stateAt) / 760) % 5;
      const handsLine = dialogueText.includes('スペシャル')
        || dialogueText.includes('わかった') || dialogueText.includes('ウマいメシ');
      if ((handsLine || phase === 3)
        && sansDialogueHandsImage.complete && sansDialogueHandsImage.naturalWidth) {
        const footX = Math.round(x);
        const footY = Math.round(y + 40 + Math.sin(t / 330) * .7);
        const dialogueScale = 50 / Math.max(1, sansDialogueHandsImage.naturalHeight);
        drawAnchoredSprite(sansDialogueHandsImage,
          sansDialogueHandsImage.naturalWidth / 2, sansDialogueHandsImage.naturalHeight,
          footX, footY, 1, false, dialogueScale);
        return;
      }
    }
`;
    let s = injectFunctionStart(source, 'drawSans', snippet, 'userSansDialoguePoseV2');
    if (s.includes('userSansDialogueWinkV1')) return s;
    const bounds = functionBounds(s, 'drawSans');
    if (!bounds) return s;
    const wink = `
    // userSansDialogueWinkV1 - close one eye over the normal Sans drawing.
    if (stage === 10 && (state === 'enemySpeak' || state === 'intro')) {
      const dialogueText = message.join(' ');
      const phase = Math.floor(Math.max(0, t - stateAt) / 760) % 5;
      const winkLine = dialogueText.includes('へへ') || dialogueText.includes('あきらめ')
        || dialogueText.includes('なまける') || phase === 1;
      if (winkLine) {
        rect(footX + 2, footY - 40, 7, 6, '#000');
        rect(footX + 3, footY - 37, 5, 1, '#fff');
      }
    }
`;
    return s.slice(0, bounds.end - 1) + wink + s.slice(bounds.end - 1);
  }

  function patchSpeechBubble(source) {
    return replaceFunction(source, 'drawMessageBox', `  function drawMessageBox() {
    const sansBubble = stage === 10 && (state === 'enemySpeak' || state === 'intro');
    if (sansBubble) {
      const x = 186;
      const y = 27;
      const w = 112;
      const h = 52;
      rect(x + 3, y, w - 6, h, '#fff');
      rect(x, y + 3, w, h - 6, '#fff');
      rect(x + 1, y + 1, w - 2, h - 2, '#fff');
      fillPolygon([[x, y + 13], [x - 11, y + 18], [x, y + 22]], '#fff');

      const incoming = visibleSpeechRows();
      const rows = [];
      for (const originalRow of incoming) {
        let clean = String(originalRow || '');
        while (clean.startsWith('＊')) clean = clean.slice(1);
        while (clean.startsWith(' ')) clean = clean.slice(1);
        if (!clean) continue;
        while (clean.length > 14 && rows.length < 4) {
          rows.push(clean.slice(0, 14));
          clean = clean.slice(14);
        }
        if (clean && rows.length < 4) rows.push(clean);
      }

      g.save();
      g.fillStyle = '#000';
      g.font = '700 7px "MS Gothic","Yu Gothic UI","Meiryo",monospace';
      g.textAlign = 'left';
      g.textBaseline = 'top';
      rows.slice(0, 4).forEach((row, index) => g.fillText(row, x + 9, y + 8 + index * 10));
      const complete = state !== 'enemySpeak' || speechChars >= message.join('').length;
      if (complete) {
        g.fillStyle = '#111';
        g.fillText('▼', x + w - 14, y + h - 13);
      }
      g.restore();
      return;
    }

    const sansLayout = stage === 10;
    const x = sansLayout ? 31 : 73;
    const y = sansLayout ? 87 : 91;
    const w = sansLayout ? 258 : 224;
    const h = sansLayout ? 55 : 53;
    rect(x, y, w, h, '#fff');
    rect(x + 3, y + 3, w - 6, h - 6, '#000');
    visibleSpeechRows().forEach((row, index) => text(row, x + 11, y + 6 + index * 13, 8));
    if (state === 'enemySpeak' && speechChars >= message.join('').length) {
      text('▼', x + w - 12, y + h - 15, 8, '#fff', 'center');
    }
  }`);
  }

  function patchDialogueAndBirdTrigger(source) {
    let s = source;
    const oldIntro = `      setState('intro', [
        '＊ 最後の審判役が 静かに道をふさいだ。',
        '＊ 笑顔の骨人が ポケットに手を入れた。'
      ]);`;
    const newIntro = `      setState('intro', [
        'きょうは ステキな日だ',
        'はなが さいてる。 ことりも さえずってる。',
        'こんな日には おまえみたいな やつは…'
      ]);`;
    if (s.includes(oldIntro)) s = s.replace(oldIntro, newIntro);

    const setStateNeedle = `    if (lines) message = lines;`;
    if (s.includes(setStateNeedle) && !s.includes('userSansIntroVoiceScheduled')) {
      const addition = `    if (lines) message = lines;
    // userSansIntroVoiceScheduled
    if (stage === 10 && lines && lines.join('').includes('ことり')) {
      window.setTimeout(() => playUserBirdChirp(), 180);
    }
    if (stage === 10 && next === 'intro' && lines && enemies.length) {
      speakingEnemy = enemies[0];
      const introTicks = Math.min(18, Math.max(5, Math.floor(lines.join('').length / 3)));
      for (let tick = 0; tick < introTicks; tick++) {
        window.setTimeout(() => {
          if (state !== 'intro') return;
          const before = speechChars;
          speechChars = tick;
          speechBlip();
          speechChars = before;
        }, 80 + tick * 72);
      }
    }`;
      s = s.replace(setStateNeedle, addition);
    }
    return s;
  }

  function patchBlueSoul(source) {
    return replaceFunction(source, 'adaptiveBlueJumpProfile', `  function adaptiveBlueJumpProfile(arena) {
    const vertical = gravityDirection === GravityDirection.DOWN
      || gravityDirection === GravityDirection.UP;
    const span = (vertical ? arena.bottom - arena.top : arena.right - arena.left)
      - battleSoulPadding() * 2;
    const compact = isCompactBattleSoul();
    const sansBattle = stage === 10;
    const platformPhase = Number.isInteger(attackPattern?.sansScriptIndex)
      && [4, 5, 6, 7, 8, 9].includes(attackPattern.sansScriptIndex);
    let clearance = span;

    if (vertical) {
      for (const bullet of bullets) {
        if (bullet.kind !== 'bone' || bullet.orientation === 'horizontal'
          || Math.abs(bullet.x - heart.x) > 20) continue;
        const extent = effectiveBoneExtent(bullet);
        const top = bullet.fromTop ? bullet.y : bullet.y - extent;
        const bottom = top + extent;
        if (gravityDirection === GravityDirection.DOWN && top > heart.y) {
          clearance = Math.min(clearance, top - heart.y - 4);
        } else if (gravityDirection === GravityDirection.UP && bottom < heart.y) {
          clearance = Math.min(clearance, heart.y - bottom - 4);
        }
      }
    }

    const maximumRise = compact ? 12 : sansBattle ? (platformPhase ? 20 : 17) : 23;
    const riseRatio = compact ? .34 : sansBattle ? (platformPhase ? .50 : .44) : .58;
    const rise = Math.max(7, Math.min(maximumRise, clearance - 2, span * riseRatio));
    const gravity = compact ? 300 : sansBattle ? (platformPhase ? 250 : 225) : 455;
    return {
      velocity: Math.max(compact ? 86 : sansBattle ? 88 : 132,
        Math.min(sansBattle ? (platformPhase ? 126 : 116) : 178, Math.sqrt(2 * gravity * rise))),
      holdAccel: compact ? 90 : sansBattle ? (platformPhase ? 120 : 105) : 205,
      holdTime: compact ? .10 : sansBattle ? (platformPhase ? .22 : .18) : .14,
      gravity,
      release: compact ? .42 : sansBattle ? .32 : .58
    };
  }`);
  }

  function patchBoneClearance(source) {
    let s = source;
    s = s.split('const heightT = 111 - heightB;').join('const heightT = 97 - heightB;');
    s = s.split('const heightT = 101 - heightB;').join('const heightT = 97 - heightB;');
    s = s.split('const opening = Math.max(20, options.opening || 20);')
      .join('const opening = Math.max(32, options.opening || 32);');
    s = s.split('const opening = Math.max(28, options.opening || 28);')
      .join('const opening = Math.max(32, options.opening || 32);');
    const openings = [[18,28],[19,29],[20,30],[21,31],[24,28],[25,29],[26,30],[27,31]];
    for (const pair of openings) s = s.split('opening: ' + pair[0] + ',').join('opening: ' + pair[1] + ',');
    s = s.split("const heartRadius = stage === 10 ? battleSoulRadius() : 4;")
      .join("const heartRadius = stage === 10 ? Math.max(1.8, battleSoulRadius() - .75) : 4;");
    s = s.split("Math.abs(bullet.y - heart.y) < (stage === 10 ? battleSoulRadius() : 5)")
      .join("Math.abs(bullet.y - heart.y) < (stage === 10 ? Math.max(1.8, battleSoulRadius() - .65) : 5)");
    s = s.split("Math.abs(bullet.x - heart.x) < (stage === 10 ? battleSoulRadius() : 5)")
      .join("Math.abs(bullet.x - heart.x) < (stage === 10 ? Math.max(1.8, battleSoulRadius() - .65) : 5)");
    return s;
  }

  function applySansVideoPatch(source) {
    let s = String(source || '');
    s = injectDialogueImages(s);
    s = injectBirdChirp(s);
    s = replaceConstArray(s, 'SANS_BATTLE_LINES', VIDEO_SANS_LINES);
    s = patchDialoguePose(s);
    s = patchSpeechBubble(s);
    s = patchDialogueAndBirdTrigger(s);
    s = patchBlueSoul(s);
    s = patchBoneClearance(s);
    return s;
  }

  window.applySansVideoAddon = applySansVideoPatch;

  function wrapUserPolish(fn) {
    if (typeof fn !== 'function') return fn;
    if (fn.__sansVideoWrapped) return fn;
    const wrapped = source => applySansVideoPatch(fn(source));
    wrapped.__sansVideoWrapped = true;
    return wrapped;
  }

  let currentUserPolish = wrapUserPolish(window.applyUserPolishHotfix);
  Object.defineProperty(window, 'applyUserPolishHotfix', {
    configurable: true,
    enumerable: true,
    get() { return currentUserPolish; },
    set(value) { currentUserPolish = wrapUserPolish(value); }
  });
})();