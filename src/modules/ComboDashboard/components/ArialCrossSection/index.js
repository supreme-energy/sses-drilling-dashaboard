import React from "react";
import { Typography } from "@material-ui/core";

// import WellMapPlot from "../../../WellExplorer/components/WellOverview/WellMapPlot";
import WidgetCard from "../../../WidgetCard";
import classes from "./ArialCrossSection.scss";

function ArialCrossSection() {
  return (
    <WidgetCard className={classes.crossSection} hideMenu>
      <Typography variant="subtitle1">Cross Section</Typography>
      {/* <WellMapPlot className={classes.mapPlot} /> */}
    </WidgetCard>
  );
}

export default ArialCrossSection;
