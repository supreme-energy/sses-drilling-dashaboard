import React from "react";
import classes from "./styles.scss";
import * as wellSections from "../../../../../../constants/wellSections";
import KpiItem from "../../../../../Kpi/KpiItem";
import classNames from "classnames";
import WellboreLargeGreen from "./WellboreLargeGreen";
import WellboreBlue from "./WellboreBlue";
import WellboreMediumGreen from "./WellboreMediumGreen";
import { useSize } from "react-hook-size";
import useRef from "react-powertools/hooks/useRef";
import OpenHole from "../../components/OpenHole";
import PhaseLabel from "../../../../../Kpi/components/PhaseLabel.js";

export default function VerticalSegment({ index, style, data }) {
  const openHole = !data.casingSize;
  const useLargeSegment =
    data.type === wellSections.INTERMEDIATE ||
    (data.type === wellSections.DRILLOUT && (data.bitSize >= 10 || data.casingSize >= 10));
  const SvgIcon =
    data.type === wellSections.SURFACE ? WellboreBlue : useLargeSegment ? WellboreLargeGreen : WellboreMediumGreen;
  const containerRef = useRef(null);
  const { height } = useSize(containerRef);
  return (
    <div
      ref={containerRef}
      className={classNames(classes.container, {
        undrilled: data.undrilled,
        [classes.first]: index === 0,
        [classes.surface]: data.type === wellSections.SURFACE,
        [classes.intermediate]: data.type === wellSections.INTERMEDIATE,
        [classes.drillout]: data.type === wellSections.DRILLOUT
      })}
      style={style}
    >
      <div className={classes.content}>
        <div className={classes.left}>
          <PhaseLabel className={classes.label} phase={data.type}>
            {data.type}
          </PhaseLabel>

          <KpiItem
            className={classNames(classes.kpi, "kpi")}
            value={data.depth}
            measureUnit={"ft"}
            label={"Depth"}
            labelClass={classes.leftLabel}
          />
        </div>
        <div className={classes.wellbore}>
          <SvgIcon height={height || undefined} transparent={data.undrilled} openHole={openHole} />

          <div className={classes.kpis}>
            <KpiItem
              textClass={"whiteText"}
              value={data.bitSize}
              measureUnit={"in"}
              label={"Bit Size"}
              className={classNames(classes.kpi, "kpi")}
            />
            {openHole ? (
              <OpenHole className="kpi" small={!useLargeSegment} />
            ) : (
              <KpiItem
                textClass={"whiteText"}
                value={data.casingSize}
                measureUnit={"in"}
                label={"Casing Size"}
                className={classNames(classes.kpi, "kpi")}
              />
            )}
          </div>
        </div>
        <div className={classes.right}>
          <KpiItem
            value={data.rop}
            measureUnit={"fph"}
            label={"Rate of Penetration"}
            className={classNames(classes.kpi, "kpi")}
          />
        </div>
      </div>
      <div className={classNames(classes.background, "segmentBackground")} />
    </div>
  );
}
