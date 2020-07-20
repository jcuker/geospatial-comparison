import React from "react";
import { Button, notification } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";

export default class Radar extends React.Component {
  map = undefined;

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
    document.title = "Mapbox | Radar Example";

    notification.destroy();
    notification.info({
      message: "Radar",
      description:
        "Press the play button in the lower-left corner to start the radar animation",
      placement: "topLeft",
      duration: 5,
    });

    mapbox.accessToken = process.env.REACT_APP_MAPBOX_API_KEY;

    this.map = new mapbox.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 1,
    });

    this.map.addControl(new mapbox.NavigationControl(), "top-left");
    this.map.on("load", () => {
      this.map.addSource("radar", {
        type: "raster",
      });
    });

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
    const obj = {
      id: `layer-${ts}`,
      type: "raster",
      url:
        "https://tilecache.rainviewer.com/v2/radar/" +
        ts +
        "/256/{z}/{x}/{y}/2/1_1.png",
      tileSize: 256,
      opacity: 0.001,
      zIndex: ts,
      scheme: "xyz",
      source: "radar",
    };

    if (!this.radarLayers[ts]) {
      this.radarLayers[ts] = { ...obj };
    }

    if (!this.map.getLayer(obj.id)) {
      this.map.addLayer({ ...obj });
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
      const foundLayer = this.map.getLayer(
        this.radarLayers[currentTimestamp].id
      );
      if (foundLayer) this.map.removeLayer(foundLayer.id);
    }
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
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
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
      </div>
    );
  }
}
