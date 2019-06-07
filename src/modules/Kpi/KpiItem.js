import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import { useKpi } from "../../api";
import classNames from "classnames";
import { twoDecimals, EMPTY_FIELD } from "../../constants/format";

function KpiItem({
  value,
  measureUnit,
  label,
  format,
  className,
  renderValue,
  labelClass,
  small,
  textClass,
  textStyle,
  style
}) {
  const formatValue = useCallback(value => (value !== undefined ? format(value) : EMPTY_FIELD), [format]);
  return (
    <div className={classNames(className, classes.vertical, { [classes.small]: small })} style={style}>
      <div className={classes.horizontalTop}>
        {renderValue({ value, format: formatValue, textClass, textStyle })}
        <Typography className={classNames(classes.caption, classes.measure, textClass)} variant="caption">
          {measureUnit}
        </Typography>
      </div>
      <Typography
        variant="caption"
        gutterBottom
        className={classNames(classes.italicLabel, labelClass, classes.caption, textClass)}
      >
        {label}
      </Typography>
    </div>
  );
}

export function defaultRenderValue({ value, format, textClass, textStyle }) {
  return (
    <Typography style={textStyle} className={classNames(classes.kpiValue, textClass)} variant="h5">
      {format(value)}
    </Typography>
  );
}

KpiItem.propTypes = {
  format: PropTypes.func,
  value: PropTypes.number,
  measureUnit: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
  renderValue: PropTypes.func,
  labelClass: PropTypes.string,
  small: PropTypes.bool,
  textClass: PropTypes.string,
  style: PropTypes.object,
  textStyle: PropTypes.object
};

KpiItem.defaultProps = {
  format: twoDecimals,
  renderValue: defaultRenderValue
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
