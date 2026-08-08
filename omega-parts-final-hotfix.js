(() => {
  'use strict';

  const PARTS_VERSION = '20260808-omega-live2d6';

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
    if (!span) throw new Error('[Omega Live2D guide] missing function: ' + name);
    return source.slice(0, span[0]) + code.trimEnd() + source.slice(span[1]);
  }

  function injectHelpers(source) {
    if (source.includes('OMEGA_LIVE2D_GUIDE_V6')) return source;
    const marker = source.search(/(^|\n)\s*function\s+omegaStoryDrawOmega\s*\(/);
    if (marker < 0) throw new Error('[Omega Live2D guide] omegaStoryDrawOmega anchor missing');
    const at = marker + (source[marker] === '\n' ? 1 : 0);
    const helpers = `  // === OMEGA LIVE2D GUIDE RIG ${PARTS_VERSION} ===
  // Layer order and names follow the attached Live2D separation guide. The game is a
  // Canvas renderer (not Cubism), so the same bottom-up separation is reproduced as
  // independent clipped layers with procedural back-fill behind moving parts.
  const OMEGA_LIVE2D_GUIDE_V6 = true;
  const OMEGA_GUIDE_LAYER_SPEC = Object.freeze([
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

  function omegaGuideSourceImage(){
    if(typeof omegaGeneratedHQImage!=='undefined'&&omegaGeneratedHQImage.complete&&omegaGeneratedHQImage.naturalWidth)return omegaGeneratedHQImage;
    if(typeof room11OmegaSourceImage!=='undefined'&&room11OmegaSourceImage.complete&&room11OmegaSourceImage.naturalWidth)return room11OmegaSourceImage;
    return null;
  }
  function omegaGuideSrc(img,x,y,w,h){
    const sx=img.naturalWidth/320, sy=img.naturalHeight/213;
    return [x*sx,y*sy,w*sx,h*sy];
  }
  let omegaGuideLayerCacheSource=null;
  let omegaGuideLayerCache=Object.create(null);
  function omegaGuideKeyedLayer(img,sx,sy,sw,sh,threshold=10){
    if(omegaGuideLayerCacheSource!==img){omegaGuideLayerCacheSource=img;omegaGuideLayerCache=Object.create(null);}
    const key=[sx,sy,sw,sh,threshold].join(':');if(omegaGuideLayerCache[key])return omegaGuideLayerCache[key];
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(sw));c.height=Math.max(1,Math.round(sh));
    const cg=c.getContext('2d',{willReadFrequently:true}),src=omegaGuideSrc(img,sx,sy,sw,sh);cg.imageSmoothingEnabled=false;cg.drawImage(img,src[0],src[1],src[2],src[3],0,0,c.width,c.height);
    try{const id=cg.getImageData(0,0,c.width,c.height),d=id.data,fade=32;for(let i=0;i<d.length;i+=4){const lum=Math.max(d[i],d[i+1],d[i+2]);if(lum<=threshold)d[i+3]=0;else if(lum<threshold+fade)d[i+3]=Math.round(d[i+3]*(lum-threshold)/fade);}cg.putImageData(id,0,0);}catch(_){/* same-origin data/blob images should allow this; keep rectangular crop as fallback */}
    omegaGuideLayerCache[key]=c;return c;
  }
  function omegaGuideDrawRegion(img,sx,sy,sw,sh,dx,dy,dw,dh,px,py,angle=0,tx=0,ty=0,scaleX=1,scaleY=1,alpha=1,keyBlack=false,threshold=10){
    if(!img||!img.naturalWidth||!img.naturalHeight)return;
    const s=keyBlack?null:omegaGuideSrc(img,sx,sy,sw,sh),layer=keyBlack?omegaGuideKeyedLayer(img,sx,sy,sw,sh,threshold):null;
    g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;
    g.translate(px+tx,py+ty);g.rotate(angle);g.scale(scaleX,scaleY);g.translate(-px,-py);
    if(layer)g.drawImage(layer,0,0,layer.width,layer.height,dx,dy,dw,dh);else g.drawImage(img,s[0],s[1],s[2],s[3],dx,dy,dw,dh);g.restore();g.globalAlpha=1;
  }
  function omegaGuideStroke(points,color,width=2,alpha=1){
    if(!points.length)return;g.save();g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';
    g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.stroke();g.restore();
  }
  function omegaGuideBackfill(now,mode,img){
    rect(0,0,W,H,'#000');
    // A faint source silhouette keeps the original composition readable while the
    // foreground regions are darkened and repainted so moved layers do not leave twins.
    if(img){g.save();g.globalAlpha=.16;g.imageSmoothingEnabled=false;g.drawImage(img,0,-8,320,213);g.restore();}
    g.save();g.fillStyle='rgba(0,0,0,.78)';
    g.fillRect(96,0,128,78);g.fillRect(18,17,114,85);g.fillRect(188,17,114,85);
    g.fillRect(0,72,111,108);g.fillRect(209,72,111,108);g.fillRect(108,55,104,125);g.restore();
    const t=now/1000, pulse=.55+.18*Math.sin(t*1.7);
    // Back pipes / veins: deterministic in-paint substitute matching the guide prompts.
    const pipe='#5d5d62',pipe2='#292a2f',vein='#7a1720';
    omegaGuideStroke([[21,16],[35,40],[62,55],[89,64],[118,77]],pipe,5,.75);
    omegaGuideStroke([[299,16],[285,40],[258,55],[231,64],[202,77]],pipe,5,.75);
    omegaGuideStroke([[92,11],[104,31],[105,58],[116,77]],pipe2,4,.9);
    omegaGuideStroke([[228,11],[216,31],[215,58],[204,77]],pipe2,4,.9);
    omegaGuideStroke([[136,67],[130,91],[137,118],[132,154]],pipe,4,.75);
    omegaGuideStroke([[184,67],[190,91],[183,118],[188,154]],pipe,4,.75);
    omegaGuideStroke([[151,71],[148,98],[151,128],[148,168]],vein,1.5,pulse);
    omegaGuideStroke([[169,71],[172,98],[169,128],[172,168]],vein,1.5,pulse);
    for(let i=0;i<7;i++){
      const yy=75+i*13,wig=Math.sin(t*.9+i)*4;
      omegaGuideStroke([[112,yy],[125+wig,yy-4],[138,yy+2]],i%2?pipe2:pipe,2.2,.72);
      omegaGuideStroke([[208,yy],[195-wig,yy-4],[182,yy+2]],i%2?pipe2:pipe,2.2,.72);
    }
    if(mode==='rage'){g.globalAlpha=.035+.02*Math.abs(Math.sin(now*.028));rect(0,0,W,H,'#fff');g.globalAlpha=1;}
  }
  function omegaGuideDrawStem(img,t,amp){
    const sway=Math.sin(t*.72)*.017*amp;
    omegaGuideDrawRegion(img,136,96,48,42,136,88,48,42,160,91,sway*.45,0,Math.sin(t*1.4)*.5*amp,1,1,.95,true,10);
    omegaGuideDrawRegion(img,133,130,54,45,133,122,54,45,160,124,sway,0,Math.sin(t*1.2+1)*.8*amp,1,1,.95,true,10);
    omegaGuideDrawRegion(img,130,168,60,45,130,160,60,45,160,162,sway*1.45,0,Math.sin(t*1.0+2)*1.1*amp,1,1,.95,true,10);
  }
  function omegaGuideDrawLegs(img,t,amp){
    const a=Math.sin(t*.83)*.022*amp;
    omegaGuideDrawRegion(img,119,125,34,88,119,117,34,88,146,122,a,Math.sin(t*.91)*1.1*amp,0,1,1,.9,true,10);
    omegaGuideDrawRegion(img,167,125,34,88,167,117,34,88,174,122,-a,-Math.sin(t*.91)*1.1*amp,0,1,1,.9,true,10);
  }
  function omegaGuideDrawArms(img,t,amp){
    const l=Math.sin(t*.77)*.022*amp,r=-Math.sin(t*.77+.35)*.022*amp;
    // Left: shoulder -> elbow -> hand, with overlap at each cut so rotations never expose a gap.
    omegaGuideDrawRegion(img,0,79,112,56,0,71,112,56,105,104,l,0,Math.sin(t*.9)*.8*amp,1,1,.98,true,10);
    omegaGuideDrawRegion(img,0,121,101,53,0,113,101,53,88,132,l*1.7,Math.sin(t*.8)*1.3*amp,Math.cos(t*.95)*.7*amp,1,1,.98,true,10);
    omegaGuideDrawRegion(img,0,155,92,58,0,147,92,58,72,159,l*2.4,Math.sin(t*.73)*2.0*amp,Math.cos(t*.82)*1.0*amp,1,1,.98,true,10);
    omegaGuideDrawRegion(img,208,79,112,56,208,71,112,56,215,104,r,0,Math.sin(t*.9+.4)*.8*amp,1,1,.98,true,10);
    omegaGuideDrawRegion(img,219,121,101,53,219,113,101,53,232,132,r*1.7,-Math.sin(t*.8+.4)*1.3*amp,Math.cos(t*.95+.4)*.7*amp,1,1,.98,true,10);
    omegaGuideDrawRegion(img,228,155,92,58,228,147,92,58,248,159,r*2.4,-Math.sin(t*.73+.4)*2.0*amp,Math.cos(t*.82+.4)*1.0*amp,1,1,.98,true,10);
  }
  function omegaGuideDrawEyes(img,t,amp){
    const tilt=Math.sin(t*1.18)*.012*amp,look=Math.sin(t*.64)*1.4*amp,bob=Math.cos(t*.91)*.7*amp;
    omegaGuideDrawRegion(img,18,18,119,88,18,10,119,88,126,53,tilt,look,bob,1,1,.99,true,10);
    omegaGuideDrawRegion(img,183,18,119,88,183,10,119,88,194,53,-tilt,-look,bob,1,1,.99,true,10);
  }
  function omegaGuideDrawJaw(img,t,amp){
    const breathe=1+Math.sin(t*1.13)*.008*amp,bob=Math.sin(t*1.37)*.8*amp;
    omegaGuideDrawRegion(img,108,61,104,96,108,53,104,96,160,70,Math.sin(t*.53)*.006*amp,0,bob,breathe,1+(breathe-1)*1.8,.99,true,8);
  }
  function omegaGuideDrawRibs(t,amp){
    // Eight separate rib arcs are kept in front of the stem, matching the guide's 6-8 rib recommendation.
    g.save();g.lineCap='round';
    for(let i=0;i<4;i++){
      const y=92+i*14,flex=Math.sin(t*.9+i*.6)*2.0*amp;
      g.strokeStyle=i%2?'#c6c4b8':'#9f9d94';g.lineWidth=2.2;g.globalAlpha=.78;
      g.beginPath();g.moveTo(151,y);g.quadraticCurveTo(138-flex,y+2,126-flex*.6,y+9);g.stroke();
      g.beginPath();g.moveTo(169,y);g.quadraticCurveTo(182+flex,y+2,194+flex*.6,y+9);g.stroke();
    }
    g.restore();g.globalAlpha=1;
  }
  function omegaGuideDrawTV(img,now,t,amp,mode){
    const jitter=(mode==='glitch'?2.2:mode==='rage'?1.25:.55)*amp;
    const tx=Math.sin(t*5.6)*jitter,ty=Math.cos(t*4.9)*jitter*.65,rot=Math.sin(t*2.0)*.006*amp;
    // Frame is four clips so the white screen can move independently inside it.
    const P=[160,28];
    omegaGuideDrawRegion(img,105,11,110,22,105,3,110,22,P[0],P[1],rot,tx*.35,ty*.35,1,1,1,true,4);
    omegaGuideDrawRegion(img,105,67,110,18,105,59,110,18,P[0],P[1],rot,tx*.35,ty*.35,1,1,1,true,4);
    omegaGuideDrawRegion(img,105,31,22,38,105,23,22,38,P[0],P[1],rot,tx*.35,ty*.35,1,1,1,true,4);
    omegaGuideDrawRegion(img,193,31,22,38,193,23,22,38,P[0],P[1],rot,tx*.35,ty*.35,1,1,1,true,4);
    // Independent screen background, eyes and mouth.
    omegaGuideDrawRegion(img,126,31,68,37,126,23,68,37,160,41,0,tx,ty,1,1,1);
    const blink=Math.sin(t*2.7)>.94?.22:1;
    omegaGuideDrawRegion(img,141,35,18,15,141,27,18,15,150,35,0,tx*1.25,ty*.9,1,blink,1);
    omegaGuideDrawRegion(img,163,35,18,15,163,27,18,15,172,35,0,tx*1.25,ty*.9,1,blink,1);
    omegaGuideDrawRegion(img,145,49,34,15,145,41,34,15,162,49,Math.sin(t*3.1)*.015*amp,tx*.8,ty*1.1,1,1,1);
    if(mode==='glitch'){
      for(let i=0;i<3;i++){const yy=26+((Math.floor(now/58)*9+i*11)%31);g.globalAlpha=.16+i*.05;rect(126+((i&1)?3:-3),yy,68,1,'#fff');}g.globalAlpha=1;
    }
  }
  function omegaPartsDrawComposite(now,mode='normal'){
    const img=omegaGuideSourceImage();
    if(!img){rect(0,0,W,H,'#000');return;}
    const t=now/1000,amp=1+(mode==='rage'?1.2:0)+(mode==='glitch'?.55:0);
    omegaGuideBackfill(now,mode,img);
    // Bottom-up workflow: rear structures first, then stems/arms, eyes/jaw, ribs, TV face last.
    omegaGuideDrawLegs(img,t,amp);
    omegaGuideDrawStem(img,t,amp);
    omegaGuideDrawArms(img,t,amp);
    omegaGuideDrawEyes(img,t,amp);
    omegaGuideDrawJaw(img,t,amp);
    omegaGuideDrawRibs(t,amp);
    omegaGuideDrawTV(img,now,t,amp,mode);
    if(mode==='glitch'){
      for(let i=0;i<5;i++){const yy=(Math.floor(now/47)*17+i*29)%150;g.globalAlpha=.06+i*.018;rect((i&1)?-4:4,yy,W,2,'#fff');}g.globalAlpha=1;
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
    if (!s.includes('OMEGA_LIVE2D_GUIDE_V6')) throw new Error('[Omega Live2D guide] composite patch failed');
    return s;
  };
})();
