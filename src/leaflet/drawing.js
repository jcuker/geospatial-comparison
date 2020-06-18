/**
 *
 * There exists a plugin for drawing here: https://github.com/Leaflet/Leaflet.draw
 * This demo is restricted to vanilla features though.
 */

import React from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Modal, Button, notification } from "antd";

export default class Drawing extends React.Component {
  map = undefined;
  rects = [];

  constructor() {
    super();
    this.state = {
      gesture: undefined,
      finishedRect: undefined,
      modalOpen: false,
    };
  }

  componentDidMount() {
    document.title = "Leaflet | Drawing Example";

    notification.destroy();
    notification.info({
      message: "Drawing",
      description:
        "Clicking on the map will begin to draw a rectangle. Click the button in the bottom right for more information.",
      placement: "topLeft",
      duration: 5,
    });

    const L = window.L;

    const mymap = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    const marker = L.marker([51.5, -0.09]).addTo(mymap);

    const circle = L.circle([51.508, -0.11], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: 500,
    }).addTo(mymap);

    const polygon = L.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047],
    ]).addTo(mymap);

    marker.bindPopup("I am a marker.");
    circle.bindPopup("I am a circle.");
    polygon.bindPopup("I am a polygon.");

    this.map = mymap;

    mymap.on("click", (e) => {
      if (this.state.gesture) {
        const startingLatLng = this.state.gesture.inProgressRect.startingLatLng;
        const endingLatLng = e.latlng;

        this.setState({
          gesture: undefined,
          finishedRect: {
            startingLatLng: [...startingLatLng],
            endingLatLng: [endingLatLng.lat, endingLatLng.lng],
          },
        });
      } else {
        this.setState({
          gesture: {
            initial: e,
            inProgressRect: {
              startingLatLng: [e.latlng.lat, e.latlng.lng],
            },
          },
        });
      }
    });

    mymap.on("mousemove", (e) => {
      if (
        this.state.gesture &&
        this.state.gesture.inProgressRect &&
        this.state.gesture.inProgressRect.startingLatLng
      ) {
        const endingLatLng = e.latlng;

        this.setState({
          gesture: {
            inProgressRect: {
              startingLatLng: [
                ...this.state.gesture.inProgressRect.startingLatLng,
              ],
              endingLatLng: [endingLatLng.lat, endingLatLng.lng],
            },
          },
        });
      }
    });
  }

  componentWillUnmount() {
    notification.destroy();
  }

  componentDidUpdate(prevProps, prevState) {
    const L = window.L;

    if (this.rects.length > 0 && this.rects[this.rects.length - 1].temporary) {
      const rectToRemove = this.rects.pop();
      this.map.removeLayer(rectToRemove);
    }

    if (this.state.finishedRect) {
      const drawn = L.rectangle(
        [
          [...this.state.finishedRect.startingLatLng],
          [...this.state.finishedRect.endingLatLng],
        ],
        {
          color: "#ff7800",
          weight: 5,
        }
      ).addTo(this.map);

      drawn.bindPopup("You drew me :)");
      this.rects.push(drawn);

      this.setState({ finishedRect: undefined });
    } else if (
      this.state.gesture &&
      this.state.gesture.inProgressRect.startingLatLng &&
      this.state.gesture.inProgressRect.endingLatLng
    ) {
      const drawn = L.rectangle(
        [
          [...this.state.gesture.inProgressRect.startingLatLng],
          [...this.state.gesture.inProgressRect.endingLatLng],
        ],
        {
          color: "#ff7800",
          weight: 5,
        }
      ).addTo(this.map);

      drawn["temporary"] = true;
      this.rects.push(drawn);
    }
  }

  openInfo = () => {
    notification.destroy();
    this.setState({ modalOpen: true });
  };

  closeModal = (e) => {
    this.setState({
      modalOpen: false,
    });
  };

  render() {
    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
        <Button
          type="primary"
          onClick={this.openInfo}
          style={{
            position: "absolute",
            bottom: 5,
            left: 5,
            zIndex: 999,
          }}
        >
          {React.createElement(InfoCircleOutlined)}
        </Button>

        <Modal
          title="Drawing in Leaflet"
          visible={this.state.modalOpen}
          footer={[
            <Button key="ok" onClick={this.closeModal}>
              OK
            </Button>,
          ]}
        >
          <p>
            Leaflet does not have built-in support for a robust drawing feature.
            Drawing a rectangle is easy enough to do, but a full-fledged drawing
            system is way more complex. Click the map once to anchor one point
            and then click another point to finish the rectangle. See source for
            additional comments.
          </p>
        </Modal>
      </div>
    );
  }
}
