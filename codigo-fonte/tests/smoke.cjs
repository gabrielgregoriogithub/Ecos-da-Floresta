const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements={},callbacks={},noop=()=>{};
const context=new Proxy({createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function el(id){return elements[id]||=( {style:{},innerHTML:'',textContent:'',classList:{add:noop,remove:noop},setAttribute:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:114,height:114}),addEventListener:(key,fn)=>{callbacks[id+':'+key]=fn},getContext:()=>context} )}
const sandbox={console,Math,Uint8Array,Int16Array,setTimeout:()=>0,clearTimeout:noop,requestAnimationFrame:noop,localStorage:{removeItem(key){delete this[key]}},document:{getElementById:el,querySelectorAll:()=>[],querySelector:()=>el('game')},window:{addEventListener:noop}};
vm.createContext(sandbox);
const html=fs.readFileSync('dist/index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(script,sandbox);
function run(code){vm.runInContext(code,sandbox)}
run(`
start();if(room!==1||state!=='play'||enemies.length<3)throw Error('Start');
p.x=chest.x;p.y=chest.y;interact();if(gold!==5||!chest.open)throw Error('Chest');interact();if(gold!==5)throw Error('Repeat chest');
enemies=[];update(.02);if(!gate)throw Error('Exit unlock');p.x=384;p.y=90;update(.02);if(state!=='choice')throw Error('Relic choice');window.pick(0);if(state!=='path')throw Error('Path choice');window.takePath(0);if(room!==2)throw Error('Advance');
start();blocks=[];river=false;touchMode=true;p.face=0;enemies=[{x:p.x-90,y:p.y,r:12,hp:9,max:9,type:0,cd:10,hit:0}];sword();if(Math.abs(Math.abs(p.face)-Math.PI)>.01)throw Error('Touch aim');
start();blocks=[];enemies=[{x:600,y:100,r:12,hp:99,max:99,type:2,cd:99,hit:0}];let initial=p.x;joy.active=true;joy.x=.5;joy.y=0;update(.1);if(Math.abs((p.x-initial)-p.speed*.05)>.01)throw Error('Analog speed');resetInput();if(joy.active||joy.x)throw Error('Input reset');
start();p.shield=1;let health=p.hp;hurt();if(p.hp!==health||p.shield)throw Error('Shield');inv=0;hurt();p.hp=p.max;enemies=[];update(.01);if(flawless!==0)throw Error('Flawless after healing');
start();p.fire=1;p.frost=1;p.crit=0;let foe={x:500,y:400,r:12,hp:30,max:30,type:2,cd:99,hit:0};enemies=[foe];hit(foe,1);if(foe.hp!==27.5||!foe.chill||!foe.burn)throw Error('Elemental combo');hitstop=0;foe.burnTick=.001;update(.02);if(foe.hp>=27.5)throw Error('Burn');
start();room=2;loadRoom();let order=[...puzzle.order],before=gold;touchRune(order[1]);if(puzzle.step)throw Error('Puzzle error');for(let i of order)touchRune(i);if(!puzzle.solved||gold!==before+6)throw Error('Puzzle');touchRune(order[0]);if(gold!==before+6)throw Error('Duplicate puzzle reward');draw();
start();loadRoom();enemies=[];update(.01);p.x=arena.x;p.y=arena.y;interact();if(state!=='arenaOffer')throw Error('Arena offer');acceptArena();if(arena.wave!==1||gate)throw Error('Arena start');enemies=[];update(.01);if(arena.wave!==2)throw Error('Arena next wave');let cash=gold;enemies=[];update(.01);if(!gate||!arena.done||gold!==cash+8)throw Error('Arena reward');
start();room=3;loadRoom();let boss=enemies.find(e=>e.type===5);boss.cd=.7;update(.01);if(!shockwaves.length)throw Error('Miniboss warning');draw();
start();weaponXP=7;hit({x:500,y:300,r:12,hp:1,max:1,type:0,cd:99,hit:0},10);if(weaponRank!==2)throw Error('Mastery');gold=17;saveCheckpoint();gold=0;resumeRun();if(gold!==17||weaponRank!==2)throw Error('Checkpoint');showStats();if(state!=='stats')throw Error('Stats');closeStats();if(state!=='play')throw Error('Stats close');
start();p.crit=0;roll();let dodgeLife=p.hp;hurt();hurt();if(perfectDodges!==1||p.hp!==dodgeLife||charge!==15||focus<=0)throw Error('Perfect dodge');let counterTarget={x:500,y:400,r:12,hp:20,max:20,type:0,cd:99,hit:0};hit(counterTarget,2,'spirit');if(focus<=0)throw Error('Companion consumed counter');hit(counterTarget,2);if(counterTarget.hp!==15||focus!==0)throw Error('Counter bonus');
start();p.crit=0;let armored={x:500,y:400,r:12,hp:20,max:20,type:0,cd:99,hit:0,affix:'armored'};hit(armored,10);if(armored.hp!==13.5)throw Error('Elite armor');hit(armored,1,'burn');if(armored.hp!==12.5)throw Error('Burn bypass armor');
start();blocks=[];river=false;enemies=[{x:500,y:200,r:12,hp:99,max:99,type:2,cd:99,hit:0,elite:true,affix:'arcane',eliteClock:0}];shots=[];update(.02);if(shots.length!==4)throw Error('Arcane volley');updateCooldowns();if(!$('cooldowns').innerHTML.includes('Esquiva'))throw Error('Cooldown panel');draw();
for(let dir of [0,Math.PI/2,Math.PI,-Math.PI/2]){p.face=dir;draw()}
for(let i=2;i<=8;i++){room=i-1;pendingRoute='battle';loadRoom();updateObjective();draw();if(enemies.some(e=>solid(e.x,e.y,e.r)))throw Error('Blocked enemy spawn '+i)}
room=8;enemies=[];update(.01);if(state!=='end'||best!==8)throw Error('Victory');start();p.hp=1;inv=0;hurt();if(state!=='end'||autoSave!==null)throw Error('Death');
toggleFX();if(!reducedFX)throw Error('Reduced effects');draw();
`);
run('start();blocks=[]');
callbacks['joystick:pointerdown']({pointerId:42,clientX:90,clientY:57,preventDefault:noop});
assert(vm.runInContext('joy.active&&joy.x>.8&&touchMode',sandbox));
callbacks['joystick:lostpointercapture']({pointerId:42});
assert(vm.runInContext('!joy.active&&joy.x===0',sandbox));
run(`
start();guideDone=false;guideIndex=0;updateGuide();if(!$('guide').innerHTML.includes('Explore'))throw Error('Guide first step');for(let action of ['move','attack','dash','magic','interact'])tutorialEvent(action);if(!guideDone||localStorage.ecosGuideDone!=='1')throw Error('Guide completion');restartGuide();if(guideDone||guideIndex!==0)throw Error('Restart guide');skipGuide();if($('guide').innerHTML)throw Error('Skip guide');
start();let completedId=runId;room=4;killCount=12;runClock=125;finish(false);let count=runHistory.length;let entry=runHistory.find(r=>r.id===completedId);if(!entry||entry.cleared!==3||entry.time!==125)throw Error('Run history record');finish(false);if(runHistory.length!==count)throw Error('Duplicate history record');showHistory();if(state!=='history'||!$('overlay').innerHTML.includes('Crônicas'))throw Error('History view');closeHistory();if(state!=='end')throw Error('History restore');
start();showHistory();closeHistory();if(state!=='play')throw Error('Resume from history');if(formatTime(125)!=='2m 05s')throw Error('Time formatting');draw();
`);
run(`
start();loadRoom();if(!cache||!blocks.some(b=>b.cacheGate)||!solid(548,190,12))throw Error('Sealed passage');p.x=490;p.y=190;p.face=0;enemies=[{x:384,y:100,r:12,hp:99,max:99,type:2,cd:99,hit:0}];bomb();bombs[0].life=.001;update(.02);if(!cache.revealed||blocks.some(b=>b.cacheGate)||solid(548,190,12))throw Error('Bomb opens passage');let walker={x:490,y:190,r:12};for(let i=0;i<90;i++)move(walker,1.5,0);if(walker.x<600)throw Error('Passage traversal');p.x=cache.x;p.y=cache.y;let cacheCash=gold;interact();if(!cache.claimed||gold!==cacheCash+7||!journey[room-1].secret)throw Error('Secret treasure');interact();if(gold!==cacheCash+7)throw Error('Duplicate cache reward');draw();showMap();if(state!=='map'||!$('overlay').innerHTML.includes('Segredo encontrado'))throw Error('Journey map');closeMap();if(state!=='play')throw Error('Map resume');saveCheckpoint();journey=[];resumeRun();if(journey.length!==2||journey[0].room!==1)throw Error('Map checkpoint');draw();
`);
console.log('PASS: progression, combat, puzzles, arena, checkpoints, rendering paths and mobile input');
