import React from "react";

export default class GeoJson extends React.Component {
  async componentDidMount() {
    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    const states = await (await fetch("states-geojson.json")).json();
    const twitter = await (await fetch("twitter.json")).json();

    L.geoJSON(states, {
      onEachFeature: (feature, layer) => {
        // does this feature have a property named popupContent?
        if (feature.properties) {
          const properties = feature.properties;
          this.popupElementStates(layer, properties);
        }
      },
    }).addTo(mymap);

    L.geoJSON(twitter, {
      onEachFeature: (feature, layer) => {
        // does this feature have a property named popupContent?
        if (feature.properties) {
          const properties = feature.properties;
          this.popupElementTwitter(layer, properties);
        }
      },
    }).addTo(mymap);
  }

  popupElementStates(layer, properties) {
    layer.bindPopup(`Name: ${properties.name} id: ${properties.id}`);
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
