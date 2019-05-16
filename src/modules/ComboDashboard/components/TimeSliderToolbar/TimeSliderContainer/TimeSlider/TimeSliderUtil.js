import { useState, useEffect } from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";

export const GRID_GUTTER = 60;
const EMPTY_ARRAY = [];

export function useRopData() {
  const [ropData, updateRopData] = useState(EMPTY_ARRAY);
  const loadData = async () => {
    const response = await fetch("/data/rop.json");

    const data = await response.json();

    updateRopData(data.data);
  };
  useEffect(() => {
    loadData();
  }, []);
  return ropData;
}

export function computeInitialViewYScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, data[data.length - 1].Hole_Depth])
      .range([0, 1]);
  }
}

export function computeInitialViewXScaleValue(data) {
  if (data && data.length > 0) {
    return scaleLinear()
      .domain([0, max(data, d => Math.max(d.ROP_A, d.ROP_I))])
      .range([0, 1]);
  }
}

export const mapRop = (d, index) => {
  return [index, Number(d.ROP_A)];
};
export const mapSlide = d => [Number(d.Hole_Depth), Number(d.ROP_I)];
