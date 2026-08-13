(() => {
  'use strict';

  const VERSION = '20260814-sans-gif-costumes-v30';
  const BASE = 'assets/sans-costumes-v30/';

  const costumeData = Object.freeze({
    idleWide: Object.freeze({
      id: 'idle-wide', frameBase: 'frames/idle-wide/', source: 'source/idle-wide.gif',
      frameWidth: 216, frameHeight: 106, frames: 19,
      delays: Object.freeze(Array(19).fill(100))
    }),
    battleReference: Object.freeze({
      id: 'battle-reference', frameBase: 'frames/battle-reference/',
      source: 'source/battle-reference.gif', frameWidth: 220, frameHeight: 164,
      frames: 73, delays: Object.freeze(Array(73).fill(100))
    }),
    shrug: Object.freeze({
      id: 'shrug', frameBase: 'frames/shrug/', source: 'source/shrug.gif',
      frameWidth: 216, frameHeight: 215, frames: 25,
      delays: Object.freeze(Array(25).fill(100))
    }),
    idleLarge: Object.freeze({
      id: 'idle-large', frameBase: 'frames/idle-large/', source: 'source/idle-large.gif',
      frameWidth: 204, frameHeight: 271, frames: 10,
      delays: Object.freeze([100,100,100,200,100,100,100,100,200,100])
    }),
    eyeGlow: Object.freeze({
      id: 'eye-glow', source: 'source/eye-glow.webp', frames: 1,
      delays: Object.freeze([100])
    })
  });

  function loadImage(path) {
    const image = new Image();
    image.decoding = 'async';
    image.src = BASE + path;
    return image;
  }

  const costumes = {};
  for (const [name, data] of Object.entries(costumeData)) {
    const images = data.frameBase
      ? Object.freeze(Array.from({ length: data.frames }, (_, frame) =>
          loadImage(data.frameBase + String(frame).padStart(3, '0') + '.gif')))
      : null;
    costumes[name] = Object.freeze({
      ...data,
      image: data.sheet || !images ? loadImage(data.sheet || data.source) : null,
      images,
      sourceGif: data.source.endsWith('.gif') ? loadImage(data.source) : null
    });
  }

  function frameAt(costume, elapsedMs, loop = true) {
    if (!costume || costume.frames <= 1) return 0;
    const duration = costume.delays.reduce((sum, delay) => sum + delay, 0);
    let cursor = Math.max(0, elapsedMs);
    if (loop) cursor %= duration;
    else if (cursor >= duration) return costume.frames - 1;
    for (let frame = 0; frame < costume.frames; frame++) {
      cursor -= costume.delays[frame];
      if (cursor < 0) return frame;
    }
    return costume.frames - 1;
  }

  window.__SANS_SCRATCH_COSTUMES_V30 = Object.freeze({
    version: VERSION,
    fps: 30,
    base: BASE,
    costumes: Object.freeze(costumes),
    frameAt
  });

  function functionBounds(source, name) {
    const marker = 'function ' + name;
    const at = source.indexOf(marker);
    if (at < 0) return null;
    const start = source.lastIndexOf('\n', at) + 1;
    const paren = source.indexOf('(', at + marker.length);
    if (paren < 0) return null;
    const brace = source.indexOf('{', paren);
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
      if (ch === '"' || ch === "'" || ch.charCodeAt(0) === 96) {
        quote = ch;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) return { start, end: i + 1 };
    }
    return null;
  }

  function replaceFunction(source, name, replacement) {
    const bounds = functionBounds(source, name);
    if (!bounds) return source;
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  const drawSansV30 = String.raw`  function drawSans(x, y, t) {
    // Scratch v30: imported GIF frames are explicit costumes, never an
    // independently running browser animation.
    const library = window.__SANS_SCRATCH_COSTUMES_V30;
    const costume = library?.costumes;
    const scratchFrame = Math.floor(t / (1000 / 30));
    const scratchTime = scratchFrame * (1000 / 30);
    const footX = Math.round(x);
    const footY = Math.round(y + 40);
    // The reference recording shows a roughly 40 px wide / 55 px tall Sans.
    // The imported idle costume is 204:271, so 56 px high gives 42 px wide.
    const targetH = 56;

    function drawImageCostume(image, height = targetH, flip = false) {
      if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return false;
      const width = height * image.naturalWidth / image.naturalHeight;
      g.save();
      g.translate(footX, footY);
      if (flip) g.scale(-1, 1);
      g.imageSmoothingEnabled = false;
      g.drawImage(image, -width / 2, -height, width, height);
      g.restore();
      return true;
    }

    function switchCostume(item, frame, height = targetH, flip = false) {
      if (item?.images) {
        const safeFrame = Math.max(0, Math.min(item.frames - 1, frame | 0));
        return drawImageCostume(item.images[safeFrame], height, flip);
      }
      if (!item?.image?.complete || !item.image.naturalWidth) return false;
      if (!item.sheet) return drawImageCostume(item.image, height, flip);
      const safeFrame = Math.max(0, Math.min(item.frames - 1, frame | 0));
      const sourceX = (safeFrame % item.columns) * item.frameWidth;
      const sourceY = Math.floor(safeFrame / item.columns) * item.frameHeight;
      const width = height * item.frameWidth / item.frameHeight;
      g.save();
      g.translate(footX, footY);
      if (flip) g.scale(-1, 1);
      g.imageSmoothingEnabled = false;
      g.drawImage(item.image, sourceX, sourceY, item.frameWidth, item.frameHeight,
        -width / 2, -height, width, height);
      g.restore();
      return true;
    }

    const resting = stage === 10 && sansEndingPhase === 'sleeping';
    const woundedHit = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansDefeatHit';
    const woundedDialogue = stage === 10 && sansEndingPhase === 'wounded' && state === 'sansFinalDialogue';
    const walking = stage === 10 && sansEndingPhase === 'walking';
    if (woundedHit && drawImageCostume(sansWoundedSitImage, 54)) return;
    if (woundedDialogue && drawImageCostume(sansWoundedStandImage, 56)) return;
    if (walking && drawImageCostume(sansWoundedWalkGifImage, 56)) return;
    if (resting && drawImageCostume(sansSleepImage, 52)) {
      const cycle = Math.floor(scratchFrame / 14) % 3;
      for (let i = 0; i < 3; i++) {
        g.globalAlpha = i <= cycle ? 1 : .28;
        text('Z', footX + 8 + i * 5, footY - 21 - i * 5, 5, '#fff', 'center');
      }
      g.globalAlpha = 1;
      return;
    }

    const finalSpecial = stage === 10 && attackPattern?.finalSpecial === true;
    const finalAttack = finalSpecial && state === 'enemyTurn';
    const finalElapsed = finalAttack ? (scratchTime - stateAt) / 1000 : -1;
    const dodgeElapsed = scratchTime - dodgeAt;

    // The supplied 19-frame MISS GIF becomes the non-looping dodge costume.
    if (dodgeElapsed >= 0 && dodgeElapsed < 2300) {
      const frame = library.frameAt(costume.idleWide, dodgeElapsed, false);
      if (switchCostume(costume.idleWide, frame, 54)) return;
    }

    // The supplied cyan-eye WebP is selected only during the last rapid slams.
    if (finalAttack && finalElapsed >= 29.05) {
      if (drawImageCostume(costume.eyeGlow.image, 56)) return;
    }

    const gestureActive = (state === 'enemyTurn' || state === 'enemySpeak')
      && scratchTime >= sansGestureStartedAt && scratchTime <= sansGestureUntil;
    const direction = sansGestureDirection;
    if (gestureActive && direction === GravityDirection.UP) {
      const frame = library.frameAt(costume.shrug, scratchTime - sansGestureStartedAt, true);
      if (switchCostume(costume.shrug, frame, 58)) return;
    }

    // Left/right/down still use their directional Scratch costumes from v28.
    if (gestureActive) {
      const horizontal = direction === GravityDirection.LEFT || direction === GravityDirection.RIGHT;
      const image = horizontal ? sansPointRightImage : sansHandDownImage;
      if (drawImageCostume(image, 56, direction === GravityDirection.LEFT)) return;
    }

    // The 10-frame GIF is the normal looping pocket-pose costume.
    const idleFrame = library.frameAt(costume.idleLarge, scratchTime - stateAt, true);
    if (switchCostume(costume.idleLarge, idleFrame, 56)) return;

    drawImageCostume(sansReferenceImage, 54);
  }`;

  window.applySansGifCostumesV30 = source =>
    replaceFunction(String(source || ''), 'drawSans', drawSansV30);

  console.info('Scratch GIF costumes v30 ready:', VERSION);
})();

