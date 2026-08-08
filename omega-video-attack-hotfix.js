(() => {
  'use strict';

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

  window.applyOmegaVideoAttackHotfix = source => {
    let s = String(source || '');
    if (s.includes('OMEGA_VIDEO_ATTACK_SPRITES_V1')) return s;
    const span = findFunctionSpan(s, 'drawOmegaMasterBullet');
    if (!span) throw new Error('[Omega video attacks] drawOmegaMasterBullet not found');
    const code = `  const OMEGA_VIDEO_ATTACK_SPRITES_V1 = true;
  function omegaMasterDrawVideoSprite(name,w,h,baseAngle=0){const img=window.__omegaVideoSpriteSheet,box=window.__omegaVideoSpriteLayout&&window.__omegaVideoSpriteLayout[name];if(!img||!img.complete||!img.naturalWidth||!box)return false;g.save();if(baseAngle)g.rotate(-baseAngle);g.imageSmoothingEnabled=false;g.drawImage(img,box[0],box[1],box[2],box[3],-w/2,-h/2,w,h);g.restore();return true;}
  function drawOmegaMasterBullet(b,now) {
    g.save();g.translate(Math.round(b.x),Math.round(b.y));g.rotate(b.angle||0);const warning=b.age<(b.warning||0);g.globalAlpha=warning?.28+.18*Math.sin(b.age*27):1;
    if(b.kind==='cross'){rect(-1,-7,2,14,'#fff');rect(-7,-1,14,2,'#fff');g.rotate(Math.PI/4);rect(-1,-5,2,10,'#fff');rect(-5,-1,10,2,'#fff');}
    else if(b.kind==='drop'){if(!omegaMasterDrawVideoSprite('drop',13,16)){g.fillStyle='#fff';g.beginPath();g.moveTo(0,-7);g.quadraticCurveTo(6,1,0,7);g.quadraticCurveTo(-6,1,0,-7);g.fill();}}
    else if(b.kind==='knife'){if(!omegaMasterDrawVideoSprite('knife',20,26,.72)){fillPolygon([[-11,-2],[5,-2],[11,0],[5,2],[-11,2]],'#fff');rect(-14,-4,3,8,'#aaa');}}
    else if(b.kind==='hand'){if(!omegaMasterDrawVideoSprite('hand',31,30)){g.fillStyle='#fff';g.beginPath();g.arc(0,2,7,0,Math.PI*2);g.fill();for(let i=-2;i<=2;i++)rect(i*3-1,-10,2,10,'#fff');rect(-2,1,4,4,'#000');}}
    else if(b.kind==='shoe'){if(!omegaMasterDrawVideoSprite('shoe',28,38)){fillPolygon([[-11,-5],[4,-5],[11,0],[7,5],[-12,4]],'#fff');rect(-8,-8,8,4,'#aaa');}}
    else if(b.kind==='file'){if(!omegaMasterDrawVideoSprite('file',22,30)){rect(-7,-10,14,20,'#fff');rect(-5,-8,10,3,'#222');rect(-5,-2,8,1,'#555');rect(-5,3,9,1,'#555');}}
    else if(b.kind==='flame'){fillPolygon([[0,-9],[5,-2],[4,5],[0,9],[-5,5],[-6,-1]],'#fff');fillPolygon([[0,-5],[3,0],[0,5],[-3,0]],'#ff6d16');}
    else if(b.kind==='vine'){rect(-2,-15,4,30,'#69bd22');fillPolygon([[-2,-9],[-9,-5],[-2,-3]],'#9ee842');fillPolygon([[2,1],[9,5],[2,7]],'#9ee842');}
    else if(b.kind==='saw'){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI*2/20,r=i%2?7:13;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.stroke();g.fillStyle='#888';g.beginPath();g.arc(0,0,4,0,Math.PI*2);g.fill();}
    else if(b.kind==='block'){rect(-8,-7,16,14,'#aaa');rect(-5,-4,10,8,'#222');line(-7,-6,7,6,'#fff',1);}
    else if(b.kind==='missile'){fillPolygon([[-10,-4],[6,-4],[12,0],[6,4],[-10,4]],'#fff');rect(-9,-2,6,4,'#43dc38');fillPolygon([[-10,-4],[-15,-8],[-13,-1]],'#43dc38');fillPolygon([[-10,4],[-15,8],[-13,1]],'#43dc38');}
    else if(b.kind==='pan'){g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(0,0,8,0,Math.PI*2);g.stroke();rect(7,-2,16,4,'#fff');}
    else if(b.kind==='gun'){if(!omegaMasterDrawVideoSprite('gun',38,33,.18)){rect(-10,-3,15,5,'#ddd');rect(-4,2,5,8,'#aaa');fillPolygon([[5,-5],[13,0],[5,5]],warning?'#844':'#fff05b');}}
    else if(b.kind==='trap'){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(0,0,13,.3,Math.PI*2-.3);g.stroke();for(let i=-2;i<=2;i++)fillPolygon([[i*5,-2],[i*5+2,4],[i*5-2,4]],'#fff');}
    else if(b.kind==='laser'||b.kind==='laserV'){g.restore();const c=warning?'#68242a':'#fff';if(b.kind==='laser')line(14,b.y,306,b.y,c,warning?1:5);else line(b.x,48,b.x,164,c,warning?1:5);return;}
    else{g.fillStyle='#fff';g.beginPath();g.arc(0,0,b.size||3,0,Math.PI*2);g.fill();}
    g.restore();g.globalAlpha=1;
  }`;
    return s.slice(0, span[0]) + code + s.slice(span[1]);
  };
})();
