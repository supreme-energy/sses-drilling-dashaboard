import React from "react";
import classes from "./styles.scss";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";

const LegendItem = ({ color, label, bordered }) => {
  return (
    <div className={classes.hContainer}>
      <div
        style={{
          backgroundColor: color,
          width: 15,
          height: 6,
          border: bordered ? "solid 1px black" : "none",
          marginRight: "10px"
        }}
      />
      <Typography variant="caption" gutterBottom>
        {label}
      </Typography>
    </div>
  );
};
export default function Legend({ className }) {
  return (
    <div className={classNames(classes.hContainer, className)}>
      <LegendItem color={`#ffffff`} label={"Instant ROP"} bordered />
      <span className={classes.spacer} />
      <LegendItem color={`#F9001D`} label={"Avg ROP"} />
      <span className={classes.spacer} />
      <LegendItem color={"#979797"} label={"Accumulated Hours"} />
    </div>
  );
}
