import { CloudServerOutlined, HddOutlined } from "@ant-design/icons";
import { Button } from "antd";
import "antd/dist/antd.css";
import React from "react";
import ComponentWrapper from "../ComponentWrapper";
import Drawing from "./drawing";
import GeoJson from "./geojson";
import Popup from "./popup";
import Radar from "./radar";
import Simple from "./simple";
import Center from "./turf/center";
import Connect from "./turf/connect";
// custom css to style popups
import "./ol.css";
// Openlayer's OWN css
import "ol/ol.css";

export default class OpenLayers extends React.Component {
  constructor() {
    super();
    this.state = {
      remote: false,
      remoteUrl: "",
    };
  }

  async componentDidMount() {
    const jsonConfig = await (
      await fetch(`${window.location.origin}/env.json`)
    ).json();

    this.setState({
      remoteUrl: jsonConfig.geoserverUrl,
    });
  }

  toggleRemote = () => {
    this.setState({
      remote: !this.state.remote,
    });
  };

  mapResolver = (key) => {
    const componentKey = `${String(this.state.remote)}-${key}`;

    switch (key) {
      case "1":
        return <Simple />;
      case "2":
        return <Drawing />;
      case "3":
        return <Popup />;
      case "4":
        return <GeoJson />;
      case "5":
        return <Connect />;
      case "6":
        return <Center />;
      case "7":
        const dataLocationButton = (
          <Button
            type="primary"
            onClick={this.toggleRemote}
            style={{
              position: "absolute",
              top: 45,
              right: this.state.collapsed ? 5 : "12.25rem",
            }}
          >
            {React.createElement(
              this.state.remote ? CloudServerOutlined : HddOutlined
            )}
          </Button>
        );
        return (
          <>
            <Radar
              key={componentKey}
              remote={this.state.remote ? this.state.remoteUrl : undefined}
            />
            {dataLocationButton}
          </>
        );
      default:
        return <Simple />;
    }
  };

  render() {
    return <ComponentWrapper framework="ol" mapResolver={this.mapResolver} />;
  }
}
