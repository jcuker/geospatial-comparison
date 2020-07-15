import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudServerOutlined,
  HddOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import "antd/dist/antd.css";
import React from "react";
import Drawing from "./drawing";
import Simple from "./simple";
import Popup from "./popup";
import GeoJSON from "./geojson";
import Connect from "./turf/connect";
import Center from "./turf/center";
import Radar from "./radar";

export default class Leaflet extends React.Component {
  state = {
    collapsed: false,
    key: "1",
    turf: false,
    remote: false,
    remoteUrl: "",
  };

  async componentDidMount() {
    const splitPathname = window.location.pathname.split("/");
    const key = splitPathname[splitPathname.length - 1];
    if (key >= 5 && key < 7) {
      this.setState({ turf: true });
    }

    const jsonConfig = await (
      await fetch(`${window.location.origin}/env.json`)
    ).json();

    this.setState({
      key,
      turf: key >= 5 && key < 7,
      remoteUrl: jsonConfig.geoserverUrl,
    });
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  toggleRemote = () => {
    this.setState({
      remote: !this.state.remote,
    });
  };

  onSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    this.setState({ key });
    if (key < 1000) this.props.history.replace({ pathname: `/leaflet/${key}` });
  };

  getLeafletMap = () => {
    const componentKey = `${String(this.state.remote)}-${this.state.key}`;

    switch (this.state.key) {
      case "1":
        return <Simple key={componentKey} />;
      case "2":
        return <Drawing key={componentKey} />;
      case "3":
        return <Popup key={componentKey} />;
      case "4":
        return (
          <GeoJSON
            key={componentKey}
            remote={this.state.remote ? this.state.remoteUrl : undefined}
          />
        );
      case "5":
        return (
          <Connect
            key={componentKey}
            remote={this.state.remote ? this.state.remoteUrl : undefined}
          />
        );
      case "6":
        return (
          <Center
            key={componentKey}
            remote={this.state.remote ? this.state.remoteUrl : undefined}
          />
        );
      case "7":
        return (
          <Radar
            key={componentKey}
            remote={this.state.remote ? this.state.remoteUrl : undefined}
          />
        );
      default:
        return <Simple key={componentKey} />;
    }
  };

  render() {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <div
          style={{
            position: "absolute",
            zIndex: 999999,
            right: 0,
          }}
        >
          <Button
            type="primary"
            onClick={this.toggleCollapsed}
            style={{
              position: "absolute",
              top: 7.5,
              right: this.state.collapsed ? 5 : "12.25rem",
            }}
          >
            {React.createElement(
              this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined
            )}
          </Button>
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
          <Menu
            selectedKeys={[this.state.key]}
            openKeys={[this.state.turf ? "turf" : ""]}
            mode="inline"
            theme="dark"
            style={{
              height: "100vh",
              width: this.state.collapsed ? "0rem" : "12rem",
            }}
            onSelect={this.onSelect}
          >
            <Menu.Item key="1">Just a Map</Menu.Item>
            <Menu.Item key="2">Drawing Shapes</Menu.Item>
            <Menu.Item key="3">Popup at Click</Menu.Item>
            <Menu.Item key="4">GeoJSON</Menu.Item>
            <SubMenu
              key="turf"
              title="Turf"
              onTitleClick={() => this.setState({ turf: !this.state.turf })}
            >
              <Menu.Item key="5">Connect the Dots</Menu.Item>
              <Menu.Item key="6">Center of States</Menu.Item>
            </SubMenu>
            <Menu.Item key="7">Radar</Menu.Item>
            <Menu.Item
              key="1000"
              onClick={() => {
                this.props.history.push(`/ol/${this.state.key}`);
              }}
            >
              Goto OpenLayers
            </Menu.Item>
            <Menu.Item
              key="1001"
              onClick={() => {
                this.props.history.push(`/mapbox/${this.state.key}`);
              }}
            >
              Goto Mapbox
            </Menu.Item>
          </Menu>
        </div>
        {this.getLeafletMap()}
      </div>
    );
  }
}
