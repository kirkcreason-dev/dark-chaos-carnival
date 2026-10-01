const assert=require('assert/strict'),{engine}=require('./harness.cjs');
const arrows=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
function steer(e,target,stop=0){
 const p=e.snapshot().players[0],dx=target.x-p.x,dy=target.y-p.y;
 const moving=Math.hypot(dx,dy)>stop;
 for(const [code,on] of [['ArrowLeft',moving&&dx<-5],['ArrowRight',moving&&dx>5],['ArrowUp',moving&&dy<-5],['ArrowDown',moving&&dy>5]])e.key(on?'keydown':'keyup',code);
}
function release(e){arrows.forEach(k=>e.key('keyup',k));}
async function warmup(auto=true){
 const e=engine({phone:false});e.get('auto-action').checked=auto;e.get('auto-action').onchange();await e.click('solo-button');
 e.key('keydown','ArrowRight');e.tick(.8);assert.equal(e.snapshot().round.warmup.stage,1);
 e.key('keydown','Space');e.key('keyup','Space');e.tick(.1);assert.equal(e.snapshot().round.warmup.stage,2);
 return e;
}
(async()=>{
 const e=await warmup();
 for(let n=0;n<150&&e.snapshot().round.warmup.stage<3;n++){steer(e,e.snapshot().round.world.dummies[0],65);e.tick(.06);}
 release(e);assert.equal(e.snapshot().round.warmup.stage,3,'arrows and Space complete the tutorial without an attack key');
 assert(e.snapshot().players[0].kills>0);assert.match(e.get('input-help').textContent,/Arrow keys.*SPACE.*Auto attack ON/);
 await e.click('warmup-next');e.tick(3.2);e.key('keydown','KeyP');await e.click('quit-match');
 const outcomes=[];
 for(let booth=0;booth<6;booth++){
  e.practices[booth].onclick();await e.click('start-button');await e.click('go-round');e.tick(3.2);
  for(let n=0;n<600&&e.snapshot().round.state==='playing';n++){
   const s=e.snapshot(),p=s.players[0],w=s.round.world;
   const near=items=>items.slice().sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
   let target,stop=0;
   if(booth===0){target=near(w.dummies);stop=65;}
   if(booth===1){target=p.carry?{x:136,y:245}:near(w.chickens);stop=p.carry?10:45;}
   if(booth===2)target=near(w.tiles.flatMap((v,i)=>v===w.safe?[{x:88+(i%5+.5)*824/5,y:212+(Math.floor(i/5)+.5)*298/3}]:[]));
   if(booth===3){target=near(w.items.filter(q=>!q.fake))||near(w.mirrors.filter(m=>m.hp>0));}
   if(booth===4){target=near(w.hazards);stop=55;}
   if(booth===5)target=p.carry>=3?{x:w.gate?892:108,y:330}:near(w.items);
   if(target)steer(e,target,stop);else release(e);e.tick(.1);
  }
  release(e);const s=e.snapshot();assert.equal(s.round.state,'results');assert(s.players[0].score>0,`arrow-only play scores in attraction ${booth}`);
  outcomes.push({booth:s.round.booth,score:s.players[0].score});await e.click('next-round');await e.click('leave-game');
 }
 const manual=await warmup(false);
 for(let n=0;n<100;n++){steer(manual,manual.snapshot().round.world.dummies[0],65);manual.tick(.06);}
 release(manual);manual.tick(1);assert.equal(manual.snapshot().players[0].kills,0,'disabling assistance requires a manual attack');
 manual.key('keydown','ShiftRight');
 for(let n=0;n<100&&manual.snapshot().round.warmup.stage<3;n++){steer(manual,manual.snapshot().round.world.dummies[0],65);manual.tick(.06);}
 assert.equal(manual.snapshot().round.warmup.stage,3,'Right Shift remains available for manual attacks');
 const reloaded=engine({phone:false,initialStore:manual.store});assert.equal(reloaded.snapshot().progress.autoAction,false);await reloaded.click('continue-run');assert.equal(reloaded.snapshot().players[0].control,'key1');
 const party=engine({phone:false});await party.click('party-button');await party.click('start-button');await party.click('go-round');party.tick(3.2);
 let before=party.snapshot().players;party.key('keydown','ArrowRight');party.tick(.15);party.key('keyup','ArrowRight');let after=party.snapshot().players;
 assert(after[0].x>before[0].x+5);assert.equal(after[1].x,before[1].x,'P1 arrows never move P2');
 before=after;party.key('keydown','KeyA');party.tick(.15);party.key('keyup','KeyA');after=party.snapshot().players;assert(after[1].x<before[1].x-5);
 party.key('keydown','Space');party.key('keyup','Space');party.tick(.04);assert(party.snapshot().players[0].dash>0);assert.equal(party.snapshot().players[1].dash,0);
 party.key('keydown','ShiftLeft');party.key('keyup','ShiftLeft');party.tick(.04);assert(party.snapshot().players[1].dash>0,'P2 keeps an independent dash');
 let prevented=false;party.emit('keydown',{code:'ArrowUp',repeat:false,preventDefault(){prevented=true;}});assert(prevented,'arrows prevent page scrolling during play');party.emit('blur');assert.equal(party.snapshot().round.state,'paused');
 await party.click('quit-match');await party.click('tour-button');assert.equal(party.get('bot-level').value,'chill');assert.equal(party.get('bot-level').disabled,false);await party.click('daily-button');assert.equal(party.get('bot-level').value,'rowdy');assert.equal(party.get('bot-level').disabled,true);
 console.log('PASS: arrow-and-Space tutorial, six attractions with arrow-only scoring, optional manual attacks, saved preference and run, separate local controls, no page scrolling, and easier tour default.',outcomes);
})().catch(err=>{console.error(err);process.exit(1)});
