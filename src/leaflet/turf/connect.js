import React from "react";
import * as turf from "@turf/turf";
import { notification } from "antd";

export default class Connect extends React.Component {
  async componentDidMount() {
    document.title = "Leaflet | Turf LineString";

    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    try {
      const baseUrl = this.props.remote
        ? this.props.remote
        : window.location.origin;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mymap);

      const twitter = await (await fetch(`${baseUrl}/twitter.json`)).json();

      const turfFeatureCollection = turf.featureCollection(twitter.features);

      const flatCoords = [];
      turfFeatureCollection.features.forEach((feature) => {
        flatCoords.push(feature.geometry.coordinates);
      });

      const lineString = turf.lineString(flatCoords);

      L.geoJSON(twitter, {
        onEachFeature: (feature, layer) => {
          // does this feature have a property named popupContent?
          if (feature.properties) {
            const properties = feature.properties;
            this.popupElementTwitter(layer, properties);
          }
        },
      }).addTo(mymap);

      L.geoJSON(lineString).addTo(mymap);
    } catch (err) {
      notification.error({
        placement: "topLeft",
        description:
          "Unable to get data from remote. Try to use local data if problem persists.",
      });
    }
  }

  popupElementTwitter(layer, properties) {
    layer.bindPopup(`Text: ${properties.text} user: ${properties.user}`);
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }
}
