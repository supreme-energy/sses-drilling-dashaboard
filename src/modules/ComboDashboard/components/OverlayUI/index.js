import React, { useMemo } from "react";

import classes from "./OverlayUI.scss";
import { useCrossSectionContainer } from "../../../App/Containers";
import { Typography } from "@material-ui/core";

export default function DetailsTable({ width, height, view }) {
  const { selectedSections, calcSections } = useCrossSectionContainer();

  const selectedItem = useMemo(() => {
    return calcSections.find(s => selectedSections[s.id]);
  }, [calcSections, selectedSections]);

  return (
    <React.Fragment>
      <Typography variant="subtitle1" className={classes.root}>
        {width} by {height}{" "}
        {selectedItem &&
          `displaying ${selectedItem.vs.toFixed(2)} at ${(selectedItem.vs * view.xScale + view.x).toFixed(2)}`}
      </Typography>
    </React.Fragment>
  );
}
