import React from "react";
import classes from "./styles.scss";
import * as wellSections from "../../../../../../constants/wellSections";
import Typography from "@material-ui/core/Typography";
import KpiItem from "../../../../../Kpi/KpiItem";
import classNames from "classnames";
import WellboreLargeGreen from "./WellboreLargeGreen";
import WellboreBlue from "./WellboreBlue";
import WellboreMediumGreen from "./WellboreMediumGreen";
import { useSize } from "react-hook-size";
import useRef from "react-powertools/hooks/useRef";

const colorByType = {
  [wellSections.SURFACE]: "#C6D3EE",
  [wellSections.INTERMEDIATE]: "#CDD9C4",
  [wellSections.DRILLOUT]: "#CDD9C4"
};

const titleColorByType = {
  [wellSections.SURFACE]: "#406DC5",
  [wellSections.INTERMEDIATE]: "#538531",
  [wellSections.DRILLOUT]: "#538531"
};

export default function VerticalSegment({ index, style, data }) {
  const useLarge =
    data.type === wellSections.INTERMEDIATE ||
    (data.type === wellSections.DRILLOUT && (data.bitSize >= 10 || data.casingSize >= 10));
  const SvgIcon =
    data.type === wellSections.SURFACE ? WellboreBlue : useLarge ? WellboreLargeGreen : WellboreMediumGreen;
  const containerRef = useRef(null);
  const { height } = useSize(containerRef);
  return (
    <div
      ref={containerRef}
      className={classNames(classes.container, {
        [classes.first]: index === 0,
        [classes.surface]: data.type === wellSections.SURFACE,
        [classes.intermediate]: data.type === wellSections.INTERMEDIATE,
        [classes.drillout]: data.type === wellSections.DRILLOUT
      })}
      style={style}
    >
      <div className={classes.content}>
        <div className={classes.left}>
          <Typography style={{ color: titleColorByType[data.type] }} variant="body1">
            {data.type}
          </Typography>
          <KpiItem value={data.depth} measureUnit={"ft"} label={"Depth"} labelClass={classes.leftLabel} />
        </div>
        <div className={classes.wellbore}>
          <SvgIcon height={height} />
          {/* <img src={svgByType[data.type]} className={classes.svgIcon} /> */}
          <div className={classes.kpis}>
            <KpiItem
              textClass={"whiteText"}
              value={data.bitSize}
              measureUnit={"in"}
              label={"Bit Size"}
              className={classes.kpi}
            />
            <KpiItem
              textClass={"whiteText"}
              value={data.casingSize}
              measureUnit={"in"}
              label={"Casing Size"}
              className={classes.kpi}
            />
          </div>
        </div>
        <div className={classes.right}>
          <KpiItem value={data.rop} measureUnit={"fph"} label={"Rate of Penetration"} />
        </div>
      </div>
      <div className={classes.background} style={{ backgroundColor: colorByType[data.type] }} />
    </div>
  );
}
