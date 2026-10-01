const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { engine } = require('./harness.cjs');
const scope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../progress.js'), 'utf8'), scope);
const P = scope.window.CarnivalProgress, json = value => JSON.parse(JSON.stringify(value));
const restored = e => engine({ phone: false, initialStore: e.store });

async function finishPlayingRound(e) {
  await e.click('go-round'); e.tick(3.2);
  for (let n = 0; n < 550 && e.snapshot().round.state === 'playing'; n++) {
    const s = e.snapshot(), p = s.players[0], w = s.round.world, bid = s.round.booth;
    const nearest = items => items.slice().sort((a,b) => Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    let target, offset = 0;
    if (bid === 'carnage') { target = nearest(w.dummies); offset = 38; }
    if (bid === 'ringmaster') { target = p.carry ? {x:136,y:245} : nearest(w.chickens); offset = p.carry ? 0 : 20; }
    if (bid === 'riddle') { const ix = w.tiles.findIndex(t => t === w.safe); target = {x:88+(ix%5+.5)*824/5,y:212+(Math.floor(ix/5)+.5)*298/3}; }
    if (bid === 'milenko') { target = nearest(w.items.filter(q => !q.fake)); offset = 12; }
    if (bid === 'jeckel') { target = nearest(w.hazards.filter(h => h.grace <= 0)); offset = 22; }
    if (bid === 'wraith') { target = p.carry >= 3 ? {x:w.gate?892:108,y:330} : nearest(w.items); offset = p.carry >= 3 ? 0 : 12; }
    if (target) e.pointer(target.x,target.y-offset);
    e.tick(.11);
  }
  assert.equal(e.snapshot().round.state, 'results');
}

(async () => {
  const migrated = P.normalize({ version:1,tickets:321,cups:4,secrets:['riddle','riddle','unknown'],days:['2026-09-28'],daily:{'2026-09-28':{best:32,runs:2}},look:'royal',learnedControls:true,sound:false });
  assert.equal(migrated.version, 2); assert.equal(migrated.tickets,321); assert.equal(migrated.cups,4);
  assert.deepEqual(json(migrated.secrets), ['riddle']); assert.equal(migrated.look,'royal'); assert.equal(migrated.learnedControls,true);
  const bad=P.normalize({version:2,tickets:Infinity,cups:-10,secrets:{},music:NaN,effects:9,look:'crowned',checkpoint:{version:1},mastery:{unknown:{best:9999}}});
  assert.equal(bad.tickets,0); assert.equal(bad.cups,0); assert.equal(bad.effects,1); assert.equal(bad.look,'classic');assert.equal(bad.checkpoint,null);
  for (const [id,g] of Object.entries(P.goals)) {
    const save=P.empty();
    const report=P.recordRound(save,id,[{score:12,[g.stat]:g.tiers[2]}]);
    assert.equal(report.earned,3);assert.equal(report.newMedal,true);
    assert.equal(P.recordRound(save,id,[{score:2,[g.stat]:0}]).newMedal,false);
    assert.equal(save.mastery[id].best,g.tiers[2]);
  }
  let e=engine({phone:false});await e.click('tour-button');await e.click('start-button');
  assert.deepEqual(e.snapshot().match.route,[0,1,2,3,4,5]);assert.equal(e.snapshot().match.level,'chill');
  const initial=e.snapshot().round.world;e.tick(.1);
  await e.click('go-round');e.tick(5);e.key('keydown','ArrowRight');e.tick(.5);
  let reload=restored(e);assert.equal(reload.get('continue-card').hidden,false);await reload.click('continue-run');
  assert.equal(reload.snapshot().round.state,'intro');assert.deepEqual(reload.snapshot().round.world,initial,'unfinished attraction restarts from the same seed');
  assert.equal(reload.snapshot().players[0].score,0);e=reload;
  await finishPlayingRound(e);
  let snap=e.snapshot(),paid=snap.players[0].score;
  assert(paid>0);assert.equal(snap.progress.tickets,paid,'round earnings save before leaving results');assert.equal(snap.progress.checkpoint.match.roundIndex,1);
  assert(snap.progress.mastery.carnage.best>0);
  const paidStore=new Map(e.store);
  e=restored(e);await e.click('continue-run');assert.equal(e.snapshot().match.roundIndex,1);assert.equal(e.snapshot().progress.tickets,paid);
  assert.equal(e.snapshot().round.booth,'ringmaster');
  for(let i=1;i<6;i++) {
    await finishPlayingRound(e);
    const s=e.snapshot();assert.equal(s.progress.checkpoint.match.roundIndex,i+1);
    assert.equal(s.loadedTextures.filter(n=>n.startsWith('arena-')).length,1,'one decoded arena at a time');
    if(i<5)await e.click('next-round');
  }
  const pending=e.snapshot().progress.tickets;e=restored(e);await e.click('continue-run');e.tick(.2);
  assert.equal(e.snapshot().round.state,'complete');assert.equal(e.snapshot().progress.cups,1);assert.equal(e.snapshot().progress.tourVisits,1);
  assert.equal(e.snapshot().progress.tickets,pending,'claiming results does not pay a second time');assert.equal(e.snapshot().progress.checkpoint,null);
  reload=restored(e);assert.equal(reload.get('continue-card').hidden,true);assert.equal(reload.snapshot().progress.cups,1);
  // A crown is earned only for winning a completed tour. The persisted final
  // results fixture exercises crash recovery immediately before the award.
  const crownSave=JSON.parse(paidStore.get('dark-chaos-carnival-v1'));
  crownSave.checkpoint.match.roundIndex=6;
  crownSave.checkpoint.match.roundHistory=['carnage','ringmaster','riddle','milenko','jeckel','wraith'].map(booth=>({booth,scores:[10,0,0,0]}));
  crownSave.checkpoint.match.totals=[30,18,18,18];crownSave.checkpoint.match.raw=[60,0,0,0];
  const crown=engine({phone:false,initialStore:[['dark-chaos-carnival-v1',JSON.stringify(crownSave)]]});
  await crown.click('continue-run');assert.deepEqual(crown.snapshot().progress.tourWins,[0]);await crown.click('leave-game');assert.equal(crown.get('look-select').options[3].disabled,false);
  const stopped=engine({phone:false,initialStore:paidStore});await stopped.click('continue-run');await stopped.click('go-round');stopped.tick(3.5);
  stopped.key('keydown','KeyP');stopped.tick(.1);const frames=stopped.snapshot().renderCount;stopped.tick(3);assert.equal(stopped.snapshot().renderCount,frames,'paused scenes stop redrawing');
  await stopped.click('resume');stopped.document.hidden=true;stopped.emit('pagehide');const hidden=stopped.snapshot().round.time;stopped.tick(2);assert.equal(stopped.snapshot().round.time,hidden);
  const full=engine({phone:false,initialStore:paidStore}),battery=engine({phone:false,initialStore:paidStore});
  await full.click('continue-run');await battery.click('continue-run');battery.get('graphics-mode').value='battery';battery.get('graphics-mode').onchange();
  await full.click('go-round');await battery.click('go-round');full.tick(8);battery.tick(8);
  assert.equal(full.snapshot().round.time,battery.snapshot().round.time);assert.deepEqual(full.snapshot().players,battery.snapshot().players,'battery mode preserves gameplay');
  assert(battery.snapshot().renderCount<full.snapshot().renderCount*.65);
  const failed=engine({phone:false,failArt:true});await failed.click('solo-button');assert.equal(failed.snapshot().match,null);assert.match(failed.get('lobby-error').textContent,/could not load/);assert.equal(failed.get('start-button').disabled,false);
  const blocked=engine({phone:false,blockedStorage:true});await blocked.click('solo-button');assert.equal(blocked.snapshot().round.state,'warmup');assert.equal(blocked.snapshot().storageAvailable,false);assert.equal(blocked.get('save-status').hidden,false);
  const corrupted=engine({initialStore:[['dark-chaos-carnival-v1','not-json']]});assert.equal(corrupted.snapshot().progress.tickets,0);
  const broken=engine({phone:false,renderFault:true});await broken.click('solo-button');broken.tick(.1);assert.equal(broken.snapshot().round.state,'error');assert(broken.snapshot().progress.checkpoint);await broken.click('recover-home');assert.equal(broken.snapshot().scene,'home');
  console.log('PASS: save migration, malformed saves, six-card tour, mastery, interrupted-round replay, round payouts, result recovery without duplicate awards, crowns, lazy arenas, idle/hidden rendering, battery parity, failed art, blocked storage, render recovery.');
})().catch(error=>{console.error(error);process.exit(1);});
