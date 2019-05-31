import React, { useMemo, useRef } from "react";
import Card from "@material-ui/core/Card";
import KpiItem, { defaultRenderValue } from "../KpiItem";
import classes from "./styles.scss";
import classNames from "classnames";
import PhaseLabel from "../components/PhaseLabel";
import { scaleLinear } from "d3-scale";
import { useSize } from "react-hook-size";
import { sum } from "d3-array";

const renderSliding = props => defaultRenderValue({ ...props, textClass: classes.slidingLabel });
const renderRotating = props => defaultRenderValue({ ...props, textClass: classes.rotatingLabel });

const PercentageBar = ({ values }) => {
  const containerRef = useRef(null);
  const { width } = useSize(containerRef);

  const scale = useMemo(
    () =>
      scaleLinear()
        .domain([0, sum(values, d => d.value)])
        .range([0, width]),
    [width, values]
  );
  return (
    <div className={classes.percentageBar} ref={containerRef}>
      <div className={classNames("layout horizontal flex", classes.bars)}>
        {values.map(v => {
          return <div key={v.id} style={{ width: `${scale(v.value)}px`, height: 5, backgroundColor: v.color }} />;
        })}
      </div>
    </div>
  );
};
export default function Kpi({ data }) {
  return (
    <Card className={classNames("layout vertical", classes.container)}>
      {data ? (
        <React.Fragment>
          <PhaseLabel phase={data.type}>{data.type}</PhaseLabel>
          <div className="layout horizontal space-between">
            <div className={classNames("layout vertical", classes.firstColumn)}>
              <KpiItem className={classes.kpi} label="Target Accuracy" value={data.targetAccuracy} measureUnit="%" />
              <KpiItem className={classes.kpi} label="Drilling Time" value={data.totalHours} measureUnit="h" />
            </div>
            <div className={classNames("layout vertical", classes.secondColumn)}>
              <div className="layut vertical">
                <div className="layout horizontal space-between">
                  <KpiItem
                    className={classes.kpi}
                    label={`Sliding ${data.avgSliding}%`}
                    value={data.slidingFootage}
                    renderValue={renderSliding}
                  />

                  <KpiItem
                    className={classes.kpi}
                    label={`Rotating ${data.avgRotating}%`}
                    value={data.rotatingFootage}
                    renderValue={renderRotating}
                  />
                </div>
                <PercentageBar
                  values={[
                    { value: data.avgSliding, color: "#AFB42B", id: "avgSliding" },
                    { value: data.avgRotating, color: "#827717", id: "avgRotating" }
                  ]}
                />
              </div>
              <KpiItem className={classes.kpi} label="Lateral Length" value={data.footageDrilled} measureUnit="ft" />
            </div>
          </div>
        </React.Fragment>
      ) : null}
    </Card>
  );
}
