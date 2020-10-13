import React from "react";

export default class Popup extends React.Component {
  componentDidMount() {
    document.title = "Leaflet | Popup Example";

    const L = window.L;

    // Create a Leaflet map that corresponds to the div with id "map"
    const mymap = L.map("map").setView([37.71859, -92.007813], 4);

    // Use OpenStreetMap as the map's tileset
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    // Set a popup to open at the coordinates where a mouse click occurrs
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
