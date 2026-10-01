'use strict';
(() => {
const assetURL=p=>window.DCC_ASSETS?.[p]||p;
const C=window.CARNIVAL, $=id=>document.getElementById(id), all=s=>[...document.querySelectorAll(s)];
const touch=window.CarnivalTouch, Progress=window.CarnivalProgress;
const canvas=$('arena'),ctx=canvas.getContext('2d'),W=1000,H=580;
const bounds={left:88,right:912,top:176,bottom:510};
const textures={};
const textureLoads={};
function loadTexture(key,path){
 if(textures[key]?.complete&&textures[key]?.naturalWidth)return Promise.resolve();
 if(textureLoads[key])return textureLoads[key];
 const im=textures[key]||new Image();textures[key]=im;im.src=assetURL(path);
 let timer;
 textureLoads[key]=Promise.race([im.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Art loading timed out')),15000);})]).catch(error=>{delete textures[key];throw error;}).finally(()=>{clearTimeout(timer);delete textureLoads[key];});
 return textureLoads[key];
}
async function prepareArt(index,characters){
 const id=C.booths[index].id,names=[...new Set([...characters.map(n=>C.characters[n].sheet),'props','creatures'])];
 await Promise.all([loadTexture('arena-'+id,`assets/arenas/${id}.png`),...names.map(name=>loadTexture(name,`assets/sprites/${name}.png`))]);
}
let viewRevision=0,selectedCharacters=[0,1,2,3],startInFlight=false,quickRequest=false,pointerIntent=null,pointerDash=false,pointerStrike=false,warmup=null;
const saveKey='dark-chaos-carnival-v1';
let storageAvailable=true;
let save=Progress.empty();
try { save=Progress.normalize(JSON.parse(localStorage.getItem(saveKey)||'null')); } catch {storageAvailable=false;}
function persist(){
 try{localStorage.setItem(saveKey,JSON.stringify(save));storageAvailable=true;}catch{storageAvailable=false;}
 const notice=$('save-status');if(notice){notice.hidden=storageAvailable;notice.textContent='Device saving is unavailable. Keep this game open to retain this session’s progress.';}
}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function seeded(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function routeForDay(day){const rng=seeded(hash(`DCC-v1-${day}`));return {booths:shuffle(C.booths.map((_,i)=>i),rng).slice(0,3),mods:shuffle(C.modifiers.map((_,i)=>i),rng).slice(0,3)};}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
let mode='party',practiceIndex=0,scene='home',match=null,round=null,rng=Math.random,players=[],particles=[],floaters=[],keys=new Set(),pressedActions=new Set(),shake=0,lastFrame=0,accumulator=0,simTick=0;
let toastTimer,viewBeforePause,gamepads=[],currentDay=dateKey(),audio=null,soundOn=save.sound!==false,lastBeat=-1;
let activeInputDefaults=['key1','key2','cpu','cpu'];
const keysOne=['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space','ShiftRight'],keysTwo=['KeyW','KeyA','KeyS','KeyD','ShiftLeft','KeyE'];

function toast(message){$('toast').innerHTML=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function showView(id){viewRevision++;touch?.reset();all('.view').forEach(e=>e.hidden=e.id!==id);all('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));scene=id;$('loading-screen').hidden=true;pointerIntent=null;document.body.classList.remove('warming-up');document.body.classList.toggle('in-game',id==='game');keys.clear();pressedActions.clear();if(id==='home'||id==='vault')refreshProgress();window.scrollTo({top:0,behavior:'instant'});}
function navigate(id){if(scene==='game'&&match&&['playing','countdown','warmup','paused'].includes(round?.state)){pauseGame();return;}if(scene==='game'){match=null;round=null;}showView(id);}
function home(){navigate('home');}
all('[data-view]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
$('home-button').addEventListener('click',home);$('game-home').addEventListener('click',home);

function avatarSVG(color,index,look='classic'){
 const ch=C.characters[selectedCharacters[index]||0];
 return `<div class="character-sprite sprite-${ch.sheet} row-${ch.row} look-${look}" role="img" aria-label="${ch.name}" style="--player-color:${color}"></div>`;
}
function refreshProgress(){
 currentDay=dateKey();const route=routeForDay(currentDay);
 $('daily-date').textContent=new Date().toLocaleDateString(undefined,{month:'short',day:'numeric'}).toUpperCase();
 $('daily-route').textContent=route.booths.map(i=>C.booths[i].title).join(' · ');
 $('daily-best').textContent=save.daily[currentDay]?`YOUR BEST: ${save.daily[currentDay].best} TICKETS`:'Your first run is waiting';
 $('visit-count').textContent=save.days.length;$('secret-count').innerHTML=`${save.secrets.length}<span>/6</span>`;$('ticket-count').textContent=save.tickets;$('vault-count').textContent=`${save.secrets.length}/6`;
 $('secret-grid').innerHTML=C.booths.map((b,i)=>`<article class="secret-card ${save.secrets.includes(b.id)?'found':''}"><img class="secret-cover" src="${assetURL(`assets/cards/${b.id}.jpg`)}" alt="${b.card}"><span class="secret-index">${String(i+1).padStart(2,'0')}</span><span class="secret-state">${save.secrets.includes(b.id)?'RECORD DISCOVERED':'HIDDEN IN THE MIDWAY'}</span><h3>${save.secrets.includes(b.id)?b.secret:'An unheard echo'}</h3><div class="album-label">${b.source}</div><p>${save.secrets.includes(b.id)?`“${b.secret}” joins your record vault. A song-title Easter egg, discovered in ${b.title}.`:b.hint}</p>${save.secrets.includes(b.id)?`<a href="${b.sourceUrl}" target="_blank" rel="noopener">OPEN THE TRACK ↗</a>`:''}</article>`).join('');
 refreshMastery();
 $('look-select').options[1].disabled=save.tickets<100;$('look-select').options[2].disabled=save.tickets<300;$('look-select').options[3].disabled=!save.tourWins.length;$('look-select').value=save.look;
}
$('modifier-grid').innerHTML=C.modifiers.map((m,i)=>`<article class="modifier-card"><img class="modifier-cover" src="${assetURL(`assets/cards/${m.id==='link'?'lost':m.id}.jpg`)}" alt="${m.card}"><span>II / ${i+1} &nbsp; ${m.icon}</span><h3>${m.card}</h3><p>${m.text}</p></article>`).join('');
$('attraction-grid').innerHTML=C.booths.map((b,i)=>`<button class="attraction-card" data-practice="${i}" style="--booth-color:${b.color}"><span class="booth-number">0${i+1} / THE FIRST DECK</span><img class="booth-cover" src="${assetURL(`assets/cards/${b.id}.jpg`)}" alt="${b.card} Joker’s Card"><span class="booth-icon">${b.icon}</span><h3>${b.short}</h3><small>PRACTICE ATTRACTION ↗</small></button>`).join('');
all('[data-practice]').forEach(b=>b.onclick=()=>openLobby('practice',Number(b.dataset.practice)));
$('tour-button').onclick=()=>openLobby('tour');$('continue-run').onclick=resumeSavedRun;
$('party-button').onclick=()=>openLobby('party');$('solo-button').onclick=()=>quickPlay();$('custom-solo').onclick=()=>openLobby('solo');$('daily-button').onclick=()=>openLobby('daily');

function openLobby(nextMode,index=0){
 if(startInFlight)return;
 mode=nextMode;practiceIndex=index;match=null;warmup=null;quickRequest=false;pointerIntent=null;activeInputDefaults=mode==='party'&&!touch?.enabled?['key1','key2','cpu','cpu']:['key1','cpu','cpu','cpu'];
 $('lobby-title').textContent=mode==='tour'?'Conquer the six-card tour.':mode==='daily'?'Today’s route. Your best run.':mode==='practice'?C.booths[index].title:mode==='solo'?'One soul. Three rivals.':'Gather your homies.';
 $('lobby-eyebrow').textContent=mode==='tour'?'THE GRAND TOUR · SIX CARDS · ONE CROWN':mode==='daily'?`DAILY MIDWAY · ${dateKey()}`:mode==='practice'?'PRACTICE BOOTH':mode==='solo'?'SOLO WITH BOTS':'LOCAL MULTIPLAYER';
 $('lobby-subtitle').textContent=mode==='tour'?'Visit every first-deck attraction in order. Win the cup to earn your character’s crown and the Carnival Crown look. Your completed rounds are saved.':mode==='daily'?'A seeded, three-round solo challenge. Beat your personal best on this device.':mode==='practice'?'One attraction. Learn its rules, find its secret, then bring your friends.':'Four contestants. One crown. Fill empty seats with carnival bots.';
 $('cup-length').disabled=['daily','practice','tour'].includes(mode);$('bot-level').disabled=mode==='daily';if(mode==='tour')$('cup-length').value='6';$('bot-level').value=mode==='daily'?'rowdy':'chill';$('lobby-error').textContent='';$('reduced-motion').checked=save.reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 $('lobby-save-note').hidden=!save.checkpoint;$('start-button').textContent='ENTER THE CARNIVAL →';
 renderSeats();refreshProgress();showView('lobby');
}
function renderSeats(){
 $('player-seats').innerHTML=C.names.map((name,i)=>`<article class="seat" style="--seat-color:${C.colors[i]};--seat-glow:${C.colors[i]}1d"><div class="seat-number"><span>PLAYER 0${i+1}</span><span>✦</span></div>${avatarSVG(C.colors[i],i,save.look)}<h3>${C.characters[selectedCharacters[i]].name}</h3><p>${C.characters[selectedCharacters[i]].role}</p><select class="character-select" aria-label="Player ${i+1} character" id="character-${i}">${C.characters.map((ch,n)=>`<option value="${n}" ${n===selectedCharacters[i]?'selected':''}>${ch.name}</option>`).join('')}</select><select aria-label="Player ${i+1} input" id="input-${i}" ${['daily','tour'].includes(mode)&&i>0?'disabled':''}><option value="key1">${touch?.enabled?'Touch / Keyboard · Arrows':'Keyboard · Arrows'}</option><option value="key2">Keyboard · WASD</option><option value="pad0">Gamepad 1</option><option value="pad1">Gamepad 2</option><option value="pad2">Gamepad 3</option><option value="pad3">Gamepad 4</option><option value="cpu">Carnival bot</option></select></article>`).join('');
 activeInputDefaults.forEach((v,i)=>$('input-'+i).value=v);
 C.names.forEach((_,i)=>$('character-'+i).onchange=()=>{selectedCharacters[i]=Number($('character-'+i).value);activeInputDefaults=C.names.map((_,n)=>$('input-'+n).value);renderSeats();});
}
$('look-select').onchange=()=>{save.look=$('look-select').value;persist();activeInputDefaults=C.names.map((_,i)=>$('input-'+i).value);renderSeats();};


function refreshMastery(){
 const checkpoint=save.checkpoint;
 $('continue-card').hidden=!checkpoint;
 if(checkpoint)$('continue-copy').textContent=checkpoint.match.roundIndex===checkpoint.match.route.length?'Your results are ready to claim.':`Attraction ${checkpoint.match.roundIndex+1} of ${checkpoint.match.route.length} · ${C.booths[checkpoint.match.route[checkpoint.match.roundIndex]].title}`;
 $('mastery-count').textContent=Object.entries(save.mastery).reduce((n,[id,m])=>n+Progress.medal(id,m.best),0)+'/18';
 $('tour-crowns').textContent=save.tourWins.length+'/6 CHARACTER CROWNS';
 $('mastery-grid').innerHTML=C.booths.map(b=>{const goal=Progress.goals[b.id],record=save.mastery[b.id],best=record?.best||0,tier=Progress.medal(b.id,best);return `<article class="mastery-card medal-${tier}"><img src="${assetURL(`assets/cards/${b.id}.jpg`)}" alt="${b.card}"><div><span class="medal-name">${Progress.medalNames[tier]}</span><h3>${b.title}</h3><p>${tier===3?'Gold mastered':`${goal.tiers[tier]} ${goal.label} for ${Progress.medalNames[tier+1]}`}</p><small>BEST: ${best} · ${record?.plays||0} ${(record?.plays||0)===1?'ROUND':'ROUNDS'}</small><div class="mastery-track"><span style="width:${Math.min(100,best/goal.tiers[2]*100)}%"></span></div></div></article>`;}).join('');
 $('crown-roster').innerHTML=C.characters.map((ch,i)=>`<span class="${save.tourWins.includes(i)?'crowned':''}">${save.tourWins.includes(i)?'♛':'◇'} ${ch.name}</span>`).join('');
}
function checkpointRun(nextIndex){
 if(!match)return;
 save.checkpoint=Progress.checkpoint({version:1,match:{...match,roundIndex:nextIndex},seats:players.map(p=>({character:p.character,control:p.control}))});persist();
}
async function openNextRound(){
 const openingMatch=match;
 overlay('<p class="eyebrow">NEXT ATTRACTION</p><h2>Opening the gates…</h2><p>Your completed rounds are saved.</p>');
 try{await prepareArt(match.route[match.roundIndex],players.map(p=>p.character));if(match===openingMatch&&scene==='game')beginRound();}
 catch{if(match!==openingMatch)return;round.state='loading-error';overlay('<h2>The gate is stuck.</h2><p>Check your connection, then try loading this attraction again. Your run is saved.</p><button class="button primary" id="retry-art">TRY AGAIN</button><button class="button secondary" id="loading-home">BACK TO MIDWAY</button>');$('retry-art').onclick=async()=>{round.state='advancing';await openNextRound();};$('loading-home').onclick=()=>{match=null;round=null;showView('home');};}
}
async function resumeSavedRun(){
 if(startInFlight)return;
 const saved=Progress.checkpoint(save.checkpoint);if(!saved){save.checkpoint=null;persist();showView('home');return;}
 const missing=saved.seats.filter(s=>s.control.startsWith('pad')).some(s=>!readGamepads()[Number(s.control.slice(3))]);
 if(missing){toast('Reconnect the controllers used by this run, then press Continue.');return;}
 const openingView=viewRevision;startInFlight=true;$('continue-run').disabled=true;
 try{await prepareArt(saved.match.route[Math.min(saved.match.roundIndex,saved.match.route.length-1)],saved.seats.map(s=>s.character));}
 catch{toast('The attraction could not load. Check your connection, then Continue again.');startInFlight=false;$('continue-run').disabled=false;return;}
 startInFlight=false;$('continue-run').disabled=false;if(viewRevision!==openingView)return;match=saved.match;mode=match.mode;practiceIndex=match.route[0];selectedCharacters=saved.seats.map(s=>s.character);
 players=saved.seats.map((seat,id)=>({id,...seat,name:C.characters[seat.character].name,color:C.colors[id],human:seat.control!=='cpu',score:0,held:false,attackHeld:false}));
 if(soundOn)initAudio();showView('game');
 if(match.roundIndex===match.route.length){match.roundIndex--;beginRound(false);match.roundIndex++;finishMatch();return;}
 beginRound();
}
function setupSettings(){
 $('music-volume').value=Math.round(save.music*100);$('effects-volume').value=Math.round(save.effects*100);$('graphics-mode').value=save.graphics;$('settings-shake').checked=save.reduced;
 for(const [id,key] of [['music-volume','music'],['effects-volume','effects']])$(id).oninput=()=>{save[key]=clamp(Number($(id).value)/100,0,1);window.CarnivalAudio?.configure?.({music:save.music,effects:save.effects});$(id+'-value').textContent=Math.round(save[key]*100)+'%';persist();};
 $('music-volume-value').textContent=Math.round(save.music*100)+'%';$('effects-volume-value').textContent=Math.round(save.effects*100)+'%';
 $('graphics-mode').onchange=()=>{save.graphics=$('graphics-mode').value==='battery'?'battery':'full';persist();};
 $('settings-shake').onchange=()=>{save.reduced=$('settings-shake').checked;persist();};
 $('auto-action').checked=save.autoAction;$('auto-action').onchange=()=>{save.autoAction=$('auto-action').checked;persist();};
}

async function startMatch(){
 if(startInFlight)return;
 const controls=C.names.map((_,i)=>$('input-'+i).value),humans=controls.filter(v=>v!=='cpu');
 if(!humans.length){$('lobby-error').textContent='Give at least one seat to a human player.';return;}
 if(new Set(humans).size!==humans.length){$('lobby-error').textContent='Each human needs a different keyboard layout or gamepad.';return;}
 gamepads=readGamepads();
 const missing=humans.find(v=>v.startsWith('pad')&&!gamepads[Number(v.slice(3))]);
 if(missing){$('lobby-error').textContent=`Gamepad ${Number(missing.slice(3))+1} is not connected. Press a button on it, or choose a keyboard or bot.`;return;}
 if(['daily','tour'].includes(mode)&&(humans.length!==1||controls[0]==='cpu')){$('lobby-error').textContent='Daily runs and the Grand Tour use one human in the first seat and three bots.';return;}
 const openingView=viewRevision,chosenCharacters=[...selectedCharacters];startInFlight=true;$('start-button').disabled=true;$('lobby-error').textContent='Opening the gates…';
 const day=dateKey(),seed=mode==='daily'?hash(`DCC-play-v1-${day}`):(Date.now()^Math.floor(Math.random()*0xffffff))>>>0;
 rng=seeded(seed);const count=mode==='tour'?6:mode==='daily'?3:mode==='practice'?1:Number($('cup-length').value),daily=routeForDay(day);
 const next={mode,seed,day,quick:quickRequest,level:$('bot-level').value,roundIndex:0,route:mode==='tour'?[0,1,2,3,4,5]:mode==='daily'?daily.booths:mode==='practice'?[practiceIndex]:shuffle(C.booths.map((_,i)=>i),rng).slice(0,count),mods:mode==='tour'?[3,4,0,5,1,2]:mode==='daily'?daily.mods:shuffle(C.modifiers.map((_,i)=>i),rng).slice(0,count),totals:[0,0,0,0],raw:[0,0,0,0],roundHistory:[],done:false};
 if(quickRequest){next.route=[0,2,4];next.mods=[3,1,0];}
 try{await prepareArt(next.route[0],chosenCharacters);}catch{$('loading-screen').hidden=true;$('lobby-error').textContent='The attraction could not load. Check your connection and try Enter the Carnival again. Your saved run is safe.';startInFlight=false;$('start-button').disabled=false;return;}
 startInFlight=false;$('start-button').disabled=false;$('lobby-error').textContent='';if(scene!=='lobby'||viewRevision!==openingView)return;
 selectedCharacters=chosenCharacters;match=next;
 save.reduced=$('reduced-motion').checked;persist();
 players=C.names.map((name,i)=>({id:i,name:C.characters[selectedCharacters[i]].name,character:selectedCharacters[i],color:C.colors[i],control:controls[i],human:controls[i]!=='cpu',x:0,y:0,vx:0,vy:0,faceX:i%2?-1:1,faceY:0,score:0,cup:0,carry:0,cd:0,dash:0,inv:0,bump:0,reveal:0,pickups:0,deflects:0,safes:0,banked:0,secretSpawned:false,botThink:0,target:null,held:false,attackHeld:false,attackCD:0,attackTime:0,kills:0,chain:0,chainClock:0,delivered:0,walkDistance:0,carryBonus:false}));
 if(soundOn)initAudio();showView('game');beginRound();if(match.quick){if(!save.learnedControls)beginWarmup();else startCountdown();}
}
$('start-button').onclick=startMatch;
async function quickPlay(){if(startInFlight)return;openLobby('solo');quickRequest=true;$('bot-level').value='chill';if(save.checkpoint){$('start-button').textContent='START A NEW QUICK CUP →';return;}$('loading-screen').hidden=false;return startMatch();}

function dashKey(p){return p?.control==='key2'?'LEFT SHIFT':p?.control?.startsWith('pad')?'A / CROSS':'SPACE';}
function attackKey(p){return p?.control==='key2'?'E':p?.control?.startsWith('pad')?'X / SQUARE':'RIGHT SHIFT';}
function inputHint(){
 const p=pointerPlayer(),auto=save.autoAction?'Auto attack ON':`Attack: ${attackKey(p)}`;
 if(touch?.enabled)return `Thumbstick: move · Tap DASH · ${save.autoAction?'Auto attack ON':'Hold action to attack'}`;
 return `${p?.control==='key2'?'WASD':p?.control?.startsWith('pad')?'Stick / D-pad':'Arrow keys'}: move · ${dashKey(p)}: dash · ${auto}`;
}
function easyRule(booth){return {
 carnage:'Move toward the marked dummy. You swing automatically when you get close. Keep moving between dummies to build a chain.',
 ringmaster:'Get close to a chicken to catch it automatically. Follow the arrow back to your glowing coop, then go for another.',
 riddle:'Match the symbol at the top of the arena. Follow the marker to a matching floor tile before the countdown ends.',
 milenko:'Collect relics with a gold center. Walk close to mirrors to smash them automatically. Dash to expose fake prizes.',
 jeckel:'Move near the fireballs to bat them back automatically. Dash through danger when you need space.',
 wraith:'Collect blue souls, then follow the arrow to the glowing gate. Only delivered souls score.'
 }[booth.id];}
function controlTip(booth){
 if(save.autoAction)return {carnage:'Get close → auto-attack. Chain kills for bonus tickets.',ringmaster:'Get close → catch. Follow the arrow to your coop.',riddle:'Match the symbol. Follow the marker to safe floor.',milenko:'Gold centers are real. Get close to mirrors → auto-smash.',jeckel:'Get close → auto-deflect. Each return earns 3 tickets.',wraith:'Collect souls → follow the arrow → deliver at the lit gate.'}[booth.id];
 return booth.tip.replaceAll('E / Right Shift',touch?.enabled?'Hold the action button':attackKey(pointerPlayer()));
}
// Assistance uses the same range and cooldown as a manual strike. It never
// moves the player, picks hidden prizes, or automatically shoves other players.
function nearbyActionTarget(p){
 const id=round.booth.id;
 const objects=id==='carnage'?round.dummies.filter(d=>d.hp>0):id==='ringmaster'&&!p.carry?round.chickens:id==='milenko'?[...round.shades,...round.mirrors.filter(m=>m.hp>0)]:id==='jeckel'?round.hazards.filter(h=>h.grace<=0):[];
 const reach=id==='carnage'?88:id==='ringmaster'?78:id==='jeckel'?96:86;
 return objects.find(q=>dist(p,q)<reach);
}
function objectiveTarget(p){
 if(!save.autoAction||!['playing','warmup'].includes(round.state))return null;
 const near=items=>items.reduce((best,q)=>!best||dist(p,q)<dist(p,best)?q:best,null);
 switch(round.booth.id){
 case 'carnage':return near(round.dummies.filter(q=>q.hp>0));
 case 'ringmaster':return p.carry?coopFor(p.id):near(round.chickens);
 case 'riddle':return near(round.tiles.flatMap((symbol,i)=>symbol===round.safe?[tileCenter(i)]:[]));
 case 'milenko':return near(round.mirrors.filter(q=>q.hp>0));
 case 'jeckel':return near(round.hazards.filter(q=>q.grace<=0));
 case 'wraith':return p.carry>=3?{x:round.gate?892:108,y:330}:hiddenPrizes()?null:near(round.items);
 }
}
function beginRound(writeCheckpoint=true){
 touch?.reset();rng=seeded(hash(`DCC-round-v2:${match.seed}:${match.roundIndex}`));
 if(writeCheckpoint)checkpointRun(match.roundIndex);
 const booth=C.booths[match.route[match.roundIndex]],modifier=C.modifiers[match.mods[match.roundIndex]];
 // Evict only when the loaded round is committed, so abandoned loads cannot blank a newer arena.
 for(const key of Object.keys(textures))if(key.startsWith('arena-')&&key!=='arena-'+booth.id){textures[key].src='';delete textures[key];}
 round={booth,modifier,time:0,duration:55,state:'intro',items:[],hazards:[],blasts:[],secrets:[],spawnClock:0,lastMod:-1,lastJudge:-1,tileCycle:-1,safe:0,tiles:[],gate:0,announced:-1,dummies:[],chickens:[],mirrors:[],shades:[],splats:[],enemyClock:1,lastFire:0};
 particles=[];floaters=[];shake=0;simTick=0;lastBeat=-1;pointerIntent=null;pointerDash=false;pointerStrike=false;warmup=null;document.body.classList.remove('warming-up');$('warmup-next').hidden=true;bounds.top=booth.id==='riddle'?212:176;keys.clear();pressedActions.clear();
 players.forEach((p,i)=>Object.assign(p,{x:180+(i%2)*640,y:240+Math.floor(i/2)*210,vx:0,vy:0,faceX:i%2?-1:1,faceY:0,score:0,carry:0,cd:0,dash:0,inv:1,bump:0,reveal:0,pickups:0,deflects:0,safes:0,banked:0,secretSpawned:false,botThink:0,target:null,held:false,attackHeld:false,attackCD:0,attackTime:0,kills:0,chain:0,chainClock:0,delivered:0,walkDistance:0,carryBonus:false}));
 for(let i=0;i<14;i++)spawnItem();
 if(booth.id==='carnage'){round.items=[];for(let i=0;i<6;i++)spawnDummy();}
 if(booth.id==='ringmaster'){round.items=[];for(let i=0;i<7;i++)spawnChicken();}
 if(booth.id==='milenko')round.mirrors=[{x:280,y:250,hp:3,respawn:0},{x:720,y:250,hp:3,respawn:0},{x:280,y:440,hp:3,respawn:0},{x:720,y:440,hp:3,respawn:0}];
 if(booth.id==='jeckel')for(let i=0;i<4;i++){let angle=rng()*Math.PI*2;round.hazards.push({x:350+i*80,y:260,vx:Math.cos(angle)*165,vy:Math.sin(angle)*165,r:14,owner:-1,grace:0});}
 if(booth.id==='riddle')newTiles();
 $('round-eyebrow').textContent=`${match.mode==='tour'?'GRAND TOUR · ':match.mode==='daily'?'DAILY MIDWAY · ':''}ROUND ${String(match.roundIndex+1).padStart(2,'0')} / ${String(match.route.length).padStart(2,'0')} · ${booth.card.toUpperCase()}`;
 $('round-title').textContent=booth.title;$('modifier-label').textContent=`II / ${modifier.card.toUpperCase()}`;
 updateHUD();
 overlay(`<div class="briefing-art"><img src="${assetURL(`assets/cards/${booth.id}.jpg`)}" alt="${booth.card}"></div><p class="eyebrow">${booth.tagline}</p><h2>${booth.title}</h2><p>${save.autoAction?easyRule(booth):booth.rule}</p><div class="overlay-rule curse-rule"><img src="${assetURL(`assets/cards/${modifier.id==='link'?'lost':modifier.id}.jpg`)}" alt="${modifier.card}"><p><b>${modifier.card}</b><br>${modifier.text}</p></div><p class="overlay-controls">${controlTip(booth)}<br>${inputHint()}</p><button class="button primary" id="go-round">LET THE CHAOS BEGIN <span>→</span></button>`);
 $('go-round').onclick=startCountdown;
}
function startCountdown(){if(!round||round.state!=='intro')return;touch?.reset();round.state='countdown';round.countdown=3;players.forEach(p=>{p.held=p.control.startsWith('pad')&&!!readGamepads()[Number(p.control.slice(3))]?.buttons[0]?.pressed;});keys.clear();pressedActions.clear();pointerIntent=null;$('game-overlay').hidden=true;canvas.focus({preventScroll:true});sound(220,.16,'sine');}
function overlay(html){$('game-overlay').innerHTML=`<div class="overlay-content">${html}${players.some(p=>p.control.startsWith('pad'))?'<p class="pad-menu-hint">D-PAD: CHOOSE · A / CROSS: CONFIRM · START: PAUSE</p>':''}</div>`;$('game-overlay').hidden=false;setTimeout(()=>{const b=$('game-overlay').querySelector('button');if(b)b.focus();},0);}
function randPoint(){return{x:bounds.left+35+rng()*(bounds.right-bounds.left-70),y:bounds.top+35+rng()*(bounds.bottom-bounds.top-70)};}
function spawnItem(bonus=false){const q=randPoint();round.items.push({...q,id:simTick+rng(),fake:round.booth.id==='milenko'&&!bonus&&rng()<.34,bonus,r:bonus?13:10,phase:rng()*6.28,revealed:0});}
function newTiles(){round.tiles=Array.from({length:15},(_,i)=>i%3);round.tiles=shuffle(round.tiles,rng);round.safe=Math.floor(rng()*3);round.tileCycle=Math.floor(round.time/6);}
function tileAt(p){const x=clamp(Math.floor((p.x-bounds.left)/((bounds.right-bounds.left)/5)),0,4),y=clamp(Math.floor((p.y-bounds.top)/((bounds.bottom-bounds.top)/3)),0,2);return y*5+x;}
function tileCenter(i){return{x:bounds.left+(i%5+.5)*(bounds.right-bounds.left)/5,y:bounds.top+(Math.floor(i/5)+.5)*(bounds.bottom-bounds.top)/3};}
function isFound(){return round.modifier.id==='link'&&Math.floor(round.time/6)%2===1;}
function hiddenPrizes(){return round.modifier.id==='naught'&&round.time%12>=9;}

function inputFor(p,dt){
 if(!p.human)return botInput(p,dt);
 let x=0,y=0,action=false,attack=false;
 if(p.control==='key1'){x=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'));y=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));action=keys.has('Space');attack=keys.has('ShiftRight');}
 else if(p.control==='key2'){x=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));y=Number(keys.has('KeyS'))-Number(keys.has('KeyW'));action=keys.has('ShiftLeft');attack=keys.has('KeyE');}
 else {const pad=gamepads[Number(p.control.slice(3))];if(pad){x=pad.axes[0]||0;y=pad.axes[1]||0;if(Math.abs(x)<.18)x=0;if(Math.abs(y)<.18)y=0;x+=Number(pad.buttons[15]?.pressed||false)-Number(pad.buttons[14]?.pressed||false);y+=Number(pad.buttons[13]?.pressed||false)-Number(pad.buttons[12]?.pressed||false);action=!!pad.buttons[0]?.pressed;attack=!!pad.buttons[2]?.pressed;}}
 const queued=p.control==='key1'?'Space':p.control==='key2'?'ShiftLeft':null;const tap=(action&&!p.held)||(queued&&pressedActions.has(queued));if(queued)pressedActions.delete(queued);p.held=action;const aq=p.control==='key1'?'ShiftRight':p.control==='key2'?'KeyE':null;const strike=(attack&&!p.attackHeld)||(aq&&pressedActions.has(aq));if(aq)pressedActions.delete(aq);p.attackHeld=attack;const manual=Math.abs(x)+Math.abs(y)>.1;if(p.id===pointerPlayer()?.id){
  const ti=touch?.read();if(manual||ti?.steering)pointerIntent=null;
  if(!manual&&ti?.steering){x=ti.x;y=ti.y;}
  const pi=pointerInput(p);if(!manual&&!ti?.steering&&pi){x=pi.x;y=pi.y;attack=attack||pi.attack;}
  const dash=tap||pointerDash||ti?.dash,hit=attack||strike||pointerStrike||ti?.attack;
  pointerDash=false;pointerStrike=false;return{x,y,action:dash,attack:hit};}return{x,y,action:tap,attack:attack||strike};
}
// Pointer controls operate the first human seat. Keyboard movement cancels a destination.
function pointerPlayer(){return players.find(p=>p.human);}
function canvasPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
function pointerTarget(q){
 const pool=[];
 const add=(items,kind,offset,radius,reach)=>items.forEach(object=>{const d=Math.hypot(q.x-object.x,q.y-(object.y-offset));if(d<radius)pool.push({object,kind,d,reach});});
 add(round.dummies.filter(d=>d.hp>0),'dummy',38,45,69);
 add(round.chickens,'chicken',20,34,57);
 add(round.mirrors.filter(m=>m.hp>0),'mirror',40,43,72);
 add(round.shades,'shade',40,40,65);
 add(round.hazards,'fire',22,37,76);
 if(!hiddenPrizes())add(round.items,'prize',12,25,8);
 add(round.secrets.filter(s=>s.owner===pointerPlayer()?.id&&s.revealed),'record',0,30,8);
 if(round.state!=='warmup')add(players.filter(p=>p.id!==pointerPlayer()?.id),'rival',45,37,63);
 return pool.sort((a,b)=>a.d-b.d)[0]||null;
}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
 if(!['playing','warmup'].includes(round?.state)||!pointerPlayer())return;
 e.preventDefault();canvas.focus({preventScroll:true});const q=canvasPoint(e),p=pointerPlayer();
 const destination={x:clamp(q.x,bounds.left+20,bounds.right-20),y:clamp(q.y,bounds.top+20,bounds.bottom-20),kind:'move'};
 if(e.button===2){pointerIntent=destination;pointerDash=true;return;}
 if(e.button!==0)return;
 if(round.booth.id==='wraith'&&p.carry&&(q.x<190||q.x>810))pointerIntent={x:q.x<500?108:892,y:330,kind:'deliver'};
 else if(round.booth.id==='ringmaster'&&p.carry)pointerIntent={...coopFor(p.id),kind:'deliver'};
 else pointerIntent=pointerTarget(q)||destination;
});
function pointerInput(p){
 if(!pointerIntent)return null;
 let t=pointerIntent,o=t.object;
 if(o){
  const list={dummy:round.dummies,chicken:round.chickens,mirror:round.mirrors,shade:round.shades,fire:round.hazards,prize:round.items,record:round.secrets,rival:players}[t.kind];
  const gone=!list?.includes(o)||o.hp===0||o.life<=0||(t.kind==='fire'&&o.owner===p.id&&o.grace>0);
  if(gone){
   if(t.kind==='chicken'&&p.carry)pointerIntent={...coopFor(p.id),kind:'deliver'};
   else if(t.kind==='prize'&&round.booth.id==='wraith'&&p.carry>=5)pointerIntent={x:round.gate?892:108,y:330,kind:'deliver'};
   else pointerIntent=null;
   return pointerIntent?pointerInput(p):null;
  }
 }
 const target=o||t,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),attack=!!o&&!['prize','record'].includes(t.kind);
 if(d>1){p.faceX=dx/d;p.faceY=dy/d;}
 const reach=attack?t.reach:8;
 if(d<reach){if(!attack)pointerIntent=null;return{x:0,y:0,attack};}
 return{x:dx/(d||1),y:dy/(d||1),attack:false};
}
$('pointer-dash').onclick=()=>{if(['playing','warmup'].includes(round?.state)){pointerDash=true;canvas.focus({preventScroll:true});}};
$('pointer-attack').onclick=()=>{if(['playing','warmup'].includes(round?.state)){pointerStrike=true;canvas.focus({preventScroll:true});}};

// First-run instruction happens in the actual arena, with the actual controls.
function beginWarmup(){
 document.body.classList.add('warming-up');round.state='warmup';round.time=0;round.items=[];round.hazards=[];round.blasts=[];round.dummies=[];
 players[0].x=300;players[0].y=355;players[0].inv=0;
 warmup={stage:0,moved:0,dashed:false,time:0};pointerIntent=null;
 $('game-overlay').hidden=true;$('round-title').textContent='Move. Dash. Get close.';
 $('round-eyebrow').textContent='A QUICK WARM-UP · NO TIMER · NO PENALTIES';
 $('warmup-next').hidden=false;$('warmup-next').textContent='SKIP WARM-UP →';
 $('warmup-next').onclick=endWarmup;updateHUD();canvas.focus({preventScroll:true});
}
function endWarmup(){
 if(!warmup)return;
 save.learnedControls=true;persist();
 beginRound();startCountdown();
}
function stepWarmup(dt){
 const p=players[0];warmup.time+=dt;round.time=0;
 for(const key of ['cd','dash','attackCD','attackTime','inv','reveal'])p[key]=Math.max(0,p[key]-dt);
 const input=inputFor(p,dt),n=Math.hypot(input.x,input.y),x=n>1?input.x/n:input.x,y=n>1?input.y/n:input.y;
 if(n>.1){p.faceX=x/(Math.hypot(x,y)||1);p.faceY=y/(Math.hypot(x,y)||1);}
 if(input.action&&p.cd<=0){p.dash=.2;p.cd=1.25;p.vx=p.faceX*650;p.vy=p.faceY*650;warmup.dashed=true;emit(p.x,p.y,p.color,12);}
 if(p.dash<=0){p.vx+=(x*210-p.vx)*Math.min(1,dt*16);p.vy+=(y*210-p.vy)*Math.min(1,dt*16);}
 const before={x:p.x,y:p.y};p.x=clamp(p.x+p.vx*dt,bounds.left+18,bounds.right-18);p.y=clamp(p.y+p.vy*dt,bounds.top+18,bounds.bottom-18);
 const walked=dist(p,before);p.walkDistance+=walked;warmup.moved+=walked;
 if(warmup.stage===0&&warmup.moved>95){warmup.stage=1;emit(p.x,p.y,p.color,15);}
 if(warmup.stage===1&&warmup.dashed){warmup.stage=2;round.dummies=[{x:p.x<500?780:250,y:355,hp:2,flash:0,speed:0,phase:0,faceX:-1}];}
 if(p.attackCD<=0){if(input.attack)performAttack(p);else if(p.human&&save.autoAction&&nearbyActionTarget(p))performAttack(p,true);}
 round.dummies.forEach(d=>d.flash=Math.max(0,d.flash-dt));round.dummies=round.dummies.filter(d=>d.hp>0);
 if(warmup.stage===2&&p.kills>0){warmup.stage=3;pointerIntent=null;$('warmup-next').textContent='START THE CUP →';emit(p.x,p.y,'#d4ef74',25);}
 particles.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;});particles=particles.filter(q=>q.life>0);
 floaters.forEach(f=>{f.y-=25*dt;f.life-=dt;});floaters=floaters.filter(f=>f.life>0);shake=Math.max(0,shake-dt*20);
 updatePlayAssist();$('round-time').innerHTML='∞<span>WARM-UP</span>';$('live-rule').textContent=(touch?.enabled?['Drag the left thumbstick toward the marker.','Keep steering and tap DASH. ',save.autoAction?'Move close to the dummy. Attacks happen automatically.':'Move close and hold ATTACK.','You’re ready. Start the cup.']:['Use the ARROW KEYS to reach the marker.','Keep moving and tap SPACE to dash.',save.autoAction?'Walk up to the dummy. You attack automatically.':'Get close and hold RIGHT SHIFT to attack.','That’s it. Start the cup when you’re ready.'])[warmup.stage];
}
function updatePlayAssist(){
 const p=pointerPlayer();if(!p||!round)return;
 touch?.update({active:['playing','warmup'].includes(round.state),booth:round.booth.id,cooldown:p.cd,total:round.modifier.id==='fury'?1.25:1.9});
 $('pointer-dash').disabled=p.cd>0||!['playing','warmup'].includes(round.state);
 $('pointer-dash').textContent=p.cd>0?`DASH · ${p.cd.toFixed(1)}s`:`DASH · ${dashKey(p)}`;
 $('pointer-attack').disabled=p.attackCD>0||!['playing','warmup'].includes(round.state);
 $('pointer-attack').textContent=(round.booth.id==='ringmaster'?'CATCH':round.booth.id==='jeckel'?'DEFLECT':'ATTACK')+' · '+(save.autoAction?'AUTO':attackKey(p));
 $('input-help').textContent=inputHint();
 if(warmup&&['warmup','paused'].includes(round.state)){
  $('objective-status').textContent=['1 / 3 · MOVE','2 / 3 · DASH','3 / 3 · BREAK THE DUMMY','READY TO RAISE HELL'][warmup.stage];return;
 }
 const leader=Math.max(...players.map(q=>q.score)),rank=1+players.filter(q=>q.score>p.score).length;
 const stats={carnage:`${p.kills} dummies smashed`,ringmaster:p.carry?'CHICKEN CAUGHT → YOUR COOP':`${p.delivered} chickens delivered`,riddle:`${p.safes} safe judgments`,milenko:`${p.pickups} real relics`,jeckel:`${p.deflects} fireballs returned`,wraith:p.carry?`${p.carry}/5 souls → ${round.gate?'RIGHT':'LEFT'} GATE`:`${p.banked} souls delivered`};
 $('objective-status').textContent=`${rank===1?'IN THE LEAD':`${leader-p.score} TICKETS TO THE LEAD`} · ${stats[round.booth.id]}`;
}
function drawPointerGuide(){
 const p=pointerPlayer();if(!p)return;
 let target=pointerIntent?.object||pointerIntent||objectiveTarget(p);
 if(round.state==='warmup'&&warmup.stage===0)target={x:440,y:355};
 if(round.state==='warmup'&&warmup.stage===2)target=round.dummies[0];
 if(target){
  const attack=pointerIntent?.object||round.state==='warmup'&&warmup.stage===2,color=attack?'#ff8f8e':'#d4ef74';
  ctx.save();ctx.setLineDash([5,7]);ctx.beginPath();ctx.ellipse(target.x,target.y+6,31,12,0,0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
  if(dist(p,target)>95){line(p.x,p.y+12,target.x,target.y+6,color+'55',1);}
  ctx.restore();
 }
 if(p.carry&&['wraith','ringmaster'].includes(round.booth.id)){
  const t=round.booth.id==='ringmaster'?coopFor(p.id):{x:round.gate?892:108,y:330},a=Math.atan2(t.y-p.y,t.x-p.x);
  ctx.save();ctx.translate(p.x+Math.cos(a)*54,p.y+Math.sin(a)*30);ctx.rotate(a);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-8);ctx.lineTo(-7,8);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();ctx.restore();circle(t.x,t.y,39,'transparent',p.color,3);
 }
 if(round.state==='warmup'){
  rect(230,15,540,65,7,'#100910ee','#94716a');
  textLabel((touch?.enabled?['DRAG THE LEFT THUMBSTICK','KEEP MOVING + TAP DASH',save.autoAction?'GET CLOSE — ATTACK IS AUTOMATIC':'GET CLOSE + HOLD ATTACK','YOU’RE READY. START THE CUP BELOW.']:['ARROW KEYS TO MOVE','KEEP MOVING + TAP SPACE',save.autoAction?'GET CLOSE — ATTACK IS AUTOMATIC':'GET CLOSE + HOLD RIGHT SHIFT','YOU’RE READY. START THE CUP BELOW.'])[warmup.stage],500,40,15,'#f3e8d8');
  textLabel(['Move → Dash → Attack','A dash gets you through danger',save.autoAction?'Follow the marker. No attack button needed.':'Two hits. Watch the red health bar.','Most tickets wins the round. Most cup points wins.'][warmup.stage],500,62,11,'#d4ef74');
 }
}

function botInput(p,dt){
 p.botThink-=dt;const bid=round.booth.id;
 if(p.botThink<=0||!p.target){
  p.botThink=(match.level==='chill'?.65:match.level==='wicked'?.22:.42)+rng()*.4;let target=null;
  if(bid==='carnage')target=[...round.dummies].sort((a,b)=>dist(p,a)-dist(p,b))[0];
  else if(bid==='ringmaster'){target=p.carry?coopFor(p.id):[...round.chickens].sort((a,b)=>dist(p,a)-dist(p,b))[0];}
  else if(bid==='milenko'&&rng()<.35)target=round.mirrors.filter(m=>m.hp>0).sort((a,b)=>dist(p,a)-dist(p,b))[0];
  else if(bid==='wraith'&&p.carry>=3)target={x:round.gate?900:100,y:300};
  else if(bid==='riddle'&&round.time%6>1.4){const safe=round.tiles.map((t,i)=>t===round.safe?tileCenter(i):null).filter(Boolean);target=safe.sort((a,b)=>dist(p,a)-dist(p,b))[0];}
  else {const items=round.items.filter(q=>!(bid==='milenko'&&q.fake&&(q.revealed>0||rng()<.76)));target=items.sort((a,b)=>dist(p,a)-dist(p,b))[0];}
  p.target=target?{x:target.x+(rng()-.5)*10,y:target.y+(rng()-.5)*10}:randPoint();
 }
 let x=p.target.x-p.x,y=p.target.y-p.y,dd=Math.hypot(x,y);if(dd>8){x/=dd;y/=dd;}else{x=0;y=0;}
 // React to visible hazards without giving bots faster movement or hidden score bonuses.
 for(const h of round.hazards){const d=dist(p,h);if(d<80){x+=(p.x-h.x)/Math.max(d,1)*(80-d)/35;y+=(p.y-h.y)/Math.max(d,1)*(80-d)/35;}}
 for(const b of round.blasts){const d=dist(p,b);if(d<b.r+45){x+=(p.x-b.x)/Math.max(d,1)*2;y+=(p.y-b.y)/Math.max(d,1)*2;}}
 const action=p.cd<=0&&rng()<dt*(bid==='jeckel'?1.4:.65);
 return{x,y,action,attack:p.attackCD<=0&&((p.target&&dist(p,p.target)<82)||bid==='jeckel'||(['riddle','ringmaster'].includes(bid)&&players.some(q=>q.id!==p.id&&dist(p,q)<75)))};
}
function reward(p,value,point=p){if(isFound()||(round.modifier.id==='bedlam'&&Math.hypot(point.x-500,point.y-340)<115))value*=2;addScore(p,value);}
function addScore(p,value){p.score=Math.max(0,p.score+value);if(floaters.length>=60)floaters.shift();floaters.push({x:p.x,y:p.y-27,text:value>0?`+${value}`:`${value}`,color:value>0?'#d4ef74':'#f388b2',life:1});}
function emit(x,y,color,count=12){for(let i=0;i<count&&particles.length<180;i++){const a=rng()*6.283,s=35+rng()*110;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+rng()*.5,max:.9,color,r:1.5+rng()*3});}}
function hit(p,value=-3){
 if(round.state==='warmup'||p.inv>0||p.dash>0)return;
 if(round.booth.id==='ringmaster'&&p.carry){p.carry=0;spawnChicken(p.x,p.y);}
 addScore(p,p.human&&match.level==='chill'?Math.ceil(value/2):value);p.inv=p.human&&match.level==='chill'?1.6:1.1;if(round.booth.id==='wraith'&&p.carry){for(let i=0;i<p.carry;i++)round.items.push({x:clamp(p.x+(rng()-.5)*80,bounds.left+15,bounds.right-15),y:clamp(p.y+(rng()-.5)*80,bounds.top+15,bounds.bottom-15),id:rng(),fake:false,bonus:false,r:10,phase:rng()*6,revealed:0});p.carry=0;}
 if(round.modifier.id==='fury')p.cd=0;
 if(p.human){shake=save.reduced?0:5;sound(90,.1,'sawtooth');}emit(p.x,p.y,'#f388b2',9);
}
function secretCheck(p){
 if(round.state==='warmup'||!p.human||p.secretSpawned||save.secrets.includes(round.booth.id))return;
 const b=round.booth.id,qualified=b==='carnage'?p.kills>=8:b==='ringmaster'?p.delivered>=3:b==='riddle'?p.safes>=3:b==='milenko'?p.pickups>=8:b==='jeckel'?p.deflects>=3:p.banked>=8;
 if(qualified){p.secretSpawned=true;round.secrets.push({x:500+(p.id-1.5)*75,y:bounds.top+24,owner:p.id,revealed:b!=='milenko'});toast(`<strong>A record is stirring.</strong> ${p.name}, look near the back curtain.`);}
}
function step(dt){
 if(!round||scene!=='game')return;
 if(round.state==='warmup'){stepWarmup(dt);return;}
 if(round.state==='countdown'){round.countdown-=dt;if(round.countdown<=0){round.state='playing';sound(660,.2,'triangle');}return;}
 if(round.state!=='playing')return;
 simTick++;round.time+=dt;if(round.time>=round.duration){finishRound();return;}
 gamepads=readGamepads();
 if(players.some(p=>p.control.startsWith('pad')&&!gamepads[Number(p.control.slice(3))])){pauseGame('A controller disconnected. Reconnect it to continue.');return;}
 const bid=round.booth.id,mid=round.modifier.id;
 if(Math.floor(round.time/.178571)!==lastBeat){lastBeat=Math.floor(round.time/.178571);if(soundOn)beat(lastBeat);}
 round.spawnClock-=dt;if(round.spawnClock<=0){round.spawnClock=.65;if(!['carnage','ringmaster'].includes(bid)&&round.items.length<22)spawnItem();}
 round.items.forEach(q=>q.revealed=Math.max(0,q.revealed-dt));
 if(bid==='riddle'){
  const cycle=Math.floor(round.time/6);if(cycle!==round.tileCycle)newTiles();
  if(round.time%6>=4&&round.lastJudge!==cycle){round.lastJudge=cycle;players.forEach(p=>{if(round.tiles[tileAt(p)]===round.safe){reward(p,4);p.safes++;emit(p.x,p.y,'#d4ef74',8);}else hit(p,-4);});sound(170,.18,'square');}
 }
 if(bid==='wraith')round.gate=Math.floor(round.time/10)%2;
 const modCycle=Math.floor(round.time/(mid==='boom'?9:10));
 if(mid==='boom'&&modCycle!==round.lastMod){round.lastMod=modCycle;for(let i=0;i<3;i++)round.blasts.push({...randPoint(),r:65,life:2.4,hit:false});}
 if(mid==='pop'&&modCycle!==round.lastMod){round.lastMod=modCycle;for(let i=0;i<3;i++)spawnItem(true);}
 for(const blast of round.blasts){blast.life-=dt;if(blast.life<.45&&!blast.hit){blast.hit=true;players.forEach(p=>{if(dist(p,blast)<blast.r+12)hit(p);});emit(blast.x,blast.y,'#edbb79',25);sound(55,.18,'sawtooth');}}
 round.blasts=round.blasts.filter(b=>b.life>0);
 for(const p of players){
  p.cd=Math.max(0,p.cd-dt);p.dash=Math.max(0,p.dash-dt);p.inv=Math.max(0,p.inv-dt);p.bump=Math.max(0,p.bump-dt);p.reveal=Math.max(0,p.reveal-dt);p.attackCD=Math.max(0,p.attackCD-dt);p.attackTime=Math.max(0,p.attackTime-dt);p.chainClock=Math.max(0,p.chainClock-dt);if(p.chainClock<=0)p.chain=0;
  const input=inputFor(p,dt),len=Math.hypot(input.x,input.y),ix=len>1?input.x/len:input.x,iy=len>1?input.y/len:input.y;
  if(len>.1){p.faceX=ix/(Math.hypot(ix,iy)||1);p.faceY=iy/(Math.hypot(ix,iy)||1);}
  if(p.attackCD<=0){if(input.attack)performAttack(p);else if(p.human&&save.autoAction&&nearbyActionTarget(p))performAttack(p,true);}
  if(input.action&&p.cd<=0){p.dash=.2;p.cd=mid==='fury'?1.25:1.9;p.vx=p.faceX*650;p.vy=p.faceY*650;p.reveal=.45;round.items.forEach(q=>{if(dist(p,q)<155)q.revealed=2.3;});round.secrets.forEach(q=>{if(q.owner===p.id&&dist(p,q)<150)q.revealed=true;});emit(p.x,p.y,p.color,9);if(p.human)sound(340,.06,'triangle');}
  if(p.dash<=0){const slow=mid==='bedlam'&&Math.hypot(p.x-500,p.y-340)<115?.6:1,speed=210*slow*(p.human?1:match.level==='chill'?.70:match.level==='wicked'?1:.9);p.vx+=(ix*speed-p.vx)*Math.min(1,dt*16);p.vy+=(iy*speed-p.vy)*Math.min(1,dt*16);}
  p.walkDistance+=Math.hypot(p.vx,p.vy)*dt;
  p.x=clamp(p.x+p.vx*dt,bounds.left+18,bounds.right-18);p.y=clamp(p.y+p.vy*dt,bounds.top+18,bounds.bottom-18);
  if(bid==='riddle'&&round.time%6>=4&&round.tiles[tileAt(p)]!==round.safe&&p.dash<=0){hit(p,-4);const safe=round.tiles.map((t,i)=>t===round.safe?tileCenter(i):null).filter(Boolean).sort((a,b)=>dist(p,a)-dist(p,b))[0];p.x=safe.x;p.y=safe.y;p.vx=p.vy=0;emit(p.x,p.y,p.color,12);}
  if(!hiddenPrizes())for(let j=round.items.length-1;j>=0;j--){const q=round.items[j];if(bid==='riddle'&&round.time%6>=4&&round.tiles[tileAt(q)]!==round.safe)continue;if(dist(p,q)<24){
   if(bid==='wraith'&&p.carry>=5)continue;
   round.items.splice(j,1);p.target=null;
   if(q.fake){addScore(p,-3);emit(q.x,q.y,'#b391ed',14);if(p.human)sound(130,.13,'sine');}
   else {p.pickups++;if(bid==='wraith'){p.carry++;floaters.push({x:p.x,y:p.y-25,text:`${p.carry}/5 souls`,color:p.color,life:.6});}else{let value=q.bonus?5:bid==='milenko'?3:2;if(isFound()||(mid==='bedlam'&&Math.hypot(q.x-500,q.y-340)<115))value*=2;addScore(p,value);}emit(q.x,q.y,q.bonus?'#edbb79':p.color,6);if(p.human)sound(650+p.pickups%5*70,.06,'sine');}
  }}
  if(bid==='ringmaster'&&p.carry&&dist(p,coopFor(p.id))<45){p.carry=0;p.delivered++;reward(p,p.carryBonus?16:8);p.carryBonus=false;emit(p.x,p.y,p.color,20);spawnChicken();p.target=null;if(p.human)sound(720,.13,'triangle');}
  if(bid==='wraith'&&p.carry&&Math.abs(p.x-(round.gate?900:100))<35&&Math.abs(p.y-300)<73){const delivery=p.carry;p.banked+=delivery;addScore(p,delivery*3*(isFound()?2:1));p.carry=0;p.target=null;emit(p.x,p.y,'#8bdddf',20);if(p.human)sound(800,.15,'triangle');}
  secretCheck(p);
  for(let j=round.secrets.length-1;j>=0;j--){const q=round.secrets[j];if(q.owner===p.id&&q.revealed&&dist(p,q)<30){round.secrets.splice(j,1);if(!save.secrets.includes(bid)){save.secrets.push(bid);persist();toast(`<strong>RECORD FOUND</strong> ${round.booth.secret} · ${round.booth.source}`);emit(p.x,p.y,'#d4ef74',35);sound(1000,.25,'triangle');}}}
 }
 // Contact never eliminates a contestant; a dash makes a small, recoverable steal.
 for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
  const a=players[i],b=players[j],d=dist(a,b);if(d<32){const nx=(b.x-a.x)/(d||1)||1,ny=(b.y-a.y)/(d||1),push=(32-d)/2;
   a.x=clamp(a.x-nx*push,bounds.left+18,bounds.right-18);a.y=clamp(a.y-ny*push,bounds.top+18,bounds.bottom-18);b.x=clamp(b.x+nx*push,bounds.left+18,bounds.right-18);b.y=clamp(b.y+ny*push,bounds.top+18,bounds.bottom-18);
   if(a.bump<=0&&b.bump<=0&&((a.dash>0)!==(b.dash>0))){const attacker=a.dash>0?a:b,victim=attacker===a?b:a;if(victim.score>0){addScore(victim,-1);addScore(attacker,1);}victim.vx=attacker.faceX*300;victim.vy=attacker.faceY*300;victim.inv=.25;a.bump=b.bump=.65;emit(victim.x,victim.y,attacker.color,9);}
  }
 }
 updateHorrorObjects(dt);

 if(bid==='jeckel')for(const h of round.hazards){h.x+=h.vx*dt;h.y+=h.vy*dt;h.grace=Math.max(0,h.grace-dt);if(h.x<bounds.left+15||h.x>bounds.right-15){h.vx*=-1;h.x=clamp(h.x,bounds.left+15,bounds.right-15);}if(h.y<bounds.top+15||h.y>bounds.bottom-15){h.vy*=-1;h.y=clamp(h.y,bounds.top+15,bounds.bottom-15);}for(const p of players)if(dist(p,h)<31){if(p.dash>0&&h.grace<=0){h.vx=p.faceX*250;h.vy=p.faceY*250;h.owner=p.id;h.grace=.45;p.deflects++;reward(p,3);emit(h.x,h.y,p.color,14);}else if(h.grace<=0)hit(p);}}
 if(bid==='wraith')for(const h of pitShadows())players.forEach(p=>{if(dist(p,h)<h.r+14)hit(p);});
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=50*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);floaters.forEach(f=>{f.y-=25*dt;f.life-=dt;});floaters=floaters.filter(f=>f.life>0);shake=Math.max(0,shake-dt*20);
 if(simTick%6===0)updateHUD();
}
function coopFor(id){return {x:id%2?864:136,y:id<2?245:465};}
function spawnDummy(){const q=randPoint();round.dummies.push({...q,hp:2,flash:0,speed:36+rng()*26,phase:rng()*6});}
function spawnChicken(x,y){const q=x!==undefined?{x,y}:randPoint(),a=rng()*6.28;round.chickens.push({...q,vx:Math.cos(a)*35,vy:Math.sin(a)*35,think:0,phase:rng()*6});}
function performAttack(p,automatic=false){
 p.attackTime=.22;p.attackCD=p.human?.4:match.level==='chill'?1.15:match.level==='wicked'?.58:.85;const id=round.booth.id;
 if(p.human&&soundOn)window.CarnivalAudio?.fx('swipe');
 for(const other of players){if(automatic||round.state==='warmup'||other.id===p.id||dist(p,other)>86||other.inv>0)continue;const d=dist(p,other)||1,dx=(other.x-p.x)/d,dy=(other.y-p.y)/d;if(dx*p.faceX+dy*p.faceY<-.2)continue;
  other.inv=.85;other.x=clamp(other.x+dx*35,bounds.left+18,bounds.right-18);other.y=clamp(other.y+dy*35,bounds.top+18,bounds.bottom-18);if(id==='ringmaster'&&other.carry){other.carry=0;spawnChicken(other.x,other.y);}emit(other.x,other.y,p.color,8);
 }
 if(id==='carnage')for(const d of round.dummies){if(d.hp<=0||dist(p,d)>92)continue;d.hp--;d.flash=.25;if(p.human&&!save.reduced)shake=2;if(p.human&&soundOn)window.CarnivalAudio?.fx('hit');d.x=clamp(d.x+p.faceX*24,bounds.left+20,bounds.right-20);d.y=clamp(d.y+p.faceY*24,bounds.top+20,bounds.bottom-20);emit(d.x,d.y,'#bc3754',13);if(d.hp<=0){p.kills++;p.chain=p.chainClock>0?p.chain+1:1;p.chainClock=3.2;reward(p,5+Math.min(4,p.chain-1),d);round.splats.push({x:d.x,y:d.y,r:18+rng()*12,angle:rng()*6});}}
 if(id==='ringmaster'&&!p.carry){const n=round.chickens.findIndex(c=>dist(p,c)<82);if(n>=0){const caught=round.chickens[n];p.carryBonus=round.modifier.id==='bedlam'&&Math.hypot(caught.x-500,caught.y-340)<115;round.chickens.splice(n,1);p.carry=1;if(p.human&&soundOn)window.CarnivalAudio?.fx('chicken');floaters.push({x:p.x,y:p.y-70,text:'GOT ONE! → YOUR COOP',color:p.color,life:1.1});emit(p.x,p.y,'#e7d8b5',12);p.target=null;}}
 if(id==='milenko'){
  round.shades=round.shades.filter(sh=>{if(dist(p,sh)<90){addScore(p,2);emit(sh.x,sh.y,'#85d8b8',16);return false;}return true;});
  for(const m of round.mirrors)if(m.hp>0&&dist(p,m)<95){m.hp--;if(p.human&&soundOn)window.CarnivalAudio?.fx(m.hp===0?'glass':'hit');emit(m.x,m.y,'#a9e3cd',15);if(m.hp===0){reward(p,6,m);m.respawn=11;round.shades.push({x:m.x,y:m.y,life:9,character:p.character});for(let i=0;i<2;i++)round.items.push({x:m.x+(rng()-.5)*65,y:m.y+(rng()-.5)*50,id:rng(),fake:false,bonus:false,r:10,phase:rng()*6,revealed:0});}}

 }
 if(id==='jeckel')for(const h of round.hazards)if(dist(p,h)<100&&h.grace<=0){h.vx=p.faceX*290;h.vy=p.faceY*290;h.owner=p.id;h.grace=.4;p.deflects++;reward(p,3);emit(h.x,h.y,p.color,15);}
}
function updateHorrorObjects(dt){
 const id=round.booth.id;
 if(id==='carnage'){
  round.enemyClock-=dt;if(round.enemyClock<=0&&round.dummies.length<11){round.enemyClock=1.1;spawnDummy();}
  round.dummies=round.dummies.filter(d=>d.hp>0);for(const d of round.dummies){d.flash=Math.max(0,d.flash-dt);const p=[...players].sort((a,b)=>dist(d,a)-dist(d,b))[0],n=dist(d,p)||1;d.faceX=p.x-d.x;d.x+=(p.x-d.x)/n*d.speed*dt;d.y+=(p.y-d.y)/n*d.speed*dt;if(n<28)hit(p,-3);}
 }
 if(id==='ringmaster')for(const c of round.chickens){c.think-=dt;const nearest=[...players].filter(p=>!p.carry).sort((a,b)=>dist(c,a)-dist(c,b))[0];if(nearest&&dist(c,nearest)<145){const n=dist(c,nearest)||1;c.vx+=(c.x-nearest.x)/n*320*dt;c.vy+=(c.y-nearest.y)/n*320*dt;}else if(c.think<0){c.think=.5+rng();c.vx+=(rng()-.5)*90;c.vy+=(rng()-.5)*90;}const speed=Math.hypot(c.vx,c.vy);if(speed>108){c.vx*=108/speed;c.vy*=108/speed;}c.x+=c.vx*dt;c.y+=c.vy*dt;if(c.x<bounds.left+22||c.x>bounds.right-22){c.vx*=-1;c.x=clamp(c.x,bounds.left+22,bounds.right-22);}if(c.y<bounds.top+22||c.y>bounds.bottom-22){c.vy*=-1;c.y=clamp(c.y,bounds.top+22,bounds.bottom-22);}}
 if(id==='milenko'){for(const m of round.mirrors)if(m.hp<=0){m.respawn-=dt;if(m.respawn<=0)m.hp=3;}for(const sh of round.shades){sh.life-=dt;const p=[...players].sort((a,b)=>dist(sh,a)-dist(sh,b))[0],n=dist(sh,p)||1;sh.x+=(p.x-sh.x)/n*100*dt;sh.y+=(p.y-sh.y)/n*100*dt;if(n<28){hit(p,-4);sh.life=0;}}round.shades=round.shades.filter(sh=>sh.life>0);}
 if(id==='jeckel'&&Math.floor(round.time/12)>round.lastFire){round.lastFire=Math.floor(round.time/12);const a=rng()*6.28;round.hazards.push({x:500,y:210,vx:Math.cos(a)*190,vy:Math.sin(a)*190,r:14,owner:-1,grace:0});}
}
function drawHorrorObjects(){
 const objects=players.filter(p=>round.state!=='warmup'||p.human).map(p=>({y:p.y,draw:()=>drawPlayer(p)}));
 for(const m of round.mirrors)objects.push({y:m.y,draw:()=>{if(m.hp>0){drawProp(4,m.x,m.y,95);for(let i=0;i<m.hp;i++)circle(m.x-8+i*8,m.y+14,2,'#9bd6b3');}else star(m.x,m.y,16,'#b5dbcd44',5);}});
 for(const d of round.dummies)objects.push({y:d.y,draw:()=>{const bob=Math.sin(round.time*9+d.phase)*2;drawSprite('creatures',0,Math.floor(round.time*d.speed/16+d.phase)%4,d.x,d.y+bob,86,d.flash>0?.55:hiddenPrizes()?.33:1,d.faceX<0);rect(d.x-14,d.y-78,28,3,0,'#27111c');rect(d.x-14,d.y-78,14*d.hp,3,0,'#c14354');}});
 for(const c of round.chickens)objects.push({y:c.y,draw:()=>drawSprite('creatures',1,Math.floor(round.time*12+c.phase)%4,c.x,c.y,57,hiddenPrizes()?.33:1,c.vx<0)});
 for(const sh of round.shades)objects.push({y:sh.y,draw:()=>{const ch=C.characters[sh.character||0];drawSprite(ch.sheet,ch.row,Math.floor(round.time*8)%4,sh.x,sh.y,105,.33,sh.x>500);circle(sh.x,sh.y,20,'#80e8bb12','#80e8bb66',1);}});
 objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
}
function pitShadows(){return Array.from({length:3},(_,i)=>({x:310+i*190,y:350+Math.sin(round.time*.8+i*2.1)*105,r:34}));}
function updateHUD(){
 if(!round)return;updatePlayAssist();
 $('round-time').innerHTML=`${Math.max(0,Math.ceil(round.duration-round.time))}<span>SECONDS</span>`;
 let rule=controlTip(round.booth);
 if(round.booth.id==='riddle'){const s=['DIAMOND ◇','STAR ✦','MOON ☾'][round.safe],left=4-round.time%6;rule=left>0?`GET TO ${s} · Floor drops in ${Math.ceil(left)}s`:`SAFE: ${s} · The floor returns soon.`;}
 if(round.booth.id==='wraith')rule=`Deliver blue souls to the ${round.gate?'RIGHT':'LEFT'} glowing gate. Carry up to 5; only banked souls score.`;
 if(hiddenPrizes())rule='THE NAUGHT · Spectral prizes return in '+Math.ceil(12-round.time%12)+'s. Keep moving.';
 if(isFound())rule+=' · FOUND: double prizes!';
 $('live-rule').textContent=rule;
 $('scoreboard').innerHTML=players.map(p=>`<div class="score-card" style="--seat-color:${p.color}"><strong>${p.id+1} · ${p.name} ${p.human?'':'[BOT]'}</strong><span class="score">${p.score}<small>TICKETS</small></span><div class="dash-track" aria-label="Dash cooldown"><span style="width:${Math.round((1-p.cd/(round.modifier.id==='fury'?1.25:1.9))*100)}%"></span></div><span class="cup-label">${match.totals[p.id]} CUP POINTS ${round.booth.id==='wraith'?`· ${p.carry}/5 SOULS`:'· '+(round.booth.id==='ringmaster'&&p.carry?'CHICKEN → YOUR COOP':p.cd<=0?'DASH READY':'RECHARGING')}</span></div>`).join('');
}

