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
const ebirdLinkEl = document.querySelector("#ebird");

const getEbirdLifeListLink = function (county) {
  return `https://ebird.org/lifelist/US-${county.STUSPS}-${county.COUNTYFP}?time=life&r=US-${county.STUSPS}-${county.COUNTYFP}&sortKey=taxon_order&o=asc`;
};

const setEbirdLink = function (county) {
  const url = getEbirdLifeListLink(county);

  ebirdLinkEl.href = url;
  ebirdLinkEl.style.display = "inline";
  ebirdLinkEl.innerText = `View eBird life list for ${county.NAMELSAD}`;
};

const resetEbirdLink = function () {
  ebirdLinkEl.href = "";
  ebirdLinkEl.style.display = "none";
  ebirdLinkEl.innerText = "";
};

const getCurrentCounty = function (position) {
  console.log("getCurrentCounty");
  console.log(position);

  const currentCountyFeature =
    countySource.getFeaturesAtCoordinate(position)[0];

  if (currentCountyFeature) {
    currentCounty = currentCountyFeature.getProperties();
    console.log(currentCounty);
    setEbirdLink(currentCounty);
  } else {
    resetEbirdLink();
  }
};

const view = new View({
  center: [-9388858, 3994544],
  zoom: 4,
});

const countySource = new VectorSource({
  format: new GeoJSON(),
  url: "/counties-500k.geojson",
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
      source: countySource,
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
  console.log("change:position");
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  view.setCenter(coordinates);
  view.setZoom(10); // TODO: later, only do this on first position

  // TODO: for now, we'll only do this if there isn't yet a county, but eventually we'll want to do it more often
  // track most recent county
  // on each update, see if current location intersects that county
  // if not, check all counties for an intersection
  if (!currentCounty) {
    getCurrentCounty(coordinates);
  }
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});
