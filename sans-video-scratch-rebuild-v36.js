(() => {
  'use strict';

  const VERSION = '20260814-sans-video-scratch-rebuild-v36';
  const blasterChargeV36 = new Image();
  blasterChargeV36.src = 'data:image/gif;base64,R0lGODlhYACAAPf/MQAAAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCAD/ACwWAAYAMwB0AAAI/wD/CRxIsKDBggESHlzIsKFDgQofSpzIMCLFixQTBsDIUaLGjiArfgxJEqLGjSVJnkSZEuRKli0vvrQYkyBMmzNpDrzJkefOnBVVLsw5sqZOnER9/lPq8KjJpE6ZNnS6FGpUqUN5Wn2JEGtXmluB/vQ6FmlYrmU9gj0rtipZt2PZznw6sahVt0npPjz5NC9eonj3ykU5WLDcvmENs0W8telgwoVFRn48lfLfxJIPX26c+axZzFk1M77bGfRmqKVNWzYo1u/oiG2/rjxdlLbCuQeBoo47Fzfr3q5tb/Qte+Ru4aND23VNGm1uvhB5W/QNG7pyyNJZEodce+lnvZelI//9+7O4yc/are9EvP53de/s40e/Xdsn9Nu883cN3H668eH6kbefde/hdB5MBNpVXn3YGRhdVX3Fdd5XDuo03YQJ0qfVWuV16B1fGQ7X3XIOtvfhfPd9RBhC+3n44IkfpogffCZOCB6NAMIn44M3IWghguutyJ9xLxZ5FFhB5rhjjDiW6GJ6cA1ZnZA0QvibTQdOyV2H2rnoZJf+TcmlkUohaWOEUXroY2gmrvVfj116ieV16gGW21Spuekci5I9t11scrLWZmx2dhTnae7N5lJ/gCLqEpWbJapgkVfCFaZ6yclnH2MxKopeekQOFamImJLHnad39haeeafOGBRXpHbiZyqnas0Wa4j4NVpalnkBuGet/wnn66oZKaohYL6iWleK4dnaKVWOBSsgkbcayix4F1bb07WUgingtgV2G2Saj8I2p6ilYkTguX5Cu+yFNcIpK7iQAomiu8WaG2+S+OZr5Lmk1mQpu6C+JVOO0RqcL1MFC5zWvzcKXB/A/ZZL8MMOW0ixwuqe+SLHPR3IJ8gdQygkpA7zaC/KKTfII6UtizinzCkbKCaTNWN5M8I5ozgrySEfO2zP/DoLtLqtqnh0sa9ZSbSWIC6dUXIVtyS0q0S/lu7TumYdqdftzgv2tx0FBAAh+QQJCQD/ACwWAAYAMwB0AAAI/wD/CRxIsKDBggESHlzIsKFDgQofSpzIMCLFixctYtzoUCPHjwYTBgBJcqBIkSVJnvSYMuPKlhxXooQZcqHMkwdHqqx4kyXEnTZ76qT5byhCoThrxgyK1KdRij6LNlX4NGpDllNlHsU4E2LWmwS7StT4VWhYqyGNlu159unVoWuRenXL02RTqXfxjp2Zda7cpG/j+v36MG5Ew4UR4y3b0TBcwTwVLyYcGfLkvpXX2tWcmfJgzEw5f54aWPRl0qFNO06NU+5mrafpnh4NOPZh2Glf2iZrdnZO2Hlp39adO2nwvGB/6z6OnHhxuK+7Jpc6uLROi9OzU61dtO1t79ido/8k7nF5VcDiqZNXfv289Nojt5Nl7/Xoe7Hx88+n7rc++Ohhqfeef3YR+NpmAeanV4H8Mdgdf+iFZ9JcZxnYYHv9Ubjgg/g9VuFPrd2XIYYONnghh5Mt9hOKD5bI24TXpWjcijF+qOGJNYZ4GI0r3kggdizqmCOPJRoIHVX9GRcfhDa6OOGCQiZZo4U/Psmbfu2R6OFvAYKolnxbPkmlkUXqxR2QZZJpYZQ2flkRa/CxldNVnXU4HUJvwXklbk3OyZ54cuLZkZ7PiSXmm4UaGpufefYYaHRomrhVa5BihZt8PSZo3p2jQdpiTWA92ulln4KqFZhuvYTleI2duupz3YnR+ud4q35JqaysgbgbkrXKNqt6uy7ZK1TLxXqXsHwmxpextN6a4kYzZvlYjK9Cu6y0DiKr6F47QidorCp+dO2hjjLrq7JTltoitiBx5xJa6J5bWkrbottSvcrChCSx8L4rr31EbchtwPgWR3C/CB78b8IH8xvwmEE9bCWdCIubqakSE6mWlxkH2aWCGQ85ccUx8aUfxx2bDKW6D383bsf1sbUkzAKeyjJNvIZ6M87CkRhyzxDrC3TB9/aaLszSskpzpc4tHdzSwkFtX7JSU31RQAAAIfkECQgA/wAsBAAQAFgAXwAACP8A/wkcSLBgwQABDCpcyLChw4cQGyaMSLGixYsHJ2LcyLGjQIQeQ4qMiFDjyJMoS5pEydKjypYwXb6MSbOiypIHa2JcuZDnTZw5dVLkqdDnT6AEiQo1CNJh06RHnw6UupSp0oxQo878eLWqVKr/kGo9OrWrULFgn46NWrZqUY1b24Zdy3auW6tl006kWxesW7VIuSYcK5hs4LtNb2akW5jw3bw/F69trPUxZMWXHfM1G9Mx5cpzGVv2HFr0ZsulI2cGfXo06M99+aImvXmvbNd1U4OMHVn1X8Vbe/MWfvjszODAhycvrhMz8pes2WL+DR1tdbK6cU73ejzwccqNpwr/nn3YZPXL4bmGJr9bbmm76Z+vV08Trnal9+0n9j5YbfOsYQUo4HjW2fZVf3D9l1eAtkG1noGFCbibfc3px2B/Dko43oN70QdffRY2aF6HdgF130ceciZSiOp9heJg84mloYc1ATYgjR3CaKJ/JH5YI4UwbqhhkPslNaOPIIqIF4oMStigeD2qOFKRRonnJH37EWnlUlQGmeKV8BV545hntYjhlz6KieWW3DFJlX8f7phhgoiRmJaV2GUnpYKQGemmb9mhxpRVK9npW25MCgqgnwY+tx2Zgpb353Z5Jqroew7qxx9wNCKWlYjdxaXahH51hiGCI14nqnNx1UlqqtBh/xohqnu2xCms2sn6Hq21phSrUbmyGuyj1MUqmY56tkesq7ke2yRrqV3a21vKYlltq+y1RyiyYeaoa6QmUsttUDoy99h34kq02KXrQvqtU6Wy95C5PcWL27z2EsouVvjalO+5Kv674L78SrQnvYr+K7CQBHfaE0OF9trmvPoOuDDAEEW8asODUnzhtBef6+6WmknsVcarycixn07Bhu7KL0Js8WtecmyWltLFDHPNOWksqcl8PgxszTwTXHSfQUGJ8L1XYTuo0wlrW+/R6O2MsHOMLg1uvue1BfW+Wp/odcgAcyY2h0BzKfCEC5LtGknJpu0pSa/BLBOgdt/9dd4X7QTNd0AAADs=';
  window.__SANS_ATTACK_ASSETS_V36 = Object.freeze({
    blasterCharge: blasterChargeV36
  });
  const readinessProbeV36 = setInterval(() => {
    if (!window.__SANS_SCRATCH_REBUILD_V36) return;
    document.documentElement.dataset.sansV36 = 'ready';
    clearInterval(readinessProbeV36);
  }, 250);

  function functionBounds(source, functionName) {
    const marker = 'function ' + functionName + '(';
    const start = source.indexOf(marker);
    if (start < 0) return null;
    const brace = source.indexOf('{', start + marker.length);
    if (brace < 0) return null;
    let depth = 0;
    let quote = '';
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    for (let index = brace; index < source.length; index++) {
      const character = source[index];
      const next = source[index + 1];
      if (lineComment) {
        if (character === '\n') lineComment = false;
        continue;
      }
      if (blockComment) {
        if (character === '*' && next === '/') { blockComment = false; index++; }
        continue;
      }
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (character === '\\') { escaped = true; continue; }
        if (character === quote) quote = '';
        continue;
      }
      if (character === '/' && next === '/') { lineComment = true; index++; continue; }
      if (character === '/' && next === '*') { blockComment = true; index++; continue; }
      if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
      if (character === '{') depth++;
      if (character === '}' && --depth === 0) return { start, end: index + 1 };
    }
    return null;
  }

  function replaceFunction(source, functionName, replacement) {
    const bounds = functionBounds(source, functionName);
    if (!bounds) throw new Error('v36 could not locate ' + functionName);
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  function injectBeforeFunction(source, functionName, code, sentinel) {
    if (source.includes(sentinel)) return source;
    const bounds = functionBounds(source, functionName);
    if (!bounds) throw new Error('v36 could not inject before ' + functionName);
    return source.slice(0, bounds.start) + code + '\n\n' + source.slice(bounds.start);
  }

  window.applySansVideoScratchRebuildV36 = source => {
    let result = String(source);

    const rebuiltRuntimeV36 = String.raw`
  // -----------------------------------------------------------------------
  // Video-timed Scratch reconstruction v36
  // One immutable array = one Scratch script. One object = one custom block.
  // Programs run in the same order as the supplied no-hit recording.
  // -----------------------------------------------------------------------
  const SANS_VIDEO_ATTACK_NAMES_V36 = Object.freeze([
    'opening-slam-and-cross-blasters',
    'alternating-high-low-bones',
    'blue-bone-gates',
    'paired-bone-gaps',
    'platform-bone-stream-left',
    'platform-bone-stream-right',
    'crossing-platform-rhythm',
    'four-direction-bone-room',
    'platform-and-side-blasters',
    'rotating-bone-room',
    'fast-high-low-bone-stream',
    'compact-bone-gap-chain',
    'multi-bone-set-a',
    'aimed-small-blasters',
    'multi-bone-set-b',
    'gravity-slam-chain-a',
    'gravity-slam-chain-b',
    'aimed-large-blasters',
    'vertical-bone-rush',
    'mixed-bone-and-blaster-chain',
    'rapid-gravity-slam-chain',
    'final-box-slam',
    'final-corridor-spiral'
  ]);

  const SANS_VIDEO_REFERENCE_SECONDS_V36 = Object.freeze([
    52, 61, 72, 84, 98, 112, 128, 145, 163, 181, 248, 266,
    286, 306, 326, 348, 371, 389, 408, 421, 430, 436, 440
  ]);

  function rebuildSansBlockV36(block, attackIndex) {
    const rebuilt = { ...block, videoAttackIndexV36: attackIndex };
    if (block.options) rebuilt.options = { ...block.options };

    // The recording is no-hit. Preserve a route at least one heart diameter
    // wide after browser scaling and 30 fps quantisation.
    if (rebuilt.type === 'SINE') {
      rebuilt.options.opening = Math.max(36, rebuilt.options.opening || 0);
      rebuilt.options.spacing = Math.max(16, rebuilt.options.spacing || 0);
    }
    if (rebuilt.type === 'BONE_V_REPEAT' || rebuilt.type === 'BONE_H_REPEAT') {
      rebuilt.spacing = Math.max(18, rebuilt.spacing || 0);
    }
    if (rebuilt.type === 'FLOOR' || rebuilt.type === 'EDGE') {
      rebuilt.options.gapRadius = Math.max(18, rebuilt.options.gapRadius || 0);
      rebuilt.options.spacing = Math.max(12, rebuilt.options.spacing || 0);
    }
    if (rebuilt.type === 'TUNNEL') {
      rebuilt.options.speed = Math.min(120, rebuilt.options.speed || 120);
    }
    return Object.freeze(rebuilt);
  }

  const SANS_REBUILT_PROGRAMS_V36 = Object.freeze(
    SANS_BLOCK_PROGRAMS_V29.map((program, attackIndex) => Object.freeze(
      program.map(block => rebuildSansBlockV36(block, attackIndex))
    ))
  );

  window.__SANS_SCRATCH_REBUILD_V36 = Object.freeze({
    version: '20260814-sans-video-scratch-rebuild-v36',
    fps: SANS_BLOCK_FPS_V29,
    attackNames: SANS_VIDEO_ATTACK_NAMES_V36,
    videoReferenceSeconds: SANS_VIDEO_REFERENCE_SECONDS_V36,
    programs: SANS_REBUILT_PROGRAMS_V36,
    nonRepeatingOrder: Object.freeze(Array.from({ length: 23 }, (_, index) => index)),
    assetMode: 'generated-gif-plus-collision-blocks'
  });

  function runSansRebuiltProgramV36(now) {
    const scriptIndex = attackPattern?.sansScriptIndex;
    if (!Number.isInteger(scriptIndex)) return false;
    const frame = Math.floor((now - stateAt) / SANS_BLOCK_FRAME_MS_V29);
    const elapsed = frame / SANS_BLOCK_FPS_V29;
    updateSansBlockContinuousV29(scriptIndex, elapsed);
    const program = SANS_REBUILT_PROGRAMS_V36[scriptIndex] || [];
    for (const block of program) {
      if (elapsed + 1e-7 < block.at) break;
      const eventKey = 'v36-' + scriptIndex + '-' + block.blockIndex;
      if (sansWaveEvents.has(eventKey)) continue;
      sansWaveEvents.add(eventKey);
      const bulletCount = bullets.length;
      const wasSlamming = heart.slamActive;
      executeSansBlockV29(block, now);
      if (bullets.length > bulletCount || (heart.slamActive && !wasSlamming)) {
        lastThreatAt = now;
      }
    }
    return true;
  }
`;

    result = injectBeforeFunction(result, 'runSansBlockProgramV29', rebuiltRuntimeV36,
      'const SANS_REBUILT_PROGRAMS_V36');
    result = replaceFunction(result, 'runSansBlockProgramV29', String.raw`function runSansBlockProgramV29(now) {
    return runSansRebuiltProgramV36(now);
  }`);

    const drawBlasterHeadV36 = String.raw`function drawBlasterHead(bullet, active) {
    const image = window.__SANS_ATTACK_ASSETS_V36?.blasterCharge;
    const arena = battleArena();
    const charge = Math.max(0, Math.min(1, bullet.age / Math.max(.01, bullet.warning)));
    const recoil = active ? Math.round(Math.sin((bullet.age - bullet.warning) * 34)) : 0;
    const scale = bullet.size >= 2 ? 1.42 : bullet.size === 1 ? 1.16 : 1;
    g.save();
    g.imageSmoothingEnabled = false;
    if (bullet.orientation === 'horizontal') {
      const fromRight = bullet.side === 'right';
      g.translate(fromRight ? arena.right + 10 + recoil : arena.left - 10 - recoil, bullet.y);
      g.rotate(fromRight ? Math.PI / 2 : -Math.PI / 2);
    } else {
      const fromBottom = bullet.side === 'bottom';
      g.translate(bullet.x, fromBottom ? arena.bottom + 10 + recoil : arena.top - 10 - recoil);
      if (fromBottom) g.rotate(Math.PI);
    }
    const chargeScale = (.70 + charge * .30) * scale;
    g.scale(chargeScale, chargeScale);
    if (image?.complete && image.naturalWidth) {
      g.globalAlpha = active ? 1 : .72 + Math.sin(bullet.age * 30) * .16;
      g.drawImage(image, -16, -22, 32, 43);
    } else if (blasterReferenceImage.complete && blasterReferenceImage.naturalWidth) {
      g.drawImage(blasterReferenceImage, -15, -19, 30, 38);
    }
    g.restore();
  }`;
    result = replaceFunction(result, 'drawBlasterHead', drawBlasterHeadV36);

    // Use chronological video order: no repeated random attack before all 23
    // Scratch scripts have run once.
    result = result.replace(
      /const SANS_ATTACK_SEQUENCE = Object\.freeze\(\[[^\]]*\]\);/,
      'const SANS_ATTACK_SEQUENCE = Object.freeze(Array.from({ length: 23 }, (_, index) => index));'
    );
    return result;
  };

  console.info('Sans video Scratch rebuild v36 ready:', VERSION);
})();
