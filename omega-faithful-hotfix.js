(() => {
  'use strict';
  const MASTER_VERSION = '20260807-omega-master3';
  const MASTER_GLITCH = 'data:image/gif;base64,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';

  function findFunctionSpan(source, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\n)(\\s*)function\\s+' + escaped + '\\s*\\(');
    const match = re.exec(source);
    if (!match) return null;
    const start = match.index + (source[match.index] === '\n' ? 1 : 0);
    const brace = source.indexOf('{', match.index + match[0].length);
    if (brace < 0) return null;
    let depth = 0, state = 'code', quote = '', templateDepth = 0;
    for (let i = brace; i < source.length; i++) {
      const c = source[i], n = source[i + 1] || '';
      if (state === 'line') { if (c === '\n') state = 'code'; }
      else if (state === 'block') { if (c === '*' && n === '/') { state = 'code'; i++; } }
      else if (state === 'str') { if (c === '\\') i++; else if (c === quote) state = 'code'; }
      else if (state === 'template') {
        if (c === '\\') i++;
        else if (c === '`' && templateDepth === 0) state = 'code';
        else if (c === '$' && n === '{') { templateDepth++; i++; }
        else if (c === '}' && templateDepth) templateDepth--;
      } else {
        if (c === '/' && n === '/') { state = 'line'; i++; }
        else if (c === '/' && n === '*') { state = 'block'; i++; }
        else if (c === '"' || c === "'") { state = 'str'; quote = c; }
        else if (c === '`') { state = 'template'; templateDepth = 0; }
        else if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return [start, i + 1]; }
      }
    }
    return null;
  }

  function replaceFunction(source, name, code, required = false) {
    const span = findFunctionSpan(source, name);
    if (!span) {
      if (required) throw new Error('[Omega master] missing function: ' + name);
      console.warn('[Omega master] optional function not found:', name);
      return source;
    }
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectMasterHelpers(source) {
    if (source.includes('OMEGA_MASTER_TIMELINE')) return source;
    const marker = source.search(/(^|\n)\s*function\s+drawSansGuide\s*\(/);
    if (marker < 0) throw new Error('[Omega master] drawSansGuide marker missing');
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const helper = `  // === OMEGA MASTER REFERENCE PATCH ${MASTER_VERSION} ===
  const omegaMasterGlitchImage = new Image(); omegaMasterGlitchImage.src = '${MASTER_GLITCH}';
  const OMEGA_MASTER_TIMELINE = Object.freeze([
    {start:25,end:55,key:'normalA',soul:'#ed001f'},
    {start:55,end:75,key:'cyanKnife',soul:'#45ecff'},
    {start:75,end:105,key:'sawFire',soul:'#ed001f'},
    {start:105,end:130,key:'orangeHand',soul:'#ff9b20'},
    {start:130,end:155,key:'vineWarning',soul:'#ed001f'},
    {start:155,end:175,key:'blueShoe',soul:'#466cff'},
    {start:175,end:205,key:'trapFire',soul:'#ed001f'},
    {start:205,end:225,key:'purpleFile',soul:'#d94cff'},
    {start:225,end:255,key:'vineMachine',soul:'#ed001f'},
    {start:255,end:275,key:'greenPan',soul:'#47e45a'},
    {start:275,end:305,key:'dropBlocks',soul:'#ed001f'},
    {start:305,end:325,key:'yellowGun',soul:'#fff05b'},
    {start:325,end:360,key:'soulRescue',soul:'#ed001f'},
    {start:360,end:495,key:'lateMix',soul:'#ed001f'},
    {start:495,end:535,key:'mercyRing',soul:'#ed001f'},
    {start:535,end:550,key:'soulsFinal',soul:'#ed001f'},
    {start:550,end:558,key:'psychedelic',soul:'#ed001f'}
  ]);
  let omegaMasterLastSegment = '';
  let omegaMasterSafeX = 160;
  let omegaMasterSafeY = 112;
  let omegaMasterDamageStep = -1;
  let omegaMasterPulseAt = -10000;
  let omegaMasterWave = 0;
  let omegaMasterBossHp = 9999;
  let omegaMasterMaxHp = 9999;
  let omegaMasterDamageAt = -10000;
  let omegaMasterSaveFlashAt = -10000;

  function omegaMasterSegment(now) {
    const ref = 25 + Math.max(0, (now - omegaStartedAt) / 1000);
    let seg = OMEGA_MASTER_TIMELINE[OMEGA_MASTER_TIMELINE.length - 1];
    for (const item of OMEGA_MASTER_TIMELINE) { if (ref >= item.start && ref < item.end) { seg = item; break; } }
    return { ...seg, ref, local: ref - seg.start, remaining: seg.end - ref };
  }

  function drawGuideMasterPerspective(now, deep = false) {
    rect(0,0,W,H,'#09070b');
    // A true 3/4 overhead room: back wall and floor use different planes and the path runs diagonally away.
    fillPolygon([[18,174],[259,174],[311,83],[65,83]], deep?'#2b1427':'#32182d');
    fillPolygon([[65,83],[311,83],[298,25],[55,25]], deep?'#4d2137':'#57283d');
    fillPolygon([[18,174],[65,83],[55,25],[0,59],[0,180]], '#20111f');
    fillPolygon([[259,174],[311,83],[298,25],[320,43],[320,180]], '#241321');
    // Back-wall panels/door sit toward the upper-right vanishing area.
    fillPolygon([[207,76],[268,76],[262,34],[211,34]], '#5e2918');
    fillPolygon([[213,72],[262,72],[257,39],[216,39]], '#923d17');
    line(239,39,239,72,'#5b260f',2); rect(253,55,2,2,'#ffd35b');
    // Floor bands and converging seams make the diagonal camera obvious.
    for (let i=1;i<9;i++) {
      const t=i/9, y=83+(174-83)*t, l=65+(18-65)*t, r=311+(259-311)*t;
      line(l,y,r,y,i%2?'#52264d':'#3c1c38',1);
    }
    for (const x of [46,92,138,184,230,276]) line(188,83,x,174,'#3b1a37',1);
    line(65,83,311,83,'#9a4b66',2); line(18,174,259,174,'#140a12',3);
    if (deep && room11BackgroundImage && room11BackgroundImage.complete && room11BackgroundImage.naturalWidth) {
      g.save(); g.globalAlpha=.10; g.drawImage(room11BackgroundImage,82,31,196,116); g.restore();
    }
  }

  function drawMasterHero(x,y,now,scale=.9,direction='up',moving=true) {
    const saved={x:openingPlayer.x,y:openingPlayer.y,direction:openingPlayer.direction,moving:openingPlayer.moving};
    g.save(); g.translate(x,y); g.scale(scale,scale);
    openingPlayer.x=0; openingPlayer.y=0; openingPlayer.direction=direction; openingPlayer.moving=moving; drawOpeningHero(now);
    g.restore(); Object.assign(openingPlayer,saved);
  }

  function drawOmegaMasterSans(x,y,now,scale=.72) {
    g.save(); g.translate(x,y); g.scale(scale,scale); drawSans(0,0,now); g.restore();
  }

  function drawMasterDialogue(rows, x=22, y=119, w=276, h=50) {
    rect(x,y,w,h,'#000'); frameBox(x,y,w,h,'#fff',2);
    rows.slice(0,3).forEach((row,i)=>text(row,x+10,y+8+i*12,8,'#fff'));
  }

  function omegaMasterArena() { return {left:14,right:306,top:48,bottom:164}; }
  function omegaMasterAdd(kind,x,y,vx,vy,opt={}) {
    omegaBullets.push({kind,x,y,vx,vy,age:0,life:opt.life||3.2,size:opt.size||4,angle:opt.angle||0,spin:opt.spin||0,
      color:opt.color||'#fff',warning:opt.warning||0,extra:opt.extra||0,hitRadius:opt.hitRadius||0,width:opt.width||0,height:opt.height||0});
  }
  function omegaMasterEaseSafe(targetX,targetY) {
    omegaMasterSafeX += Math.max(-5,Math.min(5,targetX-omegaMasterSafeX));
    omegaMasterSafeY += Math.max(-4,Math.min(4,targetY-omegaMasterSafeY));
    const a=omegaMasterArena(); omegaMasterSafeX=Math.max(a.left+32,Math.min(a.right-32,omegaMasterSafeX));
    omegaMasterSafeY=Math.max(a.top+22,Math.min(a.bottom-22,omegaMasterSafeY));
  }
  function omegaMasterSpawnStarRing(now, dense=false) {
    const cx=160,cy=92,n=dense?26:20,safe=Math.atan2(omegaMasterSafeY-cy,omegaMasterSafeX-cx);
    for(let i=0;i<n;i++){const a=i*Math.PI*2/n+omegaMasterWave*.19,d=Math.atan2(Math.sin(a-safe),Math.cos(a-safe));if(Math.abs(d)<.48)continue;
      const sp=56+(i%4)*9;omegaMasterAdd('cross',cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,{life:3.7,size:4,angle:a,spin:(i%2?1:-1)*2.7});}
    omegaSpawnAt=now+(dense?660:760);
  }
  function omegaMasterSpawnRain(now,kind='drop',speed=84,spacing=22) {
    const a=omegaMasterArena(); for(let x=a.left+8;x<a.right;x+=spacing){if(Math.abs(x-omegaMasterSafeX)<29)continue;
      omegaMasterAdd(kind,x,a.top-12,Math.sin((x+omegaMasterWave)*.12)*8,speed+(x%17),{life:2.8,size:kind==='knife'?7:4,angle:kind==='knife'?.65:0,spin:kind==='cross'?2.2:0});}
    omegaSpawnAt=now+650;
  }
  function omegaMasterSpawnKnives(now) {
    const a=omegaMasterArena(); for(let x=a.left-30;x<a.right+30;x+=20){const projected=x+34;if(Math.abs(projected-omegaMasterSafeX)<33)continue;
      omegaMasterAdd('knife',x,a.top-20,31,103,{life:2.6,size:7,angle:.72});}
    omegaSpawnAt=now+570;
  }
  function omegaMasterSpawnHands(now) {
    const cx=160,cy=104,n=12,safe=Math.atan2(omegaMasterSafeY-cy,omegaMasterSafeX-cx);
    for(let i=0;i<n;i++){const a=i*Math.PI*2/n+omegaMasterWave*.21,d=Math.atan2(Math.sin(a-safe),Math.cos(a-safe));if(Math.abs(d)<.55)continue;
      const x=cx+Math.cos(a)*157,y=cy+Math.sin(a)*73;omegaMasterAdd('hand',x,y,-Math.cos(a)*67,-Math.sin(a)*67,{life:3.0,size:9,angle:a+Math.PI});}
    omegaSpawnAt=now+750;
  }
  function omegaMasterSpawnShoes(now) {
    const a=omegaMasterArena(); for(let y=a.top+10;y<a.bottom;y+=18){if(Math.abs(y-omegaMasterSafeY)<18)continue;const right=((y/18+omegaMasterWave)|0)%2===0;
      omegaMasterAdd('shoe',right?a.right+17:a.left-17,y,right?-103:103,0,{life:3.5,size:9,angle:right?Math.PI:0});}
    omegaSpawnAt=now+620;
  }
  function omegaMasterSpawnFiles(now) {
    const a=omegaMasterArena(); for(let x=a.left+10;x<a.right;x+=25){if(Math.abs(x-omegaMasterSafeX)<31)continue;
      omegaMasterAdd('file',x,a.top-14,0,82+(x%13),{life:3.0,size:8,spin:(x%2?1:-1)*.5});}
    omegaSpawnAt=now+660;
  }
  function omegaMasterSpawnFlames(now,pan=false) {
    const a=omegaMasterArena(); for(let x=a.left+6;x<a.right;x+=18){if(Math.abs(x-omegaMasterSafeX)<28)continue;
      omegaMasterAdd('flame',x,a.top-9,Math.sin(x*.17)*7,74+(x%19),{life:3.0,size:6});}
    if(pan){const side=omegaMasterWave%2?1:-1;omegaMasterAdd('pan',side>0?a.right+20:a.left-20,omegaMasterSafeY+20,side>0?-86:86,0,{life:4,size:12,angle:side>0?Math.PI:0});}
    omegaSpawnAt=now+690;
  }
  function omegaMasterSpawnVines(now) {
    const a=omegaMasterArena(); for(let x=a.left+12;x<a.right;x+=28){if(Math.abs(x-omegaMasterSafeX)<34)continue;
      omegaMasterAdd('vine',x,a.bottom+34,Math.sin(x*.15)*4,-72-(x%21),{life:3.8,size:7});}
    omegaSpawnAt=now+730;
  }
  function omegaMasterSpawnSaws(now) {
    const a=omegaMasterArena(); const y1=Math.max(a.top+18,omegaMasterSafeY-31), y2=Math.min(a.bottom-18,omegaMasterSafeY+31);
    omegaMasterAdd('saw',a.left-22,y1,92,0,{life:3.7,size:12,spin:7}); omegaMasterAdd('saw',a.right+22,y2,-92,0,{life:3.7,size:12,spin:-7});
    omegaSpawnAt=now+760;
  }
  function omegaMasterSpawnBlocks(now) {
    const a=omegaMasterArena(); for(let y=a.top+8;y<a.bottom;y+=19){if(Math.abs(y-omegaMasterSafeY)<20)continue;const right=((y+omegaMasterWave)&1)===0;
      omegaMasterAdd('block',right?a.right+12:a.left-12,y,right?-78:78,0,{life:4.2,size:8,angle:(omegaMasterWave+y)*.05});}
    omegaSpawnAt=now+700;
  }
  function omegaMasterSpawnGun(now) {
    const a=omegaMasterArena(); const vertical=omegaMasterWave%2===1;
    if(vertical){let x=omegaMasterSafeX+(omegaMasterWave%4<2?48:-48);x=Math.max(a.left+12,Math.min(a.right-12,x));omegaMasterAdd('laserV',x,a.top,0,0,{life:1.45,warning:.82,extra:a.bottom-a.top});}
    else{let y=omegaMasterSafeY+(omegaMasterWave%4<2?31:-31);y=Math.max(a.top+10,Math.min(a.bottom-10,y));omegaMasterAdd('laser',a.left,y,0,0,{life:1.45,warning:.82,extra:a.right-a.left});}
    // Visible revolver/cursor projectile follows the warning line, as in the yellow-soul section.
    omegaMasterAdd('gun',vertical?omegaMasterSafeX:a.left-18,vertical?a.top-13:omegaMasterSafeY,vertical?0:85,vertical?82:0,{life:2.5,size:9,angle:vertical?Math.PI/2:0});
    omegaSpawnAt=now+710;
  }
  function omegaMasterSpawnTrap(now) {
    const a=omegaMasterArena(); const side=omegaMasterWave%2?1:-1; const x=side>0?a.right+20:a.left-20;
    omegaMasterAdd('trap',x,a.bottom-15,side>0?-73:73,-9,{life:4.2,size:13,angle:side>0?Math.PI:0});
    omegaMasterSpawnFlames(now,false); omegaSpawnAt=now+760;
  }
  function omegaMasterSpawnMissiles(now) {
    const a=omegaMasterArena(); for(let y=a.top+8;y<a.bottom;y+=19){if(Math.abs(y-omegaMasterSafeY)<21)continue;const right=(omegaMasterWave+Math.floor(y/19))%2===0;
      omegaMasterAdd('missile',right?a.right+15:a.left-15,y,right?-94:94,Math.sin(y*.3)*4,{life:3.8,size:8,angle:right?Math.PI:0});}
    omegaSpawnAt=now+690;
  }
  function omegaMasterSpawnPattern(now,seg) {
    omegaMasterEaseSafe(heart.x,heart.y);
    const phase=seg.key;
    if(phase==='cyanKnife') omegaMasterSpawnKnives(now);
    else if(phase==='orangeHand') omegaMasterSpawnHands(now);
    else if(phase==='blueShoe') omegaMasterSpawnShoes(now);
    else if(phase==='purpleFile') omegaMasterSpawnFiles(now);
    else if(phase==='greenPan') omegaMasterSpawnFlames(now,true);
    else if(phase==='yellowGun') omegaMasterSpawnGun(now);
    else if(phase==='vineWarning') { omegaMasterWave%3===0?omegaMasterSpawnGun(now):omegaMasterSpawnVines(now); }
    else if(phase==='sawFire') { omegaMasterWave%2?omegaMasterSpawnSaws(now):omegaMasterSpawnFlames(now,false); }
    else if(phase==='trapFire') { omegaMasterWave%2?omegaMasterSpawnTrap(now):omegaMasterSpawnFlames(now,false); }
    else if(phase==='vineMachine') { omegaMasterWave%2?omegaMasterSpawnVines(now):omegaMasterSpawnMissiles(now); }
    else if(phase==='dropBlocks') { omegaMasterWave%3===0?omegaMasterSpawnBlocks(now):omegaMasterSpawnRain(now,'drop',91,20); }
    else if(phase==='lateMix') {
      const p=omegaMasterWave%8; if(p===0)omegaMasterSpawnStarRing(now,true); else if(p===1)omegaMasterSpawnVines(now); else if(p===2)omegaMasterSpawnBlocks(now);
      else if(p===3)omegaMasterSpawnFlames(now,false); else if(p===4)omegaMasterSpawnSaws(now); else if(p===5)omegaMasterSpawnGun(now); else if(p===6)omegaMasterSpawnMissiles(now); else omegaMasterSpawnRain(now,'drop',96,19);
    } else if(phase==='normalA') {
      const p=omegaMasterWave%4; if(p===0)omegaMasterSpawnStarRing(now,false); else if(p===1)omegaMasterSpawnFlames(now,false); else if(p===2)omegaMasterSpawnRain(now,'drop',82,21); else omegaMasterSpawnMissiles(now);
    }
    omegaMasterWave++;
  }

  function drawOmegaMasterBody(now, mode='normal') {
    rect(0,0,W,H,'#000');
    const shake=(mode==='late'?Math.sin(now*.075)*.8:0)+(now-omegaMasterDamageAt<260?Math.sin(now*.34)*2.5:0);
    if(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth){g.save();g.imageSmoothingEnabled=false;g.drawImage(room11OmegaSourceImage,8+shake,-5,304,228);g.restore();}
    if(mode==='glitch'&&omegaMasterGlitchImage.complete&&omegaMasterGlitchImage.naturalWidth){g.save();g.globalAlpha=.52;g.drawImage(omegaMasterGlitchImage,124,0,72,72);g.restore();}
  }
  function drawOmegaMasterTVFace(x=136,y=0,w=48,h=31,mode=0){
    rect(x,y,w,h,'#1c1c1c');rect(x+4,y+3,w-8,h-7,'#dedbd2');rect(x+7,y+5,w-14,h-11,'#fff');
    if(mode===1){line(x+12,y+17,x+20,y+10,'#111',2);line(x+w-12,y+17,x+w-20,y+10,'#111',2);line(x+15,y+22,x+w-15,y+22,'#a10b12',2);}
    else{g.fillStyle='#111';g.beginPath();g.arc(x+16,y+13,3,0,Math.PI*2);g.arc(x+w-16,y+13,3,0,Math.PI*2);g.fill();line(x+15,y+21,x+w-15,y+21,'#111',2);}
  }
  function drawOmegaMasterScreen(now, seg) {
    const special=['cyanKnife','orangeHand','blueShoe','purpleFile','greenPan','yellowGun'].includes(seg.key);
    if(special){rect(0,0,W,H,'#000');rect(135,0,50,31,'#1c1c1c');rect(139,3,42,25,'#050505');
      drawOmegaMasterTVFace(136,0,48,31,Math.floor(seg.ref/3)%2);
    } else drawOmegaMasterBody(now,seg.key==='lateMix'?'late':'normal');
    // Player HP in the reference is a small yellow bar at the bottom; do not draw the normal Sans menu frame.
    rect(143,169,34,5,'#552300'); rect(143,169,34*Math.max(0,hp/Math.max(1,maxHp)),5,'#fff000');
    if(seg.ref>=360 && seg.ref<495){const ratio=Math.max(0,omegaMasterBossHp/Math.max(1,omegaMasterMaxHp));rect(70,6,180,8,'#661016');rect(70,6,180*ratio,8,'#37df59');
      if(now-omegaMasterDamageAt<650){const p=clamp01((now-omegaMasterDamageAt)/650);text('-'+(420+((omegaMasterDamageStep%5)*111)),160,18-p*7,9,'#f22','center');}}
  }
  function drawOmegaMasterBullet(b,now) {
    g.save();g.translate(Math.round(b.x),Math.round(b.y));g.rotate(b.angle||0);const warning=b.age<(b.warning||0);g.globalAlpha=warning?.28+.18*Math.sin(b.age*27):1;
    if(b.kind==='cross'){rect(-1,-7,2,14,'#fff');rect(-7,-1,14,2,'#fff');g.rotate(Math.PI/4);rect(-1,-5,2,10,'#fff');rect(-5,-1,10,2,'#fff');}
    else if(b.kind==='drop'){g.fillStyle='#fff';g.beginPath();g.moveTo(0,-7);g.quadraticCurveTo(6,1,0,7);g.quadraticCurveTo(-6,1,0,-7);g.fill();}
    else if(b.kind==='knife'){fillPolygon([[-11,-2],[5,-2],[11,0],[5,2],[-11,2]],'#fff');rect(-14,-4,3,8,'#aaa');}
    else if(b.kind==='hand'){g.fillStyle='#fff';g.beginPath();g.arc(0,2,7,0,Math.PI*2);g.fill();for(let i=-2;i<=2;i++)rect(i*3-1,-10,2,10,'#fff');rect(-2,1,4,4,'#000');}
    else if(b.kind==='shoe'){fillPolygon([[-11,-5],[4,-5],[11,0],[7,5],[-12,4]],'#fff');rect(-8,-8,8,4,'#aaa');}
    else if(b.kind==='file'){rect(-7,-10,14,20,'#fff');rect(-5,-8,10,3,'#222');rect(-5,-2,8,1,'#555');rect(-5,3,9,1,'#555');}
    else if(b.kind==='flame'){fillPolygon([[0,-9],[5,-2],[4,5],[0,9],[-5,5],[-6,-1]],'#fff');fillPolygon([[0,-5],[3,0],[0,5],[-3,0]],'#ff6d16');}
    else if(b.kind==='vine'){rect(-2,-15,4,30,'#69bd22');fillPolygon([[-2,-9],[-9,-5],[-2,-3]],'#9ee842');fillPolygon([[2,1],[9,5],[2,7]],'#9ee842');}
    else if(b.kind==='saw'){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();for(let i=0;i<20;i++){const a=i*Math.PI*2/20,r=i%2?7:13;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.stroke();g.fillStyle='#888';g.beginPath();g.arc(0,0,4,0,Math.PI*2);g.fill();}
    else if(b.kind==='block'){rect(-8,-7,16,14,'#aaa');rect(-5,-4,10,8,'#222');line(-7,-6,7,6,'#fff',1);}
    else if(b.kind==='missile'){fillPolygon([[-10,-4],[6,-4],[12,0],[6,4],[-10,4]],'#fff');rect(-9,-2,6,4,'#43dc38');fillPolygon([[-10,-4],[-15,-8],[-13,-1]],'#43dc38');fillPolygon([[-10,4],[-15,8],[-13,1]],'#43dc38');}
    else if(b.kind==='pan'){g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(0,0,8,0,Math.PI*2);g.stroke();rect(7,-2,16,4,'#fff');}
    else if(b.kind==='gun'){rect(-10,-3,15,5,'#ddd');rect(-4,2,5,8,'#aaa');fillPolygon([[5,-5],[13,0],[5,5]],warning?'#844':'#fff05b');}
    else if(b.kind==='trap'){g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(0,0,13,.3,Math.PI*2-.3);g.stroke();for(let i=-2;i<=2;i++)fillPolygon([[i*5,-2],[i*5+2,4],[i*5-2,4]],'#fff');}
    else if(b.kind==='laser'||b.kind==='laserV'){g.restore();const c=warning?'#68242a':'#fff';if(b.kind==='laser')line(14,b.y,306,b.y,c,warning?1:5);else line(b.x,48,b.x,164,c,warning?1:5);return;}
    else{g.fillStyle='#fff';g.beginPath();g.arc(0,0,b.size||3,0,Math.PI*2);g.fill();}
    g.restore();g.globalAlpha=1;
  }
  function drawOmegaMasterRing(now,r=15){g.save();g.translate(heart.x,heart.y);g.rotate(now*.0024);for(let i=0;i<20;i++){const a=i*Math.PI*2/20;g.fillStyle=i%2?'#fff':'#ddd';g.fillRect(Math.cos(a)*r-1,Math.sin(a)*r-1,3,3);}g.restore();}
  function drawOmegaMasterSouls(now){const colors=['#45ecff','#ff9b20','#466cff','#d94cff','#47e45a','#fff05b'];for(let i=0;i<6;i++){const a=i*Math.PI*2/6+now*.00025;battleHeartShape(160+Math.cos(a)*43,91+Math.sin(a)*31,colors[i]);}g.globalAlpha=.9;rect(154,86,12,10,'#fff');rect(157,82,6,18,'#fff');g.globalAlpha=1;}
`;
    return source.slice(0, at) + helper + '\n' + source.slice(at);
  }

  window.applyOmegaFaithfulHotfix = source => {
    let s = injectMasterHelpers(String(source || ''));

    s = replaceFunction(s, 'drawSansGuide', `  function drawSansGuide(now) {
    drawGuideMasterPerspective(now,false); const e=(now-guideStartedAt)/1000,p=smoothstep01(e/2.0);
    const sx=278-54*p,sy=143-17*p,hx=106+42*p,hy=165-10*p;
    drawOmegaMasterSans(sx,sy-20,now,.63); drawMasterHero(hx,hy,now,.88,'up',true);
    drawMasterDialogue(e<1.45?['＊ よお。にんげん。']:e<3.15?['＊ オレが ROOM11まで','＊ あんないしてやるよ。']:['＊ こっちだ。','＊ おくれずに ついてきな。'],20,112,280,55);
  }`, true);

    s = replaceFunction(s, 'updateSansGuide', `  function updateSansGuide(dt,now) {
    if(now-guideStartedAt>=4600){guideChoice=0;setState('guideChoice');}
  }`, true);

    s = replaceFunction(s, 'drawGuideChoice', `  function drawGuideChoice() {
    const now=performance.now();drawGuideMasterPerspective(now,false);drawOmegaMasterSans(225,108,now,.60);drawMasterHero(150,153,now,.86,'up',false);
    drawMasterDialogue(['＊ 次に行く 覚悟はあるか？'],24,103,272,40);rect(68,146,184,28,'#000');frameBox(68,146,184,28,'#fff',1);
    if(guideChoice===0)heartShape(91,159,'#ed001f');else heartShape(179,159,'#ed001f');text('Yes',121,153,9,guideChoice===0?'#ffff00':'#fff','center');text('No',210,153,9,guideChoice===1?'#ffff00':'#fff','center');
  }`, true);

    s = replaceFunction(s, 'drawGuideResponse', `  function drawGuideResponse() {
    const now=performance.now();drawGuideMasterPerspective(now,false);drawOmegaMasterSans(225,108,now,.60);drawMasterHero(150,153,now,.86,'up',false);
    drawMasterDialogue(guideAccepted?['＊ お前ならできる。','＊ オレの背中を 離れずについて来い。']:['＊ まだ そのときじゃないぜ。','＊ あせらなくていい。'],20,112,280,55);
  }`, true);

    s = replaceFunction(s, 'startRoom11Walk', `  function startRoom11Walk() {
    guideStartedAt=performance.now();setState('room11Walk');saveCurrentProfile();
  }`, true);

    s = replaceFunction(s, 'drawRoom11Walk', `  function drawRoom11Walk(now) {
    drawGuideMasterPerspective(now,true);const e=(now-guideStartedAt)/1000,p=smoothstep01(e/5.7);
    const sx=205+48*p,sy=124-52*p,hx=140+80*p,hy=161-66*p;
    drawOmegaMasterSans(sx,sy-18,now,.62-.17*p);drawMasterHero(hx,hy,now,.90-.22*p,'up',true);
    if(e<2.0)drawMasterDialogue(['＊ ここからは オレの背中を','＊ 追って歩くだけでいい。'],20,119,280,49);else if(e<4.1)drawMasterDialogue(['＊ もうすぐ ROOM11だ。'],34,126,252,39);
    const fade=clamp01((e-5.25)/.7);if(fade>0){g.globalAlpha=fade;rect(0,0,W,H,'#000');g.globalAlpha=1;}
  }`, true);

    s = replaceFunction(s, 'updateRoom11Walk', `  function updateRoom11Walk(now) {
    if(now-guideStartedAt>=6100){omegaStartedAt=now;setState('omegaIntro');saveCurrentProfile();}
  }`, true);

    s = replaceFunction(s, 'drawOmegaFlowey', `  function drawOmegaFlowey(now) { drawOmegaMasterBody(now,'normal'); }`, true);

    s = replaceFunction(s, 'drawOmegaIntro', `  function drawOmegaIntro(now) {
    const e=(now-omegaStartedAt)/1000;rect(0,0,W,H,'#000');
    if(e<1.2){g.globalAlpha=.25+.55*Math.abs(Math.sin(e*21));if(omegaMasterGlitchImage.complete&&omegaMasterGlitchImage.naturalWidth)g.drawImage(omegaMasterGlitchImage,79,24,162,116);g.globalAlpha=1;}
    else if(e<2.35){rect(0,0,W,H,'#a40000');const img=(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth)?room11OmegaSourceImage:null;if(img){g.save();g.filter='brightness(0)';g.drawImage(img,10,-4,300,226);g.filter='none';g.restore();}battleHeartShape(160,149,'#ed001f');}
    else{drawOmegaMasterBody(now,e<3.15?'glitch':'normal');if(e<3.4){g.globalAlpha=.22+.2*Math.sin(e*31);rect(0,0,W,H,'#fff');g.globalAlpha=1;}}
    if(e>3.4)drawMasterDialogue(e<4.5?['＊ ……画面の向こうで 何かが笑った。']:['＊ フォトショップフラウィが あらわれた。'],25,126,270,43);
    if(e>5.0)text('ENTER / Z',160,166,7,'#aaa','center');
  }`, true);

    s = replaceFunction(s, 'startOmegaBattle', `  function startOmegaBattle() {
    omegaStartedAt=performance.now();omegaSpawnAt=omegaStartedAt+420;omegaBullets=[];omegaPhase=0;omegaMasterWave=0;omegaMasterLastSegment='';omegaMasterSafeX=160;omegaMasterSafeY=120;
    omegaMasterBossHp=omegaMasterMaxHp=9999;omegaMasterDamageStep=-1;omegaMasterDamageAt=-10000;omegaMasterSaveFlashAt=-10000;soulMode='red';hp=Math.max(1,hp);heart.x=160;heart.y=128;heart.vx=heart.vy=0;setState('omegaBattle');saveCurrentProfile();
  }`, true);

    s = replaceFunction(s, 'spawnOmegaWave', `  function spawnOmegaWave(now) { omegaMasterSpawnPattern(now,omegaMasterSegment(now)); }`, true);

    s = replaceFunction(s, 'updateOmegaBattle', `  function updateOmegaBattle(dt,now) {
    const a=omegaMasterArena();let dx=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0),dy=(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0),m=Math.hypot(dx,dy);if(m){dx/=m;dy/=m;}
    heart.x=Math.max(a.left+4,Math.min(a.right-4,heart.x+dx*132*dt));heart.y=Math.max(a.top+4,Math.min(a.bottom-4,heart.y+dy*132*dt));heart.vx=dx*132;heart.vy=dy*132;
    const seg=omegaMasterSegment(now);if(seg.key!==omegaMasterLastSegment){omegaBullets=[];omegaMasterLastSegment=seg.key;omegaSpawnAt=now+430;omegaMasterSafeX=heart.x;omegaMasterSafeY=heart.y;
      if(['cyanKnife','orangeHand','blueShoe','purpleFile','greenPan','yellowGun','soulRescue'].includes(seg.key)){hp=Math.min(maxHp,hp+Math.max(3,Math.ceil(maxHp*.35)));omegaMasterSaveFlashAt=now;beep(820,.06);}saveCurrentProfile();}
    if(seg.key==='soulRescue'){omegaBullets=[];if(now-omegaMasterPulseAt>420){omegaMasterPulseAt=now;hp=Math.min(maxHp,hp+1);beep(960,.025);}}
    else if(!['mercyRing','soulsFinal','psychedelic'].includes(seg.key)&&now>=omegaSpawnAt)omegaMasterSpawnPattern(now,seg);
    let hit=false;for(const b of omegaBullets){b.age+=dt;b.angle+=(b.spin||0)*dt;if(b.age>=(b.warning||0)){b.x+=(b.vx||0)*dt;b.y+=(b.vy||0)*dt;}if(b.age>=(b.warning||0)){if(b.kind==='laser')hit||=Math.abs(heart.y-b.y)<3.2;else if(b.kind==='laserV')hit||=Math.abs(heart.x-b.x)<3.2;else hit||=Math.hypot(heart.x-b.x,heart.y-b.y)<(b.hitRadius||b.size||4)+2.1;}}
    omegaBullets=omegaBullets.filter(b=>b.age<b.life&&b.x>-65&&b.x<W+65&&b.y>a.top-80&&b.y<a.bottom+80);
    if(hit&&!TEST_PLAY_INVINCIBLE&&invincible<=0){hp=Math.max(0,hp-1);invincible=.42;beep(95,.04);}invincible=Math.max(0,invincible-dt);if(hp<=0){finishDefeat();return;}
    if(seg.ref>=360&&seg.ref<495){const step=Math.floor((seg.ref-360)/4.6);if(step!==omegaMasterDamageStep){omegaMasterDamageStep=step;omegaMasterDamageAt=now;beep(150,.045);}const p=clamp01((seg.ref-360)/135);omegaMasterBossHp=Math.max(210,Math.round(omegaMasterMaxHp*(1-p*.978)));}
    if(seg.ref>=558){omegaBullets=[];omegaMasterBossHp=0;setState('omegaVictory');saveCurrentProfile();}
  }`, true);

    s = replaceFunction(s, 'drawOmegaBattle', `  function drawOmegaBattle(now) {
    const seg=omegaMasterSegment(now);drawOmegaMasterScreen(now,seg);
    if(seg.key==='soulRescue'){drawOmegaMasterSouls(now);text('＊ たすけを よんだ……',160,137,8,'#fff','center');battleHeartShape(heart.x,heart.y,'#ed001f');}
    else if(seg.key==='mercyRing'){drawOmegaMasterBody(now,'normal');drawOmegaMasterRing(now,18+Math.sin(now*.006)*3);battleHeartShape(heart.x,heart.y,'#ed001f');drawOmegaMasterTVFace(138,1,44,30,1);}
    else if(seg.key==='soulsFinal'){drawOmegaMasterBody(now,'glitch');drawOmegaMasterSouls(now);drawOmegaMasterRing(now,22);battleHeartShape(heart.x,heart.y,'#ed001f');}
    else if(seg.key==='psychedelic'){drawOmegaMasterBody(now,'glitch');const hues=['#ff0055','#00e5ff','#7cff00','#ff9d00','#8b3cff'];for(let i=0;i<10;i++){g.globalAlpha=.13;rect((i*37+Math.floor(now/30))%W,0,18,H,hues[i%hues.length]);}g.globalAlpha=1;drawOmegaMasterSouls(now);battleHeartShape(heart.x,heart.y,'#ed001f');}
    else{for(const bullet of omegaBullets)drawOmegaMasterBullet(bullet,now);battleHeartShape(heart.x,heart.y,seg.soul||'#ed001f');if(['cyanKnife','orangeHand','blueShoe','purpleFile','greenPan','yellowGun'].includes(seg.key)&&seg.remaining<4.3)text('＊ たすけを よんだ……',160,137,8,'#fff','center');}
    if(now-omegaMasterSaveFlashAt<900&&seg.key!=='soulRescue')text('SAVE',299,154,6,'#62f5ff','right');
  }`, true);

    s = replaceFunction(s, 'drawOmegaVictory', `  function drawOmegaVictory() {
    const now=performance.now();rect(0,0,W,H,'#000');drawOmegaMasterBody(now,'glitch');drawOmegaMasterSouls(now);const hues=['#ff0055','#00e5ff','#7cff00','#ff9d00','#8b3cff'];for(let i=0;i<10;i++){g.globalAlpha=.10;rect((i*31+Math.floor(now/28))%W,0,15,H,hues[i%hues.length]);}g.globalAlpha=1;
    g.globalAlpha=.82;rect(39,111,242,58,'#000');g.globalAlpha=1;frameBox(39,111,242,58,'#fff',1);text('ROOM 11 CLEAR',160,120,14,'#ffff00','center');text('6つの たましいが ケツイに応えた。',160,143,8,'#fff','center');text('ENTER / Z',160,159,7,'#aaa','center');
  }`, true);

    const invariants=['OMEGA_MASTER_TIMELINE',"key:'cyanKnife'","key:'orangeHand'","key:'blueShoe'","key:'purpleFile'","key:'greenPan'","key:'yellowGun'",
      "setState('guideChoice')","setState('room11Walk')",'drawGuideMasterPerspective','omegaMasterSpawnKnives','omegaMasterSpawnHands','omegaMasterSpawnVines','omegaMasterSpawnSaws','omegaMasterSpawnGun',"seg.ref>=558",'drawOmegaMasterRing'];
    const missing=invariants.filter(item=>!s.includes(item));if(missing.length)throw new Error('[Omega master] incomplete patch: '+missing.join(', '));
    return s;
  };
})();
