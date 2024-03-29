import React from "react";
import PropTypes from "prop-types";
import { line, curveBundle } from "d3-shape";
import _ from "lodash";
import { ON_VERTICAL, ON_CURVE, ON_LATERAL, ON_LOAD } from "../../../constants/wellPathStatus";
import { RED, BLUE, GRAY } from "../../../constants/colors";
import { useKpi, useWellOverviewKPI } from "../../../api";
import KpiItem from "../KpiItem";

import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import { noDecimals, percentage } from "../../../constants/format";

const drawLine = line()
  .x(d => d[0])
  .y(d => d[1]);

const drawArc = drawLine.curve(curveBundle.beta(0.8));
const topLine = drawLine([[5, 5], [5, 30]]);
const arcPath = drawArc([[5, 32], [5, 50], [22, 50]]);
const bottomLine = drawLine([[24, 50], [240, 50]]);

const colorByStatus = {
  [ON_VERTICAL]: {
    top: RED,
    curve: GRAY,
    lateral: GRAY
  },
  [ON_CURVE]: {
    top: BLUE,
    curve: RED,
    lateral: GRAY
  },
  [ON_LATERAL]: {
    top: BLUE,
    curve: BLUE,
    lateral: RED
  },
  [ON_LOAD]: {
    top: GRAY,
    curve: GRAY,
    lateral: GRAY
  }
};

const renderValue = ({ value, format }) => (
  <Typography style={{ color: RED, fontWeight: "bold" }} variant="h5">
    {format(value)}
  </Typography>
);

const WellPathStatus = ({ status }) => {
  return (
    <svg width={250} height={55}>
      <path d={topLine} stroke={colorByStatus[status].top} strokeWidth="5" />
      <path d={arcPath} stroke={colorByStatus[status].curve} strokeWidth="5" fill={"transparent"} />
      <path d={bottomLine} stroke={colorByStatus[status].lateral} strokeWidth="5" />
    </svg>
  );
};

WellPathStatus.propTypes = {
  status: PropTypes.oneOf([ON_VERTICAL, ON_CURVE, ON_LATERAL, ON_LOAD])
};

WellPathStatus.defaultProps = {
  status: ON_VERTICAL
};

export default function Status({ wellId }) {
  const { wellRemaining } = useKpi(wellId);
  const { data } = useWellOverviewKPI(wellId);
  const phase = _.get(data, `[${data.length - 1}].type`);
  const depth = _.get(data, `[${data.length - 1}].depth`);

  return (
    <div className={classes.container}>
      <span className={classes.status}>{phase ? `On ${phase}` : "-"}</span>
      <KpiItem
        label={`Remaining ${percentage(wellRemaining)}`}
        renderValue={renderValue}
        value={depth}
        measureUnit={"ft"}
        format={noDecimals}
        className={classes.kpi}
      />
      <WellPathStatus status={phase ? `On ${phase}` : ON_LOAD} />
    </div>
  );
}
