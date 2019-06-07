import React, { useMemo, useRef } from "react";
import Map from "../../WellMap/Map";
import { useWells } from "../../../../../api";
import { getWellZoomBounds } from "../../../utils/getWellsZoomBounds";
import { connect } from "react-redux";
import classNames from "classnames";
import classes from "./styles.scss";
import WellsLayer from "../../WellMap/WellsLayer";

function WellMapPlot({ className, selectedWellId }) {
  const [, wellsById] = useWells();
  const selectedWell = wellsById[selectedWellId];
  const selectedWellMapBounds = useMemo(() => getWellZoomBounds(selectedWell), [selectedWell]);
  const mapContainer = useRef(null);

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
