// Minimal DOM-adapter test, not a real browser/map-network test.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
class El{constructor(){this.children=[];this.value='';this.attrs={};this.events={};this.classList={add:()=>{}};}append(el){this.children.push(el);}before(el){this.beforeElement=el;}setAttribute(n,v){this.attrs[n]=v;}removeAttribute(n){delete this.attrs[n];}addEventListener(n,f){this.events[n]=f;}}
const ids=['food-time','time-label','place-name','place-status','place-hours','place-link','map-status','time-now','map-load-status','food-map','place-location'];
const els=Object.fromEntries(ids.map(id=>[id,new El()]));
const context={document:{getElementById:id=>els[id],createElement:()=>new El()},window:{FoodMapData:require('./assets/food-map-data.js'),FoodMapModel:require('./assets/food-map-model.js')},Intl,Date};
context.window.addEventListener=()=>{};
vm.runInNewContext(fs.readFileSync(__dirname+'/assets/food.js','utf8'),context);
assert(els['map-load-status'].textContent.includes('недоступен'));
assert.equal(els['map-status'].textContent, undefined, 'Removed summary is not rendered');
assert.equal(els['map-load-status'].hidden, false, 'SDK errors remain accessible');
assert.equal(els['place-name'].textContent,'Столовая в ГК');
assert.equal(els['food-map'].beforeElement, undefined, 'No duplicate cafeteria buttons above the map');
assert(els['place-hours'].textContent.includes('08:00–17:30'));
assert.equal(els['place-link'].hidden,false);
assert.equal(els['place-link'].href,'canteens/1.html');
els['food-time'].value=123;els['food-time'].events.input();
assert.equal(els['time-label'].textContent,'02:03');
assert.equal(els['food-time'].attrs['aria-valuetext'],'02:03');
els['time-now'].events.click();assert(Number(els['food-time'].value)>=0&&Number(els['food-time'].value)<1440);
console.log('PASS: no-map-SDK fallback, two approximate demo venues, linked demo profile, timeline/ARIA, Moscow Now. DOM adapter only.');
// A loaded map must retain source attribution but not the default SVG flag.
let prefix, tileOptions, center, mapOptions, minZoom;
const tileEvents={};
const drawn=[];
const map={setView(c){center=c;return this;},invalidateSize(){},getBoundsZoom(){return 17;},setMinZoom(z){minZoom=z;},getZoom(){return 17;},setZoom(){},panInsideBounds(){},attributionControl:{setPrefix(p){prefix=p;}}};
const L={map:(_id,opts)=>{mapOptions=opts;return map;},circleMarker:(coords,opts)=>{const marker={coords,opts,events:{},el:new El(),addTo(){return this;},bindTooltip(){return this;},on(name,fn){this.events[name]=fn;return this;},getElement(){return this.el;},setStyle(style){this.style=style;},setTooltipContent(){}};drawn.push(marker);return marker;},tileLayer:(_url,opts)=>{tileOptions=opts;return {addTo:()=>({on(name,fn){tileEvents[name]=fn;}})};}};
context.window.L=L;context.L=L;
vm.runInNewContext(fs.readFileSync(__dirname+'/assets/food.js','utf8'),context);
assert.equal(prefix,false);
assert(tileOptions.attribution.includes('https://www.openstreetmap.org/copyright'));
assert(tileOptions.attribution.includes('contributors'));
assert.deepEqual(center,context.window.FoodMapData.campus.center);
console.log('PASS: loaded map retains OSM attribution without library prefix. DOM adapter only.');

assert.equal(drawn.length,2);
assert.deepEqual(mapOptions.maxBounds,context.window.FoodMapData.campus.bounds);
assert.equal(mapOptions.maxBoundsViscosity,1);
assert.equal(minZoom,17);
drawn[1].events.click(); assert.equal(els['place-name'].textContent,'Столовая КПМ');
els['food-time'].value=600;els['food-time'].events.input();assert.equal(drawn[1].style.fillColor,'#168149');
els['food-time'].value=1380;els['food-time'].events.input();assert.equal(drawn[1].style.fillColor,'#77746c');
drawn[0].el.events.keydown({key:'Enter',preventDefault(){}});assert.equal(els['place-name'].textContent,'Столовая в ГК');
drawn[1].el.events.keydown({key:' ',preventDefault(){}});assert.equal(els['place-name'].textContent,'Столовая КПМ');
assert.equal(els['food-map'].beforeElement, undefined);
console.log('PASS: two clickable/keyboard markers, open/closed colors and campus bounds/minZoom adapter.');

// Successful loading stays silent; failures are still visible and announced.
tileEvents.load();
assert.equal(els['map-load-status'].hidden, true);
assert.equal(els['map-load-status'].textContent, '');
assert.equal(els['map-status'].textContent, undefined);
tileEvents.tileerror();
assert.equal(els['map-load-status'].hidden, false);
assert(els['map-load-status'].textContent.includes('недоступна'));
tileEvents.load();
assert.equal(els['map-load-status'].hidden, false, 'Partial tile failure is not concealed');
drawn[1].events.click();
assert.equal(els['place-link'].hidden, false);
assert.equal(els['place-link'].href, 'canteens/2.html');
drawn[0].events.click();
assert.equal(els['place-link'].href, 'canteens/1.html');
console.log('PASS: removed map summaries, silent success, accessible errors and both profile links.');
