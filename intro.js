'use strict';
(() => {
 const $=id=>document.getElementById(id), dialog=$('intro-dialog'), audio=$('intro-audio');
 const asset=p=>window.DCC_ASSETS?.[p]||p, scenes=[...dialog.querySelectorAll('.intro-scene')];
 const starts=[0,2200,5200,9200,12700], labels=['CREASO·NORSE','The gates','The first deck','The wicked duo','Dark Chaos Carnival'];
 const lastScene=starts.length-1;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let active=false,paused=false,muted=true,elapsed=0,previous=0,frame=0,current=-1,loaded=false,token=0,returnFocus;
 const art=[['intro-studio-logo','creaso-norse.png'],['intro-gates','gates.png'],['intro-duo','duo.png'],['intro-title','title.png']];
 function soundLabel(){const b=$('intro-sound');b.textContent=muted?'SOUND OFF ♪':'SOUND ON ♪';b.setAttribute('aria-pressed',String(!muted));audio.muted=muted;}
 function playAudio(){if(!muted&&!paused&&elapsed<16700)audio.play().catch(()=>{});}
 function drawScene(index){
  if(index===current)return;current=index;dialog.classList.toggle('studio-showing',index===0);
  scenes.forEach((el,i)=>{el.hidden=i!==index;el.classList.toggle('is-current',i===index);});
  $('intro-scene-name').textContent=`0${index+1} / 0${starts.length} · ${labels[index]}`;
  $('intro-next').hidden=index===lastScene;$('intro-pause').hidden=index===lastScene;
  $('intro-next').textContent='NEXT SCENE →';
  [...dialog.querySelectorAll('.intro-step')].forEach((el,i)=>{el.classList.toggle('is-current',i===index);el.classList.toggle('is-done',i<index);el.setAttribute('aria-current',i===index?'step':'false');});
 }
 function tick(ms){
  if(!active)return;
  if(!paused){if(previous)elapsed+=Math.min(ms-previous,150);drawScene(starts.reduce((index,time,i)=>elapsed>=time?i:index,0));}
  previous=ms;frame=requestAnimationFrame(tick);
 }
 function pause(value){paused=value;dialog.classList.toggle('intro-paused',paused);previous=0;$('intro-pause').textContent=paused?'RESUME ▶':'PAUSE Ⅱ';if(paused)audio.pause();else playAudio();}
 function seek(index){elapsed=starts[index];previous=0;try{audio.currentTime=elapsed/1000;}catch{}drawScene(index);playAudio();}
 function close(){
  token++;active=false;cancelAnimationFrame(frame);audio.pause();audio.currentTime=0;dialog.close();document.body.classList.remove('intro-open');returnFocus?.focus({preventScroll:true});
 }
 async function open(){
  if(active||dialog.open)return;const run=++token;returnFocus=document.activeElement;
  dialog.showModal();document.body.classList.add('intro-open');$('intro-loading').hidden=false;$('intro-error').hidden=true;
  $('intro-next').hidden=true;$('intro-pause').hidden=true;scenes.forEach(el=>el.hidden=true);$('intro-scene-name').textContent='PREPARING THE SHOW';
  try{
   if(!loaded){
    art.forEach(([id,file])=>$(id).src=asset('assets/intro/'+file));
    $('intro-backdrop').src=asset('assets/intro/gates.png');audio.src=asset('assets/intro/arrival-studio.wav');
    await Promise.all(art.map(([id])=>$(id).decode()));loaded=true;
   }
   if(run!==token||!dialog.open)return;
   $('intro-loading').hidden=true;active=true;elapsed=0;previous=0;current=-1;
   muted=$('sound-button').getAttribute('aria-pressed')!=='true';soundLabel();drawScene(0);pause(reduced);
   $('intro-motion-note').hidden=!reduced;frame=requestAnimationFrame(tick);$('intro-skip').focus({preventScroll:true});
  }catch{if(run!==token)return;$('intro-loading').hidden=true;$('intro-error').hidden=false;$('intro-scene-name').textContent='THE MIDWAY IS STILL OPEN';}
 }
 $('watch-intro').onclick=open;
 $('intro-skip').onclick=close;$('intro-back').onclick=close;
 $('intro-play').onclick=()=>{close();$('solo-button').click();};
 $('intro-next').onclick=()=>seek(Math.min(lastScene,current+1));
 $('intro-pause').onclick=()=>pause(!paused);
 $('intro-sound').onclick=()=>{muted=!muted;soundLabel();if(muted)audio.pause();else{try{audio.currentTime=elapsed/1000;}catch{}playAudio();}};
 [...dialog.querySelectorAll('.intro-step')].forEach((el,i)=>el.onclick=()=>{if(active)seek(i);});
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{if(!active)return;if(e.code==='ArrowRight'){e.preventDefault();seek(Math.min(lastScene,current+1));}if(e.code==='ArrowLeft'){e.preventDefault();seek(Math.max(0,current-1));}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)pause(true);});
})();