function finishRound(){
 if(round.state!=='playing')return;touch?.reset();round.state='results';keys.clear();pressedActions.clear();
 const ranking=[...players].sort((a,b)=>b.score-a.score||a.id-b.id),awards=[5,3,2,1];
 players.forEach(p=>{const rank=players.filter(q=>q.score>p.score).length;match.totals[p.id]+=awards[rank];match.raw[p.id]+=p.score;});
 match.roundHistory.push({booth:round.booth.id,scores:players.map(p=>p.score)});
 const humanPlayers=players.filter(p=>p.human),earned=humanPlayers.reduce((sum,p)=>sum+p.score,0);
 save.tickets+=earned;const mastery=Progress.recordRound(save,round.booth.id,humanPlayers);
 if(!save.days.includes(match.day))save.days.push(match.day);
 checkpointRun(match.roundIndex+1);
 const achievement=mastery.newMedal?`${Progress.medalNames[mastery.earned]} medal earned!`:`${mastery.value} ${mastery.label}`;
 const nextGoal=mastery.next===null?'Gold mastered. Improve your personal best.':`Next medal: ${mastery.next} ${mastery.label} in one round.`;
 const first=ranking.filter(p=>p.score===ranking[0].score),title=first.length>1?'A dead heat.':`${first[0].name} takes the round.`;
 updateHUD();sound(500,.3,'triangle');
 overlay(`<p class="eyebrow">ROUND ${match.roundIndex+1} / ${match.route.length} COMPLETE</p><h2>${title}</h2><p>Round tickets decide place. Cup points decide the champion.</p>${resultCards(ranking,false)}<div class="mastery-result"><strong>${achievement}</strong><span>${nextGoal}</span><small>+${earned} lifetime tickets · ${storageAvailable?'saved':'this session'}</small></div><button class="button primary" id="next-round">${match.roundIndex+1<match.route.length?'NEXT ATTRACTION':'CLAIM YOUR RESULTS'} <span>→</span></button>`);
 $('next-round').onclick=async()=>{if(round.state!=='results')return;round.state='advancing';match.roundIndex++;if(match.roundIndex<match.route.length)await openNextRound();else finishMatch();};
}
function resultCards(ranking,final){return `<div class="round-results">${ranking.map(p=>{const score=final?match.totals[p.id]:p.score,rank=ranking.filter(q=>(final?match.totals[q.id]:q.score)>score).length+1;return `<div class="result-seat ${rank===1?'winner':''}" style="--seat-color:${p.color}"><span class="place">#${rank}</span><strong>${p.name}${p.human?'':' · BOT'}</strong><b>${final?match.totals[p.id]:p.score}</b><p>${final?'CUP POINTS':'ROUND TICKETS'}</p><p>${final?match.raw[p.id]+' TOTAL TICKETS':match.totals[p.id]+' CUP POINTS'}</p></div>`;}).join('')}</div>`;}
function finishMatch(){
 if(match.done)return;match.done=true;round.state='complete';
 const ranking=[...players].sort((a,b)=>match.totals[b.id]-match.totals[a.id]||a.id-b.id),winners=ranking.filter(p=>match.totals[p.id]===match.totals[ranking[0].id]),earned=players.filter(p=>p.human).reduce((sum,p)=>sum+match.raw[p.id],0),before=save.tickets;
 save.cups++;save.checkpoint=null;
 const tourWin=match.mode==='tour'&&winners.some(p=>p.human)&&match.raw[0]>0;
 if(match.mode==='tour'){save.tourVisits++;if(tourWin&&!save.tourWins.includes(players[0].character))save.tourWins.push(players[0].character);}
 let dailyMessage='';if(match.mode==='daily'){const score=match.raw[0],old=save.daily[match.day];save.daily[match.day]={best:Math.max(old?.best||0,score),runs:(old?.runs||0)+1};dailyMessage=`<div class="daily-summary"><span>TODAY: ${score} TICKETS</span><span>${!old||score>old.best?'NEW PERSONAL BEST':'BEST: '+old.best}</span></div>`;}
 persist();
 let unlock=tourWin?'Carnival Crown look unlocked.':before-earned<300&&save.tickets>=300?'Afterlife royalty look unlocked.':before-earned<100&&save.tickets>=100?'Neon night look unlocked.':'';
 if(unlock)toast(`<strong>NEW LOOK</strong> ${unlock}`);
 const headline=match.mode==='tour'?(tourWin?'The Carnival knows your name.':'Six cards. One more reason to return.'):match.mode==='practice'?'You know this booth now.':winners.length>1?'Share the crown.':`${winners[0].name} rules the midway.`;
 overlay(`<div class="overlay-icon">♛</div><p class="eyebrow">${match.mode==='tour'?(tourWin?'GRAND TOUR CROWNED':'GRAND TOUR COMPLETE'):match.mode==='daily'?'DAILY MIDWAY COMPLETE':match.mode==='practice'?'PRACTICE COMPLETE':'THE CARNIVAL HAS ITS CHAMPION'}</p><h2>${headline}</h2>${resultCards(ranking,true)}${dailyMessage}${match.mode==='tour'?`<p class="tour-ending">${tourWin?'You made it from Carnage to the light. Your crown is in the passbook. Choose another character, master every booth, or answer tomorrow’s call.':'You crossed all six attractions. Your medals and tickets stay with you. Win the cup to claim your crown.'}</p>`:''}<p>+${earned} lifetime tickets · ${save.secrets.length}/6 records found${unlock?'<br>'+unlock:''}</p><div class="overlay-buttons"><button class="button primary" id="rematch">RUN IT BACK ↻</button><button class="button secondary" id="leave-game">BACK TO THE MIDWAY</button></div><p class="overlay-controls">${storageAvailable?'Progress saved on this device.':'Browser storage is unavailable; progress lasts for this session only.'}</p>`);
 $('rematch').onclick=()=>{if(match.quick)return quickPlay();const controls=players.map(p=>p.control);openLobby(mode,practiceIndex);activeInputDefaults=controls;renderSeats();};$('leave-game').onclick=()=>{match=null;showView('home');};
}
function pauseGame(message='Take a breath. The carnival can wait.'){
 if(!round||!['playing','countdown','warmup'].includes(round.state))return;
 touch?.reset();window.CarnivalAudio?.stop();viewBeforePause=round.state;round.state='paused';updatePlayAssist();pointerIntent=null;pointerDash=false;pointerStrike=false;keys.clear();pressedActions.clear();players.forEach(p=>p.held=false);
 overlay(`<p class="eyebrow">THE SHOW IS ON HOLD</p><h2>Intermission.</h2><p>${message}</p><div class="overlay-buttons"><button class="button primary" id="resume">BACK TO THE CHAOS</button><button class="button secondary" id="quit-match">SAVE & LEAVE</button></div><p class="overlay-controls">${storageAvailable?'Completed rounds, tickets, and records are saved. Continue from the midway; the current attraction restarts.':'Saving is unavailable. You can continue while this page stays open, but closing it will lose this session.'}</p>`);
 $('resume').onclick=resumeGame;$('quit-match').onclick=()=>{match=null;round=null;showView('home');};
}
function resumeGame(){if(round?.state!=='paused')return;touch?.reset();if(soundOn)initAudio();round.state=viewBeforePause;players.forEach(p=>{p.held=p.control.startsWith('pad')&&!!readGamepads()[Number(p.control.slice(3))]?.buttons[0]?.pressed;});$('game-overlay').hidden=true;keys.clear();pressedActions.clear();canvas.focus({preventScroll:true});}
touch?.bind({canPlay:()=>scene==='game'&&['playing','warmup'].includes(round?.state),onInterrupt:()=>{if(scene==='game')pauseGame('Phone rotated. Get comfortable, then jump back in.');}});
$('pause-button').onclick=()=>round?.state==='paused'?resumeGame():pauseGame();
window.addEventListener('keydown',e=>{if(scene!=='game')return;if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat){e.preventDefault();if(round?.state==='paused')resumeGame();else pauseGame();return;}if(!['playing','countdown','warmup'].includes(round?.state))return;if([...keysOne,...keysTwo].includes(e.code))e.preventDefault();if((e.code==='Space'||e.code==='ShiftLeft'||e.code==='KeyE'||e.code==='ShiftRight')&&!e.repeat&&['playing','warmup'].includes(round.state))pressedActions.add(e.code);keys.add(e.code);});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();pressedActions.clear();if(scene==='game')pauseGame();});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();pressedActions.clear();if(scene==='game')pauseGame();}});
window.addEventListener('pagehide',()=>{keys.clear();pressedActions.clear();if(scene==='game')pauseGame();});
window.addEventListener('gamepadconnected',e=>toast(`Controller connected: ${e.gamepad.id.split('(')[0]}`));

