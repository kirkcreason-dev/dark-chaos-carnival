const assert=require('assert/strict'); const {engine:makeEngine}=require('./harness.cjs'); const engine=()=>makeEngine({phone:false});
(async()=>{
 const e=engine();await e.click('solo-button');assert.equal(e.snapshot().round.state,'warmup');assert.equal(e.snapshot().players.filter(p=>p.human).length,1);
 e.pointer(440,355);e.tick(1);assert.equal(e.snapshot().round.warmup.stage,1);
 e.pointer(530,355,2);e.tick(.4);assert.equal(e.snapshot().round.warmup.stage,2);
 let dummy=e.snapshot().round.world.dummies[0];e.pointer(dummy.x,dummy.y-38);e.tick(3);assert.equal(e.snapshot().round.warmup.stage,3);
 await e.click('warmup-next');assert.equal(e.snapshot().players[0].score,0);assert.equal(e.snapshot().progress.learnedControls,true);e.tick(3.2);
 assert.equal(e.snapshot().round.state,'playing');assert.equal(e.snapshot().match.level,'chill');
 let killed=0;for(let t=0;t<100;t++){let s=e.snapshot(),d=s.round.world.dummies.filter(d=>d.hp>0).sort((a,b)=>Math.hypot(a.x-s.players[0].x,a.y-s.players[0].y)-Math.hypot(b.x-s.players[0].x,b.y-s.players[0].y))[0];if(d)e.pointer(d.x,d.y-38);e.tick(.12);killed=e.snapshot().players[0].kills;}
 assert(killed>0);assert(e.snapshot().players[0].score>0);
 e.pointer(800,450);e.key('keydown','ArrowLeft');e.tick(.15);e.key('keyup','ArrowLeft');assert.equal(e.snapshot().round.pointer,null);
 e.key('keydown','KeyP');const stopped=e.snapshot().round.time;e.tick(2);assert.equal(e.snapshot().round.time,stopped);await e.click('resume');e.tick(60);assert.equal(e.snapshot().round.state,'results');
 for(let n=1;n<3;n++){await e.click('next-round');await e.click('go-round');e.tick(59);assert.equal(e.snapshot().round.state,'results');}await e.click('next-round');assert.equal(e.snapshot().round.state,'complete');assert.equal(e.snapshot().progress.cups,1);
 await e.click('rematch');assert.equal(e.snapshot().round.state,'countdown');e.tick(3.2);e.key('keydown','KeyP');await e.click('quit-match');
 const outcomes=[];
 for(let i=0;i<6;i++){
  e.practices[i].onclick();await e.click('start-button');await e.click('go-round');e.tick(3.2);
  for(let t=0;t<400;t++){
   const s=e.snapshot(),p=s.players[0],w=s.round.world;if(s.round.state!=='playing')break;let target,offset=0;
   if(i===0){target=w.dummies[0];offset=38;}
   if(i===1){target=p.carry?{x:136,y:245}:w.chickens[0];offset=p.carry?0:20;}
   if(i===2){let ix=w.tiles.findIndex(t=>t===w.safe);target={x:88+(ix%5+.5)*824/5,y:212+(Math.floor(ix/5)+.5)*298/3};}
   if(i===3){target=w.mirrors.find(m=>m.hp>0)||w.items[0];offset=40;}
   if(i===4){target=w.hazards.find(h=>h.grace<=0);offset=22;}
   if(i===5){target=p.carry>=3?{x:w.gate?892:108,y:330}:w.items[0];offset=p.carry>=3?0:12;}
   if(target)e.pointer(target.x,target.y-offset);e.tick(.14);
  }
  let s=e.snapshot();assert.equal(s.round.state,'results');assert(s.players.every(p=>Number.isFinite(p.score)&&p.score>=0));outcomes.push({booth:s.round.booth,humanScore:s.players[0].score,kills:s.players[0].kills,chickens:s.players[0].delivered,deflects:s.players[0].deflects});
  await e.click('next-round');await e.click('leave-game');
 }
 const fresh=engine();await fresh.click('solo-button');await fresh.click('warmup-next');fresh.tick(3.2);fresh.key('keydown','KeyP');await fresh.click('quit-match');await fresh.click('solo-button');assert.equal(fresh.snapshot().scene,'lobby');await fresh.click('start-button');assert.equal(fresh.snapshot().round.state,'countdown');
 console.log(JSON.stringify({status:'passed',warmup:'move, dash, attack, score reset, completion saved',quickCup:'three rounds complete and rematch skips setup',controls:'pointer movement, target attacks, keyboard override, pause/resume',outcomes},null,2));
})().catch(e=>{console.error(e);process.exit(1)});
