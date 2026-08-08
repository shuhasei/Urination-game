(() => {
  'use strict';

  const PARTS_VERSION = '20260808-omega-video7';

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
    if (!span) throw new Error('[Omega video reference] missing function: ' + name);
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectHelpers(source) {
    if (source.includes('OMEGA_VIDEO_REFERENCE_V7')) return source;
    const marker = source.search(/(^|\n)\s*function\s+omegaStoryDrawOmega\s*\(/);
    if (marker < 0) throw new Error('[Omega video reference] omegaStoryDrawOmega anchor missing');
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const helpers = `  // === OMEGA FLOWEY VIDEO-REFERENCE RIG ${PARTS_VERSION} ===
  // The attached gameplay video shows a mostly stable body: the strongest motion is
  // in the TV, attack overlays and small organic drift. Keep the Live2D guide layer
  // separation, but intentionally avoid exaggerated puppet-like swinging.
  const OMEGA_VIDEO_REFERENCE_V7 = true;
  const OMEGA_VIDEO_LAYER_SPEC_V7 = Object.freeze([
    ['bg_black','background','-'],
    ['pipe_thick_1','back','pitch black background'],['pipe_thick_2','back','pitch black background'],
    ['vein_red_1','back','pitch black background'],['vein_red_2','back','pitch black background'],
    ['leg_l','rear-mid','pitch black background'],['leg_r','rear-mid','pitch black background'],
    ['stem_bottom','mid','dark background, red veins, metallic pipes'],
    ['stem_mid','mid','dark background, red veins, metallic pipes'],
    ['stem_top','mid','dark background, red veins, metallic pipes'],
    ['arm_l_shoulder','mid','metallic pipes, dark background'],['arm_l_elbow','mid','metallic pipes, dark background'],['arm_l_hand','mid','metallic pipes, dark background'],
    ['arm_r_shoulder','mid','metallic pipes, dark background'],['arm_r_elbow','mid','metallic pipes, dark background'],['arm_r_hand','mid','metallic pipes, dark background'],
    ['giant_eye_l','front-mid','metallic pipes, dark organic flesh'],['giant_eye_r','front-mid','metallic pipes, dark organic flesh'],
    ['flesh_jaw','front-mid','metallic tubes, dark background, giger style'],
    ['rib_l_1','front','green plant stem with thorns, organic texture'],['rib_l_2','front','green plant stem with thorns, organic texture'],['rib_l_3','front','green plant stem with thorns, organic texture'],['rib_l_4','front','green plant stem with thorns, organic texture'],
    ['rib_r_1','front','green plant stem with thorns, organic texture'],['rib_r_2','front','green plant stem with thorns, organic texture'],['rib_r_3','front','green plant stem with thorns, organic texture'],['rib_r_4','front','green plant stem with thorns, organic texture'],
    ['tv_frame','front','dark organic flesh, wires, dark background'],['tv_screen_bg','front','-'],
    ['tv_face_eye_l','front','tv static noise, glitch effect'],['tv_face_eye_r','front','tv static noise, glitch effect'],['tv_face_mouth','front','tv static noise, glitch effect']
  ]);
  const OMEGA_REF_W = 320, OMEGA_REF_H = 213;

  function omegaVideoImage() {
    const uploaded = window.__omegaFloweyPreloadedImage;
    if (uploaded && uploaded.complete && uploaded.naturalWidth) return uploaded;
    if (typeof room11OmegaSourceImage !== 'undefined' && room11OmegaSourceImage.complete && room11OmegaSourceImage.naturalWidth) return room11OmegaSourceImage;
    return null;
  }
  function omegaVideoSrc(img, x, y, w, h) {
    return [x * img.naturalWidth / OMEGA_REF_W, y * img.naturalHeight / OMEGA_REF_H,
      w * img.naturalWidth / OMEGA_REF_W, h * img.naturalHeight / OMEGA_REF_H];
  }
  function omegaVideoDrawCrop(img, sx, sy, sw, sh, dx, dy, dw, dh, px, py, angle=0, tx=0, ty=0, scaleX=1, scaleY=1, alpha=1) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const s = omegaVideoSrc(img, sx, sy, sw, sh);
    g.save(); g.globalAlpha = alpha; g.imageSmoothingEnabled = false;
    g.translate(px + tx, py + ty); g.rotate(angle); g.scale(scaleX, scaleY); g.translate(-px, -py);
    g.drawImage(img, s[0], s[1], s[2], s[3], dx, dy, dw, dh);
    g.restore(); g.globalAlpha = 1;
  }
  function omegaVideoStroke(points, color, width=1, alpha=1) {
    if (!points.length) return;
    g.save(); g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i][0], points[i][1]);
    g.stroke(); g.restore();
  }
  function omegaVideoCircle(x, y, r, color, alpha=1) {
    g.save(); g.globalAlpha = alpha; g.fillStyle = color; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
  }
  function omegaVideoNoise(seed) {
    let n = seed | 0;
    n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
    return ((n >>> 0) % 10000) / 10000;
  }
  function omegaVideoBackfill(t, mode) {
    rect(0, 0, W, H, '#000');
    const pipe = '#4c4d52', pipeDark = '#24252a', vein = '#6f141d';
    const pulse = .43 + .10 * Math.sin(t * 1.1);
    omegaVideoStroke([[17, 5],[34, 28],[58, 42],[89, 52],[113, 68]], pipe, 4, .35);
    omegaVideoStroke([[303, 5],[286, 28],[262, 42],[231, 52],[207, 68]], pipe, 4, .35);
    omegaVideoStroke([[96, 6],[107, 32],[112, 60],[122, 78]], pipeDark, 3, .42);
    omegaVideoStroke([[224, 6],[213, 32],[208, 60],[198, 78]], pipeDark, 3, .42);
    omegaVideoStroke([[146, 71],[144, 101],[148, 133],[145, 170]], vein, 1, pulse);
    omegaVideoStroke([[174, 71],[176, 101],[172, 133],[175, 170]], vein, 1, pulse);
    if (mode === 'rage') {
      g.globalAlpha = .025 + .02 * Math.abs(Math.sin(t * 13)); rect(0, 0, W, H, '#fff'); g.globalAlpha = 1;
    }
  }
  function omegaVideoDrawBase(img, t, amp) {
    const bob = Math.sin(t * .72) * .16 * amp;
    const sx = 1 + Math.sin(t * .49) * .0008 * amp;
    const sy = 1 + Math.sin(t * .83) * .0017 * amp;
    g.save(); g.imageSmoothingEnabled = false;
    g.translate(160, 5 + bob); g.scale(sx, sy); g.translate(-160, -5);
    g.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, -1, 320, 213);
    g.restore();
  }
  function omegaVideoDrawArms(img, t, amp) {
    // The gameplay reference keeps both plant arms nearly fixed. Only a slow, tiny
    // shoulder/hand drift is applied so the source silhouette stays recognizable.
    const l = Math.sin(t * .64) * .0042 * amp;
    const r = -Math.sin(t * .64 + .31) * .0042 * amp;
    omegaVideoDrawCrop(img, 0, 60, 108, 153, 0, 59, 108, 153, 102, 72, l, 0, Math.sin(t * .82) * .28 * amp, 1, 1, .985);
    omegaVideoDrawCrop(img, 212, 60, 108, 153, 212, 59, 108, 153, 218, 72, r, 0, Math.sin(t * .82 + .3) * .28 * amp, 1, 1, .985);
  }
  function omegaVideoDrawCore(img, t, amp) {
    const jawBob = Math.sin(t * .91) * .16 * amp;
    const jawScale = 1 + Math.sin(t * .78) * .0018 * amp;
    omegaVideoDrawCrop(img, 103, 52, 114, 102, 103, 52, 114, 102, 160, 66, Math.sin(t * .43) * .0015 * amp, 0, jawBob, jawScale, 1 + (jawScale - 1) * 1.4, .992);
    // Restore the short segmented teeth visible in the video after the white source
    // background has been keyed away.
    g.save(); g.fillStyle = '#d7d3c8'; g.globalAlpha = .78;
    for (let i = 0; i < 7; i++) {
      const yy = 103 + i * 7.1;
      const wobble = Math.sin(t * .9 + i * .7) * .18 * amp;
      g.fillRect(149 + wobble, yy, 2.4, 4.2);
      g.fillRect(168 - wobble, yy, 2.4, 4.2);
    }
    g.restore(); g.globalAlpha = 1;
  }
  function omegaVideoDrawEyes(img, t, amp) {
    const lookX = Math.sin(t * .41) * .34 * amp;
    const lookY = Math.sin(t * .57 + 1.1) * .15 * amp;
    const tilt = Math.sin(t * .53) * .0022 * amp;
    omegaVideoDrawCrop(img, 55, 42, 66, 39, 55, 42, 66, 39, 109, 61, tilt, lookX, lookY, 1, 1, .994);
    omegaVideoDrawCrop(img, 199, 42, 66, 39, 199, 42, 66, 39, 211, 61, -tilt, -lookX, lookY, 1, 1, .994);
  }
  function omegaVideoDrawRibs(t, amp) {
    // Very low-amplitude rib breathing: enough to feel organic, unlike the stronger
    // swings in the previous build, and closer to the supplied battle footage.
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const yy = 96 + i * 12.5;
      const flex = Math.sin(t * .68 + i * .43) * .32 * amp;
      g.strokeStyle = i & 1 ? '#b8b6ae' : '#92918c'; g.lineWidth = 1.35; g.globalAlpha = .32;
      g.beginPath(); g.moveTo(151, yy); g.quadraticCurveTo(140 - flex, yy + 1, 130 - flex, yy + 7); g.stroke();
      g.beginPath(); g.moveTo(169, yy); g.quadraticCurveTo(180 + flex, yy + 1, 190 + flex, yy + 7); g.stroke();
    }
    g.restore(); g.globalAlpha = 1;
  }
  function omegaVideoDrawTv(img, now, t, amp, mode) {
    const screen = { x: 119, y: 10, w: 82, h: 35 };
    const cycle = t % 7.6;
    const forcedGlitch = mode === 'glitch';
    const staticPhase = forcedGlitch || (cycle >= 5.65 && cycle < 6.12);
    const silhouettePhase = !forcedGlitch && cycle >= 6.12 && cycle < 6.72;
    const jitter = (forcedGlitch ? .85 : mode === 'rage' ? .42 : .16) * amp;
    const tx = Math.sin(t * 8.3) * jitter, ty = Math.cos(t * 7.1) * jitter * .55;

    if (staticPhase) {
      g.save(); g.fillStyle = '#050505'; g.fillRect(screen.x, screen.y, screen.w, screen.h);
      const frame = Math.floor(now / 45);
      for (let i = 0; i < 34; i++) {
        const n1 = omegaVideoNoise(frame * 97 + i * 23), n2 = omegaVideoNoise(frame * 193 + i * 41 + 7);
        g.globalAlpha = .28 + n2 * .7; g.fillStyle = n1 > .48 ? '#fff' : '#a8a8a8';
        const yy = screen.y + Math.floor(n1 * screen.h), xx = screen.x + Math.floor(n2 * screen.w);
        g.fillRect(xx, yy, 2 + Math.floor(n1 * 9), 1);
      }
      g.restore(); g.globalAlpha = 1;
    } else if (silhouettePhase) {
      g.save(); g.fillStyle = '#020202'; g.fillRect(screen.x, screen.y, screen.w, screen.h);
      g.globalAlpha = .92; g.fillStyle = '#fff';
      g.beginPath(); g.ellipse(screen.x + 45 + tx, screen.y + 17 + ty, 10, 14, -.35, 0, Math.PI * 2); g.fill();
      g.fillRect(screen.x + 29 + tx, screen.y + 10 + ty, 24, 3);
      g.globalAlpha = .42; g.fillRect(screen.x + 18, screen.y + 23, 46, 2);
      g.restore(); g.globalAlpha = 1;
    } else {
      omegaVideoDrawCrop(img, screen.x, screen.y, screen.w, screen.h, screen.x, screen.y, screen.w, screen.h,
        screen.x + screen.w / 2, screen.y + screen.h / 2, Math.sin(t * 1.7) * .0015 * amp, tx, ty, 1, 1, 1);
      // In the reference video the TV eye colors swap rapidly between red and green.
      const swap = (Math.floor(t * 3.2) & 1) !== 0;
      omegaVideoCircle(145 + tx, 23 + ty, 2.1, swap ? '#54d96b' : '#d32020', .82);
      omegaVideoCircle(175 + tx, 23 + ty, 2.1, swap ? '#d32020' : '#54d96b', .82);
    }
    if (mode === 'rage' && Math.abs(Math.sin(t * 10.5)) > .88) {
      g.globalAlpha = .055; rect(screen.x, screen.y, screen.w, screen.h, '#fff'); g.globalAlpha = 1;
    }
  }
  function omegaPartsDrawComposite(now, mode='normal') {
    const img = omegaVideoImage();
    if (!img) { rect(0, 0, W, H, '#000'); return; }
    const t = now / 1000;
    const amp = 1 + (mode === 'rage' ? .55 : 0) + (mode === 'glitch' ? .28 : 0);
    omegaVideoBackfill(t, mode);
    omegaVideoDrawBase(img, t, amp);
    omegaVideoDrawArms(img, t, amp);
    omegaVideoDrawCore(img, t, amp);
    omegaVideoDrawEyes(img, t, amp);
    omegaVideoDrawRibs(t, amp);
    omegaVideoDrawTv(img, now, t, amp, mode);
    if (mode === 'glitch') {
      const frame = Math.floor(now / 58);
      for (let i = 0; i < 4; i++) {
        const yy = 15 + Math.floor(omegaVideoNoise(frame * 31 + i * 71) * 128);
        g.globalAlpha = .045 + i * .014; rect((i & 1) ? -2 : 2, yy, W, 1, '#fff');
      }
      g.globalAlpha = 1;
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
    if (!s.includes('OMEGA_VIDEO_REFERENCE_V7')) throw new Error('[Omega video reference] composite patch failed');
    return s;
  };
})();
