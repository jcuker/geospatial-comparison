import * as turf from "@turf/turf";
import { Map, View } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import olVectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import olVectorSource from "ol/source/Vector";
import React from "react";
import { styleFunctionStates } from "../util";
import Overlay from "ol/Overlay";

export default class Center extends React.Component {
  async componentDidMount() {
    document.title = "OpenLayers | Turf Center";

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

    const statesResponse = await fetch(`${window.location.origin}/states.json`);
    const geoJson = await statesResponse.json();

    const source = new olVectorSource();
    const format = new GeoJSON();
    const features = format.readFeatures(geoJson);

    // GeoJson's default projection is 4326 while OL's is 3857
    features.map((feature) =>
      feature.getGeometry().transform("EPSG:4326", "EPSG:3857")
    );

    // work with raw json
    for (const feature of geoJson.features) {
      const polygon = turf.multiPolygon(feature.geometry.coordinates);
      const center = turf.center(polygon);
      const lineStringFeature = format.readFeature(center);
      lineStringFeature.setProperties({
        name: "Center of " + feature.properties.name,
      });
      source.addFeature(lineStringFeature);
    }

    source.getFeatures().forEach((feature) => {
      feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
    });

    const vectorLayer = new olVectorLayer({
      source: source,
    });

    const rasterLayer = new TileLayer({
      source: new OSM(),
    });

    const statesLayer = new olVectorLayer({
      source: new olVectorSource({
        format: new GeoJSON(),
        features,
      }),
      style: styleFunctionStates,
    });

    const map = new Map({
      layers: [rasterLayer, vectorLayer, statesLayer],
      target: document.getElementById("map"),
      view: new View({
        center: fromLonLat([-90.81070553065938, 40.716527262756514]),
        zoom: 4,
      }),
      overlays: [overlay],
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
          popupString += `Feature ${i}: ${s}<br />`;
        }

        content.innerHTML = popupString;
        overlay.setPosition(coordinate);
      }
    });
  }

  render() {
    return (
      <div className="wrapper">
        <div id="map"></div>
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer"></div>
          <div id="popup-content"></div>
        </div>
      </div>
    );
  }
}
