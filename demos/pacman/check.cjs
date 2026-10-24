const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const elements = new Map();
const element = id => {if (!elements.has(id)) elements.set(id, {textContent:'',hidden:false,addEventListener(){},setAttribute(){},style:{},getContext(){return {};}});return elements.get(id);};
const context = vm.createContext({document:{querySelector:element,getElementById:element,querySelectorAll(){return [];},addEventListener(){}},localStorage:{getItem(){return null;},setItem(){}},requestAnimationFrame(){},Math,console});
vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),context);
vm.runInContext(`
if(layout.some(row=>row.length!==21))throw Error('Invalid row width');
const reached=new Set(['10,17']),queue=[[10,17]];
for(const [x,y]of queue)for(const d of Object.values(directions)){const nx=x+d.x,ny=y+d.y,key=nx+','+ny;if(isOpen(nx,ny)&&!reached.has(key)){reached.add(key);queue.push([nx,ny]);}}
for(let y=0;y<cells.length;y++)for(let x=0;x<21;x++)if(cells[y][x]!=='#'&&!reached.has(x+','+y))throw Error('Unreachable cell');
begin();tick();if(score!==10)throw Error('Pellet score');
togglePause();if(state!=='paused')throw Error('Pause');togglePause();if(state!=='playing')throw Error('Resume');
reset();invincible=0;ghosts=[{x:10,y:17,dir:'up'}];collide();if(lives!==2)throw Error('Life loss');
invincible=0;power=20;ghosts=[{x:10,y:17,dir:'up'}];collide();if(score!==200||lives!==2)throw Error('Powered collision');
reset();cells=cells.map(row=>row.map(cell=>cell==='#'?'#':' '));tick();if(level!==2)throw Error('Next level');
reset();lives=1;invincible=0;ghosts=[{x:10,y:17,dir:'up'}];collide();if(state!=='over'||lives!==0)throw Error('Game over');
begin();if(state!=='playing'||lives!==3||score!==0)throw Error('Restart');
`,context);
assert.equal(elements.get('lives').textContent,'● ● ●');
console.log('PASS: reachable maze, pellets, pause, lives, power, levels, game over, restart');
