import React from "react";
import * as turf from "@turf/turf";

export default class Connect extends React.Component {
  async componentDidMount() {
    document.title = "Leaflet | Turf LineString";

    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    const twitter = await (
      await fetch(`${window.location.origin}/twitter.json`)
    ).json();

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
  }

  popupElementTwitter(layer, properties) {
    layer.bindPopup(`Text: ${properties.text} user: ${properties.user}`);
  }

  render() {
    return (
      <>
        <div id="map" />
      </>
    );
  }
}
