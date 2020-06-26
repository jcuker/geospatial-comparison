import React from "react";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
import { notification } from "antd";

export default class Simple extends React.Component {
  componentDidMount() {
    document.title = "Mapbox | Drawing Example";

    notification.destroy();
    notification.info({
      message: "Drawing",
      description:
        "Choose a drawing capability from the toolbar below the zoom controls in the top left of the screen!",
      placement: "topLeft",
      duration: 5,
    });

    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    const map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-90, 40],
      zoom: 3,
    });

    map.addControl(new mapbox.NavigationControl(), "top-left");
    map.addControl(new MapboxDraw(), "top-left");
  }

  render() {
    return (
      <div style={{ height: "100vh", width: "100vw" }}>
        <div style={{ height: "100%", width: "100%" }} id="map"></div>
      </div>
    );
  }
}
