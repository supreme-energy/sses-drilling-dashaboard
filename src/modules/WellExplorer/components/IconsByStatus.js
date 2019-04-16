import { DRILLING, UNKNOWN, TRIPPING } from "../../../constants/drillingStatus";
import drilling from "../assets/drilling-list.svg";
import unkown from "../assets/unknown-list.svg";
import tripping from "../assets/tripping-list.svg";
import drillingMap from "../assets/drilling-map.svg";
import unkownMap from "../assets/unknown-map.svg";
import trippingMap from "../assets/tripping-map.svg";
import drillingSelected from "../assets/Drilling-Selected.svg";
import trippingSelected from "../assets/Tripping-Selected.svg";
import unknownSelected from "../assets/Unknown-Selected.svg";

export const listIcons = {
  [DRILLING]: drilling,
  [UNKNOWN]: unkown,
  [TRIPPING]: tripping
};

export const mapIcons = {
  [DRILLING]: drillingMap,
  [UNKNOWN]: unkownMap,
  [TRIPPING]: trippingMap
};

export const mapIconsSelected = {
  [DRILLING]: drillingSelected,
  [UNKNOWN]: unknownSelected,
  [TRIPPING]: trippingSelected
};
