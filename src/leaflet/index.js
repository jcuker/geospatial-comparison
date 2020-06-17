import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
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

export default class Leaflet extends React.Component {
  state = {
    collapsed: false,
    key: "1",
    turf: false,
  };

  componentDidMount() {
    const splitPathname = window.location.pathname.split("/");
    const key = splitPathname[splitPathname.length - 1];
    this.setState({ key });
    if (key >= 5 && key < 9) {
      this.setState({ turf: true });
    }
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  onSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
    this.setState({ key });
    if (key !== "999")
      this.props.history.replace({ pathname: `/leaflet/${key}` });
  };

  getLeafletMap = () => {
    switch (this.state.key) {
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
            </SubMenu>{" "}
            <Menu.Item
              key="999"
              onClick={() => {
                this.props.history.push(`/ol/${this.state.key}`);
              }}
            >
              Goto OpenLayers
            </Menu.Item>
          </Menu>
        </div>
        {this.getLeafletMap()}
      </div>
    );
  }
}

/**
 * import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import "antd/dist/antd.css";
import React from "react";
import Drawing from "./drawing";
import Simple from "./simple";
import Popup from "./popup";
import GeoJSON from "./geojson";

export default class Leaflet extends React.Component {
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

  getLeafletMap = () => {
    switch (this.state.key) {
      case "1":
        return <Simple />;
      case "2":
        return <Drawing />;
      case "3":
        return <Popup />;
      case "4":
        return <GeoJSON />;
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
          }}
        >
          <Button
            type="primary"
            onClick={this.toggleCollapsed}
            style={{
              position: "absolute",
              top: 10,
              left: this.state.collapsed ? "2.5rem" : "12.25rem",
              display: "flex",
              height: "1.5rem",
              width: "1rem",
              justifyContent: "center",
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
              display: this.state.collapsed ? "none" : "block",
            }}
            onSelect={this.onSelect}
          >
            <Menu.Item key="1">Basic Example</Menu.Item>
            <Menu.Item key="2">Drawing Shapes</Menu.Item>
            <Menu.Item key="3">Popup at Click</Menu.Item>
            <Menu.Item key="4">GeoJSON</Menu.Item>
          </Menu>
        </div>
        {this.getLeafletMap()}
      </div>
    );
  }
}

 */
