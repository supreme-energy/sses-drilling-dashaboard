import React, { useMemo } from "react";
import addCircle from "../../../../assets/addCircle.svg";

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
      {selectedItem && (
        <img
          src={addCircle}
          className={classes.addIcon}
          style={{ top: `${height - 60}px`, left: `${selectedItem.vs * view.xScale + view.x + 16}px` }}
        />
      )}
    </React.Fragment>
  );
}