function readGamepads(){try{return Array.from(navigator.getGamepads?navigator.getGamepads():[]);}catch{return [];}}
const menuPadStates=new Map();
function pollGamepadMenus(){
 const pads=readGamepads();
 for(let i=0;i<4;i++){
  const pad=pads[i],previous=menuPadStates.get(i)||{confirm:false,pause:false,nav:0};
  const confirm=!!pad?.buttons[0]?.pressed,pause=!!pad?.buttons[9]?.pressed;
  const nav=pad?(pad.buttons[13]?.pressed||pad.buttons[15]?.pressed||pad.axes[1]>.65||pad.axes[0]>.65?1:pad.buttons[12]?.pressed||pad.buttons[14]?.pressed||pad.axes[1]<-.65||pad.axes[0]<-.65?-1:0):0;
  menuPadStates.set(i,{confirm,pause,nav});
  if(scene!=='game'||!players.some(p=>p.control==='pad'+i))continue;
  if(pause&&!previous.pause){if(round?.state==='paused')resumeGame();else pauseGame();continue;}
  if(!['intro','results','complete','paused','loading-error','error'].includes(round?.state))continue;
  const buttons=[...$('game-overlay').querySelectorAll('button')].filter(b=>!b.disabled&&!b.hidden);if(!buttons.length)continue;
  let index=buttons.indexOf(document.activeElement);if(index<0)index=0;
  if(nav&&!previous.nav){index=(index+nav+buttons.length)%buttons.length;buttons[index].focus();}
  if(confirm&&!previous.confirm)buttons[index].click();
 }
}

