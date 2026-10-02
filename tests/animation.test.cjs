const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const {engine}=require('./harness.cjs');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../animation.js'),'utf8'),sandbox);
const A=sandbox.window.CarnivalAnimation;
assert.equal(Object.keys(A.atlases).length,6);
for(const [name,atlas] of Object.entries(A.atlases)){
 assert.equal(atlas.frames.length,16,`${name} has every animation pose`);
 for(const f of atlas.frames){
  const png=fs.readFileSync(path.join(__dirname,'../assets/sprites',f.sheet+'.png'));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.equal(png[25],6,'atlas keeps an RGBA alpha channel');
  assert(f.x>=0&&f.y>=0&&f.x+f.w<=width&&f.y+f.h<=height,'sampling stays inside the actual image');
  assert(f.pivotX>=0&&f.pivotX<=f.w&&f.pivotY>=0&&f.pivotY<=f.h,'ground anchor stays inside its frame');
 }
}
const p={id:0,faceX:1,attackFaceX:-1,attackTime:0,dash:0,walkSpeed:210,walkDistance:0};
assert.equal(new Set(Array.from({length:8},(_,i)=>A.pose({...p,walkDistance:i*14}).frame)).size,8);
assert.equal(A.pose({...p,walkSpeed:0,walkDistance:112}).state,'idle');
assert.equal(A.pose({...p,dash:.1}).state,'dash');
for(let i=0;i<6;i++)assert.equal(A.pose({...p,attackTime:A.attackDuration-A.attackKeys[i]}).frame,8+i);
assert.equal(A.pose({...p,attackTime:A.attackDuration-A.contactTime}).frame,11);
assert.equal(A.pose({...p,attackTime:.2}).flip,true,'attack keeps its captured facing');
assert.equal(A.pose({...p,faceX:-1}).flip,true);

(async()=>{
 const e=engine({phone:false});e.get('auto-action').checked=false;e.get('auto-action').onchange();await e.click('solo-button');
 e.key('keydown','ArrowRight');e.tick(.8);e.key('keydown','Space');e.key('keyup','Space');e.tick(.1);e.key('keyup','ArrowRight');
 for(let n=0;n<200;n++){
  const s=e.snapshot(),p=s.players[0],d=s.round.world.dummies[0],dx=d.x-p.x,dy=d.y-p.y,moving=Math.hypot(dx,dy)>60;
  for(const [key,on] of [['ArrowRight',moving&&dx>4],['ArrowLeft',moving&&dx<-4],['ArrowDown',moving&&dy>4],['ArrowUp',moving&&dy<-4]])e.key(on?'keydown':'keyup',key);
  e.tick(.025);if(!moving)break;
 }
 ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].forEach(k=>e.key('keyup',k));e.tick(.4);
 const hp=e.snapshot().round.world.dummies[0].hp;
 e.key('keydown','ShiftRight');e.tick(1/60);e.key('keyup','ShiftRight');
 assert.equal(e.snapshot().players[0].animation.frame,8);assert.equal(e.snapshot().round.world.dummies[0].hp,hp,'wind-up must not hit early');
 e.tick(.1);assert.equal(e.snapshot().round.world.dummies[0].hp,hp);
 e.key('keydown','KeyP');const remaining=e.snapshot().players[0].attackTime;e.tick(1);
 assert.equal(e.snapshot().players[0].attackTime,remaining,'pause freezes the pending swing');
 await e.click('resume');e.tick(.07);
 assert.equal(e.snapshot().players[0].animation.frame,11);assert.equal(e.snapshot().round.world.dummies[0].hp,hp-1,'contact frame applies damage');
 e.tick(.4);assert.equal(e.snapshot().round.world.dummies[0].hp,hp-1,'recovery does not apply a second hit');
 e.key('keydown','ArrowLeft');e.tick(6);const atWall=e.snapshot().players[0];e.tick(.5);const blocked=e.snapshot().players[0];
 assert.equal(blocked.walkDistance,atWall.walkDistance,'held movement into a wall does not step in place');assert.equal(blocked.animation.state,'idle');
 console.log('PASS: eight locomotion poses, six attack phases, facing, contact-frame damage, one hit per swing, paused attack, and no wall moonwalking.');
})().catch(err=>{console.error(err);process.exit(1)});
