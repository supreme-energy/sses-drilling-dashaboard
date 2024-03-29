import React, { lazy, useState, useCallback } from "react";
import PropTypes from "prop-types";
import WellImporterModal from "../../../modals/WellImporterModal";
import WellImporter, {
  useWellImporterContainer,
  WellImporterProvider
} from "../../../modals/WellImporterModal/WellImporter";
import { addFile } from "../../../store/files";
import classes from "./WellExplorer.scss";
import SearchCard from "./SearchCard";
import { withTheme } from "@material-ui/core/styles";
import flowRight from "lodash/flowRight";
import { connect } from "react-redux";
import { ALL_WELLS, RECENT_WELLS, FAVORITES, changeActiveTab, changeSelectedWell } from "../store";
import { useWells, useWellsSearch } from "../../../api";
import useMemo from "react-powertools/hooks/useMemo";
import WelcomeCard from "./WelcomeCard";
import memoizeOne from "memoize-one";
import WellOverview from "./WellOverview";
import classNames from "classnames";
import { getWellsZoomBounds, getWellZoomBounds } from "../utils/getWellsZoomBounds";
import Box from "@material-ui/core/Box";
import { useWellIdContainer } from "../../App/Containers";
import { CREATE_NEW_WELL } from "../../../modals/WellImporterModal/WellImporter/state/actions";
import { WellImporterSaveProvider } from "../../../modals/WellImporterModal/WellImporterModal";

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

export const WellExplorer = ({
  wellTimestamps,
  changeActiveTab,
  addFile,
  activeTab,
  theme,
  selectedWellId,
  history,
  changeSelectedWell
}) => {
  const { wellId: openedWellId } = useWellIdContainer();
  const [wells, wellsById, updateFavorite, refresh] = useWells();
  const [, dispatch] = useWellImporterContainer();

  const [searchTerm, onSearchTermChanged] = useState("");
  const [initialTab, setInitialTab] = useState();
  const [importModalShown, toggleShowImportModal] = useState(false);
  const filteredWells = useMemo(() => getFilteredWells(activeTab, wells, wellTimestamps), [
    activeTab,
    wells,
    wellTimestamps
  ]);

  const recentWells = getRecentWells(wells, wellTimestamps);
  const mostRecentWell = recentWells[0];
  const search = useWellsSearch(filteredWells);
  const searchResults = useMemo(() => search(searchTerm), [search, searchTerm]);
  const openedWell = wellsById[openedWellId];
  const selectedWell = wellsById[selectedWellId];
  const overviewMode = !!selectedWellId;
  const wellsBounds = useMemo(() => getWellsZoomBounds(wells), [wells]);
  const selectedWellMapBounds = useMemo(() => getWellZoomBounds(selectedWell), [selectedWell]);
  const onFilesToImportChange = (event, wellName) => {
    if (!event.target.files || !event.target.files.length) {
      return;
    }

    addFile(event.target.files[0]);
    dispatch({ type: CREATE_NEW_WELL, wellName });
    toggleShowImportModal(true);
  };

  const onClickCancel = useCallback(() => {
    toggleShowImportModal(false);
  }, []);

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.overview]: overviewMode
      })}
    >
      <WellImporterModal open={importModalShown} hideBackdrop>
        <WellImporter onClickCancel={onClickCancel} />
      </WellImporterModal>

      <WellMap
        theme={theme}
        showLegend
        onMarkerClick={well => changeSelectedWell(well.id)}
        bounds={wellsBounds}
        selectedWellId={openedWellId || selectedWellId}
        showMapTypeControls={!overviewMode}
        wells={searchResults}
        className={classes.fullMap}
        zoomControl={false}
      />
      <div className={classes.row}>
        <div className={classNames(classes.column, "space-between")}>
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
            <Box boxShadow={1} display="flex" className={classes.miniMap}>
              <WellMap
                selectedWellId={selectedWellId}
                showToggleLegend
                defaultShowLegend={false}
                theme={theme}
                className="flex"
                onMarkerClick={well => changeSelectedWell(well.id)}
                bounds={selectedWellMapBounds}
                wells={searchResults}
                zoomControl={false}
              />
            </Box>
          )}
        </div>
        <span className={classes.hSpacer} />
        {selectedWell ? (
          <WellOverview
            className={classes.wellOverview}
            well={selectedWell}
            updateFavorite={updateFavorite}
            initialTab={initialTab}
            setInitialTab={setInitialTab}
          />
        ) : (
          <WelcomeCard
            className={classes.welcome}
            theme={theme}
            openedWell={openedWell}
            lastEditedWell={mostRecentWell}
            onFilesToImportChange={onFilesToImportChange}
            changeSelectedWell={changeSelectedWell}
            refreshWellList={refresh}
            setInitialTab={setInitialTab}
          />
        )}
      </div>
    </div>
  );
};

WellExplorer.propTypes = {
  theme: PropTypes.object,
  wellTimestamps: PropTypes.object,
  changeSelectedWell: PropTypes.func,
  changeActiveTab: PropTypes.func,
  addFile: PropTypes.func.isRequired,
  selectedWellId: PropTypes.string,
  activeTab: PropTypes.oneOf([ALL_WELLS, RECENT_WELLS, FAVORITES]),
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
  changeActiveTab,
  changeSelectedWell,
  addFile
};

const bindData = flowRight([
  withTheme,
  connect(
    mapStateToProps,
    mapDispatchToPops
  )
]);

export default bindData(props => (
  <WellImporterSaveProvider>
    <WellImporterProvider>
      <WellExplorer {...props} />
    </WellImporterProvider>
  </WellImporterSaveProvider>
));
