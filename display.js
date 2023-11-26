import { Fill, Stroke, Style, Text } from "ol/style.js";

export const getText = function (feature, resolution) {
  const maxResolution = 1200;
  let text = feature.get("Name");

  if (resolution > maxResolution) {
    text = "";
  }

  return text;
};

export const createTextStyle = function (feature, resolution) {
  const font = "bold" + " " + "10px" + "/" + "1" + " " + "Courier New";

  return new Text({
    textAlign: undefined,
    textBaseline: "middle",
    font: font,
    text: getText(feature, resolution),
    fill: new Fill({ color: "blue" }),
    stroke: new Stroke({ color: "#ffffff", width: 3 }),
    offsetX: 0,
    offsetY: 0,
    placement: "point",
    maxAngle: 0.7853981633974483,
    overflow: false,
    rotation: 0,
  });
};

export function polygonStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: "blue",
      width: 1,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
    text: createTextStyle(feature, resolution),
  });
}
