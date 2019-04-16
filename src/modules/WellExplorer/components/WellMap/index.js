import React from "react";
import PropTypes from "prop-types";
import { Map, TileLayer, Marker } from "react-leaflet";
import CenterControl from "../CenterControl";
import { mapIcons, mapIconsSelected } from "../IconsByStatus";
import L from "leaflet";
import mapValues from "lodash/mapValues";
import classes from "./styles.scss";
import classNames from "classnames";
import { withRouter } from "react-router";

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  margin: "0 auto"
};

const leafletIconsByStats = mapValues(mapIcons, icon => L.icon({ iconUrl: icon }));
const leafletIconsSelected = mapValues(mapIconsSelected, icon => L.icon({ iconUrl: icon }));

export const WellMap = ({
  mapCenter,
  handleClickWell,
  wells,
  theme,
  match: {
    params: { wellId }
  },
  ...props
}) => {
  return (
    <Map
      center={mapCenter}
      length={4}
      onClick={handleClickWell}
      style={mapStyles}
      zoom={6}
      {...props}
      className={classNames(classes.map, props.className)}
    >
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
      {wells.length > 0 &&
        wells.map(well => (
          <Marker
            key={well.id}
            position={well.position}
            icon={wellId === well.id ? leafletIconsSelected[well.status] : leafletIconsByStats[well.status]}
            className={classes.marker}
          />
        ))}
      <CenterControl />
    </Map>
  );
};

WellMap.propTypes = {
  mapCenter: PropTypes.object.isRequired,
  handleClickWell: PropTypes.func,
  wells: PropTypes.array,
  theme: PropTypes.object,
  className: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.object
  })
};

WellMap.defaultProps = {
  wells: []
};

export default withRouter(WellMap);
