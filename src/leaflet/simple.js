import React from "react";

export default class Simple extends React.Component {
  componentDidMount() {
    document.title = "Leaflet | Simple Example";

    // Since Leaftet is added via the root index.html file, we have to get access to the L object via the window.
    const L = window.L;

    const map = L.map("map").setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }

  render() {
    return (
      <>
        <div id="map" />
      </>
    );
  }
}
