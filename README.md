# Профком МФТИ — макет сайта

статический концепт: HTML, CSS, JavaScript.

## Запуск

Открыть `index.html` либо запустить из папки проекта:

```sh
python3 -m http.server 8000
```

## Структура

Строгое дерево: главная → направление → внутренние страницы направления.

- `index.html` — информация о профкоме (lorem ipsum), семь направлений и ссылка на бота.
- `departments/{green,events,travel,legal,culture,promo,food}/index.html` — информация (lorem ipsum) и компактная карусель фотографий каждого направления.
- `departments/food/canteens/{1,2,3}.html` — три условные столовые.
- Новости и фильтры находятся непосредственно на `departments/food/index.html#news`; прежний `departments/food/news/index.html` только перенаправляет сюда.
- `departments/food/news/{menu,canteens,feedback}.html` — примеры материалов.

Текущие фото: атлантическая сельдь Axel Kuhlmann (CC0) и тихоокеанская сельдь USGS / Jacob Gregg (Public Domain). 
