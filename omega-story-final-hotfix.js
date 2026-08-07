(() => {
  'use strict';
  const STORY_VERSION = '20260807-omega-story4';
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

  function replaceFunction(source, name, code, required=true) {
    const span = findFunctionSpan(source, name);
    if (!span) {
      if (required) throw new Error('[Omega story] missing function: ' + name);
      return source;
    }
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectStory(source) {
    if (source.includes('OMEGA_STORY_FINAL_V4')) return source;
    const marker = source.search(/(^|\n)\s*function\s+drawOmegaIntro\s*\(/);
    if (marker < 0) throw new Error('[Omega story] drawOmegaIntro marker missing');
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const code = `  const OMEGA_STORY_FINAL_V4 = true;
  const OMEGA_SOUL_KEYS = ['cyanKnife','orangeHand','blueShoe','purpleFile','greenPan','yellowGun'];
  const OMEGA_SOUL_COLORS = ['#45ecff','#ff9b20','#466cff','#d94cff','#47e45a','#fff05b'];
  let omegaStoryIntroAutoStarted = false;
  let omegaStoryActs = Object.create(null);
  let omegaStoryHealUntil = -10000;
  let omegaStorySavePos = {x:160,y:128};
  let omegaStorySaveStep = -1;
  let omegaStoryLoadStep = -1;
  let omegaStorySaveAt = -10000;
  let omegaStoryLoadAt = -10000;
  let omegaStoryFakeDeathUntil = -10000;
  let omegaStoryFakeDeathCount = 0;
  let omegaStoryFinale = false;
  let omegaStoryFinalHits = 0;
  let omegaStoryFinalHitAt = -10000;
  let omegaStoryDecision = 0;
  let omegaStoryDecisionLatch = false;
  let omegaStoryChoiceResolved = false;
  let omegaStoryChoiceMessage = '';
  let omegaStoryChoiceAt = -10000;

  function omegaStorySoulIndex(key){return OMEGA_SOUL_KEYS.indexOf(key);}
  function omegaStoryIsSoul(key){return omegaStorySoulIndex(key)>=0;}
  function omegaStoryConfirmPressed(){return pressed && (pressed.has('Enter')||pressed.has('KeyZ')||pressed.has('Space'));}
  function omegaStoryDrawImage(x=5,y=-2,w=310,h=221){
    const img=(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth)?room11OmegaSourceImage:null;
    if(img){g.save();g.imageSmoothingEnabled=false;g.drawImage(img,x,y,w,h);g.restore();return true;}return false;
  }
  function omegaStoryDrawOmega(now, mode='normal'){
    rect(0,0,W,H,'#000');const shake=mode==='rage'?Math.sin(now*.09)*2.2:Math.sin(now*.018)*.45;
    if(!omegaStoryDrawImage(5+shake,-3,310,221))drawOmegaMasterBody(now,mode==='glitch'?'glitch':'normal');
    if(mode==='glitch'){
      for(let i=0;i<8;i++){const sy=(i*17+Math.floor(now/37)*9)%112,dx=((i+Math.floor(now/71))%3-1)*7;g.globalAlpha=.18+i*.025;const img=(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth)?room11OmegaSourceImage:null;if(img)g.drawImage(img,0,sy,img.naturalWidth,8,dx,sy,320,8);}g.globalAlpha=1;
    }
  }
  function omegaStoryDrawFakeCrash(now,e){
    rect(0,0,W,H,'#000');
    if(e<1.9){text('UNDERTALE',160,48,25,'#fff','center');text('...',160,90,10,'#777','center');if(e>1.15)text('FATAL ERROR',160,132,12,'#ed1c24','center');}
    else if(e<4.1){rect(0,0,W,H,'#090909');text('UNDERTALE',160,39,23,'#fff','center');text('SAVE DATA',160,78,8,'#aaa','center');frameBox(62,91,196,42,'#fff',1);text((playerName||'PLAYER')+'  LV '+playerLevel,78,101,8,'#fff');text('FILE 0',78,116,7,'#fff');if(e>3.05){g.globalAlpha=.75;rect(61,90,198,44,'#b00000');g.globalAlpha=1;text('DATA ERASED',160,107,12,'#fff','center');}}
    else if(e<6.1){rect(0,0,W,H,'#8d0000');for(let i=0;i<18;i++){g.globalAlpha=.12;rect((i*29+Math.floor(now/20)*7)%W,(i*41)%H,40,3,'#fff');}g.globalAlpha=1;text('FLOWEY',160,75,30,'#000','center');text('おまえの セーブは もう ない。',160,118,8,'#fff','center');}
    else if(e<8.2){rect(0,0,W,H,'#000');text('...',160,85,10,'#fff','center');if(e>7.0)text('LOAD FAILED',160,108,8,'#bdbdbd','center');}
    else if(e<10.2){rect(0,0,W,H,'#a00000');const p=(e-8.2)/2;g.globalAlpha=.25+.65*p;omegaStoryDrawOmega(now,'glitch');g.globalAlpha=1;}
    else{omegaStoryDrawOmega(now,e<12.2?'glitch':'rage');if(e<12.4){g.globalAlpha=.14+.16*Math.sin(now*.04);rect(0,0,W,H,'#fff');g.globalAlpha=1;}if(e>12.8)text('＊ さあ ほんとうの じごくを はじめよう。',160,159,7,'#fff','center');}
  }
  function updateOmegaIntroStory(now){
    const e=(now-omegaStartedAt)/1000;if(!omegaStoryIntroAutoStarted&&e>=14.6){omegaStoryIntroAutoStarted=true;startOmegaBattle();}
  }
  function omegaStorySoulAct(seg,now){
    if(!omegaStoryIsSoul(seg.key))return;
    const idx=omegaStorySoulIndex(seg.key),ready=seg.local>=Math.max(8,(seg.end-seg.start)-6.0);
    if(ready&&!omegaStoryActs[seg.key]){
      omegaStartedAt+=16.67;
      if(omegaStoryConfirmPressed()){
        omegaStoryActs[seg.key]=true;omegaStoryHealUntil=now+3200;omegaBullets=[];hp=Math.min(maxHp,hp+Math.max(5,Math.ceil(maxHp*.5)));omegaMasterSaveFlashAt=now;beep(980,.08);saveCurrentProfile();
      }
    }
  }
  function omegaStorySaveLoad(seg,now){
    if(omegaStoryIsSoul(seg.key)||seg.key==='soulRescue'||seg.key==='mercyRing'||seg.key==='soulsFinal'||seg.key==='psychedelic')return;
    const step=Math.floor(seg.ref/13);
    const frac=(seg.ref/13)-step;
    if(frac<.06&&step!==omegaStorySaveStep){omegaStorySaveStep=step;omegaStorySavePos={x:heart.x,y:heart.y};omegaStorySaveAt=now;beep(610,.035);}
    if(frac>.47&&frac<.54&&step!==omegaStoryLoadStep){omegaStoryLoadStep=step;omegaStoryLoadAt=now;heart.x=omegaStorySavePos.x;heart.y=omegaStorySavePos.y;omegaBullets=[];omegaSpawnAt=now+240;beep(190,.055);}
  }
  function omegaStoryDrawSaveLoad(now){
    if(now-omegaStorySaveAt<620){text('FILE 2 SAVED',160,35,7,'#fff','center');}
    if(now-omegaStoryLoadAt<760){g.globalAlpha=.30;rect(0,0,W,H,'#fff');g.globalAlpha=1;text('FILE 2 LOADED',160,35,7,'#fff','center');}
  }
  function omegaStoryHandleDeath(now){
    if(hp>0||omegaStoryFakeDeathUntil>now)return false;
    omegaStoryFakeDeathCount++;omegaStoryFakeDeathUntil=now+1850;omegaBullets=[];hp=1;heart.x=160;heart.y=130;omegaSpawnAt=now+2100;beep(70,.18);return true;
  }
  function omegaStoryDrawFakeDeath(now){
    if(now>=omegaStoryFakeDeathUntil)return false;const remain=omegaStoryFakeDeathUntil-now;rect(0,0,W,H,'#000');text('GAME OVER',160,62,21,'#fff','center');
    if(remain<1150){text('＊ しなせて なんか やらない。',160,105,8,'#fff','center');text('＊ もっと もっと くるしめ。',160,121,8,'#fff','center');}
    return true;
  }
  function omegaStoryDrawAct(seg,now){
    if(!omegaStoryIsSoul(seg.key))return;const idx=omegaStorySoulIndex(seg.key),acted=omegaStoryActs[seg.key],ready=seg.local>=Math.max(8,(seg.end-seg.start)-6.1);
    rect(132,148,56,21,ready&&!acted?'#000':'#151515');frameBox(132,148,56,21,ready&&!acted?'#ff9b20':'#777',1);text(acted?'HELP':'ACT',160,154,8,acted?'#55ff77':ready?'#ff9b20':'#777','center');
    if(ready&&!acted)text('ENTER / Z',160,137,6,'#fff','center');if(acted&&now<omegaStoryHealUntil){for(let i=0;i<9;i++){const a=i*Math.PI*2/9+now*.0035,bx=160+Math.cos(a)*(22+(i%3)*7),by=101+Math.sin(a)*(18+(i%2)*8);battleHeartShape(bx,by,'#47e45a');}text('＊ たすけを よんだ……',160,135,7,OMEGA_SOUL_COLORS[idx],'center');}
  }
  function omegaStoryDrawFinalFight(now){
    omegaStoryDrawOmega(now,'rage');const ratio=Math.max(0,1-omegaStoryFinalHits/18);rect(54,6,212,9,'#4a0000');rect(54,6,212*ratio,9,'#3ee35c');text(String(Math.max(0,Math.round(9999*ratio))),160,18,7,'#ff3333','center');
    rect(122,139,76,27,'#000');frameBox(122,139,76,27,'#ff8b18',2);text('たたかう',160,147,9,'#ff8b18','center');battleHeartShape(heart.x,heart.y,'#ed001f');
    if(now-omegaStoryFinalHitAt<470){text('-'+(540+omegaStoryFinalHits*137),160,56,12,'#ff2222','center');g.globalAlpha=.18;rect(0,0,W,H,'#fff');g.globalAlpha=1;}
    for(let i=0;i<6;i++){const a=i*Math.PI*2/6+now*.0007,bx=160+Math.cos(a)*48,by=91+Math.sin(a)*29;battleHeartShape(bx,by,OMEGA_SOUL_COLORS[i]);}
  }
  function omegaStoryUpdateFinale(dt,now){
    const a=omegaMasterArena();let dx=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0),dy=(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0),m=Math.hypot(dx,dy);if(m){dx/=m;dy/=m;}heart.x=Math.max(a.left+4,Math.min(a.right-4,heart.x+dx*145*dt));heart.y=Math.max(a.top+4,Math.min(a.bottom-4,heart.y+dy*145*dt));hp=maxHp;
    if(omegaStoryConfirmPressed()&&now-omegaStoryFinalHitAt>230){omegaStoryFinalHitAt=now;omegaStoryFinalHits++;omegaMasterDamageAt=now;beep(115,.055);if(omegaStoryFinalHits>=18){omegaStoryFinale=false;omegaBullets=[];omegaStoryDecision=0;omegaStoryChoiceResolved=false;setState('omegaVictory');saveCurrentProfile();}}
  }
  function omegaStoryDrawSmallFlowey(x=160,y=79){
    line(x,y+7,x,y+29,'#50b927',2);for(let i=0;i<6;i++){const a=i*Math.PI*2/6;g.fillStyle='#f7dc28';g.beginPath();g.ellipse(x+Math.cos(a)*8,y+Math.sin(a)*8,5,3,a,0,Math.PI*2);g.fill();}g.fillStyle='#fff';g.beginPath();g.arc(x,y,7,0,Math.PI*2);g.fill();rect(x-3,y-2,2,2,'#111');rect(x+1,y-2,2,2,'#111');line(x-3,y+3,x+3,y+3,'#111',1);
  }
  function updateOmegaVictoryChoice(now){
    if(omegaStoryChoiceResolved)return;const left=keys.has('ArrowLeft')||keys.has('ArrowUp'),right=keys.has('ArrowRight')||keys.has('ArrowDown');if((left||right)&&!omegaStoryDecisionLatch){omegaStoryDecision=left?0:1;omegaStoryDecisionLatch=true;beep();}if(!left&&!right)omegaStoryDecisionLatch=false;
  }
  function handleOmegaVictoryConfirm(){
    if(!omegaStoryChoiceResolved){omegaStoryChoiceResolved=true;omegaStoryChoiceAt=performance.now();omegaStoryChoiceMessage=omegaStoryDecision===0?'＊ フラウィに とどめを さした。':'＊ フラウィを にがした。';saveCurrentProfile();return;}
    if(performance.now()-omegaStoryChoiceAt>900){saveCurrentProfile();setState('title');}
  }
  function drawOmegaStoryDecision(now){
    rect(0,0,W,H,'#000');omegaStoryDrawSmallFlowey(160,69);if(!omegaStoryChoiceResolved){text('＊ フラウィは もう うごけない。',160,111,8,'#fff','center');rect(42,132,236,37,'#000');frameBox(42,132,236,37,'#fff',1);if(omegaStoryDecision===0)heartShape(70,150,'#ed001f');else heartShape(183,150,'#ed001f');text('たたかう',113,144,9,omegaStoryDecision===0?'#ffff00':'#fff','center');text('にがす',231,144,9,omegaStoryDecision===1?'#ffff00':'#fff','center');}
    else{text(omegaStoryChoiceMessage,160,119,8,'#fff','center');text('ENTER / Z',160,155,7,'#aaa','center');}
  }
`;
    return source.slice(0,at)+code+'\n'+source.slice(at);
  }

  window.applyOmegaStoryFinalHotfix = source => {
    let s=injectStory(String(source||''));

    s=replaceFunction(s,'drawOmegaIntro',`  function drawOmegaIntro(now) {
    const e=(now-omegaStartedAt)/1000;omegaStoryDrawFakeCrash(now,e);
  }`);

    s=replaceFunction(s,'startOmegaBattle',`  function startOmegaBattle() {
    omegaStartedAt=performance.now();omegaSpawnAt=omegaStartedAt+500;omegaBullets=[];omegaPhase=0;omegaMasterWave=0;omegaMasterLastSegment='';omegaMasterSafeX=160;omegaMasterSafeY=126;omegaMasterBossHp=omegaMasterMaxHp=9999;omegaMasterDamageStep=-1;omegaMasterDamageAt=-10000;omegaMasterSaveFlashAt=-10000;
    omegaStoryActs=Object.create(null);omegaStoryHealUntil=-10000;omegaStorySaveStep=omegaStoryLoadStep=-1;omegaStorySaveAt=omegaStoryLoadAt=-10000;omegaStoryFakeDeathUntil=-10000;omegaStoryFakeDeathCount=0;omegaStoryFinale=false;omegaStoryFinalHits=0;omegaStoryFinalHitAt=-10000;omegaStoryDecision=0;omegaStoryChoiceResolved=false;
    soulMode='red';hp=Math.max(1,hp);heart.x=160;heart.y=128;heart.vx=heart.vy=0;setState('omegaBattle');saveCurrentProfile();
  }`);

    s=replaceFunction(s,'updateOmegaBattle',`  function updateOmegaBattle(dt,now) {
    if(omegaStoryFinale){omegaStoryUpdateFinale(dt,now);return;}
    const a=omegaMasterArena();let dx=(keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0),dy=(keys.has('ArrowDown')?1:0)-(keys.has('ArrowUp')?1:0),m=Math.hypot(dx,dy);if(m){dx/=m;dy/=m;}heart.x=Math.max(a.left+4,Math.min(a.right-4,heart.x+dx*132*dt));heart.y=Math.max(a.top+4,Math.min(a.bottom-4,heart.y+dy*132*dt));heart.vx=dx*132;heart.vy=dy*132;
    if(now<omegaStoryFakeDeathUntil){invincible=.5;return;}
    const seg=omegaMasterSegment(now);omegaStorySoulAct(seg,now);omegaStorySaveLoad(seg,now);
    if(seg.key!==omegaMasterLastSegment){omegaBullets=[];omegaMasterLastSegment=seg.key;omegaSpawnAt=now+430;omegaMasterSafeX=heart.x;omegaMasterSafeY=heart.y;if(omegaStoryIsSoul(seg.key)){hp=Math.min(maxHp,hp+Math.max(2,Math.ceil(maxHp*.18)));omegaMasterSaveFlashAt=now;}saveCurrentProfile();}
    if(seg.key==='soulRescue'){omegaBullets=[];hp=Math.min(maxHp,hp+Math.max(1,Math.ceil(dt*18)));if(now-omegaMasterPulseAt>390){omegaMasterPulseAt=now;beep(960,.025);}}
    else if(seg.key==='lateMix'&&seg.ref>=454){omegaBullets=[];hp=maxHp;if(seg.ref>=466){omegaStoryFinale=true;omegaStoryFinalHits=0;omegaStoryFinalHitAt=-10000;omegaBullets=[];heart.x=160;heart.y=130;beep(1060,.10);return;}}
    else if(!['mercyRing','soulsFinal','psychedelic'].includes(seg.key)&&now>=omegaSpawnAt)omegaMasterSpawnPattern(now,seg);
    let hit=false;for(const b of omegaBullets){b.age+=dt;b.angle+=(b.spin||0)*dt;if(b.age>=(b.warning||0)){b.x+=(b.vx||0)*dt;b.y+=(b.vy||0)*dt;}if(b.age>=(b.warning||0)){if(b.kind==='laser')hit||=Math.abs(heart.y-b.y)<3.2;else if(b.kind==='laserV')hit||=Math.abs(heart.x-b.x)<3.2;else hit||=Math.hypot(heart.x-b.x,heart.y-b.y)<(b.hitRadius||b.size||4)+2.1;}}
    omegaBullets=omegaBullets.filter(b=>b.age<b.life&&b.x>-65&&b.x<W+65&&b.y>a.top-80&&b.y<a.bottom+80);
    if(hit&&!TEST_PLAY_INVINCIBLE&&invincible<=0){hp=Math.max(0,hp-1);invincible=.40;beep(95,.04);}invincible=Math.max(0,invincible-dt);if(hp<=0){omegaStoryHandleDeath(now);return;}
    if(seg.ref>=360&&seg.ref<454){const step=Math.floor((seg.ref-360)/4.6);if(step!==omegaMasterDamageStep){omegaMasterDamageStep=step;omegaMasterDamageAt=now;beep(150,.035);}const p=clamp01((seg.ref-360)/94);omegaMasterBossHp=Math.max(380,Math.round(omegaMasterMaxHp*(1-p*.92)));}
  }`);

    s=replaceFunction(s,'drawOmegaBattle',`  function drawOmegaBattle(now) {
    if(omegaStoryDrawFakeDeath(now))return;if(omegaStoryFinale){omegaStoryDrawFinalFight(now);return;}const seg=omegaMasterSegment(now);
    const special=omegaStoryIsSoul(seg.key);if(special){rect(0,0,W,H,'#000');drawOmegaMasterTVFace(136,0,48,31,Math.floor(now/250)%2);}else omegaStoryDrawOmega(now,seg.key==='lateMix'?'rage':seg.key==='soulRescue'?'glitch':'normal');
    if(seg.key==='soulRescue'){drawOmegaMasterSouls(now);text('＊ 6つの たましいが こたえた。',160,136,8,'#fff','center');battleHeartShape(heart.x,heart.y,'#ed001f');}
    else{for(const bullet of omegaBullets)drawOmegaMasterBullet(bullet,now);battleHeartShape(heart.x,heart.y,seg.soul||'#ed001f');omegaStoryDrawAct(seg,now);}
    rect(143,169,34,5,'#552300');rect(143,169,34*Math.max(0,hp/Math.max(1,maxHp)),5,'#fff000');omegaStoryDrawSaveLoad(now);
    if(seg.ref>=360&&seg.ref<454){const ratio=Math.max(0,omegaMasterBossHp/Math.max(1,omegaMasterMaxHp));rect(70,6,180,8,'#661016');rect(70,6,180*ratio,8,'#37df59');}
  }`);

    s=replaceFunction(s,'drawOmegaVictory',`  function drawOmegaVictory() { drawOmegaStoryDecision(performance.now()); }`);

    const updateNeedle="    } else if (state === 'omegaBattle') {\n      updateOmegaBattle(dt, now);\n    } else if (state === 'opening') {";
    const updateReplacement="    } else if (state === 'omegaIntro') {\n      updateOmegaIntroStory(now);\n    } else if (state === 'omegaBattle') {\n      updateOmegaBattle(dt, now);\n    } else if (state === 'omegaVictory') {\n      updateOmegaVictoryChoice(now);\n    } else if (state === 'opening') {";
    if(s.includes(updateNeedle))s=s.replace(updateNeedle,updateReplacement);else if(!s.includes("updateOmegaIntroStory(now)"))throw new Error('[Omega story] update loop anchor missing');

    const confirmNeedle="    if (state === 'omegaVictory') { saveCurrentProfile(); setState('title'); return; }";
    if(s.includes(confirmNeedle))s=s.replace(confirmNeedle,"    if (state === 'omegaVictory') { handleOmegaVictoryConfirm(); return; }");
    else if(!s.includes("handleOmegaVictoryConfirm(); return;"))throw new Error('[Omega story] victory confirm anchor missing');

    const roomWalk= findFunctionSpan(s,'updateRoom11Walk');
    if(roomWalk){const old=s.slice(roomWalk[0],roomWalk[1]);if(!old.includes('omegaStoryIntroAutoStarted')){
      s=s.slice(0,roomWalk[0])+old.replace("omegaStartedAt=now;setState('omegaIntro');","omegaStartedAt=now;omegaStoryIntroAutoStarted=false;setState('omegaIntro');")+s.slice(roomWalk[1]);}}

    const required=['OMEGA_STORY_FINAL_V4','omegaStoryDrawFakeCrash','omegaStorySoulAct','omegaStorySaveLoad','omegaStoryDrawFakeDeath','omegaStoryDrawFinalFight','drawOmegaStoryDecision'];
    const missing=required.filter(x=>!s.includes(x));if(missing.length)throw new Error('[Omega story] incomplete: '+missing.join(', '));
    return s;
  };
})();
