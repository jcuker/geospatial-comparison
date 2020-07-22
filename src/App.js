import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Leaflet from "./leaflet";
import OpenLayers from "./ol";
import LandingPage from "./landing-page";
import Mapbox from "./mapbox";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/leaflet/:id" component={Leaflet}></Route>
        <Route path="/ol/:id" component={OpenLayers}></Route>
        <Route path="/mapbox/:id" component={Mapbox}></Route>
        <Route path="/" component={LandingPage}></Route>
      </Switch>
    </Router>
  );
}
