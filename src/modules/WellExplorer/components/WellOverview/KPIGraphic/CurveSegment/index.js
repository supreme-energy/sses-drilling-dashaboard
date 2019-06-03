import React from "react";
import WellboreCurve from "./WellboreMediumCurve.js";
import classes from "./styles.scss";
import { Typography } from "@material-ui/core";
import KpiItem from "../../../../../Kpi/KpiItem.js";
import classNames from "classnames";
import OpenHole from "../../components/OpenHole.js";

export default function CurveSegment({ data }) {
  const openHole = !data.casingSize;
  return (
    <div className={classNames(classes.container, { undrilled: data.undrilled })}>
      <div className={classNames(classes.imgContainer, "segmentBackground")}>
        <WellboreCurve className={classes.svgIcon} transparent={data.undrilled} openHole={openHole} />
        <div className={classes.topZone}>
          <Typography className={classes.label} variant="body1">
            {data.type}
          </Typography>
          <div className={classes.kpis}>
            <KpiItem
              textClass={"whiteText"}
              small
              className={classNames(classes.kpi, "kpi")}
              value={data.bitSize}
              measureUnit={"in"}
              label={"Bit Size"}
            />
            {openHole ? (
              <OpenHole className="kpi" small />
            ) : (
              <KpiItem
                textClass={"whiteText"}
                small
                className={classNames(classes.kpi, "kpi")}
                value={data.casingSize}
                measureUnit={"in"}
                label={"Casing Size"}
              />
            )}
          </div>
          <KpiItem
            value={data.totalHours}
            measureUnit={"h"}
            label={"Time Spent"}
            className={classNames(classes.timeSpent, classes.kpi, "kpi")}
          />
          <KpiItem
            className={classNames(classes.kpi, classes.efficiency, "kpi")}
            value={data.toolFaceEfficiency}
            measureUnit={"%"}
            label={"Total Face Efficiency"}
          />
          <KpiItem
            className={classNames(classes.kpi, classes.landingPoint, "kpi")}
            value={data.landingPoint}
            measureUnit={"ft"}
            label={"Landing Point"}
          />
        </div>
      </div>
    </div>
  );
}
