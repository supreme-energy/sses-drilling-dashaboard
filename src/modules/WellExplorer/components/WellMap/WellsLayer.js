import React from "react";
import { Marker } from "react-leaflet";
import { mapIcons, mapIconsSelected } from "../IconsByStatus";
import mapValues from "lodash/mapValues";
import L from "leaflet";
import classes from "./styles.scss";

const leafletIcons = mapValues(mapIcons, icon => L.icon({ iconUrl: icon }));
const leafletIconsSelected = mapValues(mapIconsSelected, icon => L.icon({ iconUrl: icon }));

export default function WellsLayer({ wells, onMarkerClick, selectedWellId }) {
  return (
    wells.length > 0 &&
    wells.map(well => (
      <Marker
        key={well.id}
        onClick={() => onMarkerClick(well)}
        position={well.position}
        icon={selectedWellId === well.id ? leafletIconsSelected[well.status] : leafletIcons[well.status]}
        className={classes.marker}
      />
    ))
  );
}
