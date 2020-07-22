import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";

class Simple extends React.Component {
  map = undefined;

  componentDidMount() {
    document.title = "Mapbox | Simple Example";

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
      <>
        <div id="map"></div>
      </>
    );
  }
}

export default Simple;
