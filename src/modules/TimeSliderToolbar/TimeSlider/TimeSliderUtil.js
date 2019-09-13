import { scaleLinear } from "d3-scale";
import { max, min } from "d3-array";

export function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([min(data, d => d.rop_a), max(data, d => d.rop_a)])
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

export const calcBounds = (value, dataLength) => (dataLength - 1 >= value ? value : dataLength - 1);
