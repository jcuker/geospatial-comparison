import React from "react";
import { Link } from "react-router-dom";
import { Divider } from "antd";
import "./landing-page.css";

export default function LandingPage() {
  function mouseEnter(e, color) {
    const div = e.nativeEvent.target;
    div.style.color = "green";
  }

  function mouseLeave() {}
  return (
    <div className="landing-page">
      <Link
        to="/leaflet/1"
        onMouseEnter={(e) => mouseEnter(e, "")}
        onMouseLeave={mouseLeave}
        className="leaflet"
      >
        <img
          src="https://leafletjs.com/docs/images/logo.png"
          alt="to leaflet"
        />
      </Link>
      <Divider
        style={{
          margin: 0,
          padding: 0,
          borderTop: "1px solid rgb(97, 97, 97)",
        }}
      />
      <Link
        to="/ol/1"
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        className="ol"
      >
        <img
          src="https://financesonline.com/uploads/2019/09/OpenLayers-logo1.png"
          alt="to openlayers"
        />
      </Link>
      <Divider
        style={{
          margin: 0,
          padding: 0,
          borderTop: "1px solid rgb(97, 97, 97)",
        }}
      />
      <Link
        to="/mapbox/1"
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        className="mapbox"
      >
        <img src="https://logodix.com/logo/1863638.png" alt="to mapbox" />
      </Link>
    </div>
  );
}
