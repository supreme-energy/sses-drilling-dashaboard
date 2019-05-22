import React, { useRef } from "react";
import classes from "./styles.scss";
import WellboreSmallYellow from "./WellboreSmallYellow";
import { Typography } from "@material-ui/core";
import KpiItem from "../../../../../Kpi/KpiItem";
import { useSize } from "react-hook-size";

export default function CurveSegment({ data }) {
  const containerRef = useRef(null);
  const { width } = useSize(containerRef);

  return (
    <div className={classes.container} ref={containerRef}>
      <div className={classes.imgContainer}>
        <WellboreSmallYellow className={classes.svgIcon} width={width} />

        <div className={classes.kpis}>
          <div className={classes.left}>
            <Typography className={classes.label} variant="body1">
              {data.type}
            </Typography>

            <KpiItem
              textClass={"whiteText"}
              value={data.bitSize}
              measureUnit={"in"}
              label={"Bit Size"}
              className={classes.kpi}
            />
            <KpiItem value={data.depth} measureUnit={"in"} label={"Total Depth"} className={classes.kpi} />
          </div>
          <div className={classes.right}>
            <span className={classes.topSpace} />

            <KpiItem
              textClass={"whiteText"}
              value={data.casingSize}
              measureUnit={"in"}
              label={"Casing Size"}
              className={classes.kpi}
            />
            <KpiItem value={data.zoneAccuracy} measureUnit={"%"} label={"Zone Accuracy"} className={classes.kpi} />
          </div>
        </div>
      </div>
    </div>
  );
}
