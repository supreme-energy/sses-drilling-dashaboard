import React, { useMemo, useRef } from "react";
import Map from "../../WellMap/Map";
import { useWells, useWellPath } from "../../../../../api";
import { getWellZoomBounds } from "../../../utils/getWellsZoomBounds";
import { connect } from "react-redux";
import classNames from "classnames";
import classes from "./styles.scss";
import { useSize } from "react-hook-size";
import WellsLayer from "../../WellMap/WellsLayer";
import proj4 from "proj4";

function WellMapPlot({ className, selectedWellId }) {
  const [, wellsById] = useWells();
  const wellPath = useWellPath(selectedWellId);
  console.log("wellPath", wellPath);
  const selectedWell = wellsById[selectedWellId];
  const selectedWellMapBounds = useMemo(() => getWellZoomBounds(selectedWell), [selectedWell]);
  const mapContainer = useRef(null);
  const { width, height } = useSize(mapContainer);

  return (
    <div ref={mapContainer} className={classNames(className, classes.mapContainer)}>
      <Map bounds={selectedWellMapBounds} className={classNames(className, classes.map)} zoomControl={false}>
        {selectedWell && <WellsLayer wells={[selectedWell]} selectedWellId={selectedWellId} />}
      </Map>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    selectedWellId: state.wellExplorer.selectedWellId
  };
};

export default connect(
  mapStateToProps,
  null
)(WellMapPlot);
