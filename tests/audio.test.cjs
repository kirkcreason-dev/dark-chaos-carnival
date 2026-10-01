const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
let context;
class Param{constructor(){this.value=0;}setValueAtTime(v){this.value=v;}setTargetAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}}
class Node{constructor(type){this.type=type;this.gain=new Param();this.frequency=new Param();this.Q=new Param();this.threshold=new Param();this.ratio=new Param();this.links=[];this.disconnected=false;}connect(n){this.links.push(n);}disconnect(){this.disconnected=true;}start(){}stop(){} }
class AudioContext{constructor(){context=this;this.nodes=[];this.sampleRate=100;this.currentTime=1;this.destination={};this.state='suspended';}create(type){const n=new Node(type);this.nodes.push(n);return n;}createGain(){return this.create('gain');}createDynamicsCompressor(){return this.create('compressor');}createOscillator(){return this.create('oscillator');}createBiquadFilter(){return this.create('filter');}createBufferSource(){return this.create('source');}createBuffer(){return{getChannelData:()=>new Float32Array(100)};}resume(){this.state='running';return Promise.resolve();}}
const scope={window:{AudioContext},Math};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../audio.js'),'utf8'),scope);
const audio=scope.window.CarnivalAudio;audio.configure({music:0,effects:.4});audio.start();
const [master,music,effects]=context.nodes.filter(n=>n.type==='gain');
assert.equal(music.gain.value,0);assert.equal(effects.gain.value,.4);
let start=context.nodes.length;audio.beat(0,'carnage');const musicNotes=context.nodes.slice(start).filter(n=>n.type==='gain');assert(musicNotes.length>0);assert(musicNotes.every(n=>n.links[0]===music));
start=context.nodes.length;audio.fx('hit');const effectNotes=context.nodes.slice(start).filter(n=>n.type==='gain');assert(effectNotes.length>0);assert(effectNotes.every(n=>n.links[0]===effects));
for(const n of context.nodes)if(n.onended)n.onended();assert(context.nodes.filter(n=>['source','oscillator'].includes(n.type)).every(n=>n.disconnected));
audio.stop();assert.equal(master.gain.value,0);start=context.nodes.length;audio.beat(4,'wraith');assert.equal(context.nodes.length,start);
audio.configure({music:.3,effects:0});audio.start();assert.equal(music.gain.value,.3);assert.equal(effects.gain.value,0);
console.log('PASS: independent music/effects routing, remembered mixer values, mute, resume, and sound-node cleanup.');
