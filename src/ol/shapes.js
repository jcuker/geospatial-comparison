/* eslint-disable react-hooks/exhaustive-deps */
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import Polygon from "ol/geom/Polygon";
import Draw, { createRegularPolygon, createBox } from "ol/interaction/Draw";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import React, { useEffect } from "react";

export default function Shapes() {
  let map, source, vector, raster;

  useEffect(() => {
    raster = new TileLayer({
      source: new OSM(),
    });

    source = new VectorSource({ wrapX: false });

    vector = new VectorLayer({
      source: source,
    });

    map = new Map({
      layers: [raster, vector],
      target: "map",
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
      }),
    });
  });

  var draw; // global so we can remove it later
  function addInteraction(event) {
    var value = event.target.value;
    if (value !== "None") {
      var geometryFunction;
      if (value === "Square") {
        value = "Circle";
        geometryFunction = createRegularPolygon(4);
      } else if (value === "Box") {
        value = "Circle";
        geometryFunction = createBox();
      } else if (value === "Star") {
        value = "Circle";
        geometryFunction = function (coordinates, geometry) {
          var center = coordinates[0];
          var last = coordinates[1];
          var dx = center[0] - last[0];
          var dy = center[1] - last[1];
          var radius = Math.sqrt(dx * dx + dy * dy);
          var rotation = Math.atan2(dy, dx);
          var newCoordinates = [];
          var numPoints = 12;
          for (var i = 0; i < numPoints; ++i) {
            var angle = rotation + (i * 2 * Math.PI) / numPoints;
            var fraction = i % 2 === 0 ? 1 : 0.5;
            var offsetX = radius * fraction * Math.cos(angle);
            var offsetY = radius * fraction * Math.sin(angle);
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
      draw = new Draw({
        source: source,
        type: value,
        geometryFunction: geometryFunction,
      });
      map.addInteraction(draw);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <div
        id="map"
        style={{
          height: "100%",
          width: "100%",
        }}
      ></div>
      <form style={{ position: "absolute", bottom: 0, left: 5 }}>
        <label>Shape type &nbsp;</label>
        <select
          id="type"
          onChange={(event) => {
            map.removeInteraction(draw);
            addInteraction(event);
          }}
        >
          <option value="None">None</option>
          <option value="Circle">Circle</option>
          <option value="Square">Square</option>
          <option value="Box">Box</option>
          <option value="Star">Star</option>
        </select>
      </form>
    </div>
  );
}
