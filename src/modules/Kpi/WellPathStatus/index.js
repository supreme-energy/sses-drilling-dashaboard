import React from "react";
import PropTypes from "prop-types";
import { line, curveBundle } from "d3-shape";
import { ON_VERTICAL, ON_CURVE, ON_LATERAL } from "../../../constants/wellPathStatus";
import { useKpi } from "../../../api";
import KpiItem from "../KpiItem";
import { format } from "d3-format";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";

const percentage = format(".0%");
const depthFormat = format(".0f");

const drawLine = line()
  .x(d => d[0])
  .y(d => d[1]);

const drawArc = drawLine.curve(curveBundle.beta(0.8));
const topLine = drawLine([[5, 5], [5, 30]]);
const arcPath = drawArc([[5, 32], [5, 50], [22, 50]]);
const bottomLine = drawLine([[24, 50], [240, 50]]);

const red = "#ff0000";
const blue = "#0000ff";
const gray = "#757575";

const colorByStatus = {
  [ON_VERTICAL]: {
    top: red,
    curve: gray,
    lateral: gray
  },
  [ON_CURVE]: {
    top: blue,
    curve: red,
    lateral: gray
  },
  [ON_LATERAL]: {
    top: blue,
    curve: blue,
    lateral: red
  }
};

const renderValue = ({ value, format }) => (
  <Typography style={{ color: red, fontWeight: "bold" }} variant="h5">
    {format(value)}
  </Typography>
);

export const WellPathStatus = ({ status }) => {
  console.log('status', status)
  return (
    <svg width={250} height={55}>
      <path d={topLine} stroke={colorByStatus[status].top} strokeWidth="5" />
      <path d={arcPath} stroke={colorByStatus[status].curve} strokeWidth="5" fill={"transparent"} />
      <path d={bottomLine} stroke={colorByStatus[status].lateral} strokeWidth="5" />
    </svg>
  );
};

WellPathStatus.propTypes = {
  status: PropTypes.oneOf([ON_VERTICAL, ON_CURVE, ON_LATERAL])
};

WellPathStatus.defaultProps = {
  status: ON_VERTICAL
};

export default function Status({ wellId }) {
  const { wellPathStatus, depth, wellRemaining } = useKpi(wellId);
  return (
    <div className={classes.container}>
      <span className={classes.status}>{wellPathStatus}</span>
      <KpiItem
        label={`Remaining ${percentage(wellRemaining)}`}
        renderValue={renderValue}
        value={depth}
        measureUnit={"ft"}
        format={depthFormat}
        className={classes.kpi}
      />
      <WellPathStatus status={wellPathStatus} />
    </div>
  );
}
