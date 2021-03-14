import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";
import * as turf from "@turf/turf";

export default class Connect extends React.Component {
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
      const twitterJson = await (
        await fetch(`${window.location.origin}/${window.location.pathname.split("/")[1]}/twitter.json`)
      ).json();

      const turfFeatureCollection = turf.featureCollection(
        twitterJson.features
      );

      const flatCoords = [];
      turfFeatureCollection.features.forEach((feature) => {
        flatCoords.push(feature.geometry.coordinates);
      });

      const lineString = turf.lineString(flatCoords);

      map.addSource("twitter", {
        type: "geojson",
        data: twitterJson,
      });

      map.addSource("turf", {
        type: "geojson",
        data: lineString,
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

      map.addLayer({
        id: "turf",
        source: "turf",
        type: "line",
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
      <>
        <div id="map"></div>
      </>
    );
  }
}
