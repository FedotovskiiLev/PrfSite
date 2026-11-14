'use strict';
const assert = require('node:assert/strict');
const model = require('./assets/food-map-model.js');
const data = require('./assets/food-map-data.js');
assert.deepEqual(model.validate(data), []);
assert.equal(data.venues.length, 2);
assert(data.venues.every(v => v.demo && model.coordinatesValid(v.coordinates) && v.locationStatus === 'approximate-building' && v.source.startsWith('https://www.openstreetmap.org/way/')), 'Building points must retain source and approximate label');
const [gk, kpm] = data.venues;
for (let day = 0; day < 7; day++) {
  for (const [minute, state] of [[479,'closed'],[480,'open'],[1049,'open'],[1050,'closed'],[1439,'closed']])
    assert.equal(model.statusAt(gk,day,minute), day < 5 ? state : 'closed');
  for (const [minute, state] of [[479,'closed'],[480,'open'],[1379,'open'],[1380,'closed'],[1439,'closed']])
    assert.equal(model.statusAt(kpm,day,minute), state);
}
assert.deepEqual(model.localClock(new Date('2026-11-13T21:00:00Z')), {day:5,minute:0});
assert(model.validate({...data,venues:[{id:'x',name:'x',coordinates:null}]}).length);
assert(model.validate({...data,venues:[{id:'x',name:'x',coordinates:[55,37]}]}).length);
assert.equal(model.coordinatesValid([55, 37]), true);
assert.equal(model.coordinatesValid([181, 37]), false);
assert.equal(model.coordinatesValid(['55', 37]), false);
const venue = { weeklyHours: Array.from({length:7}, () => [[480,1080]]) };
for (const [t, state] of [[479,'closed'],[480,'open'],[1079,'open'],[1080,'closed']]) assert.equal(model.statusAt(venue,0,t),state);
venue.weeklyHours[6] = [[1320,120]];
assert.equal(model.statusAt(venue,6,1320),'open');
assert.equal(model.statusAt(venue,0,119),'open');
assert.equal(model.statusAt(venue,0,120),'closed');
venue.weeklyHours[0] = [[0,1440]];
assert.equal(model.statusAt(venue,0,1439),'open');
venue.weeklyHours[0] = null;
assert.equal(model.statusAt(venue,0,500),'unknown');
assert.equal(model.statusAt({},0,500),'unknown');
assert.deepEqual(model.localClock(new Date('2026-11-15T22:30:00Z')), {day:0,minute:90});
assert.throws(() => model.statusAt(venue,7,1440), RangeError);
assert(model.validate({...data,venues:[{id:'x',name:'x',coordinates:[55,37],source:'test',weeklyHours:[[]]}]}).length);
console.log('PASS: map data schema, coordinates, unknown hours, boundaries, overnight/week wrap, Moscow date; no browser or provider checks.');

for (const v of data.venues) { const [[s,w],[n,e]]=data.campus.bounds; assert(v.coordinates[0]>=s&&v.coordinates[0]<=n&&v.coordinates[1]>=w&&v.coordinates[1]<=e); }

assert(model.validate({...data,campus:{...data.campus,bounds:[[56,38],[55,37]]}}).length);

const fs = require('node:fs');
for (const [venue, file] of [[gk, '1.html'], [kpm, '2.html']]) {
  assert.equal(venue.profileUrl, 'canteens/' + file);
  const html = fs.readFileSync(__dirname + '/departments/food/canteens/' + file, 'utf8');
  assert(html.includes('<h1>' + venue.name + '</h1>'));
  assert(html.includes(venue.hoursLabel));
  for (const label of ['Демонстрационный профиль', 'Камеры', 'Акты проверок', 'Новости столовой', '../index.html#food-map']) assert(html.includes(label));
}
console.log('PASS: both marker profiles match venue names and demo hours; missing real resources explicitly labeled.');
