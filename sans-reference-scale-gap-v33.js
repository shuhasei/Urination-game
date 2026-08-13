(() => {
  'use strict';

  const VERSION = '20260814-sans-reference-scale-gap-v33';

  function replaceRequired(source, before, after, label) {
    if (!source.includes(before)) {
      console.warn('Sans v33 target was not found:', label);
      return source;
    }
    return source.replace(before, after);
  }

  window.applySansReferenceScaleGapV33 = source => {
    let result = String(source || '');

    // The heart collision diameter is at most 4.5 logical pixels. A 30 px
    // corridor therefore retains over 25 px of genuinely passable space.
    result = replaceRequired(result,
      'const opening = Math.max(20, options.opening || 20);',
      'const opening = Math.max(30, options.opening || 30);',
      'sine-bone minimum opening');

    // The recorded top/bottom pair previously left only 18 px. Reducing the
    // top bone by 14 px makes every generated pair leave exactly 32 px.
    result = replaceRequired(result,
      'const heightT = 111 - heightB;',
      'const heightT = 97 - heightB;',
      'recorded bone-gap vertical clearance');

    // Forced landings need a full keyboard-reachable pocket, not a one-heart
    // notch. Both floor and ceiling patterns now reserve a 32 px diameter.
    result = result.replaceAll(
      'const gapRadius = Math.max(stage === 10 ? 10 : 0, options.gapRadius ?? 7);',
      'const gapRadius = Math.max(stage === 10 ? 16 : 0, options.gapRadius ?? 7);');

    return result;
  };

  console.info('Sans reference scale/gap v33 ready:', VERSION);
})();

