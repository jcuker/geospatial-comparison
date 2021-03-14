import * as turf from "@turf/turf";
import { Map, View } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import olVectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import { OSM } from "ol/source";
import olVectorSource from "ol/source/Vector";
import React from "react";
import { styleFunctionTwitter } from "../util";

export default class Connect extends React.Component {
  async componentDidMount() {
    document.title = "OpenLayers | Turf LineString";

    const twitterResponse = await fetch(
      `${window.location.origin}/${window.location.pathname.split("/")[1]}/twitter.json`
    );
    const geoJson = await twitterResponse.json();

    const source = new olVectorSource();
    const format = new GeoJSON();
    const features = format.readFeatures(geoJson);

    // GeoJson's default projection is 4326 while OL's is 3857
    features.map((feature) =>
      feature.getGeometry().transform("EPSG:4326", "EPSG:3857")
    );

    const flatGeometry = [];

    for (const feature of features) {
      flatGeometry.push(feature.getGeometry().flatCoordinates);
    }

    const lineString = turf.lineString(flatGeometry);
    const lineStringFeature = format.readFeature(lineString);

    source.addFeature(lineStringFeature);

    const vectorLayer = new olVectorLayer({
      source: source,
    });

    const rasterLayer = new TileLayer({
      source: new OSM(),
    });

    const twitterLayer = new olVectorLayer({
      source: new olVectorSource({
        format: new GeoJSON(),
        features,
      }),
      style: styleFunctionTwitter,
    });

    new Map({
      layers: [rasterLayer, vectorLayer, twitterLayer],
      target: document.getElementById("map"),
      view: new View({
        center: fromLonLat([-90.81070553065938, 40.716527262756514]),
        zoom: 4,
      }),
    });
  }

  render() {
    return (
      <>
        <div id="map"></div>
      </>
    );
  }
}
