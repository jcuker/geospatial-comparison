import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";

export default class Simple extends React.Component {
  componentDidMount() {
    document.title = "Mapbox | Popup Example";

    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    const map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-90, 40],
      zoom: 3,
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
      <>
        <div id="map"></div>
      </>
    );
  }
}
