import React, { useRef } from "react";
import classes from "./styles.scss";
import WellboreSmallYellow from "./WellboreSmallYellow";
import { Typography } from "@material-ui/core";
import KpiItem from "../../../../../Kpi/KpiItem";
import { useSize } from "react-hook-size";
import classNames from "classnames";
import OpenHole from "../../components/OpenHole";

export default function CurveSegment({ data }) {
  const containerRef = useRef(null);
  const { width } = useSize(containerRef);
  const openHole = !data.casingSize;
  return (
    <div className={classNames(classes.container, { undrilled: data.undrilled })} ref={containerRef}>
      <div className={classNames(classes.imgContainer, "segmentBackground")}>
        <WellboreSmallYellow
          className={classes.svgIcon}
          width={width}
          transparent={data.undrilled}
          openHole={openHole}
        />

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
              className={classNames(classes.kpi, "kpi")}
            />
            <KpiItem
              value={data.depth}
              measureUnit={"in"}
              label={"Total Depth"}
              className={classNames(classes.kpi, "kpi")}
            />
          </div>
          <div className={classes.right}>
            <span className={classes.topSpace} />

            {openHole ? (
              <OpenHole className="kpi" />
            ) : (
              <KpiItem
                textClass={"whiteText"}
                value={data.casingSize}
                measureUnit={"in"}
                label={"Casing Size"}
                className={classNames(classes.kpi, "kpi")}
              />
            )}
            <KpiItem
              value={data.zoneAccuracy}
              measureUnit={"%"}
              label={"Zone Accuracy"}
              className={classNames(classes.kpi, "kpi")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
