import olCircle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olStyle from "ol/style/Style";
import olText from "ol/style/Text";

// colors
const blue = [0, 153, 255, 1];
const green = [0, 255, 64, 1];
const red = [242, 13, 13, 1];
const black = [0, 0, 0, 1];
const white = [255, 255, 255, 1];

export const styleFunctionTwitter = () => {
  const width = 3;

  return [
    new olStyle({
      image: new olCircle({
        radius: width * 2,
        fill: new olFill({
          color: blue,
        }),
        stroke: new olStroke({
          color: white,
          width: width / 2,
        }),
      }),
      zIndex: Number.MAX_SAFE_INTEGER,
    }),
  ];
};

export const styleFunctionEnrichedTwitter = (feature) => {
  const sentiment = feature.getProperties().sentiment || "";
  const fillColor = getColorFromSentiment(sentiment);
  const width = 3;

  return [
    new olStyle({
      image: new olCircle({
        radius: width * 2,
        fill: new olFill({
          color: fillColor,
        }),
        stroke: new olStroke({
          color: white,
          width: width / 2,
        }),
      }),
      zIndex: Number.MAX_SAFE_INTEGER,
    }),
  ];
};

function getColorFromSentiment(sentiment) {
  sentiment = sentiment.toLowerCase();

  if (sentiment.includes("positive")) {
    return green;
  } else if (sentiment.includes("neutral")) {
    return blue;
  } else if (sentiment.includes("negative")) {
    return red;
  } else {
    return black;
  }
}

export const styleFunctionStates = (feature) => {
  const color = feature.getProperties().selected ? "#FF6347" : "#7FDBFF33";
  const name = feature.getProperties().name;
  return [
    new olStyle({
      fill: new olFill({ color: color }),
      stroke: new olStroke({
        color: "#0074D9",
        width: 2,
      }),
      text: new olText({ text: name }),
    }),
  ];
};

export function styleFunctionTwitterCluster(feature) {
  const features = feature.get("features");
  const size = features.length;

  if (size === 0) return;

  return size > 1
    ? new olStyle({
        image: new olCircle({
          radius: 10,
          stroke: new olStroke({
            color: "#fff",
          }),
          fill: new olFill({
            color: "#3399CC",
          }),
        }),
        text: new olText({
          text: size.toString(),
          fill: new olFill({
            color: "#fff",
          }),
        }),
        zIndex: Number.MAX_SAFE_INTEGER,
      })
    : styleFunctionEnrichedTwitter(features[0]);
}

export function mapHasLayer(map, layer) {
  const targetProperties = layer.getProperties();
  const allLayers = map.getLayers();

  let result = false;

  allLayers.forEach((currLayer) => {
    const currLayerProperties = currLayer.getProperties();

    if (
      currLayerProperties &&
      targetProperties &&
      currLayerProperties.url === targetProperties.url
    ) {
      result = true;
      return;
    }
  });

  return result;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isCluster(feature) {
  if (!feature || !feature.get("features")) {
    return false;
  }
  return feature.get("features").length >= 1;
}
