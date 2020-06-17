import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import React from "react";
import * as olProj from "ol/proj";
import "./popup.css";
import Overlay from "ol/Overlay";
import { toStringHDMS } from "ol/coordinate";

export default class Popup extends React.Component {
  componentDidMount() {
    document.title = "OpenLayers | Popup Example";

    const container = document.getElementById("popup");
    const content = document.getElementById("popup-content");
    const closer = document.getElementById("popup-closer");
    /**
     * Create an overlay to anchor the popup to the map.
     */
    const overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          }),
        }),
      ],
      overlays: [overlay],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
    /**
     * Add a click handler to the map to render the popup.
     */
    map.on("singleclick", function (evt) {
      const coordinate = evt.coordinate;
      const hdms = toStringHDMS(olProj.toLonLat(coordinate));

      content.innerHTML = "<p>You clicked here:</p><code>" + hdms + "</code>";
      overlay.setPosition(coordinate);
    });
  }

  render() {
    return (
      <div>
        <div id="map" className="map"></div>
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer"></div>
          <div id="popup-content"></div>
        </div>
      </div>
    );
  }
}
