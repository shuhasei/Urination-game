(() => {
  'use strict';

  const VERSION = '20260814-sans-original-idle-items-v35';
  const originalFrameSources = [
    'data:image/png;base64,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',
    'data:image/png;base64,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',
    'data:image/png;base64,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'
  ];
  const originalFrames = originalFrameSources.map(source => {
    const image = new Image();
    image.src = source;
    return image;
  });
  // 42 ms per frame keeps the motion quick, while repeated neutral frames
  // prevent the one-pixel sleeve movement from looking like vibration.
  window.__SANS_ORIGINAL_IDLE_V35 = [
    originalFrames[0], originalFrames[1], originalFrames[1], originalFrames[0],
    originalFrames[2], originalFrames[2], originalFrames[0], originalFrames[0]
  ];

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
    if (!bounds) throw new Error('v35 could not locate ' + functionName);
    return source.slice(0, bounds.start) + replacement + source.slice(bounds.end);
  }

  window.applySansOriginalIdleItemsV35 = source => {
    let result = String(source);

    const generatedIdle = `    const highQualitySans = window.__SANS_HQ_ASSETS_V34?.sans;
    if (drawImageCostume(highQualitySans, 58)) return;
    const idleFrame = library.frameAt(costume.idleLarge, scratchTime - stateAt, true);
    if (switchCostume(costume.idleLarge, idleFrame, 56)) return;
    drawImageCostume(sansReferenceImage, 54);`;
    const originalIdle = `    const originalIdleFramesV35 = window.__SANS_ORIGINAL_IDLE_V35 || [];
    const originalIdleFrameV35 = originalIdleFramesV35[Math.floor(scratchTime / 42) % originalIdleFramesV35.length];
    if (drawImageCostume(originalIdleFrameV35, 56)) return;
    const idleFrame = library.frameAt(costume.idleLarge, scratchTime - stateAt, true);
    if (switchCostume(costume.idleLarge, idleFrame, 56)) return;
    drawImageCostume(sansReferenceImage, 54);`;
    if (!result.includes(generatedIdle)) throw new Error('v35 could not replace generated Sans idle');
    result = result.replace(generatedIdle, originalIdle);

    const handlePressedV35 = `function handlePressed() {
    const confirmPressedV35 = pressed.has('Enter') || pressed.has('KeyZ') || pressed.has('Space');
    if (state === 'stageClear') {
      if (pressed.has('ArrowLeft')) { clearChoice = 0; beep(); }
      if (pressed.has('ArrowRight')) { clearChoice = 1; beep(); }
    } else if (state === 'command') {
      if (pressed.has('ArrowLeft')) {
        menu = (menu + 3) % 4;
        beep();
      }
      if (pressed.has('ArrowRight')) {
        menu = (menu + 1) % 4;
        beep();
      }
    } else if (state === 'itemSelect') {
      const available = sansItemsV34.filter(item => !item.used);
      if (available.length) {
        if (pressed.has('ArrowLeft')) { itemCursorV34 = Math.max(0, itemCursorV34 - 1); beep(); }
        if (pressed.has('ArrowRight')) { itemCursorV34 = Math.min(available.length - 1, itemCursorV34 + 1); beep(); }
        if (pressed.has('ArrowUp')) { itemCursorV34 = Math.max(0, itemCursorV34 - 2); beep(); }
        if (pressed.has('ArrowDown')) { itemCursorV34 = Math.min(available.length - 1, itemCursorV34 + 2); beep(); }
      }
    } else if (state === 'target') {
      if (pressed.has('ArrowLeft') || pressed.has('ArrowUp')) {
        nextAliveTarget(-1);
        beep();
      }
      if (pressed.has('ArrowRight') || pressed.has('ArrowDown')) {
        nextAliveTarget(1);
        beep();
      }
    }
    if ((pressed.has('Escape') || pressed.has('KeyX')) &&
        (state === 'target' || state === 'result' || state === 'itemSelect')) {
      setState('command', ['＊ どうする？']);
    } else if (confirmPressedV35) {
      // Confirmation runs after cursor movement. This prevents ITEM from being
      // opened and consumed during the same input frame.
      confirm();
    }
    pressed.clear();
  }`;
    result = replaceFunction(result, 'handlePressed', handlePressedV35);

    const pointerConfirm = "    if (state !== 'enemyTurn') confirm();";
    const pointerSelection = `    const pointerBoundsV35 = canvas.getBoundingClientRect();
    const pointerXV35 = (event.clientX - pointerBoundsV35.left) * W / pointerBoundsV35.width;
    const pointerYV35 = (event.clientY - pointerBoundsV35.top) * H / pointerBoundsV35.height;
    if (state === 'command' && pointerYV35 >= 158) {
      const commandBoxesV35 = [[53, 104], [108, 159], [169, 220], [230, 281]];
      const commandIndexV35 = commandBoxesV35.findIndex(box => pointerXV35 >= box[0] && pointerXV35 <= box[1]);
      if (commandIndexV35 >= 0) {
        menu = commandIndexV35;
        confirm();
        event.preventDefault();
        return;
      }
    }
    if (state === 'itemSelect' && pointerXV35 >= 31 && pointerXV35 <= 289 &&
        pointerYV35 >= 84 && pointerYV35 <= 144) {
      const availableV35 = sansItemsV34.filter(item => !item.used);
      const columnV35 = pointerXV35 >= 157 ? 1 : 0;
      const rowV35 = Math.max(0, Math.min(2, Math.floor((pointerYV35 - 91) / 16)));
      const selectedV35 = rowV35 * 2 + columnV35;
      if (selectedV35 < availableV35.length) {
        itemCursorV34 = selectedV35;
        confirm();
        event.preventDefault();
        return;
      }
    }
    if (state !== 'enemyTurn') confirm();`;
    if (!result.includes(pointerConfirm)) throw new Error('v35 could not add pointer item selection');
    result = result.replace(pointerConfirm, pointerSelection);

    return result;
  };

  console.info('Original Sans idle and item input v35 ready:', VERSION);
})();