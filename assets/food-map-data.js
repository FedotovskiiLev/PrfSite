/* Provider-independent, explicitly sourced venue data; unconfirmed locations stay null. Coordinates are [latitude, longitude]. */
(function (root) {
  'use strict';
  const data = {
    timeZone: 'Europe/Moscow',
    campus: { name: 'МФТИ', center: [55.930090, 37.519570], zoom: 17, minZoom: 16, bounds: [[55.925,37.512],[55.935,37.528]], source: 'https://yandex.ru/maps/?ll=37.519570%2C55.930090&z=16' },
    provider: { id: 'osm', tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19 },
    venues: [
      {
        profileUrl: 'canteens/1.html',
        id: 'gk', name: 'Столовая в ГК', demo: true,
        coordinates: [55.9295226,37.5181232], locationStatus: 'approximate-building',
        source: 'https://www.openstreetmap.org/way/420503682',
        locationLabel: 'Примерная точка: центр Главного корпуса МФТИ, не вход в столовую.',
        buildingSource: 'https://new.mipt.ru/vikon/sveden/objects/',
        hoursSource: 'user-demo-2026-11-13',
        weeklyHours: [[[480,1050]],[[480,1050]],[[480,1050]],[[480,1050]],[[480,1050]],[],[]],
        hoursLabel: 'Пн–Пт 08:00–17:30 · Сб–Вс закрыто · Москва'
      },
      {
        profileUrl: 'canteens/2.html',
        id: 'kpm', name: 'Столовая КПМ', demo: true,
        coordinates: [55.9289650,37.5215239], locationStatus: 'approximate-building',
        source: 'https://www.openstreetmap.org/way/230528324',
        locationLabel: 'Примерная точка корпуса прикладной математики МФТИ, не вход в столовую.',
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
