# Demonstration cafeteria points

Verified 2026-11-14 using the public OpenStreetMap map API:
https://api.openstreetmap.org/api/0.6/map?bbox=37.516,55.927,37.523,55.931

- GK: https://www.openstreetmap.org/way/420503682, name «Главный корпус», address Институтский переулок 9 с3. Polygon bounds: south 55.9291643, west 37.5167802, north 55.9298079, east 37.5199714. Polygon area centroid [55.9295226, 37.5181232]; point-in-polygon check passes.
- KPM: https://www.openstreetmap.org/way/230528324, name «Корпус прикладной математики», address Первомайская улица 3. Polygon bounds: south 55.9288286, west 37.5212754, north 55.9291014, east 37.5217732. Polygon area centroid [55.9289650, 37.5215239].

The markers deliberately represent approximate building locations, NOT surveyed cafeteria positions or entrances. User approved building-level demonstration markers. Building identities are also confirmed by https://new.mipt.ru/vikon/sveden/objects/ . The hours are user-supplied demonstration data, not verified official hours.

Map pan limits [[55.925,37.512],[55.935,37.528]] are a UI boundary around the campus, not an administrative/property boundary. Minimum zoom is increased as necessary to keep the viewport within this region on wide screens. The OpenStreetMap data attribution remains visible.

Checks: `node verify-food-map.cjs`, `node verify-preview.cjs`, `node --check assets/food.js`. Tests cover schedule boundaries, Moscow weekdays, marker selection by click and keyboard, status colors, SDK-unavailable fallback, and bound/zoom adapter options. They are not a real-browser interaction or network test.
