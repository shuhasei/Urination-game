(() => {
  'use strict';

  const PARTS_VERSION = '20260807-omega-parts5';

  function findFunctionSpan(source, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\n)(\\s*)function\\s+' + escaped + '\\s*\\(');
    const match = re.exec(source);
    if (!match) return null;
    const start = match.index + (source[match.index] === '\n' ? 1 : 0);
    const brace = source.indexOf('{', match.index + match[0].length);
    if (brace < 0) return null;
    let depth = 0, state = 'code', quote = '';
    for (let i = brace; i < source.length; i++) {
      const c = source[i], n = source[i + 1] || '';
      if (state === 'line') { if (c === '\n') state = 'code'; continue; }
      if (state === 'block') { if (c === '*' && n === '/') { state = 'code'; i++; } continue; }
      if (state === 'str') { if (c === '\\') i++; else if (c === quote) state = 'code'; continue; }
      if (c === '/' && n === '/') { state = 'line'; i++; continue; }
      if (c === '/' && n === '*') { state = 'block'; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { state = 'str'; quote = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return [start, i + 1]; }
    }
    return null;
  }

  function replaceFunction(source, name, code) {
    const span = findFunctionSpan(source, name);
    if (!span) throw new Error('[Omega parts] missing function: ' + name);
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectHelpers(source) {
    if (source.includes('OMEGA_PARTS_COMPOSITE_V5')) return source;
    const marker = source.search(/(^|\n)\s*function\s+omegaStoryDrawOmega\s*\(/);
    if (marker < 0) throw new Error('[Omega parts] omegaStoryDrawOmega anchor missing');
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const helpers = `  const OMEGA_PARTS_COMPOSITE_V5 = true;
  function omegaPartsImage(name) {
    return window.__omegaPartGifImages && window.__omegaPartGifImages[name]
      && window.__omegaPartGifImages[name].complete ? window.__omegaPartGifImages[name] : null;
  }
  function omegaPartsDrawLayer(img, x, y, w, h, angle=0, dx=0, dy=0, sx=1, sy=1, alpha=1) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    g.save(); g.globalAlpha = alpha; g.imageSmoothingEnabled = false;
    g.translate(x + w / 2 + dx, y + h / 2 + dy); g.rotate(angle); g.scale(sx, sy);
    g.drawImage(img, -w / 2, -h / 2, w, h); g.restore(); g.globalAlpha = 1;
  }
  function omegaPartsDrawComposite(now, mode='normal') {
    rect(0, 0, W, H, '#000');
    const base = (typeof room11OmegaSourceImage !== 'undefined' && room11OmegaSourceImage.complete && room11OmegaSourceImage.naturalWidth)
      ? room11OmegaSourceImage : null;
    const t = now / 1000;
    const rage = mode === 'rage' ? 1 : 0;
    const glitch = mode === 'glitch' ? 1 : 0;
    const amp = 1 + rage * 1.35 + glitch * .55;

    // Keep the original boss readable. The individual GIF layers animate on top.
    if (base) {
      g.save(); g.globalAlpha = .78; g.imageSmoothingEnabled = false;
      g.drawImage(base, 5, -3, 310, 221); g.restore();
    }

    const bob = Math.sin(t * 1.7) * 1.2 * amp;
    const breathe = 1 + Math.sin(t * 1.12) * .009 * amp;
    const eyeTilt = Math.sin(t * 1.35) * .018 * amp;
    const armSwing = Math.sin(t * 1.05) * .026 * amp;

    omegaPartsDrawLayer(omegaPartsImage('core'), 82, 36, 156, 137,
      Math.sin(t * .63) * .006 * amp, 0, bob, breathe, 1 + Math.cos(t * 1.23) * .012 * amp, .96);
    omegaPartsDrawLayer(omegaPartsImage('left_eye'), -3, -3, 159, 105,
      eyeTilt, Math.sin(t * 1.8) * 1.3 * amp, Math.cos(t * 1.2) * .8 * amp, 1, 1, .98);
    omegaPartsDrawLayer(omegaPartsImage('right_eye'), 164, -3, 159, 105,
      -eyeTilt, -Math.sin(t * 1.8) * 1.3 * amp, Math.cos(t * 1.2) * .8 * amp, 1, 1, .98);
    omegaPartsDrawLayer(omegaPartsImage('left_arm'), -12, 67, 151, 124,
      armSwing, Math.sin(t * 1.1) * 2.0 * amp, Math.cos(t * .9) * 1.2 * amp, 1, 1, .98);
    omegaPartsDrawLayer(omegaPartsImage('right_arm'), 181, 67, 151, 124,
      -armSwing, -Math.sin(t * 1.1) * 2.0 * amp, Math.cos(t * .9) * 1.2 * amp, 1, 1, .98);
    omegaPartsDrawLayer(omegaPartsImage('tv'), 96, -8, 128, 82,
      Math.sin(t * 2.1) * .008 * amp, Math.sin(t * 4.6) * .9 * amp,
      Math.cos(t * 3.8) * .7 * amp, 1, 1, 1);

    if (glitch) {
      for (let i = 0; i < 4; i++) {
        const yy = 15 + ((Math.floor(now / 82) * 23 + i * 31) % 116);
        g.globalAlpha = .08 + i * .025; rect((i & 1) ? -2 : 2, yy, W, 1, '#fff');
      }
      g.globalAlpha = 1;
    }
    if (rage) {
      g.globalAlpha = .04 + .025 * Math.abs(Math.sin(t * 16)); rect(0, 0, W, H, '#fff'); g.globalAlpha = 1;
    }
  }
`;
    return source.slice(0, at) + helpers + '\n' + source.slice(at);
  }

  window.applyOmegaPartsFinalHotfix = source => {
    let s = injectHelpers(String(source || ''));
    s = replaceFunction(s, 'omegaStoryDrawOmega', `  function omegaStoryDrawOmega(now, mode='normal') {
    omegaPartsDrawComposite(now, mode);
  }`);
    s = replaceFunction(s, 'drawOmegaMasterBody', `  function drawOmegaMasterBody(now, mode='normal') {
    omegaPartsDrawComposite(now, mode === 'late' ? 'rage' : mode);
  }`);
    if (!s.includes('OMEGA_PARTS_COMPOSITE_V5')) throw new Error('[Omega parts] composite patch failed');
    return s;
  };
})();
