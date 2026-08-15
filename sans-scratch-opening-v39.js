(() => {
  'use strict';

  const VERSION = '20260815-sans-scratch-opening-v39';

  window.applySansScratchOpeningV39 = source => {
    let result = String(source || '');
    const original = `  const SANS_REBUILT_PROGRAMS_V36 = Object.freeze(
    SANS_BLOCK_PROGRAMS_V29.map((program, attackIndex) => Object.freeze(
      program.map(block => rebuildSansBlockV36(block, attackIndex))
    ))
  );`;
    if (!result.includes(original)) throw new Error('v39 could not locate rebuilt program table');

    const replacement = String.raw`  // Opening reconstructed from the supplied Scratch recording at 30 fps:
  // blue down-slam, floor teeth, paired bone corridor, four-way blasters,
  // orthogonal cross, diagonal cross, then the left/right finishing blast.
  const SANS_SCRATCH_OPENING_V39 = SP(
    SB.arena(.01, 'square'),
    SB.soul(.01, 'blue', GravityDirection.DOWN, true),
    SB.gesture(.01, GravityDirection.DOWN, 720),
    SB.slam(.08, GravityDirection.DOWN, 520),
    SB.floor(.32, { height: 12, spacing: 10, life: .62, gapRadius: 13 }),

    SB.clear(.94),
    SB.soul(.94, 'red', GravityDirection.DOWN, true),
    SB.gesture(.98, GravityDirection.RIGHT, 760),
    SB.sine(1.08, 'square', 13, 245, 20,
      { opening: 29, spacing: 17, life: 1.34, phase: -.55 }),

    SB.blasters(1.72, [
      [2,0,0,189,246,0,.46,.24], [2,0,0,259,166,90,.46,.24],
      [2,640,480,449,366,180,.46,.24], [2,640,480,379,446,270,.46,.24]
    ]),
    SB.blasters(2.42, [
      [2,0,240,139,306,0,.42,.22], [2,640,240,499,306,180,.42,.22],
      [2,320,0,319,156,90,.42,.22], [2,320,480,319,456,270,.42,.22]
    ]),
    SB.blasters(3.12, [
      [2,0,0,189,176,45,.44,.22], [2,640,0,449,176,135,.44,.22],
      [2,640,480,449,436,225,.44,.22], [2,0,480,189,436,315,.44,.22]
    ]),
    SB.blasters(3.86, [
      [1,0,0,189,246,0,.38,.20], [1,0,0,259,166,90,.38,.20],
      [1,640,480,449,366,180,.38,.20], [1,640,480,379,446,270,.38,.20]
    ]),
    SB.clear(4.62),
    SB.blasters(4.72, [
      [2,0,240,139,306,0,.56,.30], [2,640,240,499,306,180,.56,.30]
    ]),
    SB.blasters(5.54, [
      [2,320,0,319,156,90,.48,.24], [2,320,480,319,456,270,.48,.24]
    ]),
    SB.clear(6.35)
  );

  const SANS_REBUILT_PROGRAMS_V36 = Object.freeze(
    SANS_BLOCK_PROGRAMS_V29.map((program, attackIndex) => Object.freeze(
      (attackIndex === 0 ? SANS_SCRATCH_OPENING_V39 : program)
        .map(block => rebuildSansBlockV36(block, attackIndex))
    ))
  );`;

    result = result.replace(original, replacement);
    return result;
  };

  window.__SANS_SCRATCH_OPENING_V39 = Object.freeze({
    version: VERSION,
    fps: 30,
    duration: 6.35,
    phases: Object.freeze([
      'blue-down-slam', 'floor-teeth', 'paired-bone-corridor',
      'four-way-blasters', 'orthogonal-cross', 'diagonal-cross',
      'left-right-finish'
    ])
  });
  document.documentElement.dataset.sansV39 = 'ready';
  console.info('Sans Scratch opening v39 ready:', VERSION);
})();

