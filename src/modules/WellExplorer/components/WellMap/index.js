import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Map, TileLayer, Marker, ZoomControl } from "react-leaflet";
import CenterControl from "../CenterControl";
import { mapIcons, mapIconsSelected } from "../IconsByStatus";
import L from "leaflet";
import mapValues from "lodash/mapValues";
import classes from "./styles.scss";
import classNames from "classnames";
import { withRouter } from "react-router";
import MapLegend from "./MapLegend";
import "leaflet-fullscreen";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  margin: "0 auto"
};

const leafletIcons = mapValues(mapIcons, icon => L.icon({ iconUrl: icon }));
const leafletIconsSelected = mapValues(mapIconsSelected, icon => L.icon({ iconUrl: icon }));

const MAP = "Map";
const SATELLITE = "Satellite";

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
  const mapRef = useRef(null);
  const [selectedTiles, changeSelectedTiles] = useState(MAP);

  return (
    <Map
      {...props}
      center={mapCenter}
      length={4}
      onClick={handleClickWell}
      style={mapStyles}
      // onfullscreenchange={handleMapFullscreenChange}
      zoom={6}
      ref={mapRef}
      className={classNames(classes.map, props.className)}
    >
      {selectedTiles === MAP ? (
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" /> // eslint-disable-line max-len
      ) : (
        <TileLayer url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
      )}

      {wells.length > 0 &&
        wells.map(well => (
          <Marker
            key={well.id}
            position={well.position}
            icon={wellId === well.id ? leafletIconsSelected[well.status] : leafletIcons[well.status]}
            className={classes.marker}
          />
        ))}

      <ZoomControl position="bottomright" className={classes.zoom} />
      <CenterControl position={"bottomright"}>
        <MapLegend className={classes.legend} />
      </CenterControl>
      <CenterControl position={"bottomleft"}>
        <div className={classes.leftMapControls}>
          <Paper className={classes.horizontalLayout}>
            <Button disableRipple onClick={() => changeSelectedTiles(MAP)}>
              <Typography variant={selectedTiles === MAP ? "body1" : "body2"}>Map</Typography>
            </Button>
            <Button disableRipple onClick={() => changeSelectedTiles(SATELLITE)}>
              <Typography variant={selectedTiles === SATELLITE ? "body1" : "body2"}>Satellite</Typography>
            </Button>
          </Paper>
        </div>
      </CenterControl>
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
