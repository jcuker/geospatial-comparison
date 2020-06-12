import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Leaflet from "./leaflet";
import OpenLayers from "./ol";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/leaflet" component={Leaflet}></Route>
          <Route path="/ol" component={OpenLayers}></Route>
          <Route path="/">
            <ul>
              <li>
                <Link to="/leaflet">Leaflet</Link>
              </li>
              <li>
                <Link to="/ol">OpenLayers</Link>
              </li>
            </ul>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
