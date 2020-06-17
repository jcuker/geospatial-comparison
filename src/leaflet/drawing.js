/**
 *
 * There exists a plugin for drawing here: https://github.com/Leaflet/Leaflet.draw
 * This demo is restricted to vanilla features though.
 */

import { notification } from "antd";
import React from "react";

export default class Drawing extends React.Component {
  map = undefined;

  constructor() {
    super();
    this.state = {
      gesture: undefined,
      rect: undefined,
    };
  }

  componentDidMount() {
    document.title = "Leaflet | Drawing Example";

    notification.destroy();
    notification.info({
      message: "Drawing Limited",
      description:
        "Leaflet does not have built-in support for a robust drawing feature. Drawing a rectangle is easy to do, but a full-fledged drawing system is way more complex. Click the map once to anchor one point and then click another point to finish the rectangle. You will not be able to see the drawing in progress though. See source for additional comments.",
      placement: "topLeft",
      duration: 20,
    });

    const L = window.L;

    const mymap = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    const marker = L.marker([51.5, -0.09]).addTo(mymap);

    const circle = L.circle([51.508, -0.11], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: 500,
    }).addTo(mymap);

    const polygon = L.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047],
    ]).addTo(mymap);

    marker.bindPopup("I am a marker.");
    circle.bindPopup("I am a circle.");
    polygon.bindPopup("I am a polygon.");

    this.map = mymap;

    mymap.on("click", (e) => {
      if (this.state.gesture) {
        const startingLatLng = this.state.gesture.initial.latlng;
        const endingLatLng = e.latlng;

        this.setState({
          gesture: undefined,
          rect: {
            startingLatLng: [startingLatLng.lat, startingLatLng.lng],
            endingLatLng: [endingLatLng.lat, endingLatLng.lng],
          },
        });
      } else {
        this.setState({
          gesture: {
            initial: e,
          },
          rect: undefined,
        });
      }
    });
  }

  componentWillUnmount() {
    notification.destroy();
  }

  componentDidUpdate() {
    if (this.state.rect) {
      const L = window.L;
      const drawn = L.rectangle(
        [
          [...this.state.rect.startingLatLng],
          [...this.state.rect.endingLatLng],
        ],
        {
          color: "#ff7800",
          weight: 5,
        }
      ).addTo(this.map);

      drawn.bindPopup("You drew me :)");
    }
  }
  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
      </div>
    );
  }
}
