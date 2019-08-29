import { format } from "d3-format";

export const EMPTY_FIELD = "—";
export const twoDecimals = format(",.2f");
export const percentage = format(".0%");
export const noDecimals = format(".0f");

export const formatValue = (item, prop) => (item ? twoDecimals(item[prop]) : EMPTY_FIELD);
