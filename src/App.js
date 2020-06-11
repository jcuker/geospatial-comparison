import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Leaflet from "./leaflet";
import OpenLayers from "./ol";
import Turf from "./turf";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/leaflet">
            <Leaflet />
          </Route>
          <Route path="/ol">
            <OpenLayers />
          </Route>
          <Route path="/turf">
            <Turf />
          </Route>
          <Route path="/">
            <ul>
              <li>
                <Link to="/leaflet">Leaflet</Link>
              </li>
              <li>
                <Link to="/ol">OpenLayers</Link>
              </li>
              <li>
                <Link to="/turf">Turf</Link>
              </li>
            </ul>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
