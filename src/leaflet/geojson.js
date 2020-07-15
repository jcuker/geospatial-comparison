import React from "react";
import { notification } from "antd";

export default class GeoJson extends React.Component {
  async componentDidMount() {
    document.title = "Leaflet | GeoJson Example";

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
      const twitter = await (await fetch(`${baseUrl}/twitter.json`)).json();

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
