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
import WellOverview from "./WellOverview";
import classNames from "classnames";
import L from "leaflet";

const WellMap = lazy(() => import(/* webpackChunkName: 'WellMap' */ "./WellMap/index.js"));

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

function getWellZoomBounds(well) {
  return well
    ? L.latLngBounds(
        L.latLng(well.position[0] - 0.4, well.position[1] - 0.4),
        L.latLng(well.position[0] + 0.4, well.position[1] + 0.4)
      )
    : null;
}

function getWellsZoomBounds(wells) {
  if (wells.length === 0) {
    return null;
  } else if (wells.length === 1) {
    return getWellZoomBounds(wells[0]);
  } else {
    const { minLat, minLng, maxLat, maxLng } = wells.reduce(
      (acc, next) => {
        return {
          minLat: Math.min(next.position[0], acc.minLat),
          minLng: Math.min(next.position[1], acc.minLng),
          maxLat: Math.max(next.position[0], acc.maxLat),
          maxLng: Math.max(next.position[1], acc.maxLng)
        };
      },
      {
        minLat: wells[0].position[0],
        minLng: wells[0].position[1],
        maxLat: wells[0].position[0],
        maxLng: wells[0].position[1]
      }
    );
    return L.latLngBounds(L.latLng(minLat - 1, minLng - 1), L.latLng(maxLat + 1, maxLng + 1));
  }
}

export const WellExplorer = ({
  wellTimestamps,
  changeActiveTab,
  activeTab,
  theme,
  selectedWellId,
  history,
  match: {
    params: { wellId: openedWellId }
  }
}) => {
  const [wells, wellsById, updateFavorite] = useWells();

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
  const openedWell = wellsById[openedWellId];
  const selectedWell = wellsById[selectedWellId];
  const overviewMode = !!selectedWellId;
  const wellsBounds = useMemo(() => getWellsZoomBounds(wells), [wells]);
  const selectedWellMapBounds = useMemo(() => getWellZoomBounds(selectedWell), [selectedWell]);
  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.overview]: overviewMode
      })}
    >
      <WellMap
        theme={theme}
        showLegend
        onMarkerClick={well => history.push(`/${well.id}/combo`)}
        bounds={wellsBounds}
        selectedWellId={openedWellId || selectedWellId}
        showMapTypeControls={!overviewMode}
        wells={searchResults}
        className={classes.fullMap}
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
          {overviewMode && (
            <WellMap
              selectedWellId={selectedWellId}
              showToggleLegend
              defaultShowLegend={false}
              theme={theme}
              onMarkerClick={well => history.push(`/${well.id}/combo`)}
              bounds={selectedWellMapBounds}
              wells={searchResults}
              className={classes.miniMap}
              zoomControl={false}
            />
          )}
        </div>
        <span className={classes.hSpacer} />
        {selectedWellId ? (
          <WellOverview className={classes.wellOverview} well={selectedWell} updateFavorite={updateFavorite} />
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
  history: PropTypes.object,
  theme: PropTypes.object,
  wellTimestamps: PropTypes.object,
  changeActiveTab: PropTypes.func,
  selectedWellId: PropTypes.string,
  activeTab: PropTypes.oneOf([ALL_WELLS, RECENT_WELLS, FAVORITES]),
  match: PropTypes.shape({
    params: PropTypes.object
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
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
