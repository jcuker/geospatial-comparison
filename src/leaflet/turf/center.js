import React from "react";
import * as turf from "@turf/turf";
import { notification } from "antd";

export default class Center extends React.Component {
  async componentDidMount() {
    document.title = "Leaflet | Turf Center";

    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    try {
      const baseUrl = this.props.remote
        ? this.props.remote
        : window.location.origin;

      const states = await (await fetch(`${baseUrl}/states.json`)).json();

      const turfFeatureCollection = turf.featureCollection(states.features);
      const allCenters = [];

      turfFeatureCollection.features.forEach((feature) => {
        const center = turf.center(feature);
        center.properties = {
          name: feature.properties.name || "",
        };
        allCenters.push(center);
      });

      L.geoJSON(states, {
        onEachFeature: (feature, layer) => {
          // does this feature have a property named popupContent?
          if (feature.properties) {
            const properties = feature.properties;
            this.popupElementStates(layer, properties);
          }
        },
      }).addTo(mymap);

      const centerFeatureCollection = turf.featureCollection(allCenters);
      L.geoJSON(centerFeatureCollection, {
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            const properties = feature.properties;
            this.popupElementCenter(layer, properties);
          }
        },
      }).addTo(mymap);
    } catch (err) {
      notification.error({
        placement: "topLeft",
        description:
          "Unable to get data from remote. Try to use local data if problem persists.",
      });
    }
  }

  popupElementStates(layer, properties) {
    layer.bindPopup(`Name: ${properties.name} id: ${properties.id}`);
  }

  popupElementCenter(layer, properties) {
    layer.bindPopup(`Center of ${properties.name}`);
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }
}
