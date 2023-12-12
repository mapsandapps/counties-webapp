import Control from "ol/control/Control";
import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import { Vector as VectorSource } from "ol/source.js";
import { Vector as VectorLayer } from "ol/layer.js";
import Point from "ol/geom/Point.js";
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from "ol/style.js";

import { resetCurrentCountyLinks, setCurrentCountyLinks } from "./ebird";
import { getCountyAtCoordinate } from "./utils";

export const geolocate = (map, view) => {
  let currentCounty;

  const locate = document.createElement("div");
  locate.className = "ol-control ol-unselectable locate";
  locate.innerHTML = '<button title="Locate me" id="track">◎</button>';

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

  const headingIcon = new Icon({
    src: "/img/heading.svg",
    scale: 0.2,
    anchor: [0.5, 1.5],
    opacity: 0,
  });

  const headingFeature = new Feature();
  headingFeature.setStyle(
    new Style({
      image: headingIcon,
    })
  );

  const getCurrentCounty = function (position) {
    const currentCountyFeature = getCountyAtCoordinate(map, position);

    if (currentCountyFeature) {
      currentCounty = currentCountyFeature.getProperties();
      setCurrentCountyLinks(currentCounty);
    } else {
      resetCurrentCountyLinks();
    }
  };

  locate.addEventListener("click", function () {
    // if tracking isn't on yet, start tracking
    // otherwise, recenter the map
    if (geolocation.getTracking()) {
      centerAndZoom();
    } else {
      geolocation.setTracking(true);
    }
  });

  const geolocation = new Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
      enableHighAccuracy: true,
    },
    projection: view.getProjection(),
  });

  geolocation.on("change", function () {
    console.log("change");
  });

  // handle geolocation error.
  geolocation.on("error", function (error) {
    const info = document.getElementById("info");
    if (!info) return;

    info.innerHTML = error.message;
    info.style.display = "";
  });

  const accuracyFeature = new Feature();
  geolocation.on("change:accuracyGeometry", function () {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  const centerAndZoom = () => {
    view.setCenter(geolocation.getPosition());
    view.setZoom(10);
  };

  geolocation.on("change:heading", function () {
    console.log("change:heading");
    const heading = geolocation.getHeading();

    if (heading) {
      headingIcon.setRotation(heading);
      headingIcon.setOpacity(1);
    } else {
      headingIcon.setOpacity(0);
    }
  });

  geolocation.on("change:position", function () {
    console.log("change:position");
    const isInitialPosition = !positionFeature.getGeometry();
    const coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
    headingFeature.setGeometry(coordinates ? new Point(coordinates) : null);

    if (isInitialPosition) {
      centerAndZoom();
    }

    getCurrentCounty(coordinates);
  });

  new VectorLayer({
    map: map,
    source: new VectorSource({
      features: [accuracyFeature, headingFeature, positionFeature],
    }),
  });

  map.addControl(
    new Control({
      element: locate,
    })
  );
};
