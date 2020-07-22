import React from "react";

export default class Popup extends React.Component {
  componentDidMount() {
    document.title = "Leaflet | Popup Example";

    const L = window.L;

    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

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
      <>
        <div id="map" />
      </>
    );
  }
}
