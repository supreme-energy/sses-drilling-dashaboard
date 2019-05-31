import React from "react";
import { Typography } from "@material-ui/core";
import css from "./styles.scss";
import classNames from "classnames";
import mapStyles from "../styles.scss";

const LegendItem = ({ label, legendSymbol }) => (
  <div className={classNames("layout horizontal align-center", css.legendItem)}>
    <div className={classNames(legendSymbol, "layout justify-center align-center")} />
    <Typography variant="caption" className={css.label}>
      {label}
    </Typography>
  </div>
);

export default function({ className }) {
  return (
    <div className={classNames("layout vertical wrap content-around", className, css.container)}>
      <LegendItem label="Surface" legendSymbol={mapStyles.phasePointIcon} />
      <LegendItem label="Landing Point" legendSymbol={classNames(mapStyles.phasePointIcon, mapStyles.landing)} />
      <LegendItem label="Proposed Bottom Hole" legendSymbol={classNames(mapStyles.phasePointIcon, mapStyles.pbhl)} />
      <LegendItem label="Intermediate" legendSymbol={classNames(mapStyles.horizontalLine, css.intermediate)} />
      <LegendItem label="Drillout" legendSymbol={classNames(mapStyles.horizontalLine, css.drillout)} />
      <LegendItem label="Lateral" legendSymbol={classNames(mapStyles.horizontalLine, css.lateral)} />
      <LegendItem label="Drilling" legendSymbol={classNames(mapStyles.horizontalLine, css.drilling)} />
      <LegendItem label="Well Plan" legendSymbol={classNames(mapStyles.horizontalLine, css.wellPlan)} />
    </div>
  );
}
