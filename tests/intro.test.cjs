const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function harness({reduced=false,defer=false,fail=false}={}){
 const nodes={},events={};let raf=new Map(),id=0,clock=0,resolveDecode;
 const decoded=defer?new Promise(r=>resolveDecode=r):fail?Promise.reject(new Error('missing')):Promise.resolve();
 class El{
  constructor(name){this.name=name;this.hidden=false;this.open=false;this.attrs={};this.events={};this.currentTime=0;this.classList={toggle(){},add(){},remove(){}};this.paused=true;}
  setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}focus(){document.activeElement=this}showModal(){this.open=true}close(){this.open=false}decode(){return decoded}pause(){this.paused=true}play(){this.paused=false;return Promise.resolve()}click(){return this.onclick?.()}addEventListener(t,f){this.events[t]=f}querySelectorAll(s){return s==='.intro-scene'?scenes:steps;}
 }
 const get=n=>nodes[n]??=new El(n),scenes=Array.from({length:5},(_,i)=>get('scene'+i)),steps=Array.from({length:5},(_,i)=>get('step'+i));
 const document={getElementById:get,body:get('body'),activeElement:get('watch-intro'),hidden:false,addEventListener(t,f){events[t]=f}};
 let plays=0;get('solo-button').onclick=()=>plays++;get('sound-button').setAttribute('aria-pressed','true');
 const sandbox={document,window:{matchMedia:()=>({matches:reduced})},requestAnimationFrame:f=>{raf.set(++id,f);return id},cancelAnimationFrame:i=>raf.delete(i),console};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../intro.js'),'utf8'),sandbox);
 return{get,steps,scenes,events,document,resolveDecode,plays:()=>plays,tick(seconds){for(let i=0;i<seconds*60;i++){clock+=1000/60;const frames=[...raf.values()];raf.clear();frames.forEach(f=>f(clock));}}};
}
(async()=>{
 const h=harness();await h.get('watch-intro').click();assert(h.get('intro-dialog').open);assert.equal(h.scenes[0].hidden,false);h.tick(2);assert.equal(h.scenes[0].hidden,false);h.tick(.3);assert.equal(h.scenes[1].hidden,false);h.tick(3);assert.equal(h.scenes[2].hidden,false);
 h.get('intro-pause').click();h.tick(10);assert.equal(h.scenes[2].hidden,false);h.get('intro-next').click();assert.equal(h.scenes[3].hidden,false);assert.equal(h.get('intro-audio').currentTime,9.2);
 h.get('intro-pause').click();h.tick(3.6);assert.equal(h.scenes[4].hidden,false);h.get('intro-play').click();assert.equal(h.get('intro-dialog').open,false);assert(h.get('intro-audio').paused);assert.equal(h.plays(),1);
 await h.get('watch-intro').click();h.get('intro-sound').click();assert(h.get('intro-audio').paused);h.get('intro-sound').click();assert(!h.get('intro-audio').paused);h.document.hidden=true;h.events.visibilitychange();assert(h.get('intro-audio').paused);h.get('intro-skip').click();
 const r=harness({reduced:true});await r.get('watch-intro').click();r.tick(15);assert.equal(r.scenes[0].hidden,false);r.steps[4].click();assert.equal(r.scenes[4].hidden,false);r.get('intro-back').click();
 const d=harness({defer:true});const pending=d.get('watch-intro').click();d.get('intro-skip').click();d.resolveDecode();await pending;assert.equal(d.get('intro-dialog').open,false);d.tick(15);assert.equal(d.get('intro-dialog').open,false);
 const f=harness({fail:true});await f.get('watch-intro').click();assert.equal(f.get('intro-error').hidden,false);f.get('intro-skip').click();assert.equal(f.get('intro-dialog').open,false);
 console.log('PASS: scene timing, pause/seek, muted audio, focus-loss pause, reduced motion, skip during loading, image failure recovery, and Play Now handoff.');
})().catch(e=>{console.error(e);process.exit(1)});
