# About

This repository aims to serve as a starting point for using geospatial mapping frameworks. Find an example and use the code to bootstrap your own project. All code is proof of concept level and is **not** intended as production ready.

# Supported Frameworks

- [Leaflet](https://leafletjs.com/)
- [OpenLayers](https://openlayers.org/)
- [Mapbox GLJS](https://docs.mapbox.com/mapbox-gl-js/api/)

In order to use Mapbox, you will need to add a `.env` file to the root of the repository with an entry named `REACT_APP_MAPBOX_API_KEY`. Get an API key from Mapbox and set it to this entry.

# Implemented Examples

- Simple / just a map
- Drawing shapes
- Opening a popup at click
- Loading GeoJson
- Estimate the center of US States using Turf
- Connecting multiple points with a line using Turf
- Animated weather radar
