import React, { lazy } from "react";
import PropTypes from "prop-types";
import classes from "./WellExplorer.scss";
import SearchCard from "./SearchCard";
import { withTheme } from "@material-ui/core/styles";

const WellMap = lazy(() => import(/* webpackChunkName: 'WellMap' */ "./WellMap"));

const markers = [[26.005, -96], [27.505, -97], [29.05, -97.5], [28.05, -97.3], [30.505, -95], [29.505, -96.0]];

const mapCenter = {
  lat: 30.0902,
  lng: -95.7129
};

export const WellExplorer = props => {
  return (
    <div className={classes.container}>
      <WellMap
        className={classes.map}
        markers={markers}
        mapCenter={mapCenter}
        handleClickWell={() => {}}
        zoomControl={false}
        scrollWheelZoom={false}
      />
      <div className={classes.topRow}>
        <SearchCard theme={props.theme} />
        <div />
      </div>
    </div>
  );
};

WellExplorer.propTypes = {
  theme: PropTypes.object
};

export default withTheme()(WellExplorer);
