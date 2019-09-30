import React from "react";
import { IconButton } from "@material-ui/core";
import TableChartIcon from "../../assets/tableChart.svg";
import css from "./styles.scss";

export default function TableButton(props) {
  return (
    <IconButton size="small" className={css.root} aria-label="Show full details table" {...props}>
      <img src={TableChartIcon} className={css.icon} />
    </IconButton>
  );
}
