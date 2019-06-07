import React from "react";
import { Map as LeafletMap, TileLayer } from "react-leaflet";
import classes from "./styles.scss";
import classNames from "classnames";
import PropTypes from "prop-types";

const MAP = "Map";

export default function Map({ selectedTiles, children, ...props }) {
  return (
    <LeafletMap
      attributionControl={false}
      length={4}
      // onfullscreenchange={handleMapFullscreenChange}
      zoom={6}
      {...props}
      className={classNames(classes.map, props.className)}
    >
      {selectedTiles === MAP ? (
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" /> // eslint-disable-line max-len
      ) : (
        <TileLayer url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      )}

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
