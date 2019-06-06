import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import classNames from "classnames";

import { COLOR_BY_GRAPH } from "../../../constants/timeSlider";
import classes from "./TimeSlider.scss";

function Legend({ className, selectedGraphs, keys }) {
  return (
    <div className={classNames(classes.legend, className)}>
      {keys.map((key, index) => {
        if (selectedGraphs.includes(key)) {
          const color = "#" + COLOR_BY_GRAPH[key];
          return (
            <React.Fragment key={key}>
              <div className={classes.legendKey} style={{ backgroundColor: color }} />
              <Typography variant="caption">{key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}</Typography>
            </React.Fragment>
          );
        }
      })}
    </div>
  );
}

Legend.propTypes = {
  className: PropTypes.string,
  selectedGraphs: PropTypes.arrayOf(PropTypes.string),
  keys: PropTypes.arrayOf(PropTypes.string)
};

export default Legend;
