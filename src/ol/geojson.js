import GeoJSON from "ol/format/GeoJSON";
import { Tile as TileLayer } from "ol/layer";
import olVectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import "ol/ol.css";
import Overlay from "ol/Overlay";
import { OSM } from "ol/source";
import olVectorSource from "ol/source/Vector";
import View from "ol/View";
import React from "react";
import "./popup.css";
import { styleFunctionStates, styleFunctionTwitter } from "./util";
import { notification } from "antd";

export default class GeoJson extends React.Component {
  async componentDidMount() {
    document.title = "OpenLayers | GeoJson Example";

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

    try {
      const baseUrl = this.props.remote
        ? this.props.remote
        : window.location.origin;

      const layer1 = new olVectorLayer({
        source: new olVectorSource({
          format: new GeoJSON(),
          url: `${baseUrl}/twitter.json`,
        }),
        style: styleFunctionTwitter,
      });

      const layer2 = new olVectorLayer({
        source: new olVectorSource({
          format: new GeoJSON(),
          url: `${baseUrl}/states.json`,
        }),
        style: styleFunctionStates,
      });

      const map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          layer1,
          layer2,
        ],
        target: "map",
        overlays: [overlay],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
        }),
      });

      map.on("singleclick", function (event) {
        const features = [];
        map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          features.push(feature);
        });
        if (features.length > 0) {
          const coordinate = event.coordinate;
          let popupString = "";
          for (let i = 0; i < features.length; i++) {
            const properties = features[i].getProperties();
            let s;
            if (properties.name) {
              s = properties.name;
            } else {
              s = properties.text;
            }
            popupString += `Feature ${i}: ${s}<br/>`;
          }

          content.innerHTML = popupString;
          overlay.setPosition(coordinate);
        }
      });
    } catch (er) {
      console.log(er);
      notification.error({
        placement: "topLeft",
        message:
          "Unable to get data from remote. Try to use local data if problem persists.",
      });
      new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        target: "map",
        overlays: [overlay],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
        }),
      });
    }
  }

  render() {
    return (
      <div>
        <div id="map" style={{ height: "100vh", width: "100vw" }}></div>;
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer"></div>
          <div id="popup-content"></div>
        </div>
      </div>
    );
  }
}
