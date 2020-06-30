import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import React from "react";
import { OSM } from "ol/source";
import { Button, notification } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  mapHasLayer,
  getRandomInt,
  styleFunctionEnrichedTwitter,
} from "./util";
import olVectorLayer from "ol/layer/Vector";
import olVectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import "./popup.css";
import Overlay from "ol/Overlay";

export default class Simple extends React.Component {
  map = undefined;

  radarLayers = [];
  timestamps = [];
  jsDates = [];
  animationTimer = undefined;
  animationPosition = -1;

  // Group tweets by time
  tweetsByTime = [];
  tweetLayers = [];
  twitterLayer = new olVectorSource();

  constructor() {
    super();
    this.state = {
      playing: false,
      loaded: false,
      showTwitter: false,
      showRadar: true,
    };
  }
  async componentDidMount() {
    document.title = "OpenLayers | Radar Example";

    notification.destroy();
    notification.info({
      message: "Radar",
      description:
        "Press the play button in the lower-left corner to start the radar animation, or page through each frame using the arrows.",
      placement: "topLeft",
      duration: 5,
    });

    const container = document.getElementById("popup");
    const content = document.getElementById("popup-content");
    const closer = document.getElementById("popup-closer");

    const overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    this.timestamps = await (
      await fetch("https://api.rainviewer.com/public/maps.json")
    ).json();

    this.jsDates = this.timestamps.map((ts) => {
      return new Date(ts * 1000);
    });

    // const twitter = await (
    //   await fetch(
    //     "http://ec2-54-175-45-152.compute-1.amazonaws.com:8600/geoserver/streaming/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=streaming%3Astl-twitter&maxFeatures=50&outputFormat=application%2Fjson"
    //   )
    // ).json();

    const json = await (
      await fetch(`${window.location.origin}/enriched_twitter.json`)
    ).json();

    const maxIndex = this.jsDates.length - 1;

    json.features.map((feature) => {
      const props = feature.properties;
      props["twitter"] = true;

      // hack the date
      const dateIdx = getRandomInt(0, maxIndex);
      props["dtg"] = this.jsDates[dateIdx].getTime() / 1000;

      feature.properties = { ...props };
      return feature;
    });

    const format = new GeoJSON();

    // GeoJson's default projection is 4326 while OL's is 3857
    format.readFeatures(json).map((feature) => {
      const properties = feature.getProperties();
      const ts = properties.dtg;
      if (!this.tweetsByTime[ts]) this.tweetsByTime[ts] = [];
      this.tweetsByTime[ts].push(feature);
      feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
      return feature;
    });

    this.twitterLayer = new olVectorLayer({
      source: new olVectorSource({
        format: new GeoJSON(),
      }),
      style: styleFunctionEnrichedTwitter,
    });

    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.twitterLayer,
      ],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 5,
      }),
      overlays: [overlay],
    });

    this.map.on("singleclick", (event) => {
      const features = [];

      this.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
        const properties = feature.getProperties();
        if (properties.twitter) {
          features.push(feature);
        }
      });

      if (features.length > 0) {
        const coordinate = event.coordinate;
        let popupString = "";

        for (let i = 0; i < features.length; i++) {
          const properties = features[i].getProperties();
          const str = JSON.stringify(properties);

          popupString += `Feature ${i}: ${str}<br/>`;
        }

        content.innerHTML = popupString;
        overlay.setPosition(coordinate);
      }
    });

    this.showFrame(this.animationPosition);
    this.setState({ loaded: true });
  }

  componentWillUnmount() {
    notification.destroy();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.showTwitter !== this.state.showTwitter) {
      this.twitterLayer.setVisible(!this.twitterLayer.getVisible());
    }
    if (prevState.showRadar !== this.state.showRadar) {
      this.state.showRadar
        ? this.radarLayers[this.timestamps[this.animationPosition]].setOpacity(
            100
          )
        : this.radarLayers[this.timestamps[this.animationPosition]].setOpacity(
            0
          );
    }
  }

  addLayer = (ts) => {
    if (!this.radarLayers[ts]) {
      const url =
        "https://tilecache.rainviewer.com/v2/radar/" +
        ts +
        "/256/{z}/{x}/{y}/2/1_1.png";

      const layer = new TileLayer({
        source: new XYZ({
          url,
          tileSize: 256,
        }),
        zIndex: ts,
        opacity: 0.001,
      });
      layer.setProperties({ url });
      this.radarLayers[ts] = layer;
    }

    if (!mapHasLayer(this.map, this.radarLayers[ts])) {
      this.map.addLayer(this.radarLayers[ts]);
    }

    const tweetsInTimeBucket = this.tweetsByTime[ts];
    if (tweetsInTimeBucket && tweetsInTimeBucket.length > 0) {
      this.twitterLayer.getSource().addFeatures(tweetsInTimeBucket);
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

    this.twitterLayer.getSource().clear();

    this.addLayer(nextTimestamp);

    if (preloadOnly) {
      return;
    }

    this.animationPosition = position;

    if (!this.state.showRadar) {
      return;
    }

    if (this.radarLayers[currentTimestamp]) {
      this.radarLayers[currentTimestamp].setOpacity(0);
    }

    this.radarLayers[nextTimestamp].setOpacity(100);
  };

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

  getTimeString() {
    if (this.jsDates.length === 0) return new Date().toString();

    const jsDateObj =
      this.animationPosition === -1
        ? this.jsDates[0]
        : this.jsDates[this.animationPosition];

    return jsDateObj.toLocaleString("en-us");
  }

  stepPosition = (direction) => {
    if (!this.state.loaded || this.state.playing) return;
    const newPosition =
      direction === "l"
        ? this.animationPosition - 1
        : this.animationPosition + 1;
    this.showFrame(newPosition);
    this.forceUpdate();
  };

  render() {
    const timeDisplay = this.getTimeString();

    return (
      <div style={{ height: "100%", width: "100%" }}>
        <div id="map" style={{ height: "100%", width: "100%" }} />
        <div id="popup" className="ol-popup">
          <div id="popup-closer" className="ol-popup-closer"></div>
          <div id="popup-content"></div>
        </div>
        <Button
          type="primary"
          onClick={() =>
            this.setState({ showTwitter: !this.state.showTwitter })
          }
          style={{
            position: "absolute",
            bottom: 45,
            left: 5,
            height: 35,
            width: 125,
          }}
        >
          Toggle Tweets
        </Button>

        <Button
          type="primary"
          onClick={() => this.setState({ showRadar: !this.state.showRadar })}
          style={{
            position: "absolute",
            bottom: 85,
            left: 5,
            width: 125,
          }}
        >
          Toggle Radar
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            position: "absolute",
            bottom: 5,
            left: 5,
            height: 35,
            width: "auto",
            zIndex: 9999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            style={{
              width: 45,
            }}
            onClick={() => (this.state.playing ? this.stop() : this.play())}
          >
            {this.state.playing ? <PauseOutlined /> : <CaretRightOutlined />}
          </Button>

          <div
            style={{
              // display: !this.state.playing ? "flex" : "none",
              display: "flex",
              marginLeft: 15,
              justifyContent: "center",
              alignItems: "center",
              background: "white",
            }}
          >
            <Button
              type="primary"
              style={{
                width: 25,
                marginRight: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => this.stepPosition("l")}
            >
              <LeftOutlined />
            </Button>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                color: "black",
              }}
            >
              {timeDisplay}
            </p>
            <Button
              type="primary"
              style={{
                width: 25,
                marginLeft: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => this.stepPosition("r")}
            >
              <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
