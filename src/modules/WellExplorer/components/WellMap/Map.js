import React from "react";
import { Map as LeafletMap, TileLayer } from "react-leaflet";
import classes from "./styles.scss";
import classNames from "classnames";
import PropTypes from "prop-types";
import { MAP, SATELLITE } from "./";

const tiles = {
  [MAP]: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
  [SATELLITE]: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export default function Map({ selectedTiles, children, ...props }) {
  return (
    <LeafletMap
      attributionControl={false}
      zoom={6}
      // onfullscreenchange={handleMapFullscreenChange}

      {...props}
      className={classNames(classes.map, props.className)}
    >
      <TileLayer url={tiles[selectedTiles]} />
      {children}
    </LeafletMap>
  );
}

Map.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  selectedTiles: PropTypes.string
};

Map.defaultProps = {
  selectedTiles: MAP
};
