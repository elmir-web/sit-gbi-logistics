const MINIMUM_COST = 500; // Минимальная стоимость.
const DELIVERY_TARIFF = 75; // Стоимость за километр.
let MY_MAP = null;
const MAP_POINTERS = {
  error: null,
  inputSelected: null,
  pointOne: {
    coords: null,
    fullAddress: null,
    shortAddress: null,
  },
  pointTwo: {
    coords: null,
    fullAddress: null,
    shortAddress: null,
  },
};

const showResultMapAndInfo = (multiRoute) => {
  MY_MAP.geoObjects.add(multiRoute);

  multiRoute.model.events
    .add("requestsuccess", (event) => {
      const routes = event.get("target").getRoutes();
      const distance = Math.ceil(routes[0].properties.get("distance").value);

      const kilometrs = Math.ceil(distance / 1000);

      document.querySelector(
        ".delivery-results__distance-value"
      ).innerHTML = `${kilometrs} км`;

      document.querySelector(".delivery-results__price-value").innerHTML = `≈ ${
        kilometrs * DELIVERY_TARIFF
      } ₽`;

      document.querySelector(".delivery-results__toprowleft").style.display =
        "block";

      document.querySelector(".delivery-results__toprowright").style.display =
        "block";

      document.querySelector(".couting-price__loading").style.display = "none";
      document.querySelector(".couting-map__loading").style.display = "none";
    })
    .add("requestfail", (event) => {
      console.log(`Error: ${event.get("error").message}`);
    });
};

const createMapBlock = () => {
  return new ymaps.Map("map", {
    center: [45.060491, 38.97304],
    zoom: 9,
    controls: [],
  });
};

const createRouter = () => {
  let multiRouteModel = new ymaps.multiRouter.MultiRouteModel(
    [
      [MAP_POINTERS.pointOne.coords[0], MAP_POINTERS.pointOne.coords[1]],
      [MAP_POINTERS.pointTwo.coords[0], MAP_POINTERS.pointTwo.coords[1]],
    ],
    {
      // Путевые точки можно перетаскивать.
      // Маршрут при этом будет перестраиваться.
      wayPointDraggable: true,
      boundsAutoApply: true,
    }
  );

  ymaps.modules.require(
    ["MultiRouteCustomView"],
    function (MultiRouteCustomView) {
      // Создаем экземпляр текстового отображения модели мультимаршрута.
      // см. файл custom_view.js
      new MultiRouteCustomView(multiRouteModel);
    }
  );

  MY_MAP.destroy();
  MY_MAP = MY_MAP = createMapBlock();

  // Создаем на основе существующей модели мультимаршрут.
  let multiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
    // Путевые точки можно перетаскивать.
    // Маршрут при этом будет перестраиваться.
    wayPointDraggable: true,
    boundsAutoApply: true,
  });

  MAP_POINTERS.error = null;
  MAP_POINTERS.inputSelected = null;
  MAP_POINTERS.pointOne.coords = null;
  MAP_POINTERS.pointOne.fullAddress = null;
  MAP_POINTERS.pointOne.shortAddress = null;
  MAP_POINTERS.pointTwo.coords = null;
  MAP_POINTERS.pointTwo.fullAddress = null;
  MAP_POINTERS.pointTwo.shortAddress = null;

  showResultMapAndInfo(multiRoute);
};

// const showOnMap = (state, caption) => {
//   // Если карта еще не была создана, то создадим ее и добавим метку с адресом.
//   if (!MY_MAP) {
//     MY_MAP = new ymaps.Map("map", state);
//     placemark = new ymaps.Placemark(
//       MY_MAP.getCenter(),
//       {
//         iconCaption: caption,
//         balloonContent: caption,
//       },
//       {
//         preset: "islands#redDotIconWithCaption",
//       }
//     );
//     MY_MAP.geoObjects.add(placemark);
//     // Если карта есть, то выставляем новый центр карты и меняем данные и позицию метки в соответствии с найденным адресом.
//   } else {
//     MY_MAP.setCenter(state.center, state.zoom);
//     placemark.geometry.setCoordinates(state.center);
//     placemark.properties.set({
//       iconCaption: caption,
//       balloonContent: caption,
//     });
//   }
// };

