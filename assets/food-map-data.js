/* Provider-independent, verified venue data only. Coordinates are [latitude, longitude]. */
(function (root) {
  'use strict';
  const data = {
    timeZone: 'Europe/Moscow',
    campus: { name: 'МФТИ', center: [55.930090, 37.519570], zoom: 16, source: 'https://yandex.ru/maps/?ll=37.519570%2C55.930090&z=16' },
    provider: { id: 'osm', tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19 },
    venues: []
  };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.FoodMapData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
