/* Provider-independent, explicitly sourced venue data; unconfirmed locations stay null. Coordinates are [latitude, longitude]. */
(function (root) {
  'use strict';
  const data = {
    timeZone: 'Europe/Moscow',
    campus: { name: 'МФТИ', center: [55.930090, 37.519570], zoom: 16, source: 'https://yandex.ru/maps/?ll=37.519570%2C55.930090&z=16' },
    provider: { id: 'osm', tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19 },
    venues: [
      {
        id: 'gk', name: 'Столовая в ГК', demo: true,
        coordinates: null, locationStatus: 'unconfirmed',
        locationLabel: 'Главный корпус МФТИ. Точная отметка столовой уточняется.',
        buildingSource: 'https://new.mipt.ru/vikon/sveden/objects/',
        hoursSource: 'user-demo-2026-11-13',
        weeklyHours: [[[480,1050]],[[480,1050]],[[480,1050]],[[480,1050]],[[480,1050]],[],[]],
        hoursLabel: 'Пн–Пт 08:00–17:30 · Сб–Вс закрыто · Москва'
      },
      {
        id: 'kpm', name: 'Столовая КПМ', demo: true,
        coordinates: null, locationStatus: 'unconfirmed',
        locationLabel: 'Корпус прикладной математики МФТИ. Точная отметка столовой уточняется.',
        buildingSource: 'https://new.mipt.ru/vikon/sveden/objects/',
        hoursSource: 'user-demo-2026-11-13',
        weeklyHours: Array.from({length: 7}, () => [[480,1380]]),
        hoursLabel: 'Ежедневно 08:00–23:00 · Москва'
      }
    ]
  };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.FoodMapData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
