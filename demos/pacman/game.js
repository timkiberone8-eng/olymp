'use strict';
const layout = [
'#####################',
'#o........#........o#',
'#.###.###.#.###.###.#',
'#...................#',
'#.###.#.#####.#.###.#',
'#.....#...#...#.....#',
'#####.###.#.###.#####',
'#...#.#.......#.#...#',
'#.#.#.#.##.##.#.#.#.#',
'#.#.....#...#.....#.#',
'#.#.###.#...#.###.#.#',
'#.......#...#.......#',
'#.#.###.#####.###.#.#',
'#.#...............#.#',
'#.###.#.#####.#.###.#',
'#.....#...#...#.....#',
'#.#######.#.#######.#',
'#......... .........#',
'#.###.###.#.###.###.#',
'#o..#...........#..o#',
'###.#.#.#####.#.#.###',
'#.....#.......#.....#',
'#####################'];
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const size = 24;
const directions = {left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}};
const ui = Object.fromEntries(['score','best','lives','level','overlay','message','hint','start','pause','sound'].map(id=>[id,document.getElementById(id)]));
let best = 0;
try {best = Number(localStorage.getItem('pacman-demo-best')) || 0;} catch {}
let cells, player, ghosts, score, lives, level, power, state = 'ready', elapsed = 0, lastTime = 0, frame = 0, invincible = 0, sound = false, audio;
function updateStats(){ui.score.textContent=score;ui.best.textContent=best;ui.lives.textContent='● '.repeat(lives).trim();ui.level.textContent=String(level).padStart(2,'0');}
function spawn(){player={x:10,y:17,dir:'left',next:'left'};ghosts=[{x:9,y:10,color:'#ff698a',dir:'up'},{x:10,y:9,color:'#72d8fa',dir:'left'},{x:11,y:10,color:'#f7aa60',dir:'down'},{x:10,y:11,color:'#cf9cff',dir:'right'}];power=0;invincible=9;}
function loadLevel(){cells=layout.map(row=>row.split(''));spawn();}
function reset(){score=0;lives=3;level=1;loadLevel();updateStats();}
function isOpen(x,y){return cells[y]?.[x] !== undefined && cells[y][x] !== '#';}
function canMove(entity,dir){const d=directions[dir];return isOpen(entity.x+d.x,entity.y+d.y);}
function move(entity,dir){const d=directions[dir];entity.x+=d.x;entity.y+=d.y;entity.dir=dir;}
function beep(frequency,duration=.06){if(!sound)return;try{audio ||= new AudioContext();audio.resume();const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.045,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);}catch{}}
function addScore(points){score+=points;if(score>best){best=score;try{localStorage.setItem('pacman-demo-best',String(best));}catch{}}updateStats();}
function showOverlay(title,hint,button){ui.message.innerHTML=title;ui.hint.textContent=hint;ui.start.textContent=button;ui.overlay.hidden=false;}
function begin(){if(state==='over')reset();state='playing';ui.overlay.hidden=true;elapsed=0;beep(440);}
function togglePause(){if(state==='playing'){state='paused';showOverlay('Передышка','Продолжи, когда будешь готов.','Продолжить →');}else if(state==='paused')begin();}
function collide(){if(invincible>0)return;for(const ghost of ghosts){if(ghost.x!==player.x||ghost.y!==player.y)continue;if(power>0){addScore(200);ghost.x=10;ghost.y=10;beep(700);}else{lives--;beep(110,.25);if(lives===0){state='over';showOverlay('Ещё одну?','Твой счёт: '+score+'. Рекорд: '+best,'Попробовать снова →');}else spawn();updateStats();break;}}}
function tick(){
  if(invincible>0)invincible--;
  if(power>0)power--;
  if(canMove(player,player.next))player.dir=player.next;
  if(canMove(player,player.dir))move(player,player.dir);
  const cell=cells[player.y][player.x];
  if(cell==='.'||cell==='o'){cells[player.y][player.x]=' ';addScore(cell==='o'?50:10);if(cell==='o'){power=65;beep(520,.15);}else beep(220+(score%100)*3);}
  collide();
  if(state!=='playing')return;
  if(frame%4!==0)for(const ghost of ghosts){
    const previous={x:ghost.x,y:ghost.y};
    const options=Object.keys(directions).filter(dir=>canMove(ghost,dir));
    const forward=options.filter(dir=>{const d=directions[dir],old=directions[ghost.dir];return d.x!==-old.x||d.y!==-old.y;});
    const choices=forward.length?forward:options;
    choices.sort((a,b)=>{const da=directions[a],db=directions[b];const distance=d=>Math.abs(ghost.x+d.x-player.x)+Math.abs(ghost.y+d.y-player.y);return power>0?distance(db)-distance(da):distance(da)-distance(db);});
    if(choices.length)move(ghost,choices[Math.random()<.23?Math.floor(Math.random()*choices.length):0]);
    if(ghost.x===player.x&&ghost.y===player.y){collide();if(state!=='playing')break;}
    if(previous.x===ghost.x&&previous.y===ghost.y)ghost.dir='up';
  }
  if(!cells.some(row=>row.some(cell=>cell==='.'||cell==='o'))){level++;loadLevel();updateStats();beep(880,.3);}
  frame++;
}
function drawGhost(ghost,time){const x=ghost.x*size+12,y=ghost.y*size+12;ctx.fillStyle=power>0?(power<18&&frame%2?'#fafbff':'#546df5'):ghost.color;ctx.beginPath();ctx.arc(x,y-2,9,Math.PI,0);ctx.lineTo(x+9,y+9);for(let i=0;i<6;i++)ctx.lineTo(x+9-i*3,y+(i%2?6:9));ctx.lineTo(x-9,y-2);ctx.fill();ctx.fillStyle='white';for(const dx of [-3.5,3.5]){ctx.beginPath();ctx.ellipse(x+dx,y-2,2.8,3.8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#101b39';ctx.beginPath();const d=directions[ghost.dir];ctx.arc(x+dx+d.x,y-2+d.y,1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='white';}}
function draw(time){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#080c19';ctx.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<cells.length;y++)for(let x=0;x<cells[y].length;x++){const cell=cells[y][x],cx=x*size+12,cy=y*size+12;if(cell==='#'){ctx.fillStyle='#101e42';ctx.strokeStyle='#355abb';ctx.lineWidth=1.1;ctx.beginPath();ctx.roundRect(x*size+3,y*size+3,18,18,5);ctx.fill();ctx.stroke();}else if(cell==='.'||cell==='o'){ctx.fillStyle=cell==='o'?'#ffe58d':'#b4bcd3';ctx.beginPath();ctx.arc(cx,cy,cell==='o'?4.5+Math.sin(time/180):2,0,Math.PI*2);ctx.fill();}}
  ghosts.forEach(ghost=>drawGhost(ghost,time));
  if(invincible===0||Math.floor(time/90)%2===0){const x=player.x*size+12,y=player.y*size+12,angle={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[player.dir],mouth=.12+Math.abs(Math.sin(time/90))*.6;ctx.fillStyle='#ffe05b';ctx.shadowColor='#ffe05b';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,10,angle+mouth,angle+Math.PI*2-mouth);ctx.closePath();ctx.fill();ctx.shadowBlur=0;}
}
function animate(time){const delta=Math.min(time-lastTime,200);lastTime=time;if(state==='playing'){elapsed+=delta;const interval=Math.max(90,145-level*5);while(elapsed>=interval&&state==='playing'){tick();elapsed-=interval;}}draw(time);requestAnimationFrame(animate);}
function steer(dir){player.next=dir;if(state==='ready')begin();}
document.addEventListener('keydown',event=>{const key=event.key.toLowerCase(),dir={arrowleft:'left',a:'left',ф:'left',arrowright:'right',d:'right',в:'right',arrowup:'up',w:'up',ц:'up',arrowdown:'down',s:'down',ы:'down'}[key];if(dir){event.preventDefault();steer(dir);}else if(event.code==='Space'){event.preventDefault();if(state==='ready'||state==='over')begin();else togglePause();}});
document.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();steer(button.dataset.dir);}));
let touchStart;
canvas.addEventListener('touchstart',event=>{touchStart=event.touches[0];},{passive:true});
canvas.addEventListener('touchend',event=>{if(!touchStart)return;const end=event.changedTouches[0],dx=end.clientX-touchStart.clientX,dy=end.clientY-touchStart.clientY;if(Math.hypot(dx,dy)>12)steer(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));touchStart=null;},{passive:true});
canvas.style.touchAction='none';
ui.start.addEventListener('click',begin);
ui.pause.addEventListener('click',togglePause);
ui.sound.addEventListener('click',()=>{sound=!sound;ui.sound.textContent='Звук: '+(sound?'вкл.':'выкл.');ui.sound.setAttribute('aria-label',sound?'Выключить звук':'Включить звук');beep(440);});
document.querySelector('#restart').addEventListener('click',()=>{reset();begin();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
reset();requestAnimationFrame(animate);
