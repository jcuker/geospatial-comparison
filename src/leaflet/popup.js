import React from "react";

export default class Popup extends React.Component {
  componentDidMount() {
    const L = window.L;

    const mymap = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    mymap.on("click", (e) => {
      L.popup()
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
    });
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }
}
