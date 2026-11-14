'use strict';
const assert = require('node:assert/strict');
const model = require('./assets/food-map-model.js');
const data = require('./assets/food-map-data.js');
assert.deepEqual(model.validate(data), []);
assert.equal(data.venues.length, 2);
assert(data.venues.every(v => v.demo && v.coordinates === null && v.locationStatus === 'unconfirmed'), 'Never fabricate cafeteria coordinates');
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