function initAudio(){if(!audio){try{audio=new(window.AudioContext||window.webkitAudioContext)();}catch{soundOn=false;}}if(audio?.state==='suspended')audio.resume()?.catch(()=>{});window.CarnivalAudio?.configure?.({music:save.music,effects:save.effects});window.CarnivalAudio?.start();}
function sound(freq,len=.1,type='sine',volume=.055){if(!soundOn||save.effects<=0)return;initAudio();if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.65),audio.currentTime+len);g.gain.setValueAtTime(Math.max(.001,volume*save.effects),audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+len);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+len);o.onended=()=>{o.disconnect();g.disconnect();};}
function beat(i){window.CarnivalAudio?.beat(i,round?.booth.id);}
function soundLabels(){for(const id of ['sound-button','game-sound']){const b=$(id);if(b){b.setAttribute('aria-pressed',soundOn);b.setAttribute('aria-label',soundOn?'Mute sound':'Enable sound');b.innerHTML=`<span class="sound-word">SOUND ${soundOn?'ON':'OFF'}</span> <span>♪</span>`;}}}
function toggleSound(){soundOn=!soundOn;save.sound=soundOn;persist();if(soundOn)initAudio();else window.CarnivalAudio?.stop();soundLabels();}
$('sound-button').onclick=toggleSound;$('game-sound').onclick=toggleSound;soundLabels();

