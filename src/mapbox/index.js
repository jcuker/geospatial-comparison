import "antd/dist/antd.css";
import {
  MehOutlined
} from '@ant-design/icons';
import React from "react";
import ComponentWrapper from "../ComponentWrapper";
import Drawing from "./drawing";
import GeoJSON from "./geojson";
import Popup from "./popup";
import Radar from "./radar";
import Simple from "./simple";
import Center from "./turf/center";
import Connect from "./turf/connect";
import "./mapbox.css";

export default function Mapbox() {
  // function mapResolver(key) {
  //   switch (key) {
  //     case "1":
  //       return <Simple />;
  //     case "2":
  //       return <Drawing />;
  //     case "3":
  //       return <Popup />;
  //     case "4":
  //       return <GeoJSON />;
  //     case "5":
  //       return <Connect />;
  //     case "6":
  //       return <Center />;
  //     case "7":
  //       return <Radar />;
  //     default:
  //       return <Simple />;
  //   }
  // }

  // return <ComponentWrapper framework="mapbox" mapResolver={mapResolver} />;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      justifyContent: "center",
      textAlign: "center"
    }}>
      <MehOutlined style={{ fontSize: '6rem', marginBottom: 12 }} />
      <span>Mapbox is unable to run based on how I host this example app. Feel free to clone, provide your own API key, and then run the examples locally. I apologize for any inconvenience. </span>
    </div>
  )
}
