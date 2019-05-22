import React from "react";
import classes from "./styles.scss";
import Typography from "@material-ui/core/Typography";
const LegendItem = ({ color, label }) => {
  return (
    <div className={classes.hContainer}>
      <div style={{ backgroundColor: color, width: 50, height: 20, border: "solid 1px black", marginRight: "10px" }} />
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
    </div>
  );
};
export default function Legend() {
  return (
    <div className={classes.hContainer}>
      <LegendItem color={`#ffffff`} label={"Instant ROP"} />
      <span className={classes.spacer} />
      <LegendItem color={`#F9001D`} label={"Avg ROP"} />
      <span className={classes.spacer} />
      <LegendItem color={"#979797"} label={"Accumulated Hours"} />
    </div>
  );
}
