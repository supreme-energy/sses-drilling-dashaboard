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
import keyBy from "lodash/keyBy";
import WellOverview from "./WellOverview";
import classNames from "classNames";

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

const getWellsById = wells => keyBy(wells, "id");

export const WellExplorer = ({
  wellTimestamps,
  changeActiveTab,
  activeTab,
  theme,
  selectedWellId,
  match: {
    params: { wellId: openedWellId }
  }
}) => {
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
  const wellsById = useMemo(() => getWellsById(wells), [wells]);
  const openedWell = wellsById[openedWellId];

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.overview]: !!openedWellId
      })}
    >
      <WellMap
        theme={theme}
        showLegend
        wells={searchResults}
        className={classes.fullMap}
        mapCenter={mapCenter}
        zoomControl={false}
      />
      <div className={classes.row}>
        <div className={classes.column}>
          <SearchCard
            className={classes.searchCard}
            searchTerm={searchTerm}
            onSearchTermChanged={onSearchTermChanged}
            theme={theme}
            wells={searchResults}
            updateFavorite={updateFavorite}
            changeActiveTab={changeActiveTab}
          />
          <span className={classes.vSpacer} />
          {selectedWellId && (
            <WellMap
              theme={theme}
              wells={searchResults}
              className={classes.miniMap}
              mapCenter={mapCenter}
              zoomControl={false}
            />
          )}
        </div>
        <span className={classes.hSpacer} />
        {selectedWellId ? (
          <WellOverview className={classes.wellOverview} />
        ) : (
          <WelcomeCard
            className={classes.welcome}
            theme={theme}
            openedWell={openedWell}
            lastEditedWell={mostRecentWell}
          />
        )}
      </div>
    </div>
  );
};

WellExplorer.propTypes = {
  theme: PropTypes.object,
  wellTimestamps: PropTypes.object,
  changeActiveTab: PropTypes.func,
  selectedWellId: PropTypes.string,
  activeTab: PropTypes.oneOf([ALL_WELLS, RECENT_WELLS, FAVORITES]),
  match: PropTypes.shape({
    params: PropTypes.object
  })
};

const mapStateToProps = state => {
  return {
    activeTab: state.wellExplorer.activeTab,
    wellTimestamps: state.wellExplorer.wellTimestamps,
    selectedWellId: state.wellExplorer.selectedWellId
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
