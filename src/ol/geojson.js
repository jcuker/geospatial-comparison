import GeoJSON from "ol/format/GeoJSON";
import { Tile as TileLayer } from "ol/layer";
import olVectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import "ol/ol.css";
import Overlay from "ol/Overlay";
import { OSM } from "ol/source";
import olVectorSource from "ol/source/Vector";
import olCircle from "ol/style/Circle";
import olFill from "ol/style/Fill";
import olStroke from "ol/style/Stroke";
import olStyle from "ol/style/Style";
import olText from "ol/style/Text";
import View from "ol/View";
import React from "react";
import "./popup.css";

export default class GeoJson extends React.Component {
  async componentDidMount() {
    var container = document.getElementById("popup");
    var content = document.getElementById("popup-content");
    var closer = document.getElementById("popup-closer");
    /**
     * Create an overlay to anchor the popup to the map.
     */
    var overlay = new Overlay({
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
      const layer1 = new olVectorLayer({
        source: new olVectorSource({
          format: new GeoJSON(),
          url: "twitter.json",
        }),
        style: this.styleFunctionTwitter,
      });

      const layer2 = new olVectorLayer({
        source: new olVectorSource({
          format: new GeoJSON(),
          url: "states-geojson.json",
        }),
        style: this.styleFunctionStates,
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
          center: [0, 0],
          zoom: 2,
        }),
      });

      map.on("singleclick", function (event) {
        const features = [];
        map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          features.push(feature);
        });
        if (features.length > 0) {
          var coordinate = event.coordinate;
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
      return null;
    }
  }

  styleFunctionTwitter = () => {
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

  styleFunctionStates = (feature) => {
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

  render() {
    return (
      <div>
        <div id="map" style={{ height: "100vh", width: "100vw" }}></div>;
        <div id="popup" className="ol-popup">
          <a href="#" id="popup-closer" className="ol-popup-closer"></a>
          <div id="popup-content"></div>
        </div>
      </div>
    );
  }
}
