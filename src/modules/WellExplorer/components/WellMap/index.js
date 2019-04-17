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
import Fullscreen from "@material-ui/icons/Fullscreen";
import FullscreenExit from "@material-ui/icons/FullscreenExit";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const mapStyles = {
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  margin: "0 auto"
};

const leafletIconsByStats = mapValues(mapIcons, icon => L.icon({ iconUrl: icon }));
const leafletIconsSelected = mapValues(mapIconsSelected, icon => L.icon({ iconUrl: icon }));

const MAP = "Map";
const SATELITE = "Satelite";

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
  const toggleFullScreen = () => {
    console.log("mapRef.current.leafletElement", mapRef.current.leafletElement);
    mapRef.current.leafletElement.toggleFullscreen();
  };

  const mapRef = useRef(null);
  const [selectedTiles, changeSelectedTiles] = useState(MAP);
  const [isFullscreen, onFullScreenChanged] = useState(false);
  const FullScreenIcon = isFullscreen ? FullscreenExit : Fullscreen;

  return (
    <Map
      {...props}
      center={mapCenter}
      length={4}
      onClick={handleClickWell}
      style={mapStyles}
      onfullscreenchange={(e, data) => onFullScreenChanged(e.target.isFullscreen())}
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
            icon={wellId === well.id ? leafletIconsSelected[well.status] : leafletIconsByStats[well.status]}
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
            <Button disableRipple onClick={() => changeSelectedTiles(SATELITE)}>
              <Typography variant={selectedTiles === SATELITE ? "body1" : "body2"}>Satelite</Typography>
            </Button>
          </Paper>

          <span className={classes.hSpace} />
          <Paper className={classes.fullScreen}>
            <IconButton disableRipple onClick={toggleFullScreen}>
              <FullScreenIcon style={{ fontSize: 32 }} />
            </IconButton>
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
