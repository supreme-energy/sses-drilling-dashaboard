import React, { lazy } from "react";
import PropTypes from "prop-types";
import classes from "./WellExplorer.scss";
import SearchCard from "./SearchCard";
import { withTheme } from "@material-ui/core/styles";
import flowRight from "lodash/flowRight";
import { connect } from "react-redux";
import { ALL_WELLS, RECENT_WELLS, FAVORITES, changeActiveTab } from "../store";
import { useWells } from "../../../api";
import useMemo from "react-powertools/hooks/useMemo";

const WellMap = lazy(() => import(/* webpackChunkName: 'WellMap' */ "./WellMap/index.js"));

const mapCenter = {
  lat: 30.0902,
  lng: -95.7129
};

function getFilteredWells(activeTab, wells, wellTimestamps) {
  switch (activeTab) {
    case RECENT_WELLS:
      return wells.filter(w => wellTimestamps[w.id]).sort((a, b) => wellTimestamps[b.id] - wellTimestamps[a.id]);
    case FAVORITES:
      return wells.filter(w => w.fav);
    default:
      return wells;
  }
}

export const WellExplorer = ({ wellTimestamps, changeActiveTab, activeTab, theme }) => {
  const [wells, updateFavorite] = useWells();
  const fileterdWells = useMemo(() => getFilteredWells(activeTab, wells, wellTimestamps), [
    activeTab,
    wells,
    wellTimestamps
  ]);

  return (
    <div className={classes.container}>
      <WellMap
        theme={theme}
        wells={fileterdWells}
        className={classes.map}
        mapCenter={mapCenter}
        handleClickWell={() => {}}
        zoomControl={false}
      />
      <div className={classes.topRow}>
        <SearchCard
          theme={theme}
          wells={fileterdWells}
          updateFavorite={updateFavorite}
          changeActiveTab={changeActiveTab}
        />
        <div />
      </div>
    </div>
  );
};

WellExplorer.propTypes = {
  theme: PropTypes.object,
  wellTimestamps: PropTypes.object,
  changeActiveTab: PropTypes.func,
  activeTab: PropTypes.oneOf([ALL_WELLS, RECENT_WELLS, FAVORITES])
};

const mapStateToProps = state => {
  return {
    activeTab: state.wellExplorer.activeTab,
    wellTimestamps: state.wellExplorer.wellTimestamps
  };
};

const mapDispatchToPops = {
  changeActiveTab
};

const bindData = flowRight([
  withTheme(),
  connect(
    mapStateToProps,
    mapDispatchToPops
  )
]);

export default bindData(WellExplorer);
