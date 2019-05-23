import React, { useMemo, useRef } from "react";
import { useWellOverviewKPI } from "../../../../../api";
import VerticalSegment from "./VerticalSegment";
import * as wellSections from "../../../../../constants/wellSections";
import classes from "./styles.scss";
import classNames from "classnames";
import CurveSegment from "./CurveSegment";
import LateralSegment from "./LateralSegment";
import { sum, group, rollup } from "d3-array";
import KpiItem from "../../../../Kpi/KpiItem";
import PropTypes from "prop-types";

// will result in Map(5){"Surface" => 0, "Intermediate" => 1, "Drillout" => 2, "Curve" => 3, "Lateral" => 4}
const orderMap = rollup(
  wellSections.orderedSections.map((s, index) => ({
    section: s,
    index
  })),
  values => values[0].index,
  d => d.section
);

export default function KPIGraphic({ className, child }) {
  const data = useWellOverviewKPI();
  const bySegment = useMemo(() => group(data, d => d.type), [data]);
  const sortByWellOrder = (s1, s2) => orderMap.get(s1.type) - orderMap.get(s2.type);
  const segments = useMemo(() => {
    const segmentsToFill = wellSections.orderedSections
      .filter(w => w !== wellSections.DRILLOUT && !bySegment.get(w))
      .map(w => ({ type: w, undrilled: true }));
    return [...data, ...segmentsToFill].sort(sortByWellOrder);
  }, [data, bySegment]);
  const containerRef = useRef(null);
  const lateralSegmentData = useMemo(() => segments.find(d => d.type === wellSections.LATERAL), [segments]);

  const totalHours = useMemo(() => sum(data, d => Number(d.totalHours) || 0), [data]);

  const renderVerticalSegments = (d, index) => {
    switch (d.type) {
      case wellSections.SURFACE:
      case wellSections.INTERMEDIATE:
      case wellSections.DRILLOUT:
        return (
          <VerticalSegment
            index={index}
            key={d.id}
            className={classes.segment}
            data={d}
            style={{ zIndex: data.length - index }}
          />
        );
      case wellSections.CURVE:
        return <CurveSegment key={d.id} data={d} />;
      default:
        return null;
    }
  };

  return (
    <div className={classNames(className, classes.container)}>
      <div className={classes.content}>
        <div className={classes.verticalContainer}>
          <KpiItem value={totalHours} measureUnit={"h"} label={"Drilling Time"} className={classes.totalHours} />
          <div className={classes.verticalSegments} ref={containerRef}>
            {segments.map(renderVerticalSegments)}
          </div>
        </div>
        {lateralSegmentData && (
          <div className={classes.horizontalSegment}>
            {child}
            <LateralSegment data={lateralSegmentData} />
          </div>
        )}
      </div>
    </div>
  );
}

KPIGraphic.propTypes = {
  className: PropTypes.string,
  child: PropTypes.node
};
