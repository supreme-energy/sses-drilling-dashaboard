import React, { useState } from "react";
import PropTypes from "prop-types";
import { ZoomControl } from "react-leaflet";
import CenterControl from "../CenterControl";
import classes from "./styles.scss";
import MapLegend from "./MapLegend";
import "leaflet-fullscreen";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Map from "./Map";
import WellsLayer from "./WellsLayer";

const MAP = "Map";
const SATELLITE = "Satellite";

export const WellMap = ({
  mapCenter,
  handleClickWell,
  wells,
  theme,
  selectedWellId,
  showToggleLegend,
  showMapTypeControls,
  defaultShowLegend,
  onMarkerClick,
  ...props
}) => {
  const [selectedTiles, changeSelectedTiles] = useState(MAP);
  const [showLegend, changeShowLegend] = useState(defaultShowLegend);
  return (
    <Map
      {...props}
      center={mapCenter}
      selectedTiles={selectedTiles}
      onClick={handleClickWell}
      // onfullscreenchange={handleMapFullscreenChange}
      className={props.className}
    >
      <WellsLayer wells={wells} onMarkerClick={onMarkerClick} selectedWellId={selectedWellId} />
      {showToggleLegend && (
        <CenterControl position={"bottomright"} defaultClassName={classes.legendButtonControl}>
          <Paper className={classes.horizontalLayout}>
            <Button className={classes.legendButton} disableRipple onClick={() => changeShowLegend(!showLegend)}>
              <Typography variant="body2">Legend</Typography>
            </Button>
          </Paper>
        </CenterControl>
      )}

      <ZoomControl position="bottomright" className={classes.zoom} />
      {showLegend && (
        <CenterControl position={"bottomright"}>
          <MapLegend className={classes.legend} />
        </CenterControl>
      )}

      {showMapTypeControls && (
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
      )}
    </Map>
  );
};

WellMap.propTypes = {
  mapCenter: PropTypes.object,
  handleClickWell: PropTypes.func,
  wells: PropTypes.array,
  theme: PropTypes.object,
  selectedWellId: PropTypes.string,
  className: PropTypes.string,
  defaultShowLegend: PropTypes.bool,
  showToggleLegend: PropTypes.bool,
  showMapTypeControls: PropTypes.bool,
  onMarkerClick: PropTypes.func
};

WellMap.defaultProps = {
  wells: [],
  handleClickWell: () => {},
  defaultShowLegend: true,
  showMapTypeControls: true
};

export default WellMap;
