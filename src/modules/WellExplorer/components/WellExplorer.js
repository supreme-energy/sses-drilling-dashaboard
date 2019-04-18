import React, { lazy, useState } from "react";
import PropTypes from "prop-types";
import classes from "./WellExplorer.scss";
import SearchCard from "./SearchCard";
import { withTheme } from "@material-ui/core/styles";
import flowRight from "lodash/flowRight";
import { connect } from "react-redux";
import { ALL_WELLS, RECENT_WELLS, FAVORITES, changeActiveTab } from "../store";
import { useWells, useWellsSearch } from "../../../api";
import useMemo from "react-powertools/hooks/useMemo";
import WelcomeCard from "./WelcomeCard";
import memoizeOne from "memoize-one";

const WellMap = lazy(() => import(/* webpackChunkName: 'WellMap' */ "./WellMap/index.js"));

const mapCenter = {
  lat: 30.0902,
  lng: -95.7129
};

const getRecentWells = memoizeOne((wells, wellTimestamps) => {
  return wells.filter(w => wellTimestamps[w.id]).sort((a, b) => wellTimestamps[b.id] - wellTimestamps[a.id]);
});

function getFilteredWells(activeTab, wells, wellTimestamps) {
  switch (activeTab) {
    case RECENT_WELLS:
      return getRecentWells(wells, wellTimestamps);
    case FAVORITES:
      return wells.filter(w => w.fav);
    default:
      return wells;
  }
}

export const WellExplorer = ({ wellTimestamps, changeActiveTab, activeTab, theme }) => {
  const [wells, updateFavorite] = useWells();

  const [searchTerm, onSearchTermChanged] = useState("");
  const fileterdWells = useMemo(() => getFilteredWells(activeTab, wells, wellTimestamps), [
    activeTab,
    wells,
    wellTimestamps
  ]);

  const recentWells = getRecentWells(wells, wellTimestamps);
  const mostRecentWell = recentWells[0];
  const search = useWellsSearch(fileterdWells);
  const searchResults = useMemo(() => search(searchTerm), [search, searchTerm]);

  return (
    <div className={classes.container}>
      <WellMap
        theme={theme}
        wells={searchResults}
        className={classes.map}
        mapCenter={mapCenter}
        handleClickWell={() => {}}
        zoomControl={false}
      />
      <div className={classes.topRow}>
        <SearchCard
          searchTerm={searchTerm}
          onSearchTermChanged={onSearchTermChanged}
          theme={theme}
          wells={searchResults}
          updateFavorite={updateFavorite}
          changeActiveTab={changeActiveTab}
        />
        <WelcomeCard theme={theme} lastEditedWell={mostRecentWell} />
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
