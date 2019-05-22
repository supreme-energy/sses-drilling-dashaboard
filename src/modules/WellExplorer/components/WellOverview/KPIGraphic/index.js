import React, { useMemo, useRef } from "react";
import { useWellOverviewKPI } from "../../../../../api";
import VerticalSegment from "./VerticalSegment";
import * as wellSections from "../../../../../constants/wellSections";
import classes from "./styles.scss";
import classNames from "classnames";
import CurveSegment from "./CurveSegment";
import LateralSegment from "./LateralSegment";
import { useSize } from "react-hook-size";
import { sum } from "d3-array";
import KpiItem from "../../../../Kpi/KpiItem";
import PropTypes from "prop-types";

const curveSectionHeight = 216;

const minSegmentHeight = 139;

const gap = 10;

export default function KPIGraphic({ className, child }) {
  const data = useWellOverviewKPI();

  const containerRef = useRef(null);
  const laterlaSegmentData = useMemo(() => data.find(d => d.type === wellSections.LATERAL), [data]);
  const { height } = useSize(containerRef);

  const intermediateSectionHeight = useMemo(() => {
    const nrVerticalSegments = data.filter(
      d => d.type === wellSections.INTERMEDIATE || d.type === wellSections.DRILLOUT
    ).length;
    const computedHeight = (height - curveSectionHeight - minSegmentHeight + 2 * gap) / nrVerticalSegments + gap;

    return Math.max(minSegmentHeight, computedHeight);
  }, [height, data]);

  const totalHours = useMemo(() => sum(data, d => d.totalHours), [data]);

  const renderVerticalSegments = (d, index) => {
    switch (d.type) {
      case wellSections.SURFACE:
      case wellSections.INTERMEDIATE:
      case wellSections.DRILLOUT:
        const sectionHeight = d.type === wellSections.SURFACE ? minSegmentHeight : intermediateSectionHeight;
        return (
          <VerticalSegment
            index={index}
            key={d.startTime}
            className={classes.segment}
            data={d}
            style={{ zIndex: data.length - index }}
          />
        );
      case wellSections.CURVE:
        return <CurveSegment key={d.startTime} data={d} />;
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
            {data.map(renderVerticalSegments)}
          </div>
        </div>
        {laterlaSegmentData && (
          <div className={classes.horizontalSegment}>
            {child}
            <LateralSegment data={laterlaSegmentData} />
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
