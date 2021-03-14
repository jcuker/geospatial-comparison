import React from "react";
import * as turfHelpers from "@turf/helpers";
import turfCenter from "@turf/center";

export default class Center extends React.Component {
  async componentDidMount() {
    document.title = "Leaflet | Turf Center";

    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    const states = await (
      await fetch(`${window.location.origin}/${window.location.pathname.split("/")[1]}/states.json`)
    ).json();

    const turfFeatureCollection = turfHelpers.featureCollection(states.features);
    const allCenters = [];

    turfFeatureCollection.features.forEach((feature) => {
      const center = turfCenter(feature);
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

    const centerFeatureCollection = turfHelpers.featureCollection(allCenters);
    L.geoJSON(centerFeatureCollection, {
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const properties = feature.properties;
          this.popupElementCenter(layer, properties);
        }
      },
    }).addTo(mymap);
  }

  popupElementStates(layer, properties) {
    layer.bindPopup(`Name: ${properties.name} id: ${properties.id}`);
  }

  popupElementCenter(layer, properties) {
    layer.bindPopup(`Center of ${properties.name}`);
  }

  render() {
    return (
      <>
        <div id="map" />
      </>
    );
  }
}
