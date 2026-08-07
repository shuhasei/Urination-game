(() => {
  'use strict';
  const VERSION = '20260807-omega-faithful2';

  function findFunctionSpan(source, name) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(^|\\n)(\\s*)function\\s+' + escaped + '\\s*\\(');
    const match = re.exec(source);
    if (!match) return null;
    const start = match.index + (source[match.index] === '\n' ? 1 : 0);
    const brace = source.indexOf('{', match.index + match[0].length);
    if (brace < 0) return null;
    let depth = 0;
    let state = 'code';
    let quote = '';
    let templateDepth = 0;
    for (let i = brace; i < source.length; i++) {
      const c = source[i];
      const n = source[i + 1] || '';
      if (state === 'line') {
        if (c === '\n') state = 'code';
      } else if (state === 'block') {
        if (c === '*' && n === '/') { state = 'code'; i++; }
      } else if (state === 'str') {
        if (c === '\\') i++;
        else if (c === quote) state = 'code';
      } else if (state === 'template') {
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
        else if (c === '}') {
          depth--;
          if (depth === 0) return [start, i + 1];
        }
      }
    }
    return null;
  }

  function replaceFunction(source, name, code) {
    const span = findFunctionSpan(source, name);
    if (!span) {
      console.warn('[Omega faithful] function not found:', name);
      return source;
    }
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectHelpers(source) {
    if (source.includes('function drawPerspectiveGuideRoomFaithful')) return source;
    const marker = source.search(/(^|\n)\s*function\s+drawSansGuide\s*\(/);
    if (marker < 0) return source;
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const helpers = `  function drawPerspectiveGuideRoomFaithful(now, room11 = false) {
    rect(0, 0, W, H, '#08070b');
    fillPolygon([[18,180],[302,180],[242,52],[78,52]], '#2a1625');
    fillPolygon([[18,180],[78,52],[78,20],[0,68],[0,180]], '#3d2030');
    fillPolygon([[302,180],[242,52],[242,20],[320,68],[320,180]], '#321b2b');
    fillPolygon([[78,52],[242,52],[242,20],[78,20]], '#56303a');
    rect(132,24,56,43,'#2c120d'); rect(137,28,46,37,'#8a3b16');
    rect(142,32,36,30,'#aa4a17'); rect(173,45,3,3,'#ffd15d'); rect(127,65,66,4,'#c26929');
    g.save(); g.beginPath(); g.moveTo(18,180); g.lineTo(302,180); g.lineTo(242,52); g.lineTo(78,52); g.closePath(); g.clip();
    for (let y=61;y<181;y+=10) { const k=(y-52)/128; const l=78+(18-78)*k; const r=242+(302-242)*k; line(l,y,r,y,(Math.floor(y/10)%2)?'#49304b':'#6a3b5d',2); }
    for (const x of [32,78,124,196,242,288]) line(160,52,x,180,'#3d263e',1);
    if (room11 && room11BackgroundImage && room11BackgroundImage.complete && room11BackgroundImage.naturalWidth) { g.globalAlpha=.18; g.drawImage(room11BackgroundImage,78,51,164,102); }
    g.restore(); g.globalAlpha=1;
  }

  function drawGuideHumanFaithful(x,y,now,facing='up') {
    const ox=openingPlayer.x, oy=openingPlayer.y, od=openingPlayer.direction, om=openingPlayer.moving;
    openingPlayer.x=x; openingPlayer.y=y; openingPlayer.direction=facing; openingPlayer.moving=true;
    drawOpeningHero(now);
    openingPlayer.x=ox; openingPlayer.y=oy; openingPlayer.direction=od; openingPlayer.moving=om;
  }

  function drawOmegaFaithfulBackdrop(now, compact=false) {
    rect(0,0,W,H,'#000');
    if (room11OmegaSourceImage && room11OmegaSourceImage.complete && room11OmegaSourceImage.naturalWidth) {
      g.save(); g.imageSmoothingEnabled=false;
      const h=compact?96:122; g.drawImage(room11OmegaSourceImage,5,-9,310,h);
      g.restore();
    }
  }

  function drawOmegaGlitchSlices(now) {
    if (!room11OmegaSourceImage || !room11OmegaSourceImage.complete || !room11OmegaSourceImage.naturalWidth) return;
    const tick=Math.floor(now/45);
    for (let i=0;i<9;i++) { const sy=(i*13+tick*7)%105; const dx=((i+tick)%3-1)*7; g.drawImage(room11OmegaSourceImage,0,sy,room11OmegaSourceImage.naturalWidth,10,dx,sy,320,10); }
    for (let i=0;i<35;i++) { const x=(i*67+tick*31)%W; const y=(i*43+tick*17)%112; g.globalAlpha=.12+((i+tick)%4)*.08; rect(x,y,1+(i%3===0?2:0),1,'#fff'); }
    g.globalAlpha=1;
  }

  function drawOmegaProjectileFaithful(b,now) {
    const x=b.x||0,y=b.y||0,vx=b.vx||0,vy=b.vy||0,k=b.kind||'pellet',a=Math.atan2(vy,vx||.001);
    g.save(); g.translate(x,y);
    if(k==='knife'){g.rotate(a);fillPolygon([[-8,-2],[4,-2],[10,0],[4,2],[-8,2]],'#fff');rect(-12,-1,5,2,'#aaa');}
    else if(k==='fist'){g.fillStyle='#ff7a32';g.beginPath();g.arc(0,0,5,0,Math.PI*2);g.fill();rect(-6,-3,3,6,'#ffd069');rect(3,-4,2,8,'#ffd069');}
    else if(k==='shoe'){g.rotate(a+Math.PI/2);fillPolygon([[-5,-3],[3,-3],[7,1],[3,4],[-6,3]],'#61a9ff');rect(-3,-6,3,4,'#fff');}
    else if(k==='note'){rect(-1,-7,2,8,'#d287ff');g.fillStyle='#d287ff';g.beginPath();g.arc(-3,2,3,0,Math.PI*2);g.fill();}
    else if(k==='flame'){fillPolygon([[0,-8],[5,-1],[2,6],[0,3],[-3,7],[-6,-1]],'#ffef42');fillPolygon([[0,-4],[3,0],[0,4],[-2,0]],'#ff5d20');}
    else if(k==='gun'){g.rotate(a);rect(-8,-1,14,3,'#fff');fillPolygon([[6,-3],[11,0],[6,3]],'#ffff58');}
    else if(k==='vine'){g.rotate(a+Math.PI/2);rect(-2,-12,4,24,'#75c92f');fillPolygon([[-2,-7],[-8,-3],[-2,-2]],'#a8ee54');fillPolygon([[2,1],[8,5],[2,6]],'#a8ee54');}
    else if(k==='bomb'){g.fillStyle='#ddd';g.beginPath();g.arc(0,0,5,0,Math.PI*2);g.fill();line(2,-5,5,-9,'#fff',1);rect(5,-10,2,2,Math.floor(now/80)%2?'#ff3b20':'#ffff00');}
    else if(k==='laser'){g.globalAlpha=.25;rect(-4,-80,8,160,'#f22');g.globalAlpha=.95;rect(-1,-80,2,160,'#fff');}
    else {g.fillStyle='#fff';g.beginPath();g.arc(0,0,Math.max(2,b.radius||2.5),0,Math.PI*2);g.fill();}
    g.restore(); g.globalAlpha=1;
  }
`;
    return source.slice(0,at)+helpers+'\n'+source.slice(at);
  }

  window.applyOmegaFaithfulHotfix = source => {
    let s = injectHelpers(String(source || ''));

    s = replaceFunction(s,'drawSansGuide',`  function drawSansGuide(now) {
    drawPerspectiveGuideRoomFaithful(now,false);
    const e=(now-guideStartedAt)/1000, p=smoothstep01((e-2.1)/4.4);
    drawGuideHumanFaithful(142+p*18,153-p*55,now,'up');
    drawSans(244-p*78,122-p*51,now);
    if(e<2.25) drawGuideDialogue(['＊ よお。人間。','＊ オレのガイドで ROOM11へ','＊ 案内してやるよ。']);
    else if(e<4.5) drawGuideDialogue(['＊ ついて来いよ。','＊ こっちだ。']);
    else drawGuideDialogue(['＊ この先だ。','＊ 離れるなよ。']);
  }`);

    s = replaceFunction(s,'updateSansGuide',`  function updateSansGuide(dt,now) {
    if(now-guideStartedAt>=6900){guideStartedAt=now;setState('room11Walk');}
  }`);

    s = replaceFunction(s,'drawRoom11Walk',`  function drawRoom11Walk(now) {
    drawPerspectiveGuideRoomFaithful(now,true);
    const e=(now-guideStartedAt)/1000,p=smoothstep01(e/4.4),sw=Math.sin(now/210)*2;
    drawSans(171+sw,137-p*65,now); drawGuideHumanFaithful(154-sw*.35,165-p*68,now,'up');
    if(e<2.1) drawGuideDialogue(['＊ ここからは オレの背中を','＊ 追って歩くだけでいい。']);
    else drawGuideDialogue(['＊ ついてこいよ。','＊ もうすぐだ。']);
  }`);

    s = replaceFunction(s,'updateRoom11Walk',`  function updateRoom11Walk(now) {
    if(now-guideStartedAt>=4700){guideChoice=0;setState('guideChoice');}
  }`);

    s = replaceFunction(s,'drawGuideChoice',`  function drawGuideChoice() {
    const now=performance.now(); drawPerspectiveGuideRoomFaithful(now,true); drawSans(177,82,now); drawGuideHumanFaithful(155,139,now,'up');
    g.globalAlpha=.93;rect(37,95,246,74,'#000');g.globalAlpha=1;frameBox(37,95,246,74,'#fff',2);
    text('＊ 次に行く 覚悟はあるか？',54,106,9,'#fff');
    text((guideChoice===0?'♥ ':'')+'Yes',106,139,10,guideChoice===0?'#ffff00':'#fff','center');
    text((guideChoice===1?'♥ ':'')+'No',214,139,10,guideChoice===1?'#ffff00':'#fff','center');
  }`);

    s = replaceFunction(s,'drawGuideResponse',`  function drawGuideResponse() {
    const now=performance.now(); drawPerspectiveGuideRoomFaithful(now,true); drawSans(177,82,now); drawGuideHumanFaithful(155,139,now,'up');
    drawGuideDialogue(guideAccepted?['＊ お前ならできる。','＊ さあ、行こうぜ。']:['＊ まだ そのときじゃないぜ。','＊ あせらなくていい。','＊ 覚悟が決まったら また来な。']);
  }`);

    s = replaceFunction(s,'startRoom11Walk',`  function startRoom11Walk() {
    guideStartedAt=performance.now();setState('room11Title');saveCurrentProfile();
  }`);

    s = replaceFunction(s,'drawRoom11Title',`  function drawRoom11Title(now) {
    drawPerspectiveGuideRoomFaithful(now,true); const e=(now-guideStartedAt)/1000,p=smoothstep01(e/2.6);
    drawGuideHumanFaithful(160,160-p*54,now,'up'); g.globalAlpha=.52;rect(0,0,W,H,'#000');g.globalAlpha=1;
    text('ROOM 11',160,61,21,'#fff','center'); if(e>1.25) text('＊ ……奥で なにかが 目を覚ました。',160,127,8,'#fff','center');
  }`);

    s = replaceFunction(s,'updateRoom11Title',`  function updateRoom11Title(now) {
    if(now-guideStartedAt>=3300){omegaStartedAt=now;setState('omegaIntro');saveCurrentProfile();window.setTimeout(()=>{if(state==='omegaIntro')startOmegaBattle();},4300);}
  }`);

    s = replaceFunction(s,'drawOmegaFlowey',`  function drawOmegaFlowey(now) {
    drawOmegaFaithfulBackdrop(now,false); if(Math.floor(now/600)%7===0) drawOmegaGlitchSlices(now);
  }`);

    s = replaceFunction(s,'drawOmegaIntro',`  function drawOmegaIntro(now) {
    const e=(now-omegaStartedAt)/1000; rect(0,0,W,H,'#000');
    if(e<1.35){drawOmegaFaithfulBackdrop(now,false);drawOmegaGlitchSlices(now);}
    else{drawOmegaFaithfulBackdrop(now,false);if(e<2.5)drawOmegaGlitchSlices(now);g.globalAlpha=.92;rect(22,119,276,48,'#000');g.globalAlpha=1;frameBox(22,119,276,48,'#fff',1);text(e<2.75?'＊ …………':'＊ 逃げ場は ない。',160,132,8,'#fff','center');text('ROOM 11',160,151,7,'#aaa','center');}
  }`);

    s = replaceFunction(s,'spawnOmegaWave',`  function spawnOmegaWave(now) {
    const e=(now-omegaStartedAt)/1000,p=Math.floor((e%64)/8),cx=160,ax=heart.x||160,ay=heart.y||112; omegaPhase=p;
    if(p===0){for(let i=0;i<11;i++)addOmega('knife',18+i*29,72-(i%3)*9,(i%2?-10:10),72+(i%4)*9,2.8,3.2);omegaSpawnAt=now+660;}
    else if(p===1){for(let i=0;i<14;i++){const a=i*Math.PI*2/14+e*.43;addOmega('fist',cx,84,Math.cos(a)*69,Math.sin(a)*69,3.2,3.3);}omegaSpawnAt=now+760;}
    else if(p===2){for(let i=0;i<9;i++)addOmega('shoe',34+i*31,68,Math.sin(i*.9)*16,88+(i%3)*10,2.7,3.2);omegaSpawnAt=now+590;}
    else if(p===3){for(let i=0;i<12;i++){const side=i%2?302:18,y=79+(i%6)*12;addOmega('note',side,y,side>160?-91:91,Math.sin(i*1.7)*19,3.5,2.8);}omegaSpawnAt=now+620;}
    else if(p===4){for(let i=0;i<10;i++){const x=28+i*30;addOmega('flame',x,150,(ax-x)*.16,-86-(i%4)*11,2.7,3.4);}omegaSpawnAt=now+640;}
    else if(p===5){for(let i=0;i<8;i++){const a=Math.atan2(ay-70,ax-cx)+(i-3.5)*.14;addOmega('gun',cx,70,Math.cos(a)*110,Math.sin(a)*110,2.5,2.6);}if(Math.floor(e*2)%2===0)addOmega('laser',ax,108,0,0,1,3.6);omegaSpawnAt=now+520;}
    else if(p===6){for(let i=0;i<8;i++)addOmega('vine',32+i*37,151,Math.sin(i*1.5)*8,-93-(i%3)*14,2.3,3.4);for(let i=0;i<5;i++)addOmega('bomb',58+i*51,74,Math.sin(i*2)*20,70,2.6,4);omegaSpawnAt=now+650;}
    else{for(let i=0;i<16;i++){const a=i*Math.PI*2/16-e*.72;addOmega(i%4===0?'knife':'pellet',cx,102,Math.cos(a)*(72+(i%3)*12),Math.sin(a)*(72+(i%3)*12),3.2,2.8);}omegaSpawnAt=now+690;}
  }`);

    s = replaceFunction(s,'drawOmegaBattle',`  function drawOmegaBattle(now) {
    drawOmegaFaithfulBackdrop(now,true); if(omegaPhase>=6)drawOmegaGlitchSlices(now);
    rect(35,72,250,78,'#000');frameBox(35,72,250,78,'#fff',2);
    for(const bullet of omegaBullets)drawOmegaProjectileFaithful(bullet,now);battleHeartShape(heart.x,heart.y,'#ed001f');
    const labels=['KNIVES','RING','SHOES','NOTES','FIRE','GUN','VINES','FINAL MIX'];text(labels[omegaPhase]||'',160,62,6,'#ddd','center');
    drawStatus();drawMenu();
  }`);

    const required=['drawPerspectiveGuideRoomFaithful','drawOmegaProjectileFaithful',"addOmega('knife'", "setState('room11Title')"];
    const missing=required.filter(x=>!s.includes(x));
    if(missing.length)throw new Error('Omega faithful hotfix incomplete: '+missing.join(', '));
    return s;
  };
})();
