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

  function patchBeamThickness(source) {
    const before = `        const beamWidth = stage === 10\n          ? Math.max(5, bullet.thickness || 5)\n          : 9;`;
    const after = `        const beamWidth = stage === 10\n          ? Math.max(7, (bullet.thickness || 5) + 2)\n          : 9;`;
    if (source.includes(before)) return source.replace(before, after);
    return source.replace(
      'Math.max(5, bullet.thickness || 5)',
      'Math.max(7, (bullet.thickness || 5) + 2)'
    );
  }

  const drawSoulBreakV18 = `  function drawSoulBreak(now) {
    rect(0, 0, W, H, '#000');
    const elapsed = now - defeatAt;
    const cx = 160;
    const cy = 90;
    const scale = 1;
    const rows = SOUL_PIXELS.length;
    const cols = SOUL_PIXELS[0].length;
    const midX = cols / 2;
    const midY = rows / 2;
    const pieces = [
      { right: false, bottom: false, sx: -2.2, sy: -2.0, vx: -27, vy: -34, spin: -1.20 },
      { right: true,  bottom: false, sx:  2.2, sy: -2.0, vx:  29, vy: -38, spin:  1.30 },
      { right: false, bottom: true,  sx: -2.4, sy:  2.1, vx: -34, vy: -12, spin: -0.95 },
      { right: true,  bottom: true,  sx:  2.4, sy:  2.1, vx:  36, vy:  -8, spin:  1.05 }
    ];

    const drawQuarter = (piece, ox = 0, oy = 0, angle = 0, alpha = 1) => {
      g.save();
      g.translate(cx + ox, cy + oy);
      g.rotate(angle);
      g.globalAlpha = alpha;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (SOUL_PIXELS[row][col] !== '1') continue;
          if ((col >= midX) !== piece.right) continue;
          if ((row >= midY) !== piece.bottom) continue;
          rect((col - midX) * scale, (row - midY) * scale,
            scale, scale, '#f5222d');
        }
      }
      g.restore();
    };

    // Keep the soul intact briefly, then reveal a four-way crack before the
    // four actual heart quarters fly apart.  No substitute particle cloud is
    // used: the visible fragments remain pieces of the original heart.
    if (elapsed < 360) {
      for (const piece of pieces) drawQuarter(piece);
      return;
    }

    if (elapsed < 660) {
      const p = smoothstep01((elapsed - 360) / 300);
      for (const piece of pieces) {
        drawQuarter(piece, piece.sx * p, piece.sy * p, piece.spin * p * .05);
      }
      return;
    }

    const t = Math.max(0, (elapsed - 660) / 1000);
    const alpha = Math.max(0, 1 - t / 1.08);
    for (const piece of pieces) {
      const ox = piece.sx + piece.vx * t;
      const oy = piece.sy + piece.vy * t + 39 * t * t;
      const angle = piece.spin * Math.min(1.25, t * 1.35);
      drawQuarter(piece, ox, oy, angle, alpha);
    }
  }`;

  const passageV18 = `  function enforceMinimumSansPassage(dt = 0) {
    if (stage !== 10 || state !== 'enemyTurn') return;

    const radius = Math.max(1.8, battleSoulRadius() - .55);
    // Leave a real traversal margin around the collision circle.  v6 only
    // allowed about 2 px beyond the diameter, which looked correct but could
    // become impassable once two moving bone columns crossed between frames.
    const requiredGap = radius * 2 + (isCompactBattleSoul() ? 4.0 : 5.0);
    const transitionOverlap = radius * 2 + 2.2;
    const predictX = bullet => bullet.x + bullet.vx * dt;
    const predictY = bullet => bullet.y + bullet.vy * dt;

    const trimVerticalPair = (top, bottom, extraGap = 0) => {
      const topEnd = predictY(top) + effectiveBoneExtent(top);
      const bottomStart = predictY(bottom) - effectiveBoneExtent(bottom);
      const target = requiredGap + extraGap;
      const gap = bottomStart - topEnd;
      if (gap >= target) return;
      const need = target - gap + .18;
      const topTrim = Math.min(Math.max(0, top.h - 2), need / 2);
      const bottomTrim = Math.min(Math.max(0, bottom.h - 2), need - topTrim);
      top.h = Math.max(2, top.h - topTrim);
      bottom.h = Math.max(2, bottom.h - bottomTrim);
    };

    const trimHorizontalPair = (left, right) => {
      const leftExtent = effectiveBoneExtent(left);
      const rightExtent = effectiveBoneExtent(right);
      const leftStart = left.fromStart ? predictX(left) : predictX(left) - leftExtent;
      const rightStart = right.fromStart ? predictX(right) : predictX(right) - rightExtent;
      const leftEnd = leftStart + leftExtent;
      const rightEnd = rightStart + rightExtent;
      const a = leftStart <= rightStart
        ? { bullet: left, end: leftEnd }
        : { bullet: right, end: rightEnd };
      const b = leftStart <= rightStart
        ? { bullet: right, start: rightStart }
        : { bullet: left, start: leftStart };
      const gap = b.start - a.end;
      if (gap >= requiredGap || gap < -4) return;
      const need = requiredGap - gap + .18;
      const aExtent = effectiveBoneExtent(a.bullet);
      const bExtent = effectiveBoneExtent(b.bullet);
      const aTrim = Math.min(Math.max(0, aExtent - 2), need / 2);
      const bTrim = Math.min(Math.max(0, bExtent - 2), need - aTrim);
      a.bullet.length = Math.max(2, aExtent - aTrim);
      b.bullet.length = Math.max(2, bExtent - bTrim);
    };

    const tops = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && b.fromTop);
    const bottoms = bullets.filter(b => b.kind === 'bone'
      && b.orientation !== 'horizontal' && !b.fromTop);
    const gates = [];

    for (const top of tops) {
      let best = null;
      let bestDistance = Infinity;
      for (const bottom of bottoms) {
        const distance = Math.abs(predictX(top) - predictX(bottom));
        if (distance <= 7.5 && distance < bestDistance) {
          best = bottom;
          bestDistance = distance;
        }
      }
      if (!best) continue;
      trimVerticalPair(top, best);
      gates.push({
        x: (predictX(top) + predictX(best)) / 2,
        top,
        bottom: best,
        low: predictY(top) + effectiveBoneExtent(top),
        high: predictY(best) - effectiveBoneExtent(best),
        vx: (top.vx + best.vx) / 2
      });
    }

    // Adjacent moving gates also need a shared corridor wide enough for the
    // heart to transfer from one opening to the next instead of being trapped
    // by a one-frame diagonal pinch.
    gates.sort((a, b) => a.x - b.x);
    for (let i = 1; i < gates.length; i++) {
      const a = gates[i - 1];
      const b = gates[i];
      const dx = Math.abs(b.x - a.x);
      if (dx > 26 || Math.abs(a.vx - b.vx) > 45) continue;
      const overlap = Math.min(a.high, b.high) - Math.max(a.low, b.low);
      if (overlap >= transitionOverlap) continue;
      const extra = Math.min(7, transitionOverlap - overlap);
      trimVerticalPair(a.top, a.bottom, extra / 2);
      trimVerticalPair(b.top, b.bottom, extra / 2);
    }

    const horizontal = bullets.filter(b => b.kind === 'bone'
      && b.orientation === 'horizontal');
    for (let i = 0; i < horizontal.length; i++) {
      for (let j = i + 1; j < horizontal.length; j++) {
        if (Math.abs(predictY(horizontal[i]) - predictY(horizontal[j])) > 7.5) continue;
        trimHorizontalPair(horizontal[i], horizontal[j]);
      }
    }
  }`;

  function patchOpeningAttack(source) {
    // Keep the reference sequence intact.  The earlier fidelity layer already
    // advances the initial slam to .30 s; only retain that faster opening if a
    // legacy .36 s copy survives another patch layer.
    return source.replace("once('s0-slam', .36, () => {", "once('s0-slam', .30, () => {");
  }

  function applySansReferencePolishV18(source) {
    let result = String(source || '');
    result = patchOpeningAttack(result);
    result = patchBeamThickness(result);
    result = replaceFunction(result, 'drawSoulBreak', drawSoulBreakV18);
    result = replaceFunction(result, 'enforceMinimumSansPassage', passageV18);
    result = result.replace('    enforceMinimumSansPassage();', '    enforceMinimumSansPassage(dt);');
    return result;
  }

  window.applySansReferencePolishV18 = applySansReferencePolishV18;
})();
