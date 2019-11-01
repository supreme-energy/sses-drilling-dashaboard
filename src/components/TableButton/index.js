import React from "react";
import { IconButton } from "@material-ui/core";
import TableChartIcon from "../../assets/tableChart.svg";
import css from "./styles.scss";
import { Link, withRouter } from "react-router-dom";

export const TableButton = props => (
  <IconButton size="small" className={css.root} aria-label="Show full details table" {...props}>
    <img src={TableChartIcon} className={css.icon} />
  </IconButton>
);

export const CSTableButton = withRouter(({ match: { url } }) => {
  return (
    <Link to={`${url}/detailsTable`}>
      <TableButton />
    </Link>
  );
});
