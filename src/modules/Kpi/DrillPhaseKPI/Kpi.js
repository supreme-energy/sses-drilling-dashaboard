import React, { useMemo, useRef } from "react";
import Card from "@material-ui/core/Card";
import KpiItem, { defaultRenderValue } from "../KpiItem";
import classes from "./styles.scss";
import classNames from "classnames";
import PhaseLabel from "../components/PhaseLabel";
import { scaleLinear, scaleThreshold } from "d3-scale";
import { useSize } from "react-hook-size";
import { sum } from "d3-array";
import { useTheme } from "@material-ui/styles";
import { format } from "d3-format";

const percentage = value => (value !== undefined ? format(".2%") : "-");
const noDecimal = format(".0f");

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
  const theme = useTheme();

  const getTargetColor = useMemo(
    () =>
      // scaleThreshold :: Number -> wargning | yellow | success
      scaleThreshold()
        .domain([50, 80, 100])
        .range([theme.palette.warning.main, theme.palette.yellow.main, theme.palette.success.main]),
    [theme]
  );

  return (
    <Card className={classNames("layout vertical", classes.container)}>
      <PhaseLabel phase={data.type}>{data.type}</PhaseLabel>
      <div className="layout horizontal space-between">
        <div className={classNames("layout vertical", classes.firstColumn)}>
          <KpiItem
            textStyle={{ color: getTargetColor(data.targetAccuracy) }}
            className={classes.kpi}
            label="Target Accuracy"
            value={data.targetAccuracy}
            measureUnit="%"
          />
          <KpiItem className={classes.kpi} label="Drilling Time" value={data.totalHours} measureUnit="h" />
        </div>
        <div className={classNames("layout vertical", classes.secondColumn)}>
          <div className="layut vertical">
            <div className="layout horizontal space-between">
              <KpiItem
                className={classes.kpi}
                format={noDecimal}
                label={`Sliding ${percentage(data.slidingPct)}`}
                value={data.avgSliding}
                renderValue={renderSliding}
              />

              <KpiItem
                className={classes.kpi}
                format={noDecimal}
                label={`Rotating ${percentage(data.rotatingPct)}`}
                value={data.avgRotating}
                renderValue={renderRotating}
              />
            </div>
            <PercentageBar
              values={[
                { value: data.slidingPct, color: "#AFB42B", id: "slidingPct" },
                { value: data.rotatingPct, color: "#827717", id: "rotatingPct" }
              ]}
            />
          </div>
          <KpiItem
            className={classes.kpi}
            label={data.type ? `${data.type} Length` : "-"}
            value={data.holeDepthStart}
            measureUnit="ft"
          />
        </div>
      </div>
    </Card>
  );
}

Kpi.defaultProps = {
  data: {}
};
