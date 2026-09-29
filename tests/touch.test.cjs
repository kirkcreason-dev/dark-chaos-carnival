const {engine}=require('./harness.cjs'),assert=require('assert/strict');
const e=engine(),state=()=>e.snapshot(),p=()=>state().players[0];
const emit=(id,type,pointerId,x=66,y=66)=>e.get(id).emit(type,{pointerId,clientX:x,clientY:y,pointerType:'touch'});
const steer=(x,y)=>emit('touch-stick','pointermove',11,66+x*43,66+y*43);
const aim=target=>{let dx=target.x-p().x,dy=target.y-p().y,d=Math.hypot(dx,dy);steer(dx/(d||1),dy/(d||1));};
(async()=>{
 await e.click('solo-button');assert.equal(state().round.state,'warmup');
 let x=p().x;emit('touch-stick','pointerdown',11);e.tick(.2);assert.equal(p().x,x,'deadzone holds still');
 emit('touch-stick','pointerdown',99,5,5);steer(1,0);e.tick(.8);assert(p().x>x+100,'second finger does not steal movement');
 assert.equal(state().round.warmup.stage,1);emit('touch-dash','pointerdown',12);emit('touch-dash','pointerup',12);e.tick(.1);assert(p().dash>0,'brief dash tap is buffered');
 assert.equal(state().round.warmup.stage,2);emit('touch-attack','pointerdown',13);
 for(let i=0;i<120&&state().round.warmup.stage<3;i++){aim(state().round.world.dummies[0]);e.tick(.06);}
 assert.equal(state().round.warmup.stage,3,'move and held attack work simultaneously');assert(p().kills>0);
 emit('touch-attack','pointerup',13);emit('touch-stick','pointerup',11);
 // Verify release in warm-up, where bot collisions cannot move the player.
 emit('touch-stick','pointerdown',11,108,66);e.tick(.3);emit('touch-stick','pointercancel',11);e.tick(.7);x=p().x;e.tick(.5);assert(Math.abs(p().x-x)<.1,'cancelled stick stops');
 e.pointer(800,400);emit('touch-stick','pointerdown',11);e.tick(.1);assert.equal(state().round.pointer,null,'touch takes over from tap to move');
 emit('touch-stick','lostpointercapture',11);e.tick(.2);
 emit('touch-stick','pointerdown',11,108,66);emit('touch-attack','pointerdown',13);e.emit('blur');assert.equal(state().round.state,'paused');await e.click('resume');e.tick(.8);x=p().x;e.tick(.3);assert(Math.abs(p().x-x)<.1,'app switch releases input');
 emit('touch-stick','pointerdown',11,108,66);e.emit('orientationchange');assert.equal(state().round.state,'paused');await e.click('resume');e.tick(.8);x=p().x;e.tick(.3);assert(Math.abs(p().x-x)<.1,'rotation releases input');
 await e.click('warmup-next');e.tick(3.2);e.key('keydown','KeyP');await e.click('quit-match');
 // Exercise actual thumb input in every attraction, including labels and delivery.
 const outcomes=[];
 for(let i=0;i<6;i++){
  e.practices[i].onclick();await e.click('start-button');await e.click('go-round');e.tick(3.2);
  assert.equal(e.get('touch-attack-label').textContent,i===1?'CATCH':i===4?'DEFLECT':'ATTACK');
  emit('touch-stick','pointerdown',11);emit('touch-attack','pointerdown',13);
  for(let n=0;n<700&&state().round.state==='playing';n++){
   let w=state().round.world,player=p(),target;
   const nearest=items=>items.slice().sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
   if(i===0)target=nearest(w.dummies);
   if(i===1)target=player.carry?{x:136,y:245}:nearest(w.chickens);
   if(i===2){let ix=w.tiles.findIndex(t=>t===w.safe);target={x:88+(ix%5+.5)*824/5,y:212+(Math.floor(ix/5)+.5)*298/3};}
   if(i===3)target=nearest(w.mirrors.filter(m=>m.hp>0))||nearest(w.items);
   if(i===4)target=nearest(w.hazards);
   if(i===5)target=player.carry>=3?{x:w.gate?892:108,y:330}:nearest(w.items);
   if(target)aim(target);e.tick(.08);
  }
  assert.equal(state().round.state,'results');assert(p().score>0,`touch scores in booth ${i}`);
  outcomes.push({booth:state().round.booth,score:p().score,kills:p().kills,deliveries:p().delivered,deflects:p().deflects});
  await e.click('next-round');await e.click('leave-game');
 }
 const fresh=engine();await fresh.click('solo-button');
 const send=(id,type,pointerId)=>fresh.get(id).emit(type,{pointerId,clientX:66,clientY:66,pointerType:'touch'});
 send('touch-attack','pointerdown',1);send('touch-attack','pointercancel',1);fresh.tick(.1);assert.equal(fresh.snapshot().players[0].attackCD,0,'cancel clears queued attack');
 send('touch-attack','pointerdown',1);send('touch-attack','pointerup',1);fresh.tick(.1);assert(fresh.snapshot().players[0].attackCD>0,'short action tap is buffered');
 send('touch-dash','pointerdown',2);fresh.tick(3);assert.equal(fresh.snapshot().players[0].cd,0,'holding dash does not repeat');send('touch-dash','pointerup',2);
 send('touch-dash','pointerdown',2);send('touch-dash','pointercancel',2);fresh.tick(.1);assert.equal(fresh.snapshot().players[0].cd,0,'cancel clears queued dash');
 console.log(JSON.stringify({status:'passed',controls:['simultaneous thumbstick, dash and held attack','deadzone and second-finger ownership','buffered quick taps','pointer takeover','cancel and lost capture','app switch and rotation reset','contextual action labels'],outcomes},null,2));
})().catch(err=>{console.error(err);process.exit(1)});
