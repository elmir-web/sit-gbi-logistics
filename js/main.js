const DELIVERY_TARIFF = 75; // Стоимость за километр.
const MINIMUM_COST = 500; // Минимальная стоимость.
let MY_MAP = null;
let INPUT_SELECTED = null;
const MAP_POINTERS = {
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

(() => {})();

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

function showResult(obj) {
  // // console.log(INPUT_SELECTED);
  let mapContainer = document.querySelector("#map");
  let bounds = obj.properties.get("boundedBy");

  // Рассчитываем видимую область для текущего положения пользователя.
  let mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [
    mapContainer.offsetWidth,
    mapContainer.offsetHeight,
  ]);

  // // console.log(mapState.center); // координаты точки

  // // Убираем контролы с карты.
  // // mapState.controls = [];

  // // console.log(mapState); // координаты точки

  // // Создаём карту.
  // // showOnMap(mapState, shortAddress);

  if (INPUT_SELECTED === 1) {
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

  if (INPUT_SELECTED === 2) {
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

  console.log(MAP_POINTERS);
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
        console.log(error);
        console.log(hint);
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
  MY_MAP = new ymaps.Map("map", {
    center: [45.060491, 38.97304],
    zoom: 9,
    controls: [],
  });

  let suggestViewDownAddress = new ymaps.SuggestView("down-address");
  let suggestViewDeliveryAddress = new ymaps.SuggestView("delivery-address");

  suggestViewDownAddress.events.add("select", (event) => {
    INPUT_SELECTED = 1;

    preGeocodeEvent(event.originalEvent.item.displayName);
  });

  suggestViewDeliveryAddress.events.add("select", (event) => {
    INPUT_SELECTED = 2;

    preGeocodeEvent(event.originalEvent.item.displayName);
  });
});
