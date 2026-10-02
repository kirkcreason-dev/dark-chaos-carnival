const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const base=require('path').join(__dirname,'..')+require('path').sep;
function engine({phone=true,initialStore=null,blockedStorage=false,failArt=false,pads=[],renderFault=false}={}){
 const nodes=new Map(),events={},store=new Map(initialStore||[['dark-chaos-carnival-v1',JSON.stringify({version:1,sound:false})]]);let cb,clock=100;
 let drawCalls=0;const ctx=new Proxy({drawImage(){drawCalls++;if(renderFault)throw new Error('Simulated renderer failure');},createRadialGradient:()=>({addColorStop(){}})}, {get(t,k){return k in t?t[k]:(...a)=>{}},set(t,k,v){t[k]=v;return true}});
 class El{constructor(id){this.id=id;this.value='';this.hidden=false;this.disabled=false;this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.captures=new Set();this.options=Array.from({length:4},()=>({disabled:false}));this.classList={toggle(){},add(){},remove(){}};this.events={};}
 set innerHTML(v){this.html=v;for(const m of v.matchAll(/id="([^"]+)"/g))get(m[1]);}
 get innerHTML(){return this.html||''}setAttribute(k,v){this[k]=v}addEventListener(t,f){(this.events[t]||=[]).push(f)}setPointerCapture(id){this.captures.add(id)}hasPointerCapture(id){return this.captures.has(id)}releasePointerCapture(id){this.captures.delete(id);this.emit('lostpointercapture',{pointerId:id})}emit(t,e={}){for(const f of this.events[t]||[])f({type:t,button:0,preventDefault(){},...e})}focus(){document.activeElement=this;}click(){this.onclick?.();this.emit('click');}getContext(){return ctx}getBoundingClientRect(){return this.id==='touch-stick'?{left:0,top:0,width:132,height:132}:{left:0,top:0,width:1000,height:580}}querySelectorAll(){return [...(this.html||'').matchAll(/<button[^>]*id="([^"]+)"/g)].map(m=>get(m[1]));}querySelector(){const m=(this.html||'').match(/<button[^>]*id="([^"]+)"/);return m?get(m[1]):null;}}
 function get(id){if(!nodes.has(id))nodes.set(id,new El(id));return nodes.get(id)}
 const views=['home','lobby','game','vault','how'].map(get),nav=['home','vault','how'].map(v=>{let e=new El('nav-'+v);e.dataset.view=v;return e}),practices=Array.from({length:6},(_,i)=>{let e=new El('practice-'+i);e.dataset.practice=String(i);return e});
 get('cup-length').value='3';get('bot-level').value='chill';get('look-select').value='classic';
 const document={body:new El('body'),getElementById:get,querySelectorAll(s){return s==='.view'?views:s==='.nav-button'||s==='[data-view]'?nav:s==='[data-practice]'?practices:[]},addEventListener(t,f){(events['doc-'+t]||=[]).push(f)}};
 const sandbox={document,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>{if(blockedStorage)throw new Error('Storage blocked');store.set(k,v);}},navigator:{getGamepads:()=>pads},Image:class{constructor(){this.complete=true;this.naturalWidth=1774;this.naturalHeight=887}decode(){return failArt?Promise.reject(new Error('Missing image')):Promise.resolve()}},requestAnimationFrame:f=>cb=f,setTimeout:()=>1,clearTimeout(){},console,Date,Math,JSON,Set,Number,Array};
 sandbox.window=sandbox;sandbox.scrollTo=()=>{};sandbox.matchMedia=()=>({matches:phone,addEventListener(){}});sandbox.addEventListener=(t,f)=>(events[t]||=[]).push(f);
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(base+'content.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(base+'touch-controls.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(base+'progress.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(base+'animation.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(base+'game.js','utf8'),sandbox);
 const tick=secs=>{for(let i=0;i<Math.ceil(secs*60);i++){clock+=1000/60;cb(clock)}};
 const click=id=>get(id).onclick?.();const pointer=(x,y,button=0)=>get('arena').emit('pointerdown',{clientX:x,clientY:y,button});
 const key=(type,code)=>emit(type,{code,repeat:false,preventDefault(){}});const snapshot=()=>sandbox.CarnivalDebug.snapshot();
 const emit=(type,e={})=>(events[type]||[]).forEach(f=>f(e));return{get,click,pointer,key,tick,snapshot,practices,events,store,emit,document,drawCalls:()=>drawCalls};
}
module.exports={engine};
