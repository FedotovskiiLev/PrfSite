(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const slider = $('food-time');
  if (!slider) return;
  const data = window.FoodMapData, model = window.FoodMapModel;
  if (!data || !model || model.validate(data).length) {
    $('map-load-status').textContent = 'Данные карты недоступны. Откройте карту по ссылке ниже.';
    return;
  }
  const fmt = n => `${String(Math.floor(n / 60)).padStart(2,'0')}:${String(n % 60).padStart(2,'0')}`;
  let selected = null;
  const markers = new Map();
  function render() {
    const minute = Number(slider.value), day = model.localClock(new Date(),data.timeZone).day;
    $('time-label').textContent = fmt(minute);
    slider.setAttribute('aria-valuetext',fmt(minute));
    let openCount = 0;
    for (const venue of data.venues) {
      const status = model.statusAt(venue,day,minute);
      if (status === 'open') openCount++;
      const marker = markers.get(venue.id);
      const label = `${venue.name}: ${status === 'open' ? 'открыто' : status === 'closed' ? 'закрыто' : 'часы неизвестны'}`;
      if (marker) {
        marker.setStyle({fillColor:status === 'open' ? '#168149' : '#77746c'});
        marker.getElement()?.setAttribute('aria-label',label);
        const tooltip = document.createElement('span'); tooltip.textContent = label;
        marker.setTooltipContent(tooltip);
      }
    }
    $('map-status').textContent = data.venues.length ? `Открыто: ${openCount} из ${data.venues.length}.` : 'Точки столовых ещё не добавлены. Ползунок готов для проверенных расписаний.';
    $('place-name').textContent = selected?.name || 'Столовые на карте';
    $('place-status').textContent = selected ? ({open:'Открыто',closed:'Закрыто',unknown:'Расписание неизвестно'}[model.statusAt(selected,day,minute)] + ` · ${fmt(minute)}`) : 'Здесь появится информация о выбранной столовой.';
    $('place-hours').textContent = selected?.hoursLabel || 'Расписание не предоставлено';
    const link = $('place-link');
    const safeLink = selected?.profileUrl && /^(?:canteens\/|https:\/\/)/.test(selected.profileUrl);
    link.hidden = !safeLink;
    if (safeLink) link.href = selected.profileUrl; else link.removeAttribute('href');
  }
  function now() { slider.value = model.localClock(new Date(),data.timeZone).minute; render(); }
  slider.addEventListener('input',render);
  $('time-now').addEventListener('click',now);
  if (!window.L || !data.campus.center) {
    $('food-map').classList.add('food-map-empty');
    $('food-map').textContent = 'Карта не загрузилась';
    $('map-load-status').textContent = 'Картографический сервис недоступен. Можно открыть карту по ссылке ниже. Расписания работают независимо от карты.';
    now(); return;
  }
  const map = L.map('food-map',{scrollWheelZoom:false}).setView(data.campus.center,data.campus.zoom);
  // Keep the required map-data attribution without the library prefix.
  map.attributionControl.setPrefix(false);
  const tiles = L.tileLayer(data.provider.tileUrl, {maxZoom:data.provider.maxZoom, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  let errors = 0;
  tiles.on('tileerror',() => { errors++; $('map-load-status').textContent = 'Часть карты недоступна из-за сети. Попробуйте открыть её отдельно.'; });
  tiles.on('load',() => { if (!errors) $('map-load-status').textContent = 'OpenStreetMap · центр обзора: кампус МФТИ. Это не отметка столовой.'; });
  for (const venue of data.venues) {
    const label = document.createElement('span'); label.textContent = venue.name;
    const marker = L.circleMarker(venue.coordinates,{radius:11,color:'#fff',weight:3,fillOpacity:1,fillColor:'#77746c'}).addTo(map).bindTooltip(label,{className:'food-map-label'});
    marker.on('click',() => { selected=venue; render(); });
    const el = marker.getElement();
    el?.setAttribute('tabindex','0'); el?.setAttribute('role','button');
    el?.addEventListener('keydown',event => { if (event.key==='Enter'||event.key===' ') {event.preventDefault();selected=venue;render();} });
    markers.set(venue.id,marker);
  }
  now();
})();
