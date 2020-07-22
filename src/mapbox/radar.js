import React from "react";
import { Button, notification } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import * as mapbox from "mapbox-gl/dist/mapbox-gl.js";

export default class Radar extends React.Component {
  map = undefined;

  radarObjects = [];
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

    this.timestamps = await (
      await fetch("https://api.rainviewer.com/public/maps.json")
    ).json();

    const tiles = [];
    const sources = [];

    for (const ts of this.timestamps) {
      const url = `https://tilecache.rainviewer.com/v2/radar/${ts}/256/{z}/{x}/{y}/2/1_1.png`;
      const key = `radar-src-${ts}`;
      const source = {};
      source[key] = {
        type: "raster",
        tiles: [url],
        tileSize: 256,
      };

      const layer = {
        id: `radar-layer-${ts}`,
        type: "raster",
        source: key,
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: "visible",
        },
      };

      tiles.push(url);
      sources.push(source);

      this.radarObjects[ts] = {
        source,
        layer,
      };
    }

    this.map = new mapbox.Map({
      container: "map", // container id
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40], // starting position
      zoom: 2, // starting zoom
    });

    this.map.addControl(new mapbox.NavigationControl(), "top-left");
  }

  componentWillUnmount() {
    notification.destroy();
  }

  /**
   * Animation functions
   * @param ts
   */
  addLayer = (ts) => {
    const obj = this.radarObjects[ts];

    if (!this.map.getLayer(obj.layer.id)) {
      const sourceId = Object.keys(obj.source).find((obj) => obj.includes(ts));
      this.map.addSource(sourceId, obj.source[sourceId]);
      this.map.addLayer(obj.layer);
    } else {
      this.map.setLayoutProperty(obj.layer.id, "visibility", "visible");
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

    if (currentTimestamp) {
      const obj = this.radarObjects[currentTimestamp];

      const layer = this.map.getLayer(obj.layer.id);
      if (layer) {
        this.map.setLayoutProperty(layer.id, "visibility", "none");
      }
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
