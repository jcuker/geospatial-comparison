import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import "antd/dist/antd.css";
import React from "react";
import Simple from "./simple";
import Shapes from "./shapes";
import Popup from "./popup";
import { useHistory } from "react-router-dom";
import GeoJson from "./geojson";

export default class OpenLayers extends React.Component {
  state = {
    collapsed: false,
    key: "1",
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  onSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    this.setState({ key });
  };

  getOlMap = () => {
    switch (this.state.key) {
      case "1":
        return <Simple />;
      case "2":
        return <Shapes />;
      case "3":
        return <Popup />;
      case "4":
        return <GeoJson />;
      case "999":
        this.props.history.push("/leaflet");
        return;
      default:
        return <Simple />;
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
          <Menu
            defaultSelectedKeys={["1"]}
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
            <Menu.Item key="999">Goto Leaflet</Menu.Item>
          </Menu>
        </div>
        {this.getOlMap()}
      </div>
    );
  }
}
