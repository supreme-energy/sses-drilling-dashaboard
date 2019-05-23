import { scaleLinear, scalePow } from "d3-scale";
import { max } from "d3-array";

export const GRID_GUTTER = 1;

export const mapRop = (d, index) => [Number(index), Number(d.ROP_A)];
export const mapSlide = (d, index) => [Number(index), Number(d.ROP_I)];

export function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, max(data, d => Math.max(d.ROP_A, d.ROP_I))])
      .range([0, 1]);
  }
}

export function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, data.length])
      .range([0, 1]);
  }
}

export function computeDataToSliderScale(data) {
  if (data && data.length > 0) {
    return scalePow()
      .domain([0, data.length])
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
