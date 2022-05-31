const DELIVERY_TARIFF = 75; // Стоимость за километр.
const MINIMUM_COST = 500; // Минимальная стоимость.

(() => {})();

ymaps.ready(() => {
  let myMap = new ymaps.Map("map", {
    center: [45.060491, 38.97304],
    zoom: 9,
    controls: [],
  });

  // myMap.behaviors.disable(["scrollZoom"]);

  // let routePanelControl = new ymaps.control.RoutePanel({
  //   // Создадим панель маршрутизации.
  //   options: {
  //     // Добавим заголовок панели.
  //     showHeader: true,
  //     autofocus: false,
  //     title:
  //       "Укажите адрес загрузки и выгрузки — стоимость рассчитается автоматически",
  //   },
  // });

  // routePanelControl.routePanel.options.set({
  //   // Пользователь сможет построить только автомобильный маршрут.
  //   types: {
  //     auto: true,
  //   },
  // });

  // myMap.controls.add(routePanelControl);
});
