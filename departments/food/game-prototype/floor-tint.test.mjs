import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class Node {constructor(tag){this.tag=tag;this.a={};this.children=[]}setAttribute(k,v){this.a[k]=v}appendChild(n){this.children.push(n)}get firstChild(){return this.children[0]}removeChild(n){this.children.splice(this.children.indexOf(n),1)}}
test('blue floor preserves its source and adds only one cached, non-interactive tint',()=>{
 const layer=new Node('g'),pattern=new Node('pattern'),source=new Node('image');
 source.a.href='assets/floor-cc0.png';pattern.appendChild(source);
 const ctx={document:{getElementById:id=>id==='environment'?layer:pattern,createElementNS:(_,tag)=>new Node(tag)}};ctx.globalThis=ctx;
 vm.runInNewContext(fs.readFileSync(new URL('./environment.js',import.meta.url),'utf8'),ctx);
 for(let x=0;x<1200;x+=60)ctx.FoodEnvironment.update({x,y:0},{width:360,height:225});
 assert.equal(pattern.children.length,2);assert.equal(pattern.children[0],source);
 const tint=pattern.children[1];assert.equal(tint.tag,'rect');assert.equal(tint.a.fill,'#3f92ce');assert.equal(tint.a.opacity,'0.5');assert.equal(tint.a['pointer-events'],'none');
 assert.equal(tint.a.width,'48');assert.equal(tint.a.height,'48');assert.equal(tint.a.filter,undefined);
 assert(layer.children.every(table=>table.children[0].a.href==='assets/table-coffee-cc0.png'));
});
