import React, { useState } from "react";
import { Card, IconButton, Collapse } from "@material-ui/core";
import { ArrowDropDown, ArrowDropUp } from "@material-ui/icons";

import DrillPhaseViewer from "./DrillPhaseViewer";
import TimeSlider from "./TimeSlider";
import classes from "./TimeSliderToolbar.scss";

function TimeSliderToolbar() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ display: "flex", minHeight: 50 }}>
      <Card className={classes.card}>
        <IconButton className={classes.collapseButton} onClick={() => setExpanded(e => !e)}>
          {expanded ? <ArrowDropDown /> : <ArrowDropUp />}
        </IconButton>
      </Card>
      <Collapse style={{ minHeight: 50, border: "1px solid rgb(209, 208, 208)" }} in={expanded}>
        <div style={{ display: "flex" }}>
          <DrillPhaseViewer className={classes.noShrink} expanded={expanded} />
          <TimeSlider className={classes.noShrink} />
        </div>
      </Collapse>
    </div>
  );
}

TimeSliderToolbar.propTypes = {};

export default TimeSliderToolbar;
