import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";
import "./popup.css";

export default class Simple extends React.Component {
  async componentDidMount() {
    document.title = "Mapbox | GeoJson Example";
    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    const map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-90, 40],
      zoom: 3,
    });
    map.addControl(new mapbox.NavigationControl(), "top-left");

    map.on("load", async function () {
      const statesJson = await (
        await fetch(`${window.location.origin}/states.json`)
      ).json();

      const twitterJson = await (
        await fetch(`${window.location.origin}/twitter.json`)
      ).json();

      map.addSource("states", {
        type: "geojson",
        data: statesJson,
      });

      map.addSource("twitter", {
        type: "geojson",
        data: twitterJson,
      });

      map.addLayer({
        id: "states",
        source: "states",
        type: "fill",
        paint: {
          "fill-color": "#03a9f4",
          "fill-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "twitter",
        source: "twitter",
        type: "symbol",
        layout: {
          "icon-image": [
            "coalesce",
            ["image", ["concat", ["get", "icon"], "-15"]],
            ["image", "marker-15"],
          ],
        },
      });

      map.on("click", function (e) {
        const features = map.queryRenderedFeatures(e.point);
        if (!features || features.length <= 0) {
          return;
        }

        let descStr = "";
        for (let i = 0; i < features.length; i++) {
          const properties = features[i].properties;
          if (properties.name) {
            descStr += `Feature ${i}: ${properties.name}<br/>`;
          } else if (properties.text) {
            descStr += `Feature ${i}: ${properties.user} tweeted "${properties.text}"</br>`;
          } else {
            const unknownString =
              Object.keys(properties).length > 0
                ? JSON.stringify(properties)
                : features[i].layer.id || "Unknown Layer";

            descStr += `Feature ${i}: ${unknownString}<br/>`;
          }
        }

        const coordinates = e.lngLat;

        new mapbox.Popup()
          .setLngLat(coordinates)
          .setHTML(`<p>${descStr}</p>`)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the states layer.
      map.on("mouseenter", "states", function () {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "states", function () {
        map.getCanvas().style.cursor = "";
      });

      // Change the cursor to a pointer when the mouse is over the states layer.
      map.on("mouseenter", "twitter", function () {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "twitter", function () {
        map.getCanvas().style.cursor = "";
      });
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
