import React from "react";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import { useKpi } from "../../api";
import { format } from "d3-format";

const kpiFormat = format(",.2f");

function KpiItem({ value, measureUnit, label }) {
  return (
    <div className={classes.vertical}>
      <div className={classes.horizontalTop}>
        <Typography variant="h5">{kpiFormat(value)}</Typography>
        <Typography variant="caption">{measureUnit}</Typography>
      </div>
      <Typography variant="caption" gutterBottom style={{ fontStyle: "italic" }}>
        {label}
      </Typography>
    </div>
  );
}

export function BitDepth() {
  const { bitDepth } = useKpi();
  return <KpiItem label={"Bit Depth"} value={bitDepth} measureUnit={"ft"} />;
}

export function Rop() {
  const { rateOfPenetration } = useKpi();
  return <KpiItem label={"Rate of Penetration"} value={rateOfPenetration} measureUnit={"fph"} />;
}

export default KpiItem;
