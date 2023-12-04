import Overlay from "ol/Overlay.js";
import { getEbirdLifeListLink, getEbirdTargetsLink } from "./ebird";
import { getCountyAtCoordinate } from "./utils";

/**
 * Elements that make up the popup.
 */
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

/**
 * Create an overlay to anchor the popup to the map.
 */
export const popupOverlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const getPopupHTML = (county) => {
  return `${county.Name} County:<br><a href="${getEbirdLifeListLink(
    county
  )}" target="_new">Life list</a><br><a href="${getEbirdTargetsLink(
    county
  )}" target="_new">Targets</a>`;
};

export const addClickHandler = (map) => {
  /**
   * Add a click handler to hide the popup.
   * @return {boolean} Don't follow the href.
   */
  closer.onclick = function () {
    popupOverlay.setPosition(undefined);
    closer.blur();
    return false;
  };

  /**
   * Add a click handler to the map to render the popup.
   */
  map.on("singleclick", function (e) {
    const coordinate = e.coordinate;

    const clickedCountyFeature = getCountyAtCoordinate(map, coordinate);
    const clickedCounty = clickedCountyFeature.getProperties();
    content.innerHTML = getPopupHTML(clickedCounty);
    popupOverlay.setPosition(coordinate);
  });
};
