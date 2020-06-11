import React, { useEffect } from "react";

export default function App() {
  useEffect(() => {
    console.log(window.L);
    const L = window.L;

    const mymap = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);
  });

  const state = {
    lat: 51.505,
    lng: -0.09,
    zoom: 13,
  };

  const position = [state.lat, state.lng];

  return (
    <div style={{ height: 500, width: 500 }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
