import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import React from "react";

export default class Simple extends React.Component {
  componentDidMount() {
    document.title = "OpenLayers | Simple Example";

    new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  render() {
    return (
      <div
        id="map"
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>
    );
  }
}
