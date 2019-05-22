import React from "react";
import WellboreCurve from "./WellboreMediumCurve.js";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import KpiItem from "../../../../../Kpi/KpiItem.js";
import classNames from "classnames";

export default function CurveSegment({ data }) {
  return (
    <div className={classes.container}>
      <div className={classes.imgContainer}>
        <WellboreCurve className={classes.svgIcon} />
        <div className={classes.topZone}>
          <Typography className={classes.label} variant="body1">
            {data.type}
          </Typography>
          <div className={classes.kpis}>
            <KpiItem
              textClass={"whiteText"}
              small
              className={classes.kpi}
              value={data.bitSize}
              measureUnit={"in"}
              label={"Bit Size"}
            />
            <KpiItem
              textClass={"whiteText"}
              small
              className={classes.kpi}
              value={data.casingSize}
              measureUnit={"in"}
              label={"Casing Size"}
            />
          </div>
          <KpiItem
            value={data.totalHours}
            measureUnit={"h"}
            label={"Time Spent"}
            className={classNames(classes.timeSpent, classes.kpi)}
          />
          <KpiItem
            className={classNames(classes.kpi, classes.efficiency)}
            value={data.toolFaceEfficiency}
            measureUnit={"%"}
            label={"Total Face Efficiency"}
          />
          <KpiItem
            className={classNames(classes.kpi, classes.landingPoint)}
            value={data.landingPoint}
            measureUnit={"ft"}
            label={"Landing Point"}
          />
        </div>
      </div>
    </div>
  );
}
