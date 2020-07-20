import "antd/dist/antd.css";
import React from "react";
import ComponentWrapper from "../ComponentWrapper";
import Drawing from "./drawing";
import GeoJSON from "./geojson";
import Popup from "./popup";
import Radar from "./radar";
import Simple from "./simple";
import Center from "./turf/center";
import Connect from "./turf/connect";

export default function Leaflet() {
  function mapResolver(key) {
    switch (key) {
      case "1":
        return <Simple />;
      case "2":
        return <Drawing />;
      case "3":
        return <Popup />;
      case "4":
        return <GeoJSON />;
      case "5":
        return <Connect />;
      case "6":
        return <Center />;
      case "7":
        return <Radar />;
      default:
        return <Simple />;
    }
  }

  return <ComponentWrapper framework="leaflet" mapResolver={mapResolver} />;
}
