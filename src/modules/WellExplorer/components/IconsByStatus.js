import { DRILLING, UNKNOWN, TRIPPING, COMPLETED } from "../../../constants/drillingStatus";
import drilling from "../assets/drilling-list.svg";
import unknown from "../assets/unknown-list.svg";
import tripping from "../assets/tripping-list.svg";
import drillingMap from "../assets/drilling-map.svg";
import unknownMap from "../assets/unknown-map.svg";
import trippingMap from "../assets/tripping-map.svg";
import drillingSelected from "../assets/Drilling-Selected.svg";
import trippingSelected from "../assets/Tripping-Selected.svg";
import unknownSelected from "../assets/Unknown-Selected.svg";
import completed from "../assets/Completed.svg";
import completedSelected from "../assets/Completed-Selected.svg";
import completedList from "../assets/Completed-list.svg";
import mapValues from "lodash/mapValues";
import L from "leaflet";

export const listIcons = {
  [DRILLING]: drilling,
  [UNKNOWN]: unknown,
  [TRIPPING]: tripping,
  [COMPLETED]: completedList
};

export const mapIcons = {
  [DRILLING]: drillingMap,
  [UNKNOWN]: unknownMap,
  [TRIPPING]: trippingMap,
  [COMPLETED]: completed
};

export const mapIconsSelected = {
  [DRILLING]: drillingSelected,
  [UNKNOWN]: unknownSelected,
  [TRIPPING]: trippingSelected,
  [COMPLETED]: completedSelected
};

export const leafletMapIcons = mapValues(mapIcons, icon => L.icon({ iconUrl: icon, iconAnchor: [9.5, 22] }));
export const leafletMapIconsSelected = mapValues(mapIconsSelected, icon =>
  L.icon({ iconUrl: icon, iconAnchor: [9.5, 22] })
);
