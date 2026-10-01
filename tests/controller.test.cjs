const assert=require('assert/strict'),{engine}=require('./harness.cjs');
(async()=>{
 const pad={axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))},pads=[null,null,pad];
 const e=engine({phone:false,pads});await e.click('tour-button');e.get('input-0').value='pad2';await e.click('start-button');
 const press=(n)=>{pad.buttons[n].pressed=true;e.tick(.04);},release=n=>{pad.buttons[n].pressed=false;e.tick(.04);};
 press(0);assert.equal(e.snapshot().round.state,'countdown');e.tick(3.1);assert.equal(e.snapshot().players[0].dash,0,'holding menu confirmation does not dash');release(0);
 pad.axes[0]=1;const x=e.snapshot().players[0].x;e.tick(.4);assert(e.snapshot().players[0].x>x);pad.axes[0]=0;
 press(9);assert.equal(e.snapshot().round.state,'paused');release(9);
 // The first focused button resumes; holding it cannot trigger a gameplay dash.
 e.get('resume').focus();press(0);assert.equal(e.snapshot().round.state,'playing');assert.equal(e.snapshot().players[0].dash,0);release(0);
 press(9);release(9);e.get('resume').focus();press(13);release(13);assert.equal(e.document.activeElement.id,'quit-match');press(0);release(0);assert.equal(e.snapshot().scene,'home');
 pads[2]=null;await e.click('continue-run');assert.equal(e.snapshot().scene,'home');assert.match(e.get('toast').innerHTML,/Reconnect/);
 pads[2]=pad;await e.click('continue-run');assert.equal(e.snapshot().round.state,'intro');
 press(0);release(0);e.tick(3.2);pads[2]=null;e.tick(.1);assert.equal(e.snapshot().round.state,'paused');
 console.log('PASS: sparse gamepad assignment, menu navigation/confirm, Start pause, held-button isolation, disconnect and saved-run reconnect.');
})().catch(err=>{console.error(err);process.exit(1);});