// Painted arenas, sourced card artwork, and animated character atlases.
function rect(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function circle(x,y,r,fill,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function line(x1,y1,x2,y2,color,width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function textLabel(text,x,y,size=12,color='#f4eddc',align='center',font='Arial'){ctx.fillStyle=color;ctx.font=`bold ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,x,y);}
function star(x,y,r,color,n=4){ctx.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,rr=i%2?r*.35:r;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}
function rune(x,y,kind,size,color){if(kind===0){ctx.beginPath();ctx.moveTo(x,y-size);ctx.lineTo(x+size,y);ctx.lineTo(x,y+size);ctx.lineTo(x-size,y);ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.stroke();}else if(kind===1)star(x,y,size,color);else{circle(x,y,size,color);circle(x+size*.48,y-size*.35,size*.8,'#272033');}}
function drawEnvironment(){
 const id=round.booth.id,im=textures['arena-'+id];
 ctx.fillStyle='#110a10';ctx.fillRect(0,0,W,H);if(im?.complete&&im.naturalWidth)ctx.drawImage(im,0,0,W,H);
 // A faint ground vignette keeps attacks readable without flattening the painted room.
 const shade=ctx.createRadialGradient(500,360,120,500,330,620);shade.addColorStop(0,'#03010800');shade.addColorStop(1,'#03010877');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
 for(let i=0;i<22;i++){const x=(i*173+round.time*(3+i%4))%W,y=130+(i*53)%430;circle(x,y,1+(i%2),i%3?'#b3907250':'#ffbe7355');}
 for(const stain of round.splats){ctx.save();ctx.globalAlpha=.5;ctx.translate(stain.x,stain.y);ctx.rotate(stain.angle);ctx.beginPath();ctx.ellipse(0,0,stain.r,stain.r*.45,0,0,Math.PI*2);ctx.fillStyle='#691b30';ctx.fill();ctx.restore();}
 if(id==='riddle'){drawTiles();drawProp(round.time%6>=4?0:1,500,173,125);}
 if(id==='ringmaster')for(const p of players){const c=coopFor(p.id);rect(c.x-37,c.y-22,74,44,6,'#181015aa',p.color);for(let n=0;n<5;n++)line(c.x-29+n*14,c.y-19,c.x-29+n*14,c.y+19,p.color+'77',2);textLabel('P'+(p.id+1)+' COOP',c.x,c.y+34,10,p.color);}
 if(id==='wraith'){
  for(let i=0;i<2;i++){const active=i===round.gate;ctx.save();ctx.shadowColor=active?'#9ff8e6':'#a2425b';ctx.shadowBlur=active?28:0;rect(i?866:82,256,52,152,24,active?'#8bdddf44':'#180c2399',active?'#bffff2':'#654459');ctx.restore();textLabel(active?'SHANGRI-LA':'HELL’S PIT',i?892:108,240,10,active?'#bffff2':'#c5809c');}
  for(const h of pitShadows()){circle(h.x,h.y,h.r+7,'#57225566');circle(h.x,h.y,h.r,'#06030b','#b04e8588',2);drawProp(6,h.x,h.y,80,.45);}
 }
 if(round.modifier.id==='bedlam'){circle(500,340,115,'#62902720','#b4c45688',2);for(let i=0;i<10;i++){const a=i*Math.PI/5;star(500+Math.cos(a)*105,340+Math.sin(a)*105,7,i%2?'#a51b51':'#a8b94a',5);}textLabel('YUM YUM’S GARDEN ×2',500,463,9,'#d4ef74');}
 if(isFound())textLabel('FOUND · PRIZES ×2',500,108,13,'#d4ef74');
 if(hiddenPrizes())textLabel('THE NAUGHT · PRIZES VANISH',500,108,12,'#d6c4e7');
}
function drawTiles(){
 const tw=(bounds.right-bounds.left)/5,th=(bounds.bottom-bounds.top)/3,judging=round.time%6>=4;
 round.tiles.forEach((kind,i)=>{const x=bounds.left+i%5*tw,y=bounds.top+Math.floor(i/5)*th,safe=kind===round.safe,colors=['#d6a5e9','#d4ef74','#8bdddf'];
  rect(x+3,y+3,tw-6,th-6,3,judging&&!safe?'#050309':colors[kind]+'12',judging&&safe?colors[kind]+'aa':'#b89c8550');if(judging&&!safe){line(x+8,y+8,x+tw-10,y+8,'#491d4544',5);}
  if(!judging||safe)rune(x+tw/2,y+th/2,kind,19,colors[kind]);else{textLabel('×',x+tw/2,y+th/2,28,'#63354d');}
 });
 const countdown=Math.max(0,Math.ceil(4-round.time%6));rect(379,13,242,51,9,'#15111f','#b1ce6888');rune(410,38,round.safe,13,['#d6a5e9','#d4ef74','#8bdddf'][round.safe]);textLabel(countdown?`MATCH THIS · ${countdown}`:'SAFE TILES ONLY',520,38,13,'#f4eddc');
}
function drawItem(q){
 const bob=Math.sin(round.time*3+q.phase)*2;
 ctx.save();ctx.translate(q.x,q.y+bob);circle(0,10,9,'#0004');
 if(round.booth.id==='wraith'){ctx.restore();drawProp(6,q.x,q.y,43);return;}
 else if(round.booth.id==='milenko'&&!q.bonus){ctx.beginPath();ctx.moveTo(-4,-12);ctx.lineTo(4,-12);ctx.lineTo(4,-6);ctx.quadraticCurveTo(15,10,0,11);ctx.quadraticCurveTo(-15,10,-4,-6);ctx.closePath();ctx.fillStyle=q.fake&&q.revealed?'#be659b':'#ad87df';ctx.fill();rect(-5,-14,10,4,1,'#edd2af');if(q.fake&&q.revealed){line(-5,-3,5,6,'#fff0ee',2);line(5,-3,-5,6,'#fff0ee',2);}else{circle(0,2,3,q.fake?'#ad87df':'#f0d089','#f0d089',1.4);}}
 else {ctx.rotate(.2);rect(-9,-6,18,12,2,q.bonus?'#edbb79':'#e4cf91','#38243d');line(-3,-4,-3,4,'#4b365b',1);line(3,-4,3,4,'#4b365b',1);if(q.bonus)star(0,-14,5,'#ffe7b1');}
 ctx.restore();
}
function drawPlayer(p){
 const ch=C.characters[p.character||0];ctx.save();
 ctx.beginPath();ctx.ellipse(p.x,p.y+8,25,9,0,0,Math.PI*2);ctx.fillStyle='#0009';ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.stroke();
 const moving=Math.abs(p.vx)+Math.abs(p.vy)>20,frame=moving?Math.floor(p.walkDistance/22)%4:0,size=ch.sheet==='spirits'?115:110;
 if(p.dash>0){for(let i=3;i>0;i--)drawSprite(ch.sheet,ch.row,frame,p.x-p.faceX*i*13,p.y-p.faceY*i*13,size,.12*(4-i),p.faceX<-.1);}
 const alpha=p.inv>0&&Math.floor(p.inv*9)%2===0?.45:1;
 if(save.look!=='classic'){ctx.shadowColor=['royal','crowned'].includes(save.look)?'#e6b863':'#7de4cf';ctx.shadowBlur=10;}
 drawSprite(ch.sheet,ch.row,frame,p.x,p.y,size,alpha,p.faceX<-.1);ctx.shadowBlur=0;
 if(p.attackTime>0){const a=Math.atan2(p.faceY,p.faceX),progress=1-p.attackTime/.22;ctx.save();ctx.translate(p.x,p.y-24);ctx.rotate(a);ctx.beginPath();ctx.arc(0,0,70,-.9+progress*.9,.7+progress*.9);ctx.strokeStyle=ch.id==='shaggy'?'#f9d9cb':p.color;ctx.lineWidth=8*(1-progress)+2;ctx.shadowColor=p.color;ctx.shadowBlur=15;ctx.stroke();ctx.restore();}
 if(save.look==='crowned'){textLabel('♛',p.x,p.y-size-18,20,'#efc879');}
 const label=p.human?(players.filter(q=>q.human).length===1?'YOU · ':'')+ch.short:ch.short;rect(p.x-49,p.y-size-6,98,18,3,'#100810e8',p.color+'99');textLabel(`${p.id+1} · ${label}`,p.x,p.y-size+3,9,p.color);
 if(round.booth.id==='wraith'&&p.carry)for(let i=0;i<p.carry;i++)drawProp(6,p.x-16+i*8,p.y+19,19);
 if(round.booth.id==='ringmaster'&&p.carry)drawProp(3,p.x+24,p.y-53,42);
 if(p.chain>1&&p.chainClock>0)textLabel(`${p.chain} HIT CHAIN`,p.x,p.y-size-18,10,'#f4bb72');
 if(p.reveal>0)circle(p.x,p.y,(.45-p.reveal)*340,'transparent',p.color+'66',2);
 ctx.restore();
}
function drawSprite(sheet,row,frame,x,y,size,alpha=1,flip=false){
 const im=textures[sheet];if(!im?.complete||!im.naturalWidth)return;const cw=im.naturalWidth/4,split=im.naturalHeight*(sheet==='icp'?.513:sheet==='hosts'?.518:.5),sy=row?split:0,ch=row?im.naturalHeight-split:split;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(im,frame*cw,sy,cw,ch,-size/2,-size+12,size,size);ctx.restore();
}
function drawProp(index,x,y,size,alpha=1,flip=false){drawSprite('props',Math.floor(index/4),index%4,x,y,size,alpha,flip);}
function draw(){
 if(!round||scene!=='game')return;ctx.save();if(shake&&!save.reduced){ctx.translate(Math.sin(round.time*113)*shake,Math.cos(round.time*89)*shake);}
 drawEnvironment();
 for(const b of round.blasts){circle(b.x,b.y,b.r,b.hit?'#f8d4a749':'#ef996822',b.hit?'#ffd79e':'#eb986c',2);if(!b.hit){line(b.x-15,b.y,b.x+15,b.y,'#edbb79',2);line(b.x,b.y-15,b.x,b.y+15,'#edbb79',2);textLabel(Math.ceil(b.life-.45).toString(),b.x,b.y-28,17,'#edbb79');}}
 if(!hiddenPrizes())round.items.filter(q=>round.booth.id!=='riddle'||round.time%6<4||round.tiles[tileAt(q)]===round.safe).forEach(drawItem);
 for(const q of round.secrets){if(q.revealed){ctx.save();ctx.shadowColor='#d4ef74';ctx.shadowBlur=18;circle(q.x,q.y,16,'#0b0a10','#d4ef74',2);ctx.shadowBlur=0;circle(q.x,q.y,7,players[q.owner].color);circle(q.x,q.y,2,'#130d1f');ctx.restore();textLabel('P'+(q.owner+1)+' RECORD',q.x,q.y-24,8,'#d4ef74');}else star(q.x,q.y,6,'#d4ef7444');}
 for(const h of round.hazards){drawProp(5,h.x,h.y,64);if(h.grace>0)circle(h.x,h.y,22,'transparent',players[h.owner].color,2);}
 drawHorrorObjects();
 drawPointerGuide();
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.9);circle(p.x,p.y,p.r,p.color);}ctx.globalAlpha=1;
 for(const f of floaters){ctx.globalAlpha=Math.min(1,f.life*2);textLabel(f.text,f.x,f.y,13,f.color);}ctx.globalAlpha=1;
 if(round.state==='countdown'){ctx.fillStyle='#100d1880';ctx.fillRect(0,0,W,H);textLabel(Math.ceil(round.countdown).toString(),500,278,120,'#d4ef74','center','Impact');textLabel('GET READY',500,373,17,'#f4eddc');}
 ctx.restore();
}
let lastDraw=0,lastDrawnRound=null,lastDrawnState='',renderCount=0;
function frame(ms){
 try{
  if(document.hidden){lastFrame=0;accumulator=0;return;}
  pollGamepadMenus();
  const elapsed=lastFrame?Math.min((ms-lastFrame)/1000,.1):0;lastFrame=ms;accumulator+=elapsed;
  let steps=0;while(accumulator>=1/60&&steps<6){step(1/60);accumulator-=1/60;steps++;}
  const active=['playing','countdown','warmup'].includes(round?.state),changed=round!==lastDrawnRound||round?.state!==lastDrawnState;
  if(scene==='game'&&round&&(changed||active&&ms-lastDraw>=1000/(save.graphics==='battery'?30:60)-.5)){
   draw();renderCount++;lastDraw=ms;lastDrawnRound=round;lastDrawnState=round.state;
  }
 }catch(error){
  console.error('Carnival interrupted:',error);touch?.reset();keys.clear();pressedActions.clear();window.CarnivalAudio?.stop();
  if(round)round.state='error';
  overlay('<p class="eyebrow">YOUR COMPLETED ROUNDS ARE SAFE</p><h2>The curtain caught.</h2><p>Restart this attraction to continue your run.</p><button class="button primary" id="recover-run">CONTINUE SAVED RUN</button><button class="button secondary" id="recover-home">BACK TO MIDWAY</button>');
  $('recover-run').onclick=resumeSavedRun;$('recover-home').onclick=()=>{match=null;round=null;showView('home');};
  lastDrawnRound=round;lastDrawnState='error';
 }finally{requestAnimationFrame(frame);}
}

setupSettings();persist();refreshProgress();requestAnimationFrame(frame);
// Read-only snapshot for deterministic regression checks and debugging.
window.CarnivalDebug={snapshot:()=>JSON.parse(JSON.stringify({scene,mode,renderCount,loadedTextures:Object.keys(textures),day:dateKey(),round:round?{booth:round.booth.id,modifier:round.modifier.id,state:round.state,time:round.time,items:round.items.length,warmup:warmup?{stage:warmup.stage,moved:warmup.moved,dashed:warmup.dashed}:null,pointer:pointerIntent?{kind:pointerIntent.kind,x:pointerIntent.object?.x??pointerIntent.x,y:pointerIntent.object?.y??pointerIntent.y}:null,world:{items:round.items,hazards:round.hazards,secrets:round.secrets,safe:round.safe,tiles:round.tiles,gate:round.gate,dummies:round.dummies,chickens:round.chickens,mirrors:round.mirrors,shades:round.shades}}:null,players:players.map(p=>({id:p.id,x:p.x,y:p.y,score:p.score,carry:p.carry,cd:p.cd,human:p.human,control:p.control,pickups:p.pickups,deflects:p.deflects,safes:p.safes,banked:p.banked,inv:p.inv,dash:p.dash,kills:p.kills,delivered:p.delivered,character:p.character,attackCD:p.attackCD,walkDistance:p.walkDistance})),match:match?{mode:match.mode,roundIndex:match.roundIndex,route:match.route,mods:match.mods,quick:match.quick,level:match.level,day:match.day,totals:match.totals,raw:match.raw,done:match.done}:null,progress:JSON.parse(JSON.stringify(save)),storageAvailable})),routeForDay};
})();
