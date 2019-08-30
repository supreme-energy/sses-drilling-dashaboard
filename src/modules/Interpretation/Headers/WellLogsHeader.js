import React from "react";
import Header from "./Header";
import { withWellLogsData } from "../../../api";
import memoizeOne from "memoize-one";
import memoize from "react-powertools/memoize";
import { extent as d3Extent, min, max } from "d3-array";

const logDataExtent = memoize(logData => {
  return d3Extent(logData.data, d => Number(d.value));
});

const getWellsGammaExtent = memoizeOne(logsData => {
  const extents = logsData.map(ld => logDataExtent(ld));
  return [min(extents, ([min]) => min), max(extents, ([, max]) => max), extents];
});

const EMPTY_ARRAY = [];

function WellLogsHeader({ logs, data: { result }, ...props }) {
  const gammaExtent = getWellsGammaExtent(result || EMPTY_ARRAY);

  return <Header {...props} range={gammaExtent} />;
}

export default withWellLogsData(WellLogsHeader);

WellLogsHeader.defaultProps = {
  logs: []
};
