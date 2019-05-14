import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import classNames from "classnames";

import classes from "./TimeSlider.scss";

const LEGEND_BY_COLOR = {
  SLIDE: "#A9FFFB",
  CONNECTION: "#D9AAFE",
  ROP: "#08BB00",
  LEGEND: "#967F2F"
};

function Legend({ className, selectedGraphs, keys }) {
  return (
    <div className={classNames(classes.legend, className)}>
      {keys.map((key, index) => {
        if (selectedGraphs.includes(key)) {
          return (
            <React.Fragment key={index}>
              <div className={classes.legendKey} style={{ backgroundColor: LEGEND_BY_COLOR[key] }} />
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
