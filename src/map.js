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
const ebirdLinksEl = document.querySelector("#ebird-links");
const ebirdLifeLinkEl = document.querySelector("#ebird-life");
const ebirdTargetsLinkEl = document.querySelector("#ebird-targets");
const today = new Date();

// prettier-ignore
const monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
const currentMonthName = monthNames[today.getMonth()];

const getEbirdLifeListLink = function (county) {
  return `https://ebird.org/lifelist/US-${county.STUSPS}-${county.COUNTYFP}?time=life&r=US-${county.STUSPS}-${county.COUNTYFP}&sortKey=taxon_order&o=asc`;
};

const getEbirdTargetsLink = function (county) {
  const currentMonth = today.getMonth() + 1;

  return `https://ebird.org/targets?region=${county.Name}%2C+${county.STATE_NAME}%2C+United+States+%28US%29&r1=US-${county.STUSPS}-${county.COUNTYFP}&bmo=${currentMonth}&emo=${currentMonth}&r2=US-${county.STUSPS}-${county.COUNTYFP}&t2=life&mediaType=`;
};

const setEbirdLinks = function (county) {
  ebirdLinksEl.style.display = "block";

  const lifeListUrl = getEbirdLifeListLink(county);
  const targetsUrl = getEbirdTargetsLink(county);

  ebirdLifeLinkEl.href = lifeListUrl;
  ebirdLifeLinkEl.innerText = `Life list for ${county.NAMELSAD}`;

  ebirdTargetsLinkEl.href = targetsUrl;
  ebirdTargetsLinkEl.innerText = `Targets for ${county.NAMELSAD} for ${currentMonthName}`;
};

const resetEbirdLinks = function () {
  ebirdLinksEl.style.display = "none";

  ebirdLifeLinkEl.href = "";
  ebirdLifeLinkEl.innerText = "";

  ebirdTargetsLinkEl.href = "";
  ebirdTargetsLinkEl.innerText = "";
};

const getCurrentCounty = function (position) {
  console.log("getCurrentCounty");
  console.log(position);

  const currentCountyFeature =
    countySource.getFeaturesAtCoordinate(position)[0];

  if (currentCountyFeature) {
    currentCounty = currentCountyFeature.getProperties();
    console.log(currentCounty);
    setEbirdLinks(currentCounty);
  } else {
    resetEbirdLinks();
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
