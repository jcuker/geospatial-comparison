import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import React from "react";
import { OSM } from "ol/source";
import { Button, notification, Slider } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  mapHasLayer,
  styleFunctionEnrichedTwitter,
  styleFunctionTwitterCluster,
  isCluster,
  getRandomInt,
} from "./util";
import olVectorLayer from "ol/layer/Vector";
import olVectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import "./popup.css";
import Overlay from "ol/Overlay";
import olClusterSource from "ol/source/Cluster";

export default class Simple extends React.Component {
  map = undefined;

  radarLayers = [];
  timestamps = [];
  jsDates = [];
  animationTimer = undefined;
  animationPosition = -1;

  // Group tweets by time
  tweetsByTime = [];
  tweetClusterLayer = undefined;
  twitterLayer = undefined;

  constructor() {
    super();
    this.state = {
      playing: false,
      loaded: false,
      showTwitter: false,
      showRadar: true,
      inputValue: 60,
    };
  }
  async componentDidMount() {
    document.title = "OpenLayers | Radar Example";

    // Create the overlay and the popup elements
    const container = document.getElementById("popup");
    const content = document.getElementById("popup-content");
    const closer = document.getElementById("popup-closer");
    const overlay = this.createOverlay(container, content, closer);

    // Load the data from a remote geoserver or a local file.
    // Note we are not awaiting so that the map will load and be responsive while the data is fetched.
    this.loadData();

    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 5,
      }),
      overlays: [overlay],
    });

    this.map.on("singleclick", (event) => {
      const features = [];

      // iterate all features at the click pixel
      this.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
        // Have to check to see if the feature is a cluster. A cluser will be nsted in another fearure and we will have to handle it differently.
        if (isCluster(feature)) {
          const clusterFeatures = feature.get("features");

          for (const currFeature of clusterFeatures) {
            const properties = currFeature.getProperties();
            if (properties.twitter) {
              features.push(currFeature);
            }
          }
        } else {
          const properties = feature.getProperties();
          if (properties.twitter) {
            features.push(feature);
          }
        }
      });

      if (features.length > 0) {
        const coordinate = event.coordinate;
        let popupString = "";

        for (let i = 0; i < features.length; i++) {
          const properties = features[i].getProperties();
          let str = `User <em><b>${properties.user}</b></em> tweeted "${properties.text}" near ${properties.place}.<br/>`;
          str += `The tweet seems to have a <b>${properties.sentiment}</b> sentiment.`;

          popupString += `Feature ${i + 1}:<br/> ${str}<br/>`;
          // If there is at least one feature, add another line break
          if (i < features.length - 1) popupString += "<br/>";
        }

        content.innerHTML = popupString;
        overlay.setPosition(coordinate);
      } else {
        overlay.setPosition(undefined);
        closer.blur();
      }
    });
  }

  createOverlay(container, content, closer) {
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

    return overlay;
  }

  async loadData() {
    this.timestamps = await (
      await fetch("https://api.rainviewer.com/public/maps.json")
    ).json();

    // convert the unix timestamps from rainviewer to a js timestamp
    this.jsDates = this.timestamps.map((ts) => {
      return new Date(ts * 1000);
    });

    const baseUrl = this.props.remote
      ? this.props.remote
      : window.location.origin;

    // Remove any current notifications and display the loading one.
    notification.destroy();
    notification.info({
      message: "Please Wait",
      description: "Loading data...",
      placement: "topLeft",
      duration: 0,
    });

    let json;

    try {
      if (this.props.remote) {
        const maxFeatures = 50_000;
        const url = `${baseUrl}/streaming/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=streaming%3Astl-twitter&TIME=PT3H/PRESENT&width=768&height=330&srs=EPSG%3A4326&maxFeatures=${maxFeatures}&outputFormat=application%2Fjson`;
        json = await (await fetch(url)).json();
      } else {
        json = await (await fetch(`${baseUrl}/enriched_twitter.json`)).json();
      }
    } catch (err) {
      notification.destroy();
      notification.error({
        placement: "topLeft",
        description:
          "Unable to get data. If not already, try to use local data if problem persists.",
      });
      return;
    }

    // do some logic for each feature
    json.features.map((feature) => {
      const props = feature.properties;

      // this helps in the case we have other non-twitter features at the same pixel when clicking
      props["twitter"] = true;

      if (this.props.remote) {
        const unixTimestampOfTweet = new Date(props["dtg"]).getTime() / 1000;
        // find the matching bucket
        const ts = this.findMatchingTimestamp(unixTimestampOfTweet);
        props["dtg"] = ts;
      } else {
        // create some random date information for local data
        const maxIndex = this.timestamps.length - 1;
        const dateIdx = getRandomInt(0, maxIndex);
        props["dtg"] = this.jsDates[dateIdx].getTime() / 1000;
      }

      feature.properties = { ...props };
      return feature;
    });

    const format = new GeoJSON();

    // convert the raw jason into geojson object for further processing
    format.readFeatures(json).map((feature) => {
      const properties = feature.getProperties();
      const ts = properties.dtg;

      // add the feature to the correct time bucket
      if (!this.tweetsByTime[ts]) this.tweetsByTime[ts] = [];
      this.tweetsByTime[ts].push(feature);

      // GeoJson's default projection is 4326 while OL's is 3857 we need to transform
      feature.getGeometry().transform("EPSG:4326", "EPSG:3857");
      return feature;
    });

    this.tweetClusterLayer = new olVectorLayer({
      source: new olClusterSource({
        distance: this.state.inputValue,
        source: new olVectorSource({
          format: new GeoJSON(),
        }),
      }),
      style: styleFunctionTwitterCluster,
      zIndex: Number.MAX_SAFE_INTEGER,
    });

    this.twitterLayer = new olVectorLayer({
      source: new olVectorSource({
        format: new GeoJSON(),
      }),
      style: styleFunctionEnrichedTwitter,
      zIndex: Number.MAX_SAFE_INTEGER,
    });

    this.map.addLayer(this.tweetClusterLayer);
    // optional call to only have non-clustered tweets.
    // this.map.addLayer(this.twitterLayer);
    this.showFrame(this.animationPosition);
    this.setState({ loaded: true });

    notification.destroy();
    notification.success({
      message: "Success",
      description: `Loaded ${json.features.length} tweets onto the map!`,
      duration: 10,
      placement: "topLeft",
    });
    notification.info({
      message: "Radar",
      description:
        "Press the play button in the lower-left corner to start the radar animation.\n You can page through each frame using the arrows and change the radius of the clutering algorithm with the slider.",
      placement: "topLeft",
      duration: 12,
    });
  }

  componentWillUnmount() {
    notification.destroy();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.showTwitter !== this.state.showTwitter) {
      this.twitterLayer.setVisible(!this.twitterLayer.getVisible());
      this.tweetClusterLayer.setVisible(!this.tweetClusterLayer.getVisible());
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

  // Next 5 functions were adapted from RainViewer's OpenLayers example
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
      // Have to get source twice to access the 'feature' source
      this.tweetClusterLayer
        .getSource()
        .getSource()
        .addFeatures(tweetsInTimeBucket);
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
    // Have to get source twice to access the 'feature' source
    this.tweetClusterLayer.getSource().getSource().clear();

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
    const preloadingDirection =
      nextPosition - this.animationPosition > 0 ? 1 : -1;

    this.changeRadarPosition(nextPosition);

    // preload next next frame (typically, +1 frame)
    // if don't do that, the animation will be blinking at the first loop
    this.changeRadarPosition(nextPosition + preloadingDirection, true);
  };

  getTimeDisplay() {
    if (this.jsDates.length === 0) return new Date().toLocaleString("en-us");

    const jsDateObj =
      this.animationPosition === -1
        ? this.jsDates[0]
        : this.jsDates[this.animationPosition];

    const timeString = jsDateObj.toLocaleString("en-us");
    return (
      <p
        style={{
          fontSize: 12,
          textAlign: "center",
          alignSelf: "center",
          justifySelf: "center",
          margin: 0,
          color: "black",
        }}
      >
        {timeString}
      </p>
    );
  }

  // Direction is either 'l' for left or 'r' for right
  stepPosition = (direction) => {
    if (!this.state.loaded || this.state.playing) return;
    const newPosition =
      direction === "l"
        ? this.animationPosition - 1
        : this.animationPosition + 1;
    this.showFrame(newPosition);
    // since we adpted a generic openlayers example, react was not used. None of the radar
    // variables are tied to state. In order to avoid a large refactor, just force an update to rerender.
    this.forceUpdate();
  };

  onSliderChange = (val) => {
    this.setState({ inputValue: val });
    this.tweetClusterLayer.getSource().setDistance(val);
  };

  findMatchingTimestamp(ts) {
    let leftIdx = 0;
    let rightIdx = 1;

    while (rightIdx < this.timestamps.length - 1) {
      if (ts >= this.timestamps[leftIdx] && ts < this.timestamps[rightIdx]) {
        return this.timestamps[leftIdx];
      }
      leftIdx++;
      rightIdx++;
    }

    // hack the date if not matched
    const maxIndex = this.timestamps.length - 1;
    const dateIdx = getRandomInt(0, maxIndex);
    return this.jsDates[dateIdx].getTime() / 1000;
  }

  render() {
    const timeDisplay = this.getTimeDisplay();

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
            bottom: 85,
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
            bottom: 125,
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
            width: 300,
            zIndex: 9999,
            alignItems: "center",
            justifyContent: "space-between",
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
              position: "absolute",
              paddingLeft: 5,
              left: 0,
              bottom: 40,
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              alignContent: "center",
              alignItems: "center",
              background: "white",
              width: 300,
              justifyContent: "space-between",
              borderRadius: "3px",
            }}
          >
            <p style={{ margin: 0 }}>Grouping Distance</p>
            <Slider
              min={0}
              max={400}
              step={20}
              style={{
                width: 75,
                flex: 2,
              }}
              value={this.state.inputValue}
              onChange={this.onSliderChange}
            />
          </div>
          <div
            style={{
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
            {timeDisplay}
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
