import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";
import "./popup.css";

export default class Simple extends React.Component {
  componentDidMount() {
    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    const map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-77.04, 38.907],
      zoom: 11.15,
    });

    map.addControl(new mapbox.NavigationControl(), "top-left");
    map.on("click", function (e) {
      const lngLat = e.lngLat;

      const htmlStr = `<p>You clicked at ${JSON.stringify(lngLat)}</p>`;

      new mapbox.Popup().setLngLat(lngLat).setHTML(htmlStr).addTo(map);
    });
  }

  render() {
    return (
      <div style={{ height: "100vh", width: "100vw" }}>
        <div style={{ height: "100%", width: "100%" }} id="map"></div>
      </div>
    );
  }
}
