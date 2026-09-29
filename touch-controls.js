'use strict';
(() => {
 const $=id=>document.getElementById(id), stick=$('touch-stick'), nub=$('touch-nub');
 const attack=$('touch-attack'), dash=$('touch-dash');
 const media=window.matchMedia('(any-pointer: coarse), (max-width: 700px), (max-width: 1000px) and (max-height: 600px)');
 let enabled=media.matches, override=null, canPlay=()=>false, onInterrupt=()=>{}, dashCD=0;
 let stickId=null, attackId=null, dashId=null, x=0, y=0, strike=false, dashTap=false;
 function release(el,id){if(id!==null&&el.hasPointerCapture?.(id))el.releasePointerCapture(id);}
 function reset(){
  const ids=[stickId,attackId,dashId];stickId=attackId=dashId=null;x=y=0;strike=dashTap=false;
  [stick,attack,dash].forEach((el,i)=>{el.classList.remove('pressed');release(el,ids[i]);});
  nub.style.transform='translate(0px, 0px)';
 }
 function setEnabled(value){enabled=!!value;reset();document.body.classList.toggle('touch-mode',enabled);$('touch-toggle').checked=enabled;}
 function move(e){
  if(e.pointerId!==stickId)return;e.preventDefault();
  const r=stick.getBoundingClientRect(),radius=r.width*.32;
  let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;
  const length=Math.hypot(dx,dy),scale=length>radius?radius/length:1;dx*=scale;dy*=scale;
  const power=Math.min(1,length/radius),amount=power<.16?0:(power-.16)/.84;
  x=length?dx/(Math.hypot(dx,dy)||1)*amount:0;y=length?dy/(Math.hypot(dx,dy)||1)*amount:0;
  nub.style.transform=`translate(${dx}px, ${dy}px)`;
 }
 stick.addEventListener('pointerdown',e=>{
  if(!enabled||!canPlay()||stickId!==null||e.button!==0)return;
  e.preventDefault();stickId=e.pointerId;stick.setPointerCapture(e.pointerId);stick.classList.add('pressed');move(e);
 });
 stick.addEventListener('pointermove',move);
 function endStick(e){if(e.pointerId!==stickId)return;const id=stickId;stickId=null;x=y=0;nub.style.transform='translate(0px, 0px)';stick.classList.remove('pressed');release(stick,id);}
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,endStick);
 function bindAction(el,kind){
  el.addEventListener('pointerdown',e=>{
   if(!enabled||!canPlay()||e.button!==0||(kind==='attack'?attackId!==null:dashId!==null||dashCD>0))return;
   e.preventDefault();el.setPointerCapture(e.pointerId);el.classList.add('pressed');
   if(kind==='attack'){attackId=e.pointerId;strike=true;}else{dashId=e.pointerId;dashTap=true;}
  });
  const end=e=>{const id=kind==='attack'?attackId:dashId;if(e.pointerId!==id)return;
   if(kind==='attack')attackId=null;else dashId=null;
   // Cancellation must not leave a buffered action for the next frame.
   if(e.type!=='pointerup'){if(kind==='attack')strike=false;else dashTap=false;}
   el.classList.remove('pressed');release(el,id);
  };
  for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,end);
  el.addEventListener('click',e=>{if(e.detail===0&&enabled&&canPlay()){if(kind==='attack')strike=true;else if(dashCD<=0)dashTap=true;}});
 }
 bindAction(attack,'attack');bindAction(dash,'dash');
 [stick,attack,dash].forEach(el=>el.addEventListener('contextmenu',e=>e.preventDefault()));
 $('touch-toggle').addEventListener('change',e=>{override=e.target.checked;setEnabled(override);});
 media.addEventListener?.('change',()=>{if(override===null)setEnabled(media.matches);});
 window.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!enabled&&override!==false)setEnabled(true);},{passive:true});
 window.addEventListener('blur',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
 window.addEventListener('orientationchange',()=>{reset();onInterrupt();});
 let landscape=window.innerWidth>window.innerHeight;
 window.addEventListener('resize',()=>{reset();const next=window.innerWidth>window.innerHeight;if(next!==landscape){landscape=next;onInterrupt();}});
 window.CarnivalTouch={
  get enabled(){return enabled;},
  bind(options){canPlay=options.canPlay;onInterrupt=options.onInterrupt;},reset,
  read(){const input={x,y,steering:stickId!==null,attack:attackId!==null||strike,dash:dashTap};strike=dashTap=false;return input;},
  update({active,booth,cooldown,total}){
   dashCD=cooldown;
   $('touch-controls').classList.toggle('inactive',!active);
   stick.setAttribute('aria-disabled',!active);attack.setAttribute('aria-disabled',!active);dash.setAttribute('aria-disabled',!active||cooldown>0);
   $('touch-attack-label').textContent=booth==='ringmaster'?'CATCH':booth==='jeckel'?'DEFLECT':'ATTACK';
   $('touch-dash-hint').textContent=cooldown>0?`${cooldown.toFixed(1)}s`:'TAP';
   dash.style.setProperty('--ready',`${Math.max(0,Math.min(1,1-cooldown/total))*100}%`);
  }
 };
 setEnabled(enabled);
})();
