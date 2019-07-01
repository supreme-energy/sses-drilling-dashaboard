import React from "react";
import { Marker } from "react-leaflet";
import { leafletMapIcons, leafletMapIconsSelected } from "../IconsByStatus";

import classes from "./styles.scss";

export default function WellsLayer({ wells, onMarkerClick, selectedWellId }) {
  return (
    wells.length > 0 &&
    wells.map((well, index) => (
      <Marker
        key={well.id}
        onClick={() => onMarkerClick(well)}
        zIndexOffset={selectedWellId === well.id ? wells.length + 1 : index + 1}
        position={well.surfacePosition}
        icon={selectedWellId === well.id ? leafletMapIconsSelected[well.status] : leafletMapIcons[well.status]}
        className={classes.marker}
      />
    ))
  );
}
