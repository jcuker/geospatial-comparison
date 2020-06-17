import olCircle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olStyle from "ol/style/Style";
import olText from "ol/style/Text";

export const styleFunctionTwitter = () => {
  const white = [255, 255, 255, 1];
  const blue = [0, 153, 255, 1];
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
      zIndex: Infinity,
    }),
  ];
};

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
