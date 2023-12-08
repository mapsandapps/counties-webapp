import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map.js";
import View from "ol/View.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { ScaleLine, defaults as defaultControls } from "ol/control.js";

import { polygonStyleFunction } from "./display";
import { geolocate } from "./geolocation";
import { addClickHandler, popupOverlay } from "./onclick";

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
      // @ts-ignore
      name: "counties",
      source: countySource,
      style: polygonStyleFunction,
    }),
  ],
  overlays: [popupOverlay],
  target: "map",
  view: view,
});

geolocate(map, view);
addClickHandler(map);
