/* eslint-disable react-hooks/exhaustive-deps */
import { notification } from "antd";
import Polygon from "ol/geom/Polygon";
import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import Map from "ol/Map";
import { OSM, Vector as VectorSource } from "ol/source";
import View from "ol/View";
import React from "react";

export default class Drawing extends React.Component {
  constructor() {
    super();
    this.draw = undefined;
    this.map = undefined;
    this.source = undefined;
    this.vector = undefined;
    this.raster = undefined;
  }

  componentDidMount() {
    document.title = "OpenLayers | Drawing Example";

    notification.destroy();
    notification.info({
      message: "Drawing Instructions",
      description:
        "Choose the shape type from the bottom-right corner to draw arbitrary shapes onto the map.",
      placement: "topLeft",
      duration: 10,
    });

    this.raster = new TileLayer({
      source: new OSM(),
    });

    this.source = new VectorSource({ wrapX: false });

    this.vector = new VectorLayer({
      source: this.source,
    });

    this.map = new Map({
      layers: [this.raster, this.vector],
      target: "map",
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
      }),
    });
  }

  componentWillUnmount() {
    notification.destroy();
  }

  addInteraction(event) {
    let value = event.target.value;

    if (value !== "None") {
      let geometryFunction;
      if (value === "Square") {
        value = "Circle";
        geometryFunction = createRegularPolygon(4);
      } else if (value === "Box") {
        value = "Circle";
        geometryFunction = createBox();
      } else if (value === "Star") {
        value = "Circle";
        geometryFunction = function (coordinates, geometry) {
          const center = coordinates[0];
          const last = coordinates[1];
          const dx = center[0] - last[0];
          const dy = center[1] - last[1];
          const radius = Math.sqrt(dx * dx + dy * dy);
          const rotation = Math.atan2(dy, dx);
          const newCoordinates = [];
          const numPoints = 12;
          for (let i = 0; i < numPoints; ++i) {
            const angle = rotation + (i * 2 * Math.PI) / numPoints;
            const fraction = i % 2 === 0 ? 1 : 0.5;
            const offsetX = radius * fraction * Math.cos(angle);
            const offsetY = radius * fraction * Math.sin(angle);
            newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
          }
          newCoordinates.push(newCoordinates[0].slice());
          if (!geometry) {
            geometry = new Polygon([newCoordinates]);
          } else {
            geometry.setCoordinates([newCoordinates]);
          }
          return geometry;
        };
      }

      this.draw = new Draw({
        source: this.source,
        type: value,
        geometryFunction: geometryFunction,
      });

      this.map.addInteraction(this.draw);
    }
  }

  render() {
    return (
      <>
        <div id="map"></div>
        <form style={{ position: "absolute", bottom: 0, left: 5 }}>
          <label>Shape type &nbsp;</label>
          <select
            id="type"
            onChange={(event) => {
              this.map.removeInteraction(this.draw);
              this.addInteraction(event);
            }}
          >
            <option value="None">None</option>
            <option value="Circle">Circle</option>
            <option value="Square">Square</option>
            <option value="Box">Box</option>
            <option value="Star">Star</option>
          </select>
        </form>
      </>
    );
  }
}
