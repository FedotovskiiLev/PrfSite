/* Pure data adapter: no map SDK, network requests, or invented venue locations. */
(function (root) {
  'use strict';
  const coordinatesValid = xy => Array.isArray(xy) && xy.length === 2 &&
    xy.every(Number.isFinite) && Math.abs(xy[0]) <= 90 && Math.abs(xy[1]) <= 180;
  const minuteValid = n => Number.isInteger(n) && n >= 0 && n < 1440;
  const intervalValid = p => Array.isArray(p) && p.length === 2 &&
    minuteValid(p[0]) && Number.isInteger(p[1]) && p[1] >= 0 && p[1] <= 1440 && p[0] !== p[1];
  function validate(data) {
    const errors = [];
    if (!data || !Array.isArray(data.venues)) return ['venues must be an array'];
    try { new Intl.DateTimeFormat('en', { timeZone: data.timeZone }).format(); }
    catch (_) { errors.push('Invalid timeZone'); }
    if (data.campus?.center != null && !coordinatesValid(data.campus.center)) errors.push('Invalid campus center');
    if (data.campus?.bounds != null) {
      const b = data.campus.bounds;
      if (!Array.isArray(b) || b.length !== 2 || !b.every(coordinatesValid) || b[0][0] >= b[1][0] || b[0][1] >= b[1][1]) errors.push('Invalid campus bounds');
    }
    const ids = new Set();
    for (const venue of data.venues) {
      if (!venue.id || ids.has(venue.id)) errors.push('Missing or duplicate venue id');
      ids.add(venue.id);
      if (!venue.name) errors.push(`${venue.id}: name required`);
      if (venue.coordinates == null) {
        if (venue.locationStatus !== 'unconfirmed') errors.push(`${venue.id}: missing location must be explicit`);
      } else {
        if (!coordinatesValid(venue.coordinates)) errors.push(`${venue.id}: invalid coordinates`);
        if (!venue.source) errors.push(`${venue.id}: verified location source required`);
      }
      const week = venue.weeklyHours;
      if (week != null && (!Array.isArray(week) || week.length !== 7 ||
          week.some(day => day !== null && (!Array.isArray(day) || !day.every(intervalValid))))) {
        errors.push(`${venue.id}: invalid weeklyHours`);
      }
    }
    return errors;
  }
  // Monday = 0. null means unknown, [] means confirmed closed, [0,1440] means 24h.
  // Overnight windows belong to their starting day; endpoints are half-open.
  function statusAt(venue, day, minute) {
    if (!Number.isInteger(day) || day < 0 || day > 6 || !minuteValid(minute)) throw new RangeError('Invalid weekday/minute');
    const week = venue.weeklyHours;
    if (!week) return 'unknown';
    const today = week[day], yesterday = week[(day + 6) % 7];
    if (today?.some(([start, end]) => end > start ? minute >= start && minute < end : minute >= start)) return 'open';
    if (yesterday?.some(([start, end]) => end < start && minute < end)) return 'open';
    return today == null || yesterday == null ? 'unknown' : 'closed';
  }
  function localClock(date = new Date(), timeZone = 'Europe/Moscow') {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
    return { day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(p.weekday), minute: Number(p.hour) * 60 + Number(p.minute) };
  }
  const api = { coordinatesValid, validate, statusAt, localClock };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FoodMapModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
