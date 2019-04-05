import React from "react";
import PropTypes from "prop-types";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import CenterControl from "./CenterControl";
import useFetch from "react-powertools/data/useFetch";

const mapStyles = {
  width: "100%",
  minHeight: "60%",
  maxHeight: "60%",
  position: "absolute",
  left: 0,
  margin: "0 auto"
};

export const WellMap = ({ mapCenter, handleClickWell, markers, ...props }) => {
  useFetch({
    path: "/joblist.php"
  });

  return (
    <Map center={mapCenter} length={4} onClick={handleClickWell} style={mapStyles} zoom={6} {...props}>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
      {markers.length > 0 &&
        markers.map((markerPosition, markerIndex) => (
          <Marker key={markerIndex} position={markerPosition}>
            <Popup>Info</Popup>
          </Marker>
        ))}
      <CenterControl />
    </Map>
  );
};

WellMap.propTypes = {
  mapCenter: PropTypes.object.isRequired,
  handleClickWell: PropTypes.func,
  markers: PropTypes.arrayOf(PropTypes.array)
};

export default WellMap;
