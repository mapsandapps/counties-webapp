import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map.js";
import Point from "ol/geom/Point.js";
import View from "ol/View.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import Control from "ol/control/Control";
import { ScaleLine, defaults as defaultControls } from "ol/control.js";

import { polygonStyleFunction } from "./display.js";

let currentCounty;

const getCurrentCounty = function () {
  // const position = geolocation.getPosition();
  // console.log(positionFeature.getExtent())
  // console.log(map.getView().fit(positionFeature, {
  //   maxZoom: 18
  // }));
  const geometry = positionFeature.getGeometry();
  console.log(geometry);

  view.fit(geometry, {
    duration: 1000,
    maxZoom: 10,
  });
};

const view = new View({
  center: [0, 0],
  zoom: 2,
});

const map = new Map({
  controls: defaultControls().extend([
    new ScaleLine({
      units: "us",
    }),
  ]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: "./data/counties-500k.geojson",
      }),
      style: polygonStyleFunction,
    }),
  ],
  target: "map",
  view: view,
});

const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

const locate = document.createElement("div");
locate.className = "ol-control ol-unselectable locate";
locate.innerHTML = '<button title="Locate me" id="track">◎</button>';
locate.addEventListener("click", function () {
  geolocation.setTracking(true);
});

map.addControl(
  new Control({
    element: locate,
  })
);

geolocation.on("change", function () {
  console.log("change");
});

geolocation.on("change:position", function () {
  console.log("change:position");
  // TODO: for now, we'll only do this if there isn't yet a county, but eventually we'll want to do it more often
  if (!currentCounty) {
    getCurrentCounty();
  }
});

// handle geolocation error.
geolocation.on("error", function (error) {
  const info = document.getElementById("info");
  info.innerHTML = error.message;
  info.style.display = "";
});

const accuracyFeature = new Feature();
geolocation.on("change:accuracyGeometry", function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: "#3399CC",
      }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  })
);

geolocation.on("change:position", function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});
