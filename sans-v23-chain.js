(() => {
  'use strict';

  let rawV22 = null;
  let chained = null;

  function applyChecked(source, transformer, label) {
    if (typeof transformer !== 'function') return source;
    const candidate = transformer(source);
    try {
      // The generated game is executed as a classic Blob script. Compile the
      // exact candidate first so a bad function-boundary patch cannot blank it.
      new Function(candidate);
      console.info(label + ' applied and syntax checked.');
      return candidate;
    } catch (error) {
      const match = String(error?.stack || error).match(/<anonymous>:(\d+):(\d+)/);
      const line = match ? Number(match[1]) : 0;
      const lines = String(candidate).split('\n');
      const context = line ? lines.slice(Math.max(0, line - 3), line + 2).join('\n') : '';
      console.error(label + ' was rolled back because it generated invalid JavaScript.', {
        error, line, context
      });
      return source;
    }
  }

  Object.defineProperty(window, 'applySansRecursionMediaFixV22', {
    configurable: true,
    enumerable: true,
    get() { return chained || rawV22; },
    set(value) {
      rawV22 = value;
      if (typeof value !== 'function') {
        chained = value;
        return;
      }
      chained = source => {
        let result = value(source);
        if (typeof window.applySansVideoFidelityV23 === 'function') {
          result = window.applySansVideoFidelityV23(result);
          console.info('Sans video-fidelity v23 applied.');
        }
        if (typeof window.applySansBirdReferenceV23 === 'function') {
          result = window.applySansBirdReferenceV23(result);
          console.info('Sans bird-reference v23 applied.');
        }
        // v24's transformer is intentionally skipped: it produced a duplicate
        // identifier declaration at runtime. Its embedded voice sample remains
        // available as window.__sansVoiceBlipV24Data for the corrected v25 patch.
        if (typeof window.applySansStartupSizeFixV25 === 'function') {
          result = window.applySansStartupSizeFixV25(result);
          console.info('Sans startup/size fix v25 applied.');
        }
        if (typeof window.applySansVideoRebuildV26 === 'function') {
          result = window.applySansVideoRebuildV26(result);
          console.info('Sans video rebuild v26 applied.');
        }
        if (typeof window.applySansCompleteFidelityV27 === 'function') {
          result = window.applySansCompleteFidelityV27(result);
          console.info('Sans complete fidelity v27 applied.');
        }
        if (typeof window.applySansPoseEyeFidelityV28 === 'function') {
          result = window.applySansPoseEyeFidelityV28(result);
          console.info('Scratch-style Sans pose/eye fidelity v28 applied.');
        }
        if (typeof window.applySansBlockEngineV29 === 'function') {
          result = applyChecked(result, window.applySansBlockEngineV29,
            'Scratch-style Sans block engine v29');
        }
        if (typeof window.applySansGifCostumesV30 === 'function') {
          result = applyChecked(result, window.applySansGifCostumesV30,
            'Scratch GIF costumes v30');
        }
        if (typeof window.applySansReferenceScaleGapV33 === 'function') {
          result = applyChecked(result, window.applySansReferenceScaleGapV33,
            'Sans reference scale/gap v33');
        }
        if (typeof window.applySansHqItemsFairnessV34 === 'function') {
          result = applyChecked(result, window.applySansHqItemsFairnessV34,
            'Sans HQ portraits/items/fairness v34');
        }
        if (typeof window.applySansOriginalIdleItemsV35 === 'function') {
          result = applyChecked(result, window.applySansOriginalIdleItemsV35,
            'Original Sans idle/item input v35');
        }
        if (typeof window.applySansVideoScratchRebuildV36 === 'function') {
          result = applyChecked(result, window.applySansVideoScratchRebuildV36,
            'Video-timed Scratch battle rebuild v36');
        }
        if (typeof window.applySansDialogueMotionV37 === 'function') {
          result = applyChecked(result, window.applySansDialogueMotionV37,
            'Sans dialogue/motion v37');
        }
        if (typeof window.applySansDialogueBlasterFairnessV38 === 'function') {
          result = applyChecked(result, window.applySansDialogueBlasterFairnessV38,
            'Sans dialogue/blaster/fairness v38');
        }
        if (typeof window.applySansScratchOpeningV39 === 'function') {
          result = applyChecked(result, window.applySansScratchOpeningV39,
            'Sans Scratch opening v39');
        }
        return result;
      };
      chained.__sansV37Chained = true;
    }
  });
})();

