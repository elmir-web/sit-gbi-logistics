import Toast from "./Toast.js";

const DELIVERY_TARIFF = 75; // Стоимость за километр.
const MINIMUM_COST = 500; // Минимальная стоимость.

(() => {})();

const showOnMap = (caption) => {
  // Если карта еще не была создана, то создадим ее и добавим метку с адресом.
  // if (!map) {
  //   map = new ymaps.Map("map", state);
  //   placemark = new ymaps.Placemark(
  //     map.getCenter(),
  //     {
  //       iconCaption: caption,
  //       balloonContent: caption,
  //     },
  //     {
  //       preset: "islands#redDotIconWithCaption",
  //     }
  //   );
  //   map.geoObjects.add(placemark);
  //   // Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.
  // } else {
  //   map.setCenter(state.center, state.zoom);
  //   placemark.geometry.setCoordinates(state.center);
  //   placemark.properties.set({
  //     iconCaption: caption,
  //     balloonContent: caption,
  //   });
  // }
};

function showResult(obj) {
  // Удаляем сообщение об ошибке, если найденный адрес совпадает с поисковым запросом.
  // $("#suggest").removeClass("input_error");
  // $("#notice").css("display", "none");

  // myMap.destroy(); // тут подумать

  let mapContainer = document.querySelector("#map");
  let bounds = obj.properties.get("boundedBy");

  // // Рассчитываем видимую область для текущего положения пользователя.
  // let mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [
  //   mapContainer.width(),
  //   mapContainer.height(),
  // ]);

  // продолжить тут

  console.log(
    ymaps.util.bounds.getCenterAndZoom(bounds, [
      mapContainer.offsetWidth,
      mapContainer.offsetHeight,
    ])
  ); // координаты точки

  // Сохраняем полный адрес для сообщения под картой.
  let address = [obj.getCountry(), obj.getAddressLine()].join(", ");

  // Сохраняем укороченный адрес для подписи метки.
  let shortAddress = [
    obj.getThoroughfare(),
    obj.getPremiseNumber(),
    obj.getPremise(),
  ].join(" ");

  // Убираем контролы с карты.
  // mapState.controls = [];

  // Создаём карту.
  showOnMap(shortAddress);

  // Выводим сообщение под картой.
  new Toast({
    title: "Сообщение",
    text: address,
    theme: "light",
    autohide: true,
    interval: 3000,
  });
}

const preGeocodeEvent = (value) => {
  ymaps.geocode(value).then(
    function (res) {
      let obj = res.geoObjects.get(0);
      let error;
      let hint;

      if (obj) {
        // Об оценке точности ответа геокодера можно прочитать тут: https://tech.yandex.ru/maps/doc/geocoder/desc/reference/precision-docpage/
        switch (
          obj.properties.get("metaDataProperty.GeocoderMetaData.precision")
        ) {
          case "exact":
            break;
          case "number":
          case "near":
          case "range":
            error = "Неточный адрес, требуется уточнение";
            hint = "Уточните номер дома";
            break;
          case "street":
            error = "Неполный адрес, требуется уточнение";
            hint = "Уточните номер дома";
            break;
          case "other":
          default:
            error = "Неточный адрес, требуется уточнение";
            hint = "Уточните адрес";
        }
      } else {
        error = "Адрес не найден";
        hint = "Уточните адрес";
      }

      // Если геокодер возвращает пустой массив или неточный результат, то показываем ошибку.
      if (error) {
        new Toast({
          title: "Ошибка",
          text: error,
          theme: "danger",
          autohide: true,
          interval: 5000,
        });
        new Toast({
          title: "Сообщение",
          text: hint,
          theme: "light",
          autohide: true,
          interval: 3000,
        });
      } else {
        showResult(obj);
      }
    },
    function (e) {
      //     console.log(e);
    }
  );
};

ymaps.ready(() => {
  let myMap = new ymaps.Map("map", {
    center: [45.060491, 38.97304],
    zoom: 9,
    controls: [],
  });

  let suggestViewDownAddress = new ymaps.SuggestView("down-address");
  let suggestViewDeliveryAddress = new ymaps.SuggestView("delivery-address");
  // let map;
  // let placemark;

  suggestViewDownAddress.events.add("select", (event) => {
    preGeocodeEvent(event.originalEvent.item.displayName);
  });

  suggestViewDeliveryAddress.events.add("select", (event) => {
    preGeocodeEvent(event.originalEvent.item.displayName);
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
