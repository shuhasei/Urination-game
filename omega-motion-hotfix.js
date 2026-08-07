(() => {
  'use strict';
  const MOTION_VERSION = '20260807-omega-motion2';

  function findFunctionSpan(source, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\n)(\\s*)function\\s+' + escaped + '\\s*\\(');
    const match = re.exec(source);
    if (!match) return null;
    const start = match.index + (source[match.index] === '\n' ? 1 : 0);
    const brace = source.indexOf('{', match.index + match[0].length);
    if (brace < 0) return null;
    let depth = 0, mode = 'code', quote = '';
    for (let i = brace; i < source.length; i++) {
      const c = source[i], n = source[i + 1] || '';
      if (mode === 'line') { if (c === '\n') mode = 'code'; continue; }
      if (mode === 'block') { if (c === '*' && n === '/') { mode = 'code'; i++; } continue; }
      if (mode === 'string') { if (c === '\\') i++; else if (c === quote) mode = 'code'; continue; }
      if (c === '/' && n === '/') { mode = 'line'; i++; continue; }
      if (c === '/' && n === '*') { mode = 'block'; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { mode = 'string'; quote = c; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) return [start, i + 1]; }
    }
    return null;
  }

  function replaceFunction(source, name, code) {
    const span = findFunctionSpan(source, name);
    if (!span) throw new Error('[Omega motion] missing function: ' + name);
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  window.applyOmegaMotionHotfix = source => {
    let s = String(source || '');
    if (!s.includes('omegaStoryDrawOmega')) throw new Error('[Omega motion] story layer missing');
    if (!s.includes('OMEGA_MOTION_HELPERS')) {
      const anchor = s.search(/(^|\n)\s*function\s+omegaStoryDrawOmega\s*\(/);
      if (anchor < 0) throw new Error('[Omega motion] anchor missing');
      const at = anchor + (s[anchor] === '\n' ? 1 : 0);
      const helpers = `  const OMEGA_MOTION_HELPERS = true;
  function omegaMotionPose(now,mode='normal'){
    const t=now/1000, rage=mode==='rage'?1:0, glitch=mode==='glitch'?1:0;
    return {bob:Math.sin(t*1.82)*2.1+Math.sin(t*.47)*.8,rot:Math.sin(t*.76)*(.006+rage*.012),sx:1+Math.sin(t*1.23)*.006,sy:1+Math.cos(t*1.67)*.012,
      tvx:Math.sin(t*5.1)*(0.7+rage*1.4),tvy:Math.cos(t*4.6)*(0.6+rage*1.2),wave:2.2+rage*3.4+glitch*1.8};
  }
  function omegaMotionDrawSegmentedImage(img,now,mode='normal'){
    if(!img||!img.complete||!img.naturalWidth)return false;const p=omegaMotionPose(now,mode),x=5,y=-3,w=310,h=221,bands=18,bh=h/bands;
    g.save();g.translate(160,108+p.bob);g.rotate(p.rot);g.scale(p.sx,p.sy);g.translate(-160,-108);
    for(let i=0;i<bands;i++){const dy=i*bh,offset=Math.sin(now*.0023+i*.67)*p.wave*(i<7?.45:i<13?.8:1);g.drawImage(img,0,img.naturalHeight*i/bands,img.naturalWidth,img.naturalHeight/bands,x+offset,y+dy,w,bh+1);}
    g.restore();
    // TV/upper-face area gets a faster micro-jitter while the flesh remains slow.
    g.save();g.globalAlpha=.32;g.beginPath();g.rect(126,0,70,39);g.clip();g.drawImage(img,5+p.tvx,-3+p.tvy,310,221);g.restore();
    return true;
  }
  function omegaMotionOverlay(now,mode='normal'){
    if(mode==='rage'){g.globalAlpha=.035+.025*Math.abs(Math.sin(now*.031));rect(0,0,W,H,'#fff');g.globalAlpha=1;}
    if(mode==='glitch'){for(let i=0;i<5;i++){const yy=(Math.floor(now/43)*13+i*29)%150;g.globalAlpha=.08+i*.018;rect(((i&1)?-4:4),yy,W,2,'#fff');}g.globalAlpha=1;}
  }
`;
      s = s.slice(0,at) + helpers + '\n' + s.slice(at);
    }

    s = replaceFunction(s, 'omegaStoryDrawOmega', `  function omegaStoryDrawOmega(now, mode='normal') {
    rect(0,0,W,H,'#000');
    const img=(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth)?room11OmegaSourceImage:null;
    if(!omegaMotionDrawSegmentedImage(img,now,mode))drawOmegaMasterBody(now,mode==='glitch'?'glitch':mode==='rage'?'late':'normal');
    if(mode==='glitch'&&img){for(let i=0;i<8;i++){const sy=(i*17+Math.floor(now/37)*9)%112,dx=((i+Math.floor(now/71))%3-1)*7;g.globalAlpha=.12+i*.018;g.drawImage(img,0,Math.min(img.naturalHeight-1,sy*img.naturalHeight/180),img.naturalWidth,Math.max(1,img.naturalHeight/26),dx,sy,320,5);}g.globalAlpha=1;}
    omegaMotionOverlay(now,mode);
  }`);

    return s;
  };
})();
