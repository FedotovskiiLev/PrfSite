import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
class Element {
 constructor(tag){this.tag=tag;this.attrs={};this.children=[]}
 setAttribute(k,v){this.attrs[k]=String(v)}
 appendChild(n){this.children.push(n)}
 insertBefore(n,b){this.children=this.children.filter(x=>x!==n);this.children.splice(this.children.indexOf(b),0,n)}
}
function rig(){const context={document:{createElementNS:(_,tag)=>new Element(tag)}};vm.runInNewContext(fs.readFileSync(new URL('sprite-rig.js',import.meta.url),'utf8'),context);return context.FoodSpriteRig.sanitarian()}
test('lying pose keeps walking identity and attaches dedicated relaxed limbs beneath the coat',()=>{
 const r=rig();r.update(0,true,false);const torso=r.node.children.find(n=>n.attrs.fill==='#ebece4'),head=r.node.children.find(n=>n.children.some(x=>x.tag==='circle'&&x.attrs.cy==='-19'));
 const shape=torso.attrs.d,headShape=JSON.stringify(head.children.map(n=>n.attrs));
 const lying=r.node.children.find(n=>n.attrs['data-pose']==='lying');
 r.update(0,false,true,.3);
 assert.equal(torso.attrs.d,shape);assert.equal(JSON.stringify(head.children.map(n=>n.attrs)),headShape);
 assert.equal(head.attrs.transform,'rotate(0)');assert.equal(lying.attrs.display,'inline');
 assert.equal(r.node.children[0].attrs.display,'none');assert.equal(r.node.children[1].attrs.display,'none');assert.equal(r.node.children[2].attrs.display,'none');
 assert.ok(r.node.children.indexOf(lying)<r.node.children.indexOf(torso));
 const legs=lying.children.find(n=>n.attrs['data-part']==='resting-legs');assert.equal(legs.children.length,3);
 const arms=lying.children.find(n=>n.attrs['data-part']==='resting-arms');assert.equal(arms.children.length,4);
 assert.ok(lying.children.some(n=>n.attrs['data-part']==='contact-shadow'));
});
test('breathing and staggered sweat animate while resting limbs stay planted; walking restores cleanly',()=>{
 const r=rig(),torso=r.node.children.find(n=>n.attrs.fill==='#ebece4'),lying=r.node.children.find(n=>n.attrs['data-pose']==='lying'),sweat=r.node.children.find(n=>n.attrs['data-part']==='sweat');
 r.update(.25,true,true,.3);const body=torso.attrs.transform,limbs=JSON.stringify(lying),drops=JSON.stringify(sweat.children);
 r.update(.25,true,true,.8);assert.notEqual(torso.attrs.transform,body);assert.equal(JSON.stringify(lying),limbs);assert.notEqual(JSON.stringify(sweat.children),drops);assert.equal(sweat.children.length,2);
 assert.equal(r.node.children[0].attrs.display,'none','even an erroneous moving flag must not show walking feet when exhausted');
 r.update(.25,true,false,.9);assert.equal(lying.attrs.display,'none');assert.equal(sweat.attrs.display,'none');assert.equal(torso.attrs.transform,'');assert.equal(r.node.children[0].attrs.display,'inline');assert.equal(r.node.children[1].attrs.display,'inline');assert.equal(r.node.children[2].attrs.display,'inline');
});
