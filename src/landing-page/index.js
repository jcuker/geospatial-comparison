import React from "react";
import { Link } from "react-router-dom";
import { Divider } from "antd";
import "./landing-page.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Link to="/leaflet/1" id="leaflet" className="framework">
        <img
          src="https://leafletjs.com/docs/images/logo.png"
          alt="to leaflet"
        />
      </Link>

      <Divider className="divider" />

      <Link to="/ol/1" id="ol" className="framework">
        <img
          src="https://financesonline.com/uploads/2019/09/OpenLayers-logo1.png"
          alt="to openlayers"
        />
      </Link>

      <Divider className="divider" />

      <Link to="/mapbox/1" id="mapbox" className="framework">
        <img src="https://logodix.com/logo/1863638.png" alt="to mapbox" />
      </Link>
    </div>
  );
}
