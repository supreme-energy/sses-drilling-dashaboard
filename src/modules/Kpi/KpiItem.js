import React from "react";
import PropTypes from "prop-types";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import { useKpi } from "../../api";
import { format } from "d3-format";
import classNames from "classnames";

function KpiItem({ value, measureUnit, label, format, className, renderValue }) {
  return (
    <div className={classNames(className, classes.vertical)}>
      <div className={classes.horizontalTop}>
        {renderValue({ value, format })}
        <Typography variant="caption">{measureUnit}</Typography>
      </div>
      <Typography variant="caption" gutterBottom className={classes.italicLabel}>
        {label}
      </Typography>
    </div>
  );
}

KpiItem.propTypes = {
  format: PropTypes.func,
  value: PropTypes.number,
  measureUnit: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  renderValue: PropTypes.func
};

KpiItem.defaultProps = {
  format: format(",.2f"),
  renderValue: ({ value, format }) => (
    <Typography className={classes.kpiValue} variant="h5">
      {format(value)}
    </Typography>
  )
};

export function BitDepth() {
  const { bitDepth } = useKpi();
  return <KpiItem label={"Bit Depth"} value={bitDepth} measureUnit={"ft"} />;
}

export function Rop() {
  const { rateOfPenetration } = useKpi();
  return <KpiItem label={"Rate of Penetration (ROP)"} value={rateOfPenetration} measureUnit={"fph"} />;
}

export default KpiItem;
