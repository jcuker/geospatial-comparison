import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";

class Simple extends React.Component {
  map = undefined;

  componentDidMount() {
    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    this.map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 1,
    });

    this.map.addControl(new mapbox.NavigationControl(), "top-left");
  }

  render() {
    return (
      <div style={{ height: "100vh", width: "100vw" }}>
        <div style={{ height: "100%", width: "100%" }} id="map"></div>
      </div>
    );
  }
}

export default Simple;
