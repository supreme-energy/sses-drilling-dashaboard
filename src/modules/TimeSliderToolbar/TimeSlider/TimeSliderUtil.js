import { scaleLinear } from "d3-scale";
import { max, min } from "d3-array";

export function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([min(data, d => Math.min(d.ROP_A, d.Angle)), max(data, d => Math.max(d.ROP_A, d.Angle))])
      .range([0, 1]);
  }
}

export function computeInitialViewXScaleValue(dataLength) {
  if (dataLength > 0) {
    return scaleLinear()
      .domain([0, dataLength - 1])
      .range([0, 1]);
  }
}

export const transformDate = dateTime => {
  const splitDateTime = dateTime.split(" ");
  if (splitDateTime.length > 1) {
    const date = splitDateTime[0].split("/");
    return `${date[0]}-${date[1]} ${date[2]}`;
  }
  return dateTime;
};
