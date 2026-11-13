// Minimal DOM-adapter test, not a real browser/map-network test.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
class El{constructor(){this.value='';this.attrs={};this.events={};this.classList={add:()=>{}};}setAttribute(n,v){this.attrs[n]=v;}removeAttribute(n){delete this.attrs[n];}addEventListener(n,f){this.events[n]=f;}}
const ids=['food-time','time-label','place-name','place-status','place-hours','place-link','map-status','time-now','map-load-status','food-map'];
const els=Object.fromEntries(ids.map(id=>[id,new El()]));
const context={document:{getElementById:id=>els[id]},window:{FoodMapData:require('./assets/food-map-data.js'),FoodMapModel:require('./assets/food-map-model.js')},Intl,Date};
vm.runInNewContext(fs.readFileSync(__dirname+'/assets/food.js','utf8'),context);
assert(els['map-load-status'].textContent.includes('недоступен'));
assert(els['map-status'].textContent.includes('ещё не добавлены'));
assert.equal(els['place-link'].hidden,true);
els['food-time'].value=123;els['food-time'].events.input();
assert.equal(els['time-label'].textContent,'02:03');
assert.equal(els['food-time'].attrs['aria-valuetext'],'02:03');
els['time-now'].events.click();assert(Number(els['food-time'].value)>=0&&Number(els['food-time'].value)<1440);
console.log('PASS: no-map-SDK fallback, empty verified venues, hidden profile, timeline/ARIA, Moscow Now. DOM adapter only.');
// A loaded map must retain source attribution but not the default SVG flag.
let prefix, tileOptions, center;
const map={setView(c){center=c;return this;},attributionControl:{setPrefix(p){prefix=p;}}};
const L={map:()=>map,tileLayer:(_url,opts)=>{tileOptions=opts;return {addTo:()=>({on(){}})};}};
context.window.L=L;context.L=L;
vm.runInNewContext(fs.readFileSync(__dirname+'/assets/food.js','utf8'),context);
assert.equal(prefix,false);
assert(tileOptions.attribution.includes('https://www.openstreetmap.org/copyright'));
assert(tileOptions.attribution.includes('contributors'));
assert.deepEqual(center,context.window.FoodMapData.campus.center);
console.log('PASS: loaded map retains OSM attribution without library prefix. DOM adapter only.');
