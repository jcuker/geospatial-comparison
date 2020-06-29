import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import React from "react";
import { OSM } from "ol/source";

export default class Simple extends React.Component {
  async componentDidMount() {
    document.title = "OpenLayers | Simple Example";
    const allTs = await (
      await fetch("https://api.rainviewer.com/public/maps.json")
    ).json();
    const ts = allTs[getRandomInt(allTs.length - 1)];
    const size = "512";
    const color = "1";
    const options = "1_0";

    const url = `https://tilecache.rainviewer.com/v2/radar/${ts}/${size}/{z}/{x}/{y}/${color}/${options}.png`;

    const radar = new TileLayer({
      source: new XYZ({
        url,
      }),
    });

    new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        radar,
      ],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 5,
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
