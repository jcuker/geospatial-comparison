import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Menu } from "antd";
import "antd/dist/antd.css";
import SubMenu from "antd/lib/menu/SubMenu";
import React from "react";
import { withRouter } from "react-router-dom";

/**
 * Expects props to be like such:
 * {
 *  framework: 'leaflet' | 'ol' | 'mapbox,
 *  mapResolver: (key: number) => JSX.Element;
 * }
 */
class ComponentWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      key: "1",
      turf: false,
    };
  }

  componentDidMount() {
    const splitPathname = window.location.pathname.split("/");
    const key = splitPathname[splitPathname.length - 1];
    this.setState({ key });
    if (key >= 5 && key < 7) {
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
    if (key < 1000)
      this.props.history.replace({
        pathname: `/${this.props.framework}/${key}`,
      });
  };

  getNavItems = () => {
    const ol = (
      <Menu.Item
        key="1000"
        onClick={() => {
          this.props.history.push(`/ol/${this.state.key}`);
        }}
      >
        Goto OpenLayers
      </Menu.Item>
    );

    const leaflet = (
      <Menu.Item
        key="1001"
        onClick={() => {
          this.props.history.push(`/leaflet/${this.state.key}`);
        }}
      >
        Goto Leaflet
      </Menu.Item>
    );

    const mapbox = (
      <Menu.Item
        key="1002"
        onClick={() => {
          this.props.history.push(`/mapbox/${this.state.key}`);
        }}
      >
        Goto Mapbox
      </Menu.Item>
    );

    switch (this.props.framework) {
      case "leaflet":
        return [ol, mapbox];
      case "ol":
        return [leaflet, mapbox];
      case "mapbox":
        return [leaflet, ol];
      default:
        return [leaflet, ol, mapbox];
    }
  };

  render() {
    const menuNavItems = this.getNavItems();
    const map = this.props.mapResolver(this.state.key);

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
            </SubMenu>
            <Menu.Item key="7">Radar</Menu.Item>
            {[...menuNavItems]}
          </Menu>
        </div>
        {map}
      </div>
    );
  }
}

export default withRouter(ComponentWrapper);
