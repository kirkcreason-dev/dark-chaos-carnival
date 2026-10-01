'use strict';
// Original 84 BPM horrorcore sketch. No sampled songs or performer voices.
window.CarnivalAudio=(()=>{
 let ac,master,noise,musicBus,effectsBus,enabled=false,bus,music=.65,effects=.8;
 function start(){
  enabled=true;
  if(!ac){try{
   ac=new(window.AudioContext||window.webkitAudioContext)();
   master=ac.createGain();master.gain.value=.4;
   const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=8;
   master.connect(limiter);limiter.connect(ac.destination);
   musicBus=ac.createGain();effectsBus=ac.createGain();musicBus.connect(master);effectsBus.connect(master);bus=effectsBus;
   musicBus.gain.value=music;effectsBus.gain.value=effects;
   noise=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
   const data=noise.getChannelData(0);let last=0;
   for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.3)/1.1;data[i]=last*2;}
  }catch{enabled=false;return;}}
  master.gain.setTargetAtTime(.4,ac.currentTime,.03);
  if(ac.state==='suspended')ac.resume()?.catch(()=>{});
 }
 function configure(values){
  music=Math.max(0,Math.min(1,values.music));effects=Math.max(0,Math.min(1,values.effects));
  if(ac){musicBus.gain.setTargetAtTime(music,ac.currentTime,.03);effectsBus.gain.setTargetAtTime(effects,ac.currentTime,.03);}
 }
 function stop(){enabled=false;if(ac)master.gain.setTargetAtTime(0,ac.currentTime,.025);}
 function tone(freq,len,vol=.2,type='sine',end,delay=0){
  if(!enabled||!ac)return;
  const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);
  if(end)o.frequency.exponentialRampToValueAtTime(end,t+len);
  g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(vol,t+.006);
  g.gain.exponentialRampToValueAtTime(.001,t+len);
  o.connect(g);g.connect(bus||effectsBus);o.start(t);o.stop(t+len+.03);
  o.onended=()=>{o.disconnect();g.disconnect();};
 }
 function hiss(len,vol=.12,freq=1200,type='highpass',delay=0){
  if(!enabled||!ac)return;
  const t=ac.currentTime+delay,src=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();
  src.buffer=noise;filter.type=type;filter.frequency.value=freq;filter.Q.value=.8;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+len);
  src.connect(filter);filter.connect(g);g.connect(bus||effectsBus);src.start(t);src.stop(t+len);
  src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect();};
 }
 function beat(n,room){
  if(!enabled||!ac)return;
  bus=musicBus;
  const s=n%16,bar=Math.floor(n/16)%4;
  if([0,6,8,11].includes(s)){tone(135,.24,.65,'sine',35);hiss(.025,.1,900);}
  if(s===4||s===12){hiss(.19,.45,1450);tone(190,.1,.15,'triangle',85);hiss(.07,.16,2400,'highpass',.018);}
  if(s%2===0)hiss(s===14?.12:.033,.12,6500);
  if(s===15&&bar%2)hiss(.04,.1,7600);
  const root=[73.42,69.30,65.41,69.30][bar];
  if([0,3,6,8,11,14].includes(s)){tone(root*(s===14?2:1),.23,.15,'triangle');tone(root/2,.22,.25);}
  if(s===0||s===8){
   const notes=room==='wraith'?[2,3,4.5]:room==='milenko'?[2,2.378,2.828]:[2,2.378,3];
   for(const ratio of notes){tone(root*ratio,.9,.035,'sawtooth');tone(root*ratio*1.006,1.15,.025,'triangle');}
  }
  if(s===2||s===10)tone(root*[8,6,5.656,6][bar],.32,.045,'sine');
  bus=effectsBus;
 }
 function fx(type){
  bus=effectsBus;
  if(type==='swipe'){hiss(.13,.3,1800,'bandpass');tone(125,.1,.08,'triangle',48);}
  if(type==='hit'){hiss(.12,.5,580,'lowpass');tone(105,.13,.32,'sine',32);}
  if(type==='glass'){for(let i=0;i<8;i++)tone(1100+i*347,.12+i*.025,.055,'sine',600+i*177,i*.008);hiss(.35,.35,3800);}
  if(type==='chicken'){tone(640,.075,.17,'sawtooth',390);tone(780,.08,.13,'triangle',420,.085);tone(600,.07,.09,'triangle',340,.17);}
 }
 return{start,stop,beat,fx,configure};
})();
