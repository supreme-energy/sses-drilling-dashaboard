import React, { useCallback } from "react";
import PropTypes from "prop-types";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import _ from "lodash";
import { useKpi, useWellOverviewKPI } from "../../api";
import { useWellIdContainer } from "../App/Containers";
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
    <div className={classNames(className, classes.vertical, classes.root, { [classes.small]: small })} style={style}>
      <div className={classes.horizontalTop}>
        {renderValue({ value, format: formatValue, textClass, textStyle })}
        <Typography className={classNames(classes.caption, textClass)} variant="caption">
          {measureUnit}
        </Typography>
      </div>
      <Typography
        variant="caption"
        component="div"
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
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
  const { wellId } = useWellIdContainer();
  const { data } = useWellOverviewKPI(wellId);
  const rop = _.get(data, `[${data.length - 1}].rop`);
  return <KpiItem label={"Rate of Penetration (ROP)"} value={rop} measureUnit={"fph"} />;
}

export default KpiItem;