const createAddress = (obj) => {
  let mapContainer = document.querySelector("#map");
  let bounds = obj.properties.get("boundedBy");

  // Рассчитываем видимую область для текущего положения пользователя.
  let mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [
    mapContainer.offsetWidth,
    mapContainer.offsetHeight,
  ]);

  if (MAP_POINTERS.inputSelected === 1) {
    MAP_POINTERS.pointOne.coords = mapState.center;
    MAP_POINTERS.pointOne.fullAddress = [
      obj.getCountry(),
      obj.getAddressLine(),
    ].join(", ");
    MAP_POINTERS.pointOne.shortAddress = [
      obj.getThoroughfare(),
      obj.getPremiseNumber(),
      obj.getPremise(),
    ].join(" ");
  }

  if (MAP_POINTERS.inputSelected === 2) {
    MAP_POINTERS.pointTwo.coords = mapState.center;
    MAP_POINTERS.pointTwo.fullAddress = [
      obj.getCountry(),
      obj.getAddressLine(),
    ].join(", ");
    MAP_POINTERS.pointTwo.shortAddress = [
      obj.getThoroughfare(),
      obj.getPremiseNumber(),
      obj.getPremise(),
    ].join(" ");
  }

  createRouter();
};

const preGeocodeEvent = (value, prevInputSelect) => {
  if (prevInputSelect != null && MAP_POINTERS.inputSelected != null) {
    document.querySelector(".couting-price__loading").style.display = "block";
    document.querySelector(".couting-map__loading").style.display = "block";
  }

  ymaps.geocode(value).then(
    function (res) {
      let obj = res.geoObjects.get(0);
      let error;

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
            error = "Пожалуйста уточните номер дома";
            break;
          case "street":
            error = "Пожалуйста уточните номер дома";
            break;
          case "other":
          default:
            error = "Пожалуйста уточните адрес";
        }
      } else {
        error = "Такой адрес не найден";
      }

      // Если геокодер возвращает пустой массив или неточный результат, то показываем ошибку.
      if (error) {
        MAP_POINTERS.error = true;

        if (MAP_POINTERS.inputSelected === 1)
          document.querySelector("#down-address").value = error;
        else if (MAP_POINTERS.inputSelected === 2)
          document.querySelector("#delivery-address").value = error;
      } else {
        createAddress(obj);
      }
    },
    function (e) {
      console.log(e);
    }
  );
};

// __________________________________________________ Все начинается здесь
ymaps.ready(() => {
  // Создаем экземпляр карты и пофигу что потом мы его удалим, просто он сейчас нужен
  MY_MAP = createMapBlock();

  // Создаем подсказку ввода адреса на каждом из полей средствами Яндекс.Карты
  let suggestViewDownAddress = new ymaps.SuggestView("down-address");
  let suggestViewDeliveryAddress = new ymaps.SuggestView("delivery-address");

  // Если выбран пункт из подсказки
  suggestViewDownAddress.events.add("select", (event) => {
    preGeocodeEvent(event.get("item").value, MAP_POINTERS.inputSelected); // Передаем на функцию адрес из первого поля

    MAP_POINTERS.inputSelected = 1; // Установим служебное значение в результат выбранного первого поля
  });

  // Если выбран пункт из подсказки
  suggestViewDeliveryAddress.events.add("select", (event) => {
    preGeocodeEvent(event.get("item").value, MAP_POINTERS.inputSelected); // Передаем на функцию адрес из первого поля

    MAP_POINTERS.inputSelected = 2; // Установим служебное значение в результат выбранного второго поля
  });
});
// __________________________________________________ Все начинается здесь
