import React from "react";
import { IconButton } from "@material-ui/core";
import TableChartIcon from "../../assets/tableChart.svg";
import css from "./styles.scss";
import { Link, withRouter } from "react-router-dom";

export default withRouter(({ match: { url } }) => {
  return (
    <Link to={`${url}/detailsTable`}>
      <IconButton size="small" className={css.root} aria-label="Show full details table">
        <img src={TableChartIcon} className={css.icon} />
      </IconButton>
    </Link>
  );
});
