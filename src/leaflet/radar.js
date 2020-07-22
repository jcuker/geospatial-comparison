import React from "react";
import { Button, notification } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";

export default class Radar extends React.Component {
  L = window.L;

  radarLayers = [];
  timestamps = [];
  animationTimer = undefined;
  animationPosition = -1;

  constructor() {
    super();
    this.state = {
      playing: false,
    };
  }

  async componentDidMount() {
    document.title = "Leaflet | Radar Example";

    notification.destroy();
    notification.info({
      message: "Radar",
      description:
        "Press the play button in the lower-left corner to start the radar animation",
      placement: "topLeft",
      duration: 5,
    });

    this.map = this.L.map("map").setView([37.71859, -92.007813], 5);

    this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '& <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.timestamps = await (
      await fetch("https://api.rainviewer.com/public/maps.json")
    ).json();
  }

  componentWillUnmount() {
    notification.destroy();
  }

  /**
   * Animation functions
   * @param ts
   */
  addLayer = (ts) => {
    if (!this.radarLayers[ts]) {
      this.radarLayers[ts] = new this.L.TileLayer(
        "https://tilecache.rainviewer.com/v2/radar/" +
          ts +
          "/256/{z}/{x}/{y}/2/1_1.png",
        {
          tileSize: 256,
          opacity: 0.001,
          zIndex: ts,
        }
      );
    }

    if (!this.map.hasLayer(this.radarLayers[ts])) {
      this.map.addLayer(this.radarLayers[ts]);
    }
  };

  changeRadarPosition = (position, preloadOnly) => {
    while (position >= this.timestamps.length) {
      position -= this.timestamps.length;
    }
    while (position < 0) {
      position += this.timestamps.length;
    }

    var currentTimestamp = this.timestamps[this.animationPosition];
    var nextTimestamp = this.timestamps[position];

    this.addLayer(nextTimestamp);

    if (preloadOnly) {
      return;
    }

    this.animationPosition = position;

    if (this.radarLayers[currentTimestamp]) {
      this.radarLayers[currentTimestamp].setOpacity(0);
    }

    this.radarLayers[nextTimestamp].setOpacity(100);
  };

  /**
   * Stop the animation
   * Check if the animation timeout is set and clear it.
   */
  stop = () => {
    if (this.animationTimer !== undefined) {
      clearTimeout(this.animationTimer);
      this.animationTimer = undefined;
      this.setState({ playing: false });
      return true;
    }
    return false;
  };

  play = () => {
    this.showFrame(this.animationPosition + 1);

    // Main animation driver. Run this function every 500 ms
    this.animationTimer = setTimeout(this.play, 500);
    this.setState({ playing: true });
  };

  showFrame = (nextPosition) => {
    var preloadingDirection =
      nextPosition - this.animationPosition > 0 ? 1 : -1;

    this.changeRadarPosition(nextPosition);

    // preload next next frame (typically, +1 frame)
    // if don't do that, the animation will be blinking at the first loop
    this.changeRadarPosition(nextPosition + preloadingDirection, true);
  };

  render() {
    return (
      <>
        <div id="map" />
        <Button
          type="primary"
          style={{
            position: "absolute",
            bottom: 5,
            left: 5,
            height: 35,
            zIndex: 9999,
            width: 45,
          }}
          onClick={() => (this.state.playing ? this.stop() : this.play())}
        >
          {this.state.playing ? <PauseOutlined /> : <CaretRightOutlined />}
        </Button>
      </>
    );
  }
}
