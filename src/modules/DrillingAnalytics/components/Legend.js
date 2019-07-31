import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { COLOR_BY_GRAPH } from "../../../constants/drillingAnalytics";
import classes from "./DrillingAnalytics.scss";

function Legend({ selectedGraphs, keys }) {
  return (
    <div className={classes.legend}>
      {keys.map(key => {
        if (selectedGraphs.includes(key)) {
          return (
            <React.Fragment key={key}>
              <div className={classes.legendKey} style={{ backgroundColor: COLOR_BY_GRAPH[key].string }} />
              <Typography variant="caption">{key}</Typography>
            </React.Fragment>
          );
        }
      })}
    </div>
  );
}

Legend.propTypes = {
  selectedGraphs: PropTypes.arrayOf(PropTypes.string),
  keys: PropTypes.arrayOf(PropTypes.string)
};

export default Legend;
